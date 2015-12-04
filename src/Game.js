import Tetromino from './Tetromino';
import {Types} from './Tetromino';
import Constants from './Constants';
import Stage from './Stage';

export default class Game {
  constructor() {
    console.log(PIXI);

    // DOM container
    this._domContainer = document.getElementById('game');

    // Keyboard events
    var leftKey = this._keyboard(37);
    var upKey = this._keyboard(38);
    var rightKey = this._keyboard(39);
    var downKey = this._keyboard(40);
    leftKey.press = () => this._pressLeft();
    upKey.press = () => this._pressUp();
    rightKey.press = () => this._pressRight();
    downKey.press = () => this._pressDown();
     
    // Set up PIXI and launch game
    this.renderer = PIXI.autoDetectRenderer(Constants.WIDTH * Constants.SQUARE_SIZE, Constants.HEIGHT * Constants.SQUARE_SIZE);
    this._domContainer.appendChild(this.renderer.view);

    // Pixi container
    this.container = new PIXI.Container();

    // Game board/stage
    this.stage = new Stage(this.container); 

    // Current moving tetromino
    this.tetromino = Tetromino.getRandom(this.container);

    // Delay between moves
    this.delay = 300;

    // GO!
    this._start();
  }

  /**
   * Start the game
   */
  _start() {
    var self = this;
    var timer = new Date().getTime();
    function loop() { // Event loop
      if (new Date().getTime() - timer > self.delay) {
        timer = new Date().getTime();
        self.tetromino.move(0, 1); // Gravity
        // If collision, cancel  move and unite the tetromino with the game stage
        if (self.stage.isCollision(self.tetromino)) { 
          self.tetromino.move(0, -1);
          self.stage.unite(self.tetromino);
          self.tetromino = Tetromino.getRandom(self.container);
          // Lose! Restart
          if (self.stage.isCollision(self.tetromino)) {
            self.stage.reset();
          }
        }
        self._render(); // Render
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /**
   * "Press left" event
   */
  _pressLeft() {
    this.tetromino.move(-1, 0);
    if (this.stage.isCollision(this.tetromino)) {
      this.tetromino.move(1, 0);
    }
    this._render();
  }

  /**
   * "Press right" event
   */
  _pressRight() {
    this.tetromino.move(1, 0);
    if (this.stage.isCollision(this.tetromino)) {
      this.tetromino.move(-1, 0);
    }
    this._render();
  }

  /**
   * "Press up" event
   */
  _pressUp() {
    this.tetromino.rotate();
    if (this.stage.isCollision(this.tetromino)) {
      this.tetromino.antiRotate();
    }
    this._render();
  }

  /**
   * "Press down" event
   */
  _pressDown() {
    this.tetromino.move(0, 1);
    if (this.stage.isCollision(this.tetromino)) {
      this.tetromino.move(0, -1);
      this.stage.unite(this.tetromino);
      this.tetromino = Tetromino.getRandom(this.container); 
    }
    this._render();
  }

  /**
   * Render function
   */
  _render() {
    // Remove everything from the container, redraw stage and tetromino and render
    // TODO : do not remove and redraw at every move
    this.container.removeChildren();
    this.stage.draw();
    this.tetromino.draw();
    this.renderer.render(this.container);
  }

  /**
   * Keyboard events helper
   */
  _keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function(event) {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
      }
      event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = function(event) {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
      }
      event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
      "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
      "keyup", key.upHandler.bind(key), false
    );
    return key;
  }

}
