import Tetromino from './Tetromino';
import {Types} from './Tetromino';
import Constants from './Constants';
import Stage from './Stage';

export default class Game {
  constructor() {
    console.log(PIXI);

    // Keyboard
    var leftKey = this._keyboard(37);
    var upKey = this._keyboard(38);
    var rightKey = this._keyboard(39);
    var downKey = this._keyboard(40);
    leftKey.press = () => this._pressLeft();
    upKey.press = () => this._pressUp();
    rightKey.press = () => this._pressRight();
    downKey.press = () => this._pressDown();
     
    // Set up and launch game
    this.renderer = PIXI.autoDetectRenderer(Constants.WIDTH * Constants.SQUARE_SIZE, Constants.HEIGHT * Constants.SQUARE_SIZE);
    document.body.appendChild(this.renderer.view);

    this.container = new PIXI.Container();
    this.stage = new Stage(this.container);
    this.tetromino = Tetromino.getRandom(this.container);
    this.delay = 300;
    this.start();
  }

  start() {
    var self = this;
    var timer = new Date().getTime();
    function loop() {
      if (new Date().getTime() - timer > self.delay) {
        timer = new Date().getTime();
        self.tetromino.move(0, 1);
        if (self.stage.isCollision(self.tetromino)) {
          self.tetromino.move(0, -1);
          self.stage.unite(self.tetromino);
          self.tetromino = Tetromino.getRandom(self.container);
        }
        self._render();
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  _pressLeft() {
    this.tetromino.move(-1, 0);
    if (this.stage.isCollision(this.tetromino)) {
      this.tetromino.move(1, 0);
    }
    this._render();
  }

  _pressRight() {
    this.tetromino.move(1, 0);
    if (this.stage.isCollision(this.tetromino)) {
      this.tetromino.move(-1, 0);
    }
    this._render();
  }

  _pressUp() {
    this.tetromino.rotate();
    if (this.stage.isCollision(this.tetromino)) {
      this.tetromino.antiRotate();
    }
    this._render();
  }

  _pressDown() {
    this.tetromino.move(0, 1);
    if (this.stage.isCollision(this.tetromino)) {
      this.tetromino.move(0, -1);
      this.stage.unite(this.tetromino);
      this.tetromino = Tetromino.getRandom(this.container); 
    }
    this._render();
  }

  _render() {
    this.container.removeChildren();
    this.stage.draw();
    this.tetromino.draw();
    this.renderer.render(this.container);
  }

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
