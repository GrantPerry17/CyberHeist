// BootScene.js
class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // optional: small asset for preload screen
    this.load.image('logo', 'assets/images/logo.png');
  }

  create() {
    this.scene.start('PreloadScene');
  }
}

window.BootScene = BootScene;
