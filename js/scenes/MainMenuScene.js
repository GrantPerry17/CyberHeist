// MainMenuScene.js
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    // logo
    this.add.image(width / 2, height / 2 - 150, 'logo')
      .setDisplaySize(296, 124);
    // start button
    this.add.image(width / 2, height / 2 + 50, 'startButton')
      .setInteractive({ useHandCursor: true })
      .setDisplaySize(324, 156) 
      .on('pointerdown', () => this.scene.start('GameScene'));
  }
}

window.MainMenuScene = MainMenuScene;
