import Tetromino from './Tetromino';
import {Types} from './Tetromino';
import Constants from './Constants';
import Stage from './Stage';

export default class Game {
  constructor() {
    console.log(PIXI);

    // DOM container
    this._domContainer = document.querySelector(Constants.DOM.CONTAINER);

    // Next tetromino DOM container
    this._domNextContainer = document.querySelector(Constants.DOM.NEXT)

    // Keyboard events
    this._initKeyboardEvents();

    // Mouse events
    this._initMouseEvents();
     
    // Set up PIXI
    this._renderer = PIXI.autoDetectRenderer(Constants.WIDTH * Constants.SQUARE_SIZE, Constants.HEIGHT * Constants.SQUARE_SIZE);

    this._domContainer.appendChild(this._renderer.view);

    // Pixi container
    this._container = new PIXI.Container();

    // Game board/stage
    this._stage = new Stage(this._container); 

    // Init tetrominos
    this._tetromino = undefined; // Tetromino on the stage
    this._nextTetromino = undefined; // Next tetromino
    this._newTetromino();

    // Delay between moves
    this._delay = 300;

    // Init timer
    this._timer = new Date().getTime();

    // GO!
    this._requestId = undefined; // requestAnimationFrame ID (used to pause game)
    this._paused = false;
    this._start();
  }

  /**
   * Start the game
   */
  _start() {
    this._requestId = requestAnimationFrame(() => this._loop());
  }

  _loop() {
    if (new Date().getTime() - this._timer > this._delay) {
      this._timer = new Date().getTime();
      this._tetromino.move(0, 1); // Gravity
      // If collision, cancel  move and unite the tetromino with the game stage
      if (this._stage.isCollision(this._tetromino)) { 
        this._tetromino.move(0, -1);
        this._stage.unite(this._tetromino);
        this._newTetromino();
      }
      this._render(); // Render
    }
    this._requestId = requestAnimationFrame(() => this._loop());
  }

  _pause() {
    this._paused = !this._paused;
    // Stop or restart loop
    if (this._paused) {
      cancelAnimationFrame(this._requestId);
      document.querySelector(Constants.DOM.START_PAUSE).id = 'start';
      document.querySelector(Constants.DOM.START_PAUSE).innerText = 'start';
    } else {
      this._start();   
      document.querySelector(Constants.DOM.START_PAUSE).id = 'pause';
      document.querySelector(Constants.DOM.START_PAUSE).innerText = 'pause';
    }
  }

  _newTetromino() {
    if (!this._nextTetromino) {
      this._nextTetromino = Tetromino.getRandom(this._container);  
    }
    this._tetromino = this._nextTetromino;
    this._nextTetromino = Tetromino.getRandom(this._container);
    this._domNextContainer.className = this._nextTetromino.type.name;
    // Lose! Restart
    if (this._stage.isCollision(this._tetromino)) {
      this._stage.reset();
    }
  }

  /**
   * Init keyboard events
   */
  _initKeyboardEvents() {
    var leftKey = this._keyboard(37);
    var upKey = this._keyboard(38);
    var rightKey = this._keyboard(39);
    var downKey = this._keyboard(40);
    var spaceKey = this._keyboard(32);
    var pKey = this._keyboard(80);
    leftKey.press = () => this._pressLeft();
    upKey.press = () => this._pressUp();
    rightKey.press = () => this._pressRight();
    downKey.press = () => this._pressDown();
    spaceKey.press = () => this._pressSpace();
    pKey.press = () => this._pause();
  }

  /**
   * Init mouse events
   */
  _initMouseEvents() {
    var startPauseButton = document.querySelector(Constants.DOM.START_PAUSE);
    startPauseButton.addEventListener('click', () => this._pause());
  }

  /**
   * "Press left" event
   */
  _pressLeft() {
    if (!this._paused) {
      this._tetromino.move(-1, 0);
      if (this._stage.isCollision(this._tetromino)) {
        this._tetromino.move(1, 0);
      }
      this._render();
    }
  }

  /**
   * "Press right" event
   */
  _pressRight() {
    if (!this._paused) {
      this._tetromino.move(1, 0);
      if (this._stage.isCollision(this._tetromino)) {
        this._tetromino.move(-1, 0);
      }
      this._render();
    }
  }

  /**
   * "Press up" event
   */
  _pressUp() {
    if (!this._paused) {
      this._tetromino.rotate();
      if (this._stage.isCollision(this._tetromino)) {
        this._tetromino.antiRotate();
      }
      this._render();
    }
  }

  /**
   * "Press down" event
   */
  _pressDown() {
    if (!this._paused) {
      this._tetromino.move(0, 1);
      if (this._stage.isCollision(this._tetromino)) {
        this._tetromino.move(0, -1);
        this._stage.unite(this._tetromino);
        this._newTetromino();
      }
      this._render();
    }
  }

  /**
   * "Press space" event
   */
  _pressSpace() {
    if (!this._paused) {
      while (!this._stage.isCollision(this._tetromino)) {
        this._tetromino.move(0, 1);
      }
      this._tetromino.move(0, -1);
      this._stage.unite(this._tetromino);
      this._newTetromino();
      this._render();
    }
  }

  /**
   * Render function
   */
  _render() {
    // Remove everything from the container, redraw stage and tetromino and render
    // TODO : do not remove and redraw at every move
    this._container.removeChildren();
    this._stage.draw();
    this._tetromino.draw();
    this._renderer.render(this._container);
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
        event.preventDefault();
      }
    };

    //The `upHandler`
    key.upHandler = function(event) {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };

    //Attach event listeners
    window.addEventListener(
      'keydown', key.downHandler.bind(key), false
    );
    window.addEventListener(
      'keyup', key.upHandler.bind(key), false
    );
    return key;
  }

}
