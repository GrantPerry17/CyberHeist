class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.hasHacked = false;
    this.correctAnswer = null;
    this.options = [];
    this.selectedOption = null;
    this.modal = null;
    this.isAnswered = false;
    this.terminal = null;
    this.hackCount = 0;
  }

  preload() {
    this.load.image('background', 'path/to/background/image.png');
    this.load.image('player', 'path/to/player/image.png');
    this.load.image('terminal', 'path/to/terminal/image.png');
    this.load.audio('bg_music', 'path/to/bg_music.mp3');
    this.load.audio('hack_sound', 'path/to/hack_sound.mp3');
  }

  create() {
    this.resetGame(); // Ensure game resets when starting a new game

    const bg = this.add.image(0, 0, 'background').setOrigin(0);
    bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2);
    this.player.setVelocity(0);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.scene.launch('UIScene');

    this.bgMusic = this.sound.add('bg_music', { loop: true, volume: 0.2 });
    this.bgMusic.play();

    this.spawnTerminal();
    this.updateUI();
  }

  resetGame() {
    // Reset all variables related to the game state
    this.hasHacked = false;
    this.correctAnswer = null;
    this.options = [];
    this.selectedOption = null;
    this.isAnswered = false;
    this.terminal = null;
    this.hackCount = 0;

    // Reset modal and other UI elements
    if (this.modal) {
      this.modal.destroy();
      this.modal = null;
    }

    // Stop background music before restarting
    if (this.bgMusic) {
      this.bgMusic.stop();
    }
  }

  update() {
    this.player.setVelocity(0);
    const speed = 800; // Increased speed

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
  }

  spawnTerminal() {
    const terminalX = Phaser.Math.Between(100, this.sys.game.config.width - 100);
    const terminalY = Phaser.Math.Between(100, this.sys.game.config.height - 100);
    this.terminal = this.add.image(terminalX, terminalY, 'terminal').setInteractive();
    this.terminal.setScale(0.05);

    this.terminal.on('pointerdown', () => this.checkDistanceForHack());
  }

  checkDistanceForHack() {
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, this.terminal.x, this.terminal.y
    );

    if (distance < 100 && (!this.hasHacked || this.isAnswered)) {
      this.startHack();
    } else if (distance >= 100) {
      this.events.emit('showPrompt', 'Get closer to the terminal to hack!');
    }
  }

  startHack() {
    this.hasHacked = true;
    this.isAnswered = false;
    this.events.emit('showPrompt', 'Hacking terminal...');
    this.sound.play('hack_sound', {volume: 0.2});
    this.fetchMathQuestion();
  }

  fetchMathQuestion() {
    try {
      const question = this.generateRandomMathQuestion();
      this.correctAnswer = math.evaluate(question);
      this.options = this.generateMultipleChoiceOptions(this.correctAnswer);
      this.events.emit('showQuestion', question);
      this.createModal(question);
    } catch (error) {
      console.error("Error generating math question:", error);
      this.events.emit('showPrompt', 'Failed to retrieve puzzle.');
    }
  }

  generateRandomMathQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
    return `${num1} ${operator} ${num2}`;
  }

  generateMultipleChoiceOptions(correctAnswer) {
    const options = [correctAnswer];
    while (options.length < 4) {
      const randomOption = Math.floor(Math.random() * 20) + 1;
      if (!options.includes(randomOption)) {
        options.push(randomOption);
      }
    }
    return Phaser.Utils.Array.Shuffle(options);
  }

  createModal(question) {
    this.modal = this.add.container(this.sys.game.config.width / 2, this.sys.game.config.height / 2);

    const modalWidth = 600;
    const modalHeight = 350;
    const modalBackground = this.add.rectangle(0, 0, modalWidth, modalHeight, 0x000000, 0.8);
    modalBackground.setOrigin(0.5);
    this.modal.add(modalBackground);

    const questionText = this.add.text(0, -100, `Solve: ${question}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'monospace',
      wordWrap: { width: modalWidth - 40 },
    });
    questionText.setOrigin(0.5);
    this.modal.add(questionText);

    let xOffset = -160;
    this.options.forEach((option, index) => {
      const optionText = this.add.text(xOffset, 40, `${option}`, {
        fontSize: '20px',
        fill: '#fff',
        fontFamily: 'monospace',
      })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.checkAnswer(option));

      this.modal.add(optionText);
      xOffset += 130;
    });

    this.modal.x = this.sys.game.config.width / 2;
    this.modal.y = this.sys.game.config.height / 2;
  }

  checkAnswer(selectedOption) {
    if (selectedOption === this.correctAnswer) {
      this.events.emit('showPrompt', 'Correct! You hacked the terminal.');
      this.hackCount++;
      this.updateUI();

      // Remove the terminal
      this.terminal.setVisible(false);
      this.terminal.disableInteractive();

      // Reset flags
      this.hasHacked = false;
      this.isAnswered = false;

      this.time.delayedCall(3000, () => {
        if (this.hackCount < 10) {
          this.closeModal();
          this.spawnTerminal();
        } else {
          this.events.emit('showPrompt', 'You have hacked 10 terminals! Returning to the main menu...');
          this.time.delayedCall(2000, () => this.scene.start('MainMenuScene'));
        }
      });
    } else {
      this.events.emit('showPrompt', 'Incorrect! Click the terminal to try a new question.');
      this.modal.setAlpha(0.5);
      this.isAnswered = true;

      this.time.delayedCall(1000, () => {
        this.closeModal(); // Let player try again on same terminal
      });
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.destroy();
    }
    this.modal = null;
  }

  updateUI() {
    this.events.emit('updateHackCount', `Hacks Completed: ${this.hackCount} / 10`);
  }
}

window.GameScene = GameScene;
