class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.level = 1;
        this.lives = 3;
        this.maxLevels = 5;
        this.checkpoint = null;
        this.canShoot = true;
    }

    preload() {
        this.load.image('ground', 'assets/ground.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('goal', 'assets/goal.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.audio('jump', 'assets/jump.wav');
        this.load.audio('death', 'assets/death.wav');
        this.load.audio('shoot', 'assets/shoot.wav');
        this.load.audio('bgm', 'assets/bgm.mp3');
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);

        this.jumpSound = this.sound.add('jump');
        this.deathSound = this.sound.add('death');
        this.shootSound = this.sound.add('shoot');
        this.bgm = this.sound.add('bgm', { loop: true });
        if (!this.bgm.isPlaying) this.bgm.play();

        this.createLevel();

        // Add ground button (small)
        this.add.text(650, 570, '+ Platform', {
            fontSize: '16px',
            fill: '#0f0',
            backgroundColor: '#000',
            padding: { x: 6, y: 2 },
        }).setInteractive().on('pointerdown', () => {
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 500);
            const scale = Phaser.Math.FloatBetween(0.3, 1);
            this.platforms.create(x, y, 'ground').setScale(scale).refreshBody();
        });
    }

    createLevel() {
        this.add.text(10, 10, 'Liv: ' + this.lives, { fontSize: '50px', fill: '#fff' });

        this.platforms = this.physics.add.staticGroup();
        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group();
        this.goal = this.physics.add.staticGroup();

        this.createPlatformsForLevel(this.level);

        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(0.02);
        this.player.body.setSize(this.player.width, this.player.height);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.player, this.enemies, this.playerHit, null, this);
        this.physics.add.overlap(this.player, this.goal, this.nextLevel, null, this);
        this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);

        this.goal.getChildren().forEach(g => g.setScale(0.05).refreshBody());
        this.enemies.getChildren().forEach(e => e.setScale(0.05));
    }

    createPlatformsForLevel(level) {
        // Always add full ground floor
        for (let x = 0; x <= 800; x += 64) {
            this.platforms.create(x, 568, 'ground').setScale(1).refreshBody();
        }

        switch (level) {
            case 1:
                this.platforms.create(200, 450, 'ground').setScale(0.5).refreshBody();
                this.platforms.create(400, 350, 'ground').setScale(0.5).refreshBody();
                this.enemies.create(400, 300, 'enemy').setVelocityX(100).setBounce(1).setCollideWorldBounds(true);
                this.goal.create(700, 270, 'goal').setScale(0.05).refreshBody();
                break;

            case 2:
                this.platforms.create(150, 400, 'ground').setScale(0.4).refreshBody();
                this.platforms.create(300, 300, 'ground').setScale(0.4).refreshBody();
                this.platforms.create(500, 200, 'ground').setScale(0.4).refreshBody();
                this.enemies.create(300, 250, 'enemy').setVelocityX(120).setBounce(1).setCollideWorldBounds(true);
                this.goal.create(600, 150, 'goal').setScale(0.05).refreshBody();
                break;

            case 3:
                this.platforms.create(100, 400, 'ground').setScale(0.3).refreshBody();
                this.platforms.create(300, 300, 'ground').setScale(0.6).refreshBody();
                this.platforms.create(600, 250, 'ground').setScale(0.4).refreshBody();
                this.enemies.create(600, 200, 'enemy').setVelocityX(90).setBounce(1).setCollideWorldBounds(true);
                this.goal.create(700, 200, 'goal').setScale(0.05).refreshBody();
                break;

            case 4:
                this.platforms.create(250, 450, 'ground').setScale(0.4).refreshBody();
                this.platforms.create(450, 350, 'ground').setScale(0.4).refreshBody();
                this.platforms.create(650, 250, 'ground').setScale(0.4).refreshBody();
                this.enemies.create(250, 400, 'enemy').setVelocityX(80).setBounce(1).setCollideWorldBounds(true);
                this.enemies.create(650, 200, 'enemy').setVelocityX(110).setBounce(1).setCollideWorldBounds(true);
                this.goal.create(750, 200, 'goal').setScale(0.05).refreshBody();
                break;

            case 5:
                this.platforms.create(200, 350, 'ground').setScale(0.6).refreshBody();
                this.platforms.create(500, 250, 'ground').setScale(0.6).refreshBody();
                this.enemies.create(500, 200, 'enemy').setVelocityX(100).setBounce(1).setCollideWorldBounds(true);
                this.goal.create(750, 180, 'goal').setScale(0.05).refreshBody();
                break;

            default:
                this.goal.create(700, 150, 'goal').setScale(0.05).refreshBody();
                break;
        }
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        if ((this.cursors.up.isDown || Phaser.Input.Keyboard.JustDown(this.jumpKey)) && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
            this.jumpSound.play();
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
            this.shootBullet();
        }

        if (this.player.y > 600) {
            this.playerHit();
        }
    }

    shootBullet() {
        const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet');
        bullet.setVelocityX(400);
        bullet.setCollideWorldBounds(true);
        bullet.setScale(0.05);
        bullet.body.onWorldBounds = true;
        bullet.body.world.on('worldbounds', (body) => {
            if (body.gameObject === bullet) bullet.destroy();
        });
        this.shootSound.play();
        this.canShoot = false;
        this.time.delayedCall(500, () => this.canShoot = true);
    }

    bulletHitEnemy(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();
    }

    playerHit() {
        this.deathSound.play();
        this.lives--;
        if (this.lives <= 0) {
            alert('Du förlorade!');
            this.level = 1;
            this.lives = 3;
        }
        this.scene.restart({ level: this.level, lives: this.lives });
    }

    nextLevel() {
        if (this.level >= this.maxLevels) {
            alert('Grattis!! Du klarade spelet!');
            this.level = 1;
            this.lives = 3;
        } else {
            this.level++;
        }
        this.scene.restart({ level: this.level, lives: this.lives });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: MainScene
};

const game = new Phaser.Game(config);
