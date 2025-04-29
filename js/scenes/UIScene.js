class UIScene extends Phaser.Scene {
  constructor() { 
    super({ key: 'UIScene', active: false });
  }

  create() {
    // Text box for instructions/status
    this.promptText = this.add.text(20, 20, '', {
      fontSize: '20px',
      fill: '#00FF00',
      fontFamily: 'monospace',
      backgroundColor: '#000000AA',
      padding: { x: 10, y: 5 }
    }).setDepth(100);

    // Text box for hack count (number of successful hacks)
    this.hackCountText = this.add.text(20, 60, 'Hacks Completed: 0 / 10', {
      fontSize: '20px',
      fill: '#00FF00',
      fontFamily: 'monospace',
      backgroundColor: '#000000AA',
      padding: { x: 10, y: 5 }
    }).setDepth(100);

    // Listen for GameScene events
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('showPrompt', this.updatePrompt, this);
    gameScene.events.on('showQuestion', this.updateQuestion, this);
    gameScene.events.on('updateHackCount', this.updateHackCount, this);
  }

  updatePrompt(message) {
    this.promptText.setText(message);
  }

  updateQuestion(question) {
    this.promptText.setText(`Solve: ${question}`);
  }

  updateHackCount(hackCountMessage) {
    // Update the hack count text
    this.hackCountText.setText(hackCountMessage);
  }

  update() {
    // Prompt the player to find the terminal initially
    if (!this.promptText.text) {
      this.updatePrompt('Find the terminal and click it to hack!');
    }
  }
}

window.UIScene = UIScene;
