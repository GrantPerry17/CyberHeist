// PreloadScene.js
class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const { width, height } = this.cameras.main;
    const logo = this.add.image(width / 2, height / 2 - 100, 'logo')
      .setDisplaySize(296, 124);
    this.add.text(width / 2, height / 2 + 50, 'Loading...', {
      fontSize: '24px', fill: '#ffffff'
    }).setOrigin(0.5);

    // Images
    this.load.image('logo', 'assets/images/logo.png');
    this.load.image('startButton', 'assets/images/start_button.png');
    this.load.image('background', 'assets/images/bg.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('terminal', 'assets/images/terminal.png');

    // Audio
    this.load.audio('bg_music', 'assets/audio/bg_music.wav');
    this.load.audio('hack_sound', 'assets/audio/hack_sound.mp3');
  }

  create() {
    this.scene.start('MainMenuScene');
  }
}

window.PreloadScene = PreloadScene;
