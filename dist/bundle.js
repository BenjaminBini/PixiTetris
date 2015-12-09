(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Game constants
 */
exports.default = {
  WIDTH: 12, // Width of the game (in number of blocks)
  HEIGHT: 24, // Height of the game (in number of blocks)
  SQUARE_SIZE: 25, // Width and height of a block (in px)
  COLORS: {
    TETROMINO_BORDERS: 0x373c40,
    TETROMINO_I: 0xff8000,
    TETROMINO_J: 0x2cc990,
    TETROMINO_L: 0xf34344,
    TETROMINO_O: 0xffdf00,
    TETROMINO_S: 0xccdce4,
    TETROMINO_T: 0x008aff,
    TETROMINO_Z: 0xfcb941,
    BACKGROUND: 0x2d3236,
    BORDERS: 0x373C40,
    BORDERS_TRANSPARENCY: 1
  },
  DOM: {
    CONTAINER: '#game',
    NEXT: '#next-tetromino',
    START_PAUSE: '#start-pause button',
    LEVEL: '#level',
    SCORE: '#score',
    CLEARED: '#cleared',
    BEST: '#best-score'
  }
};

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Tetromino = require('./Tetromino');

var _Tetromino2 = _interopRequireDefault(_Tetromino);

var _Constants = require('./Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _Stage = require('./Stage');

var _Stage2 = _interopRequireDefault(_Stage);

var _ScoreManager = require('./ScoreManager');

var _ScoreManager2 = _interopRequireDefault(_ScoreManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = (function () {
  function Game() {
    _classCallCheck(this, Game);

    console.log(PIXI);

    // DOM container
    this._domContainer = document.querySelector(_Constants2.default.DOM.CONTAINER);

    // Next tetromino DOM container
    this._domNextContainer = document.querySelector(_Constants2.default.DOM.NEXT);

    // Keyboard events
    this._initKeyboardEvents();

    // Mouse events
    this._initMouseEvents();

    // Set up PIXI
    this._renderer = PIXI.autoDetectRenderer(_Constants2.default.WIDTH * _Constants2.default.SQUARE_SIZE, _Constants2.default.HEIGHT * _Constants2.default.SQUARE_SIZE);

    this._domContainer.appendChild(this._renderer.view);

    // Pixi container
    this._container = new PIXI.Container();

    // Game board/stage
    this._stage = new _Stage2.default(this._container);

    // Init tetrominos
    this._tetromino = undefined; // Tetromino on the stage
    this._nextTetromino = undefined; // Next tetromino
    this._newTetromino();

    // Delay between moves
    this._delay = 300;

    // Init timer
    this._timer = new Date().getTime();

    // Score manager
    this._scoreManager = new _ScoreManager2.default();

    // GO!
    this._requestId = undefined; // requestAnimationFrame ID (used to pause game)
    this._paused = false;
    this._start();
  }

  /**
   * Start the game
   */

  _createClass(Game, [{
    key: '_start',
    value: function _start() {
      var _this = this;

      this._requestId = requestAnimationFrame(function () {
        return _this._loop();
      });
    }

    /**
     * Game loop
     */

  }, {
    key: '_loop',
    value: function _loop() {
      var _this2 = this;

      if (new Date().getTime() - this._timer > this._delay) {
        this._timer = new Date().getTime();
        this._drop();
        this._render(); // Render
      }
      this._requestId = requestAnimationFrame(function () {
        return _this2._loop();
      });
    }

    /**
     * Pause the game
     */

  }, {
    key: '_pause',
    value: function _pause() {
      this._paused = !this._paused;
      // Stop or restart loop
      if (this._paused) {
        cancelAnimationFrame(this._requestId);
        document.querySelector(_Constants2.default.DOM.START_PAUSE).id = 'start';
        document.querySelector(_Constants2.default.DOM.START_PAUSE).innerText = 'resume';
      } else {
        this._start();
        document.querySelector(_Constants2.default.DOM.START_PAUSE).id = 'pause';
        document.querySelector(_Constants2.default.DOM.START_PAUSE).innerText = 'pause';
      }
    }

    /**
     * Move the current tetromino downward
     */

  }, {
    key: '_drop',
    value: function _drop() {
      this._tetromino.move(0, 1); // Gravity
      // If collision, cancel  move and unite the tetromino with the game stage
      if (this._stage.isCollision(this._tetromino)) {
        this._tetromino.move(0, -1);
        this._tetromino.remove();
        var clearedLines = this._stage.unite(this._tetromino);
        if (clearedLines > 0) {
          this._scoreManager.addClearedLines(clearedLines);
        }
        this._scoreManager.tetrominoDropped();
        this._newTetromino();
      }
    }

    /**
     * Move the current tetromino as down as possible
     */

  }, {
    key: '_hardDrop',
    value: function _hardDrop() {
      while (!this._stage.isCollision(this._tetromino)) {
        this._tetromino.move(0, 1);
      }
      this._tetromino.move(0, -1);
      this._tetromino.remove();
      var clearedLines = this._stage.unite(this._tetromino);
      if (clearedLines > 0) {
        this._scoreManager.addClearedLines(clearedLines);
      }
      this._scoreManager.tetrominoDropped();
      this._newTetromino();
    }

    /**
     * Called when the game is over
     */

  }, {
    key: '_gameOver',
    value: function _gameOver() {
      this._stage.reset();
      this._scoreManager.reset();
    }

    /**
     * Put a new tetromino on the board
     * And check if the game is lost or not
     */

  }, {
    key: '_newTetromino',
    value: function _newTetromino() {
      if (!this._nextTetromino) {
        this._nextTetromino = _Tetromino2.default.getRandom(this._container);
      }
      this._tetromino = this._nextTetromino;
      this._nextTetromino = _Tetromino2.default.getRandom(this._container);
      this._domNextContainer.className = this._nextTetromino.type.name;
      // Lose! Restart
      if (this._stage.isCollision(this._tetromino)) {
        this._gameOver();
      }
    }

    /**
     * Init keyboard events
     */

  }, {
    key: '_initKeyboardEvents',
    value: function _initKeyboardEvents() {
      var _this3 = this;

      var leftKey = this._keyboard(37);
      var upKey = this._keyboard(38);
      var rightKey = this._keyboard(39);
      var downKey = this._keyboard(40);
      var spaceKey = this._keyboard(32);
      var pKey = this._keyboard(80);
      leftKey.press = function () {
        return _this3._pressLeft();
      };
      upKey.press = function () {
        return _this3._pressUp();
      };
      rightKey.press = function () {
        return _this3._pressRight();
      };
      downKey.press = function () {
        return _this3._pressDown();
      };
      spaceKey.press = function () {
        return _this3._pressSpace();
      };
      pKey.press = function () {
        return _this3._pause();
      };
    }

    /**
     * Init mouse events
     */

  }, {
    key: '_initMouseEvents',
    value: function _initMouseEvents() {
      var _this4 = this;

      var startPauseButton = document.querySelector(_Constants2.default.DOM.START_PAUSE);
      startPauseButton.addEventListener('click', function () {
        return _this4._pause();
      });
    }

    /**
     * "Press left" event
     */

  }, {
    key: '_pressLeft',
    value: function _pressLeft() {
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

  }, {
    key: '_pressRight',
    value: function _pressRight() {
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

  }, {
    key: '_pressUp',
    value: function _pressUp() {
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

  }, {
    key: '_pressDown',
    value: function _pressDown() {
      if (!this._paused) {
        this._drop();
        this._render();
      }
    }

    /**
     * "Press space" event
     */

  }, {
    key: '_pressSpace',
    value: function _pressSpace() {
      if (!this._paused) {
        this._hardDrop();
        this._render();
      }
    }

    /**
     * Render function
     */

  }, {
    key: '_render',
    value: function _render() {
      this._stage.draw();
      this._tetromino.draw();
      this._renderer.render(this._container);
    }

    /**
     * Keyboard events helper
     */

  }, {
    key: '_keyboard',
    value: function _keyboard(keyCode) {
      var key = {};
      key.code = keyCode;
      key.isDown = false;
      key.isUp = true;
      key.press = undefined;
      key.release = undefined;
      //The `downHandler`
      key.downHandler = function (event) {
        if (event.keyCode === key.code) {
          if (key.isUp && key.press) key.press();
          key.isDown = true;
          key.isUp = false;
          event.preventDefault();
        }
      };

      //The `upHandler`
      key.upHandler = function (event) {
        if (event.keyCode === key.code) {
          if (key.isDown && key.release) key.release();
          key.isDown = false;
          key.isUp = true;
          event.preventDefault();
        }
      };

      //Attach event listeners
      window.addEventListener('keydown', key.downHandler.bind(key), false);
      window.addEventListener('keyup', key.upHandler.bind(key), false);
      return key;
    }
  }]);

  return Game;
})();

exports.default = Game;

},{"./Constants":1,"./ScoreManager":3,"./Stage":4,"./Tetromino":5}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Constants = require('./Constants');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScoreManager = (function () {
  function ScoreManager() {
    _classCallCheck(this, ScoreManager);

    this.reset();
  }

  _createClass(ScoreManager, [{
    key: 'reset',
    value: function reset() {
      this.level = 0;
      this.score = 0;
      this.clearedLines = 0;
      this.updateDisplay();
    }
  }, {
    key: '_addPoints',
    value: function _addPoints(points) {
      this.score += points;
    }
  }, {
    key: 'addClearedLines',
    value: function addClearedLines(lines) {
      var previousClearedLines = this.clearedLines;
      this.clearedLines += lines;
      if (previousClearedLines % 10 > this.clearedLines % 10) {
        this.level++;
      }
      if (lines === 1) {
        this._addPoints(40 * (this.level + 1));
      } else if (lines === 2) {
        this._addPoints(100 * (this.level + 1));
      } else if (lines === 3) {
        this._addPoints(300 * (this.level + 1));
      } else if (lines === 4) {
        this._addPoints(1200 * (this.level + 1));
      }
      this.updateDisplay();
    }
  }, {
    key: 'tetrominoDropped',
    value: function tetrominoDropped() {
      this._addPoints(5 * (this.level + 1));
      this.updateDisplay();
    }
  }, {
    key: 'updateDisplay',
    value: function updateDisplay() {
      document.querySelector(_Constants2.default.DOM.LEVEL).innerText = this.level;
      document.querySelector(_Constants2.default.DOM.SCORE).innerText = this.score;
      document.querySelector(_Constants2.default.DOM.CLEARED).innerText = this.clearedLines;
    }
  }]);

  return ScoreManager;
})();

exports.default = ScoreManager;

},{"./Constants":1}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Constants = require('./Constants');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represent the game stage
 */

var Stage = (function () {
  function Stage(container) {
    _classCallCheck(this, Stage);

    // Set the container
    this._container = container;

    // _data represents the state of every block of the stage
    // 0 for "empty", hexa code color if not
    // We initialize it with zeros
    this._data = [];
    for (var x = 0; x < _Constants2.default.WIDTH; x++) {
      this._data.push([]);
      for (var y = 0; y < _Constants2.default.HEIGHT; y++) {
        this._data[x].push(0);
      }
    }

    // Pixi's blocks
    this._blocks = [];
  }

  /**
   * Add shapes to the _container
   */

  _createClass(Stage, [{
    key: 'draw',
    value: function draw() {
      var i = 0;
      for (var x = 0; x < _Constants2.default.WIDTH; x++) {
        for (var y = 0; y < _Constants2.default.HEIGHT; y++) {
          // Color blocks when not empty
          if (this._data[x][y] !== 0) {
            var block = new PIXI.Graphics();
            block.lineStyle(1, _Constants2.default.COLORS.TETROMINO_BORDERS, 1);
            block.beginFill(this._data[x][y]);
            block.drawRect(0, 0, _Constants2.default.SQUARE_SIZE, _Constants2.default.SQUARE_SIZE);
            block.endFill();
            block.x = x * _Constants2.default.SQUARE_SIZE;
            block.y = y * _Constants2.default.SQUARE_SIZE;
            this._container.removeChild(this._blocks[i]);
            this._container.addChild(block);
            this._blocks[i] = block;
          } else if (this._blocks[i] === undefined) {
            // Just a grid if empty
            var block = new PIXI.Graphics();
            block.lineStyle(1, _Constants2.default.COLORS.BORDERS, _Constants2.default.COLORS.BORDERS_TRANSPARENCY);
            block.beginFill(_Constants2.default.COLORS.BACKGROUND);
            block.drawRect(0, 0, _Constants2.default.SQUARE_SIZE, _Constants2.default.SQUARE_SIZE);
            block.endFill();
            block.x = x * _Constants2.default.SQUARE_SIZE;
            block.y = y * _Constants2.default.SQUARE_SIZE;
            this._container.addChild(block);
            this._blocks[i] = block;
          }
          i++;
        }
      }
    }

    /**
     * Check if 'tetromino' is in collision with the stage
     */

  }, {
    key: 'isCollision',
    value: function isCollision(tetromino) {
      for (var x = 0; x < tetromino.type.size; x++) {
        for (var y = 0; y < tetromino.type.size; y++) {
          if (tetromino.x + x < 0 || tetromino.x + x >= _Constants2.default.WIDTH || y >= _Constants2.default.HEIGHT || tetromino.y >= 0 && this._data[tetromino.x + x][tetromino.y + y] !== 0) {
            if (tetromino.hasBlock(x, y)) {
              return true;
            }
          }
        }
      }
      return false;
    }

    /**
     * Fusion 'tetromino' with the stage
     * If the fusion create a line, we clear the line
     * Return the number of cleared lines
     */

  }, {
    key: 'unite',
    value: function unite(tetromino) {
      var clearedLines = 0;

      // Fusion the tetromino with the stage
      for (var y = 0; y < tetromino.type.size; y++) {
        for (var x = 0; x < tetromino.type.size; x++) {
          if (tetromino.x + x < _Constants2.default.WIDTH && tetromino.x + x >= 0 && tetromino.hasBlock(x, y)) {
            this._data[tetromino.x + x][tetromino.y + y] = tetromino.type.color;
          }
        }
      }

      for (var y = 0; y < tetromino.type.size; y++) {
        // Check if the fusion created a new line
        var eraseLine = true;
        if (y + tetromino.y >= _Constants2.default.HEIGHT) {
          eraseLine = false;
        } else {
          for (var x = 0; x < _Constants2.default.WIDTH; x++) {
            if (this._data[x][y + tetromino.y] === 0) {
              eraseLine = false;
              break;
            }
          }
        }
        // If yes, we erase it and move all concerned blocks
        if (eraseLine) {
          clearedLines++;
          for (var yy = y + tetromino.y; yy >= 0; yy--) {
            for (var x = 0; x < _Constants2.default.WIDTH; x++) {
              if (yy > 0) {
                this._data[x][yy] = this._data[x][yy - 1];
              } else {
                this._data[x][yy] = 0;
              }
            }
          }
          // empty the blocks (we will need to redraw)
          this._blocks = [];
        }
      }

      return clearedLines;
    }

    /**
     * Reset the stage
     */

  }, {
    key: 'reset',
    value: function reset() {
      this._data = [];
      for (var x = 0; x < _Constants2.default.WIDTH; x++) {
        this._data.push([]);
        for (var y = 0; y < _Constants2.default.HEIGHT; y++) {
          this._data[x].push(0);
        }
      }
      this._blocks = [];
    }
  }]);

  return Stage;
})();

exports.default = Stage;

},{"./Constants":1}],5:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Types = undefined;

var _Constants = require('./Constants');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a tetromino
 */

var Tetromino = (function () {
  function Tetromino(type, container) {
    _classCallCheck(this, Tetromino);

    // Set the container
    this._container = container;

    // Type of the tetromino (I, J, L, O, S, T, Z)
    this.type = type;

    // Position of the tetromino
    this.x = Math.floor(_Constants2.default.WIDTH / 2 - this.type.size / 2);
    this.y = 0;

    // Angle of the tetromino (0: 0deg, 1: 90deg, 2: 180deg, 3: 270deg)
    this.angle = 0;

    // Pixi's blocks
    this._blocks = [];
  }

  /**
   * Static method to get a random tetromino
   */

  _createClass(Tetromino, [{
    key: 'draw',

    /**
     * Add shapes to container
     */
    value: function draw() {
      var i = 0;
      for (var x = 0; x < this.type.size; x++) {
        for (var y = 0; y < this.type.size; y++) {
          if (this.type.shapes[this.angle][y][x] === 1) {
            if (this._blocks.length !== 4) {
              var block = new PIXI.Graphics();
              block.lineStyle(1, _Constants2.default.COLORS.TETROMINO_BORDERS, 1);
              block.beginFill(this.type.color);
              block.drawRect(0, 0, _Constants2.default.SQUARE_SIZE, _Constants2.default.SQUARE_SIZE);
              block.endFill();
              this._blocks.push(block);
              this._container.addChild(block);
            }
            this._blocks[i].x = (this.x + x) * _Constants2.default.SQUARE_SIZE;
            this._blocks[i].y = (this.y + y) * _Constants2.default.SQUARE_SIZE;
            i++;
          }
        }
      }
    }

    /**
     * Remove shapes from container
     */

  }, {
    key: 'remove',
    value: function remove() {
      for (var i = 0; i < this._blocks.length; i++) {
        this._container.removeChild(this._blocks[i]);
      }
    }

    /**
     * Rotate the tetromino to the right
     */

  }, {
    key: 'rotate',
    value: function rotate() {
      this.angle += 1;
      this.angle %= 4;
    }

    /**
     * Rotate the tetromino to the left
     */

  }, {
    key: 'antiRotate',
    value: function antiRotate() {
      this.angle -= 1;
      if (this.angle === -1) {
        this.angle = 3;
      }
    }

    /**
     * Move the tetromino
     */

  }, {
    key: 'move',
    value: function move(dx, dy) {
      this.x += dx;
      this.y += dy;
    }

    /**
     * Test if the tetromino has a block in the positino (x, y)
     * x and y being relative the the position of the tetromino
     */

  }, {
    key: 'hasBlock',
    value: function hasBlock(x, y) {
      return this.type.shapes[this.angle][y][x] === 1;
    }
  }], [{
    key: 'getRandom',
    value: function getRandom(container) {
      var types = [Types.I, Types.J, Types.L, Types.O, Types.S, Types.T, Types.Z];
      var type = types[Math.floor(Math.random() * 7)];
      return new Tetromino(type, container);
    }
  }]);

  return Tetromino;
})();

/**
 * Types of tetrominos
 */

exports.default = Tetromino;
var Types = exports.Types = {
  I: {
    name: 'I', // Name of the tetromino
    color: _Constants2.default.COLORS.TETROMINO_I, // Background color
    size: 4, // Size of the 'container' of the tetromino
    shapes: [// All shapes of the tetromino (one per rotation position)
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]], [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]]
  },
  J: {
    name: 'J',
    color: _Constants2.default.COLORS.TETROMINO_J,
    size: 3,
    shapes: [[[1, 0, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 1], [0, 1, 0], [0, 1, 0]], [[0, 0, 0], [1, 1, 1], [0, 0, 1]], [[0, 1, 0], [0, 1, 0], [1, 1, 0]]]
  },
  L: {
    name: 'L',
    color: _Constants2.default.COLORS.TETROMINO_L,
    size: 3,
    shapes: [[[0, 0, 1], [1, 1, 1], [0, 0, 0]], [[0, 1, 0], [0, 1, 0], [0, 1, 1]], [[0, 0, 0], [1, 1, 1], [1, 0, 0]], [[1, 1, 0], [0, 1, 0], [0, 1, 0]]]
  },
  O: {
    name: 'O',
    color: _Constants2.default.COLORS.TETROMINO_O,
    size: 2,
    shapes: [[[1, 1], [1, 1]], [[1, 1], [1, 1]], [[1, 1], [1, 1]], [[1, 1], [1, 1]]]
  },
  S: {
    name: 'S',
    color: _Constants2.default.COLORS.TETROMINO_S,
    size: 3,
    shapes: [[[0, 1, 1], [1, 1, 0], [0, 0, 0]], [[0, 1, 0], [0, 1, 1], [0, 0, 1]], [[0, 0, 0], [0, 1, 1], [1, 1, 0]], [[1, 0, 0], [1, 1, 0], [0, 1, 0]]]
  },
  T: {
    name: 'T',
    color: _Constants2.default.COLORS.TETROMINO_T,
    size: 3,
    shapes: [[[0, 1, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 0], [0, 1, 1], [0, 1, 0]], [[0, 0, 0], [1, 1, 1], [0, 1, 0]], [[0, 1, 0], [1, 1, 0], [0, 1, 0]]]
  },
  Z: {
    name: 'Z',
    color: _Constants2.default.COLORS.TETROMINO_Z,
    size: 3,
    shapes: [[[1, 1, 0], [0, 1, 1], [0, 0, 0]], [[0, 0, 1], [0, 1, 1], [0, 1, 0]], [[0, 0, 0], [1, 1, 0], [0, 1, 1]], [[0, 1, 0], [1, 1, 0], [1, 0, 0]]]
  }
};

},{"./Constants":1}],6:[function(require,module,exports){
'use strict';

var _Game = require('./Game');

var _Game2 = _interopRequireDefault(_Game);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var g = new _Game2.default();

},{"./Game":2}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQ29uc3RhbnRzLmpzIiwic3JjL0dhbWUuanMiLCJzcmMvU2NvcmVNYW5hZ2VyLmpzIiwic3JjL1N0YWdlLmpzIiwic3JjL1RldHJvbWluby5qcyIsInNyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O2tCQ0dlO0FBQ2IsT0FBSyxFQUFFLEVBQUU7QUFDVCxRQUFNLEVBQUUsRUFBRTtBQUNWLGFBQVcsRUFBRSxFQUFFO0FBQ2YsUUFBTSxFQUFFO0FBQ1AscUJBQWlCLEVBQUUsUUFBUTtBQUMzQixlQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFXLEVBQUUsUUFBUTtBQUNyQixjQUFVLEVBQUUsUUFBUTtBQUNwQixXQUFPLEVBQUUsUUFBUTtBQUNqQix3QkFBb0IsRUFBRSxDQUFDO0dBQ3ZCO0FBQ0QsS0FBRyxFQUFFO0FBQ0osYUFBUyxFQUFFLE9BQU87QUFDbEIsUUFBSSxFQUFFLGlCQUFpQjtBQUN2QixlQUFXLEVBQUUscUJBQXFCO0FBQ2pDLFNBQUssRUFBRSxRQUFRO0FBQ2YsU0FBSyxFQUFFLFFBQVE7QUFDZixXQUFPLEVBQUUsVUFBVTtBQUNuQixRQUFJLEVBQUUsYUFBYTtHQUNwQjtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDdkJvQixJQUFJO0FBQ3ZCLFdBRG1CLElBQUksR0FDVDswQkFESyxJQUFJOztBQUVyQixXQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQzs7O0FBQUMsQUFHbEIsUUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLG9CQUFVLEdBQUcsQ0FBQyxTQUFTLENBQUM7OztBQUFDLEFB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QyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxvQkFBVSxNQUFNLENBQUMsV0FBVztBQUNuQyxRQUFJLEVBQUUsQ0FBQztBQUNQLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsb0JBQVUsTUFBTSxDQUFDLFdBQVc7QUFDbkMsUUFBSSxFQUFFLENBQUM7QUFDUCxVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLG9CQUFVLE1BQU0sQ0FBQyxXQUFXO0FBQ25DLFFBQUksRUFBRSxDQUFDO0FBQ1AsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDTCxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDTixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ0wsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ04sRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNMLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNOLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDTCxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDTixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxvQkFBVSxNQUFNLENBQUMsV0FBVztBQUNuQyxRQUFJLEVBQUUsQ0FBQztBQUNQLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsb0JBQVUsTUFBTSxDQUFDLFdBQVc7QUFDbkMsUUFBSSxFQUFHLENBQUM7QUFDUixVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLG9CQUFVLE1BQU0sQ0FBQyxXQUFXO0FBQ25DLFFBQUksRUFBRyxDQUFDO0FBQ1IsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixDQUNGO0dBQ0Y7Q0FDRixDQUFDOzs7Ozs7Ozs7OztBQ3RTRixJQUFJLENBQUMsR0FBRyxvQkFBVSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogR2FtZSBjb25zdGFudHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICBXSURUSDogMTIsIC8vIFdpZHRoIG9mIHRoZSBnYW1lIChpbiBudW1iZXIgb2YgYmxvY2tzKVxuICBIRUlHSFQ6IDI0LCAvLyBIZWlnaHQgb2YgdGhlIGdhbWUgKGluIG51bWJlciBvZiBibG9ja3MpXG4gIFNRVUFSRV9TSVpFOiAyNSwgLy8gV2lkdGggYW5kIGhlaWdodCBvZiBhIGJsb2NrIChpbiBweClcbiAgQ09MT1JTOiB7XG4gIFx0VEVUUk9NSU5PX0JPUkRFUlM6IDB4MzczYzQwLFxuICBcdFRFVFJPTUlOT19JOiAweGZmODAwMCxcbiAgXHRURVRST01JTk9fSjogMHgyY2M5OTAsXG4gIFx0VEVUUk9NSU5PX0w6IDB4ZjM0MzQ0LFxuICBcdFRFVFJPTUlOT19POiAweGZmZGYwMCxcbiAgXHRURVRST01JTk9fUzogMHhjY2RjZTQsXG4gIFx0VEVUUk9NSU5PX1Q6IDB4MDA4YWZmLFxuICBcdFRFVFJPTUlOT19aOiAweGZjYjk0MSxcbiAgXHRCQUNLR1JPVU5EOiAweDJkMzIzNixcbiAgXHRCT1JERVJTOiAweDM3M0M0MCxcbiAgXHRCT1JERVJTX1RSQU5TUEFSRU5DWTogMVxuICB9LFxuICBET006IHtcbiAgXHRDT05UQUlORVI6ICcjZ2FtZScsXG4gIFx0TkVYVDogJyNuZXh0LXRldHJvbWlubycsXG4gIFx0U1RBUlRfUEFVU0U6ICcjc3RhcnQtcGF1c2UgYnV0dG9uJyxcbiAgICBMRVZFTDogJyNsZXZlbCcsXG4gICAgU0NPUkU6ICcjc2NvcmUnLFxuICAgIENMRUFSRUQ6ICcjY2xlYXJlZCcsXG4gICAgQkVTVDogJyNiZXN0LXNjb3JlJ1xuICB9XG59O1xuIiwiaW1wb3J0IFRldHJvbWlubyBmcm9tICcuL1RldHJvbWlubyc7XG5pbXBvcnQge1R5cGVzfSBmcm9tICcuL1RldHJvbWlubyc7XG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcbmltcG9ydCBTdGFnZSBmcm9tICcuL1N0YWdlJztcbmltcG9ydCBTY29yZU1hbmFnZXIgZnJvbSAnLi9TY29yZU1hbmFnZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc29sZS5sb2coUElYSSk7XG5cbiAgICAvLyBET00gY29udGFpbmVyXG4gICAgdGhpcy5fZG9tQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLkNPTlRBSU5FUik7XG5cbiAgICAvLyBOZXh0IHRldHJvbWlubyBET00gY29udGFpbmVyXG4gICAgdGhpcy5fZG9tTmV4dENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5ORVhUKVxuXG4gICAgLy8gS2V5Ym9hcmQgZXZlbnRzXG4gICAgdGhpcy5faW5pdEtleWJvYXJkRXZlbnRzKCk7XG5cbiAgICAvLyBNb3VzZSBldmVudHNcbiAgICB0aGlzLl9pbml0TW91c2VFdmVudHMoKTtcbiAgICAgXG4gICAgLy8gU2V0IHVwIFBJWElcbiAgICB0aGlzLl9yZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKENvbnN0YW50cy5XSURUSCAqIENvbnN0YW50cy5TUVVBUkVfU0laRSwgQ29uc3RhbnRzLkhFSUdIVCAqIENvbnN0YW50cy5TUVVBUkVfU0laRSk7XG5cbiAgICB0aGlzLl9kb21Db250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fcmVuZGVyZXIudmlldyk7XG5cbiAgICAvLyBQaXhpIGNvbnRhaW5lclxuICAgIHRoaXMuX2NvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuXG4gICAgLy8gR2FtZSBib2FyZC9zdGFnZVxuICAgIHRoaXMuX3N0YWdlID0gbmV3IFN0YWdlKHRoaXMuX2NvbnRhaW5lcik7IFxuXG4gICAgLy8gSW5pdCB0ZXRyb21pbm9zXG4gICAgdGhpcy5fdGV0cm9taW5vID0gdW5kZWZpbmVkOyAvLyBUZXRyb21pbm8gb24gdGhlIHN0YWdlXG4gICAgdGhpcy5fbmV4dFRldHJvbWlubyA9IHVuZGVmaW5lZDsgLy8gTmV4dCB0ZXRyb21pbm9cbiAgICB0aGlzLl9uZXdUZXRyb21pbm8oKTtcblxuICAgIC8vIERlbGF5IGJldHdlZW4gbW92ZXNcbiAgICB0aGlzLl9kZWxheSA9IDMwMDtcblxuICAgIC8vIEluaXQgdGltZXJcbiAgICB0aGlzLl90aW1lciA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgLy8gU2NvcmUgbWFuYWdlclxuICAgIHRoaXMuX3Njb3JlTWFuYWdlciA9IG5ldyBTY29yZU1hbmFnZXIoKTtcblxuICAgIC8vIEdPIVxuICAgIHRoaXMuX3JlcXVlc3RJZCA9IHVuZGVmaW5lZDsgLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIElEICh1c2VkIHRvIHBhdXNlIGdhbWUpXG4gICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgdGhpcy5fc3RhcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB0aGUgZ2FtZVxuICAgKi9cbiAgX3N0YXJ0KCkge1xuICAgIHRoaXMuX3JlcXVlc3RJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLl9sb29wKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdhbWUgbG9vcFxuICAgKi9cbiAgX2xvb3AoKSB7XG4gICAgaWYgKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGhpcy5fdGltZXIgPiB0aGlzLl9kZWxheSkge1xuICAgICAgdGhpcy5fdGltZXIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuX2Ryb3AoKTtcbiAgICAgIHRoaXMuX3JlbmRlcigpOyAvLyBSZW5kZXJcbiAgICB9XG4gICAgdGhpcy5fcmVxdWVzdElkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuX2xvb3AoKSk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2UgdGhlIGdhbWVcbiAgICovXG4gIF9wYXVzZSgpIHtcbiAgICB0aGlzLl9wYXVzZWQgPSAhdGhpcy5fcGF1c2VkO1xuICAgIC8vIFN0b3Agb3IgcmVzdGFydCBsb29wXG4gICAgaWYgKHRoaXMuX3BhdXNlZCkge1xuICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmVxdWVzdElkKTtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TVEFSVF9QQVVTRSkuaWQgPSAnc3RhcnQnO1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLlNUQVJUX1BBVVNFKS5pbm5lclRleHQgPSAncmVzdW1lJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc3RhcnQoKTsgICBcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TVEFSVF9QQVVTRSkuaWQgPSAncGF1c2UnO1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLlNUQVJUX1BBVVNFKS5pbm5lclRleHQgPSAncGF1c2UnO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHRoZSBjdXJyZW50IHRldHJvbWlubyBkb3dud2FyZFxuICAgKi9cbiAgX2Ryb3AoKSB7XG4gICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMCwgMSk7IC8vIEdyYXZpdHlcbiAgICAvLyBJZiBjb2xsaXNpb24sIGNhbmNlbCAgbW92ZSBhbmQgdW5pdGUgdGhlIHRldHJvbWlubyB3aXRoIHRoZSBnYW1lIHN0YWdlXG4gICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHsgXG4gICAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgwLCAtMSk7XG4gICAgICB0aGlzLl90ZXRyb21pbm8ucmVtb3ZlKCk7XG4gICAgICB2YXIgY2xlYXJlZExpbmVzID0gdGhpcy5fc3RhZ2UudW5pdGUodGhpcy5fdGV0cm9taW5vKTtcbiAgICAgIGlmIChjbGVhcmVkTGluZXMgPiAwKSB7XG4gICAgICAgIHRoaXMuX3Njb3JlTWFuYWdlci5hZGRDbGVhcmVkTGluZXMoY2xlYXJlZExpbmVzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3Njb3JlTWFuYWdlci50ZXRyb21pbm9Ecm9wcGVkKCk7XG4gICAgICB0aGlzLl9uZXdUZXRyb21pbm8oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgY3VycmVudCB0ZXRyb21pbm8gYXMgZG93biBhcyBwb3NzaWJsZVxuICAgKi9cbiAgX2hhcmREcm9wKCkge1xuICAgIHdoaWxlICghdGhpcy5fc3RhZ2UuaXNDb2xsaXNpb24odGhpcy5fdGV0cm9taW5vKSkge1xuICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMCwgMSk7XG4gICAgfVxuICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDAsIC0xKTtcbiAgICB0aGlzLl90ZXRyb21pbm8ucmVtb3ZlKCk7XG4gICAgdmFyIGNsZWFyZWRMaW5lcyA9IHRoaXMuX3N0YWdlLnVuaXRlKHRoaXMuX3RldHJvbWlubyk7XG4gICAgaWYgKGNsZWFyZWRMaW5lcyA+IDApIHtcbiAgICAgIHRoaXMuX3Njb3JlTWFuYWdlci5hZGRDbGVhcmVkTGluZXMoY2xlYXJlZExpbmVzKTtcbiAgICB9XG4gICAgdGhpcy5fc2NvcmVNYW5hZ2VyLnRldHJvbWlub0Ryb3BwZWQoKTtcbiAgICB0aGlzLl9uZXdUZXRyb21pbm8oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgZ2FtZSBpcyBvdmVyXG4gICAqL1xuICBfZ2FtZU92ZXIoKSB7XG4gICAgdGhpcy5fc3RhZ2UucmVzZXQoKTtcbiAgICB0aGlzLl9zY29yZU1hbmFnZXIucmVzZXQoKTtcbiAgfVxuICBcblxuICAvKipcbiAgICogUHV0IGEgbmV3IHRldHJvbWlubyBvbiB0aGUgYm9hcmRcbiAgICogQW5kIGNoZWNrIGlmIHRoZSBnYW1lIGlzIGxvc3Qgb3Igbm90XG4gICAqL1xuICBfbmV3VGV0cm9taW5vKCkge1xuICAgIGlmICghdGhpcy5fbmV4dFRldHJvbWlubykge1xuICAgICAgdGhpcy5fbmV4dFRldHJvbWlubyA9IFRldHJvbWluby5nZXRSYW5kb20odGhpcy5fY29udGFpbmVyKTsgIFxuICAgIH1cbiAgICB0aGlzLl90ZXRyb21pbm8gPSB0aGlzLl9uZXh0VGV0cm9taW5vO1xuICAgIHRoaXMuX25leHRUZXRyb21pbm8gPSBUZXRyb21pbm8uZ2V0UmFuZG9tKHRoaXMuX2NvbnRhaW5lcik7XG4gICAgdGhpcy5fZG9tTmV4dENvbnRhaW5lci5jbGFzc05hbWUgPSB0aGlzLl9uZXh0VGV0cm9taW5vLnR5cGUubmFtZTtcbiAgICAvLyBMb3NlISBSZXN0YXJ0XG4gICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcbiAgICAgIHRoaXMuX2dhbWVPdmVyKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXQga2V5Ym9hcmQgZXZlbnRzXG4gICAqL1xuICBfaW5pdEtleWJvYXJkRXZlbnRzKCkge1xuICAgIHZhciBsZWZ0S2V5ID0gdGhpcy5fa2V5Ym9hcmQoMzcpO1xuICAgIHZhciB1cEtleSA9IHRoaXMuX2tleWJvYXJkKDM4KTtcbiAgICB2YXIgcmlnaHRLZXkgPSB0aGlzLl9rZXlib2FyZCgzOSk7XG4gICAgdmFyIGRvd25LZXkgPSB0aGlzLl9rZXlib2FyZCg0MCk7XG4gICAgdmFyIHNwYWNlS2V5ID0gdGhpcy5fa2V5Ym9hcmQoMzIpO1xuICAgIHZhciBwS2V5ID0gdGhpcy5fa2V5Ym9hcmQoODApO1xuICAgIGxlZnRLZXkucHJlc3MgPSAoKSA9PiB0aGlzLl9wcmVzc0xlZnQoKTtcbiAgICB1cEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzVXAoKTtcbiAgICByaWdodEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzUmlnaHQoKTtcbiAgICBkb3duS2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcHJlc3NEb3duKCk7XG4gICAgc3BhY2VLZXkucHJlc3MgPSAoKSA9PiB0aGlzLl9wcmVzc1NwYWNlKCk7XG4gICAgcEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3BhdXNlKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdCBtb3VzZSBldmVudHNcbiAgICovXG4gIF9pbml0TW91c2VFdmVudHMoKSB7XG4gICAgdmFyIHN0YXJ0UGF1c2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uU1RBUlRfUEFVU0UpO1xuICAgIHN0YXJ0UGF1c2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9wYXVzZSgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcIlByZXNzIGxlZnRcIiBldmVudFxuICAgKi9cbiAgX3ByZXNzTGVmdCgpIHtcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xuICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoLTEsIDApO1xuICAgICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcbiAgICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMSwgMCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXCJQcmVzcyByaWdodFwiIGV2ZW50XG4gICAqL1xuICBfcHJlc3NSaWdodCgpIHtcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xuICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMSwgMCk7XG4gICAgICBpZiAodGhpcy5fc3RhZ2UuaXNDb2xsaXNpb24odGhpcy5fdGV0cm9taW5vKSkge1xuICAgICAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgtMSwgMCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogXCJQcmVzcyB1cFwiIGV2ZW50XG4gICAqL1xuICBfcHJlc3NVcCgpIHtcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xuICAgICAgdGhpcy5fdGV0cm9taW5vLnJvdGF0ZSgpO1xuICAgICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcbiAgICAgICAgdGhpcy5fdGV0cm9taW5vLmFudGlSb3RhdGUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3JlbmRlcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcIlByZXNzIGRvd25cIiBldmVudFxuICAgKi9cbiAgX3ByZXNzRG93bigpIHtcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xuICAgICAgdGhpcy5fZHJvcCgpO1xuICAgICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFwiUHJlc3Mgc3BhY2VcIiBldmVudFxuICAgKi9cbiAgX3ByZXNzU3BhY2UoKSB7XG4gICAgaWYgKCF0aGlzLl9wYXVzZWQpIHtcbiAgICAgIHRoaXMuX2hhcmREcm9wKCk7XG4gICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIGZ1bmN0aW9uXG4gICAqL1xuICBfcmVuZGVyKCkge1xuICAgIHRoaXMuX3N0YWdlLmRyYXcoKTtcbiAgICB0aGlzLl90ZXRyb21pbm8uZHJhdygpO1xuICAgIHRoaXMuX3JlbmRlcmVyLnJlbmRlcih0aGlzLl9jb250YWluZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEtleWJvYXJkIGV2ZW50cyBoZWxwZXJcbiAgICovXG4gIF9rZXlib2FyZChrZXlDb2RlKSB7XG4gICAgdmFyIGtleSA9IHt9O1xuICAgIGtleS5jb2RlID0ga2V5Q29kZTtcbiAgICBrZXkuaXNEb3duID0gZmFsc2U7XG4gICAga2V5LmlzVXAgPSB0cnVlO1xuICAgIGtleS5wcmVzcyA9IHVuZGVmaW5lZDtcbiAgICBrZXkucmVsZWFzZSA9IHVuZGVmaW5lZDtcbiAgICAvL1RoZSBgZG93bkhhbmRsZXJgXG4gICAga2V5LmRvd25IYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSBrZXkuY29kZSkge1xuICAgICAgICBpZiAoa2V5LmlzVXAgJiYga2V5LnByZXNzKSBrZXkucHJlc3MoKTtcbiAgICAgICAga2V5LmlzRG93biA9IHRydWU7XG4gICAgICAgIGtleS5pc1VwID0gZmFsc2U7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vVGhlIGB1cEhhbmRsZXJgXG4gICAga2V5LnVwSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0ga2V5LmNvZGUpIHtcbiAgICAgICAgaWYgKGtleS5pc0Rvd24gJiYga2V5LnJlbGVhc2UpIGtleS5yZWxlYXNlKCk7XG4gICAgICAgIGtleS5pc0Rvd24gPSBmYWxzZTtcbiAgICAgICAga2V5LmlzVXAgPSB0cnVlO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvL0F0dGFjaCBldmVudCBsaXN0ZW5lcnNcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICdrZXlkb3duJywga2V5LmRvd25IYW5kbGVyLmJpbmQoa2V5KSwgZmFsc2VcbiAgICApO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgJ2tleXVwJywga2V5LnVwSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXG4gICAgKTtcbiAgICByZXR1cm4ga2V5O1xuICB9XG5cbn1cbiIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY29yZU1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLmxldmVsID0gMDtcbiAgICB0aGlzLnNjb3JlID0gMDtcbiAgICB0aGlzLmNsZWFyZWRMaW5lcyA9IDA7XG4gICAgdGhpcy51cGRhdGVEaXNwbGF5KCk7XG4gIH1cblxuICBfYWRkUG9pbnRzKHBvaW50cykge1xuICAgIHRoaXMuc2NvcmUgKz0gcG9pbnRzO1xuICB9XG5cbiAgYWRkQ2xlYXJlZExpbmVzKGxpbmVzKSB7XG4gICAgdmFyIHByZXZpb3VzQ2xlYXJlZExpbmVzID0gdGhpcy5jbGVhcmVkTGluZXM7XG4gICAgdGhpcy5jbGVhcmVkTGluZXMgKz0gbGluZXM7XG4gICAgaWYgKHByZXZpb3VzQ2xlYXJlZExpbmVzICUgMTAgPiB0aGlzLmNsZWFyZWRMaW5lcyAlIDEwKSB7XG4gICAgICB0aGlzLmxldmVsKys7XG4gICAgfVxuICAgIGlmIChsaW5lcyA9PT0gMSkge1xuICAgICAgdGhpcy5fYWRkUG9pbnRzKDQwICogKHRoaXMubGV2ZWwgKyAxKSk7XG4gICAgfSBlbHNlIGlmIChsaW5lcyA9PT0gMikge1xuICAgICAgdGhpcy5fYWRkUG9pbnRzKDEwMCAqICh0aGlzLmxldmVsICsgMSkpO1xuICAgIH0gZWxzZSBpZiAobGluZXMgPT09IDMpIHtcbiAgICAgIHRoaXMuX2FkZFBvaW50cygzMDAgKiAodGhpcy5sZXZlbCArIDEpKTtcbiAgICB9IGVsc2UgaWYgKGxpbmVzID09PSA0KSB7XG4gICAgICB0aGlzLl9hZGRQb2ludHMoMTIwMCAqICh0aGlzLmxldmVsICsgMSkpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZURpc3BsYXkoKTtcbiAgfVxuXG4gIHRldHJvbWlub0Ryb3BwZWQoKSB7XG4gICAgdGhpcy5fYWRkUG9pbnRzKDUgKiAodGhpcy5sZXZlbCArIDEpKTtcbiAgICB0aGlzLnVwZGF0ZURpc3BsYXkoKTtcbiAgfVxuXG4gIHVwZGF0ZURpc3BsYXkoKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLkxFVkVMKS5pbm5lclRleHQgPSB0aGlzLmxldmVsO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TQ09SRSkuaW5uZXJUZXh0ID0gdGhpcy5zY29yZTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uQ0xFQVJFRCkuaW5uZXJUZXh0ID0gdGhpcy5jbGVhcmVkTGluZXM7XG4gIH1cbn1cbiIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMnO1xuXG4vKipcbiAqIFJlcHJlc2VudCB0aGUgZ2FtZSBzdGFnZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFnZSB7XG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lcikge1xuICAgIC8vIFNldCB0aGUgY29udGFpbmVyXG4gICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xuXG4gICAgLy8gX2RhdGEgcmVwcmVzZW50cyB0aGUgc3RhdGUgb2YgZXZlcnkgYmxvY2sgb2YgdGhlIHN0YWdlXG4gICAgLy8gMCBmb3IgXCJlbXB0eVwiLCBoZXhhIGNvZGUgY29sb3IgaWYgbm90XG4gICAgLy8gV2UgaW5pdGlhbGl6ZSBpdCB3aXRoIHplcm9zXG4gICAgdGhpcy5fZGF0YSA9IFtdO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcbiAgICAgIHRoaXMuX2RhdGEucHVzaChbXSk7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IENvbnN0YW50cy5IRUlHSFQ7IHkrKykge1xuICAgICAgICB0aGlzLl9kYXRhW3hdLnB1c2goMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUGl4aSdzIGJsb2Nrc1xuICAgIHRoaXMuX2Jsb2NrcyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBzaGFwZXMgdG8gdGhlIF9jb250YWluZXJcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgdmFyIGkgPSAwO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgQ29uc3RhbnRzLkhFSUdIVDsgeSsrKSB7XG4gICAgICAgIC8vIENvbG9yIGJsb2NrcyB3aGVuIG5vdCBlbXB0eVxuICAgICAgICBpZiAodGhpcy5fZGF0YVt4XVt5XSAhPT0gMCkge1xuICAgICAgICAgIHZhciBibG9jayA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgICAgICAgYmxvY2subGluZVN0eWxlKDEsIENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX0JPUkRFUlMsIDEpO1xuICAgICAgICAgIGJsb2NrLmJlZ2luRmlsbCh0aGlzLl9kYXRhW3hdW3ldKTtcbiAgICAgICAgICBibG9jay5kcmF3UmVjdCgwLCAwLCBDb25zdGFudHMuU1FVQVJFX1NJWkUsIENvbnN0YW50cy5TUVVBUkVfU0laRSk7XG4gICAgICAgICAgYmxvY2suZW5kRmlsbCgpO1xuICAgICAgICAgIGJsb2NrLnggPSB4ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xuICAgICAgICAgIGJsb2NrLnkgPSB5ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xuICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLl9ibG9ja3NbaV0pO1xuICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRDaGlsZChibG9jayk7XG4gICAgICAgICAgdGhpcy5fYmxvY2tzW2ldID0gYmxvY2s7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmxvY2tzW2ldID09PSB1bmRlZmluZWQpIHsgLy8gSnVzdCBhIGdyaWQgaWYgZW1wdHlcbiAgICAgICAgICB2YXIgYmxvY2sgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgICAgICAgIGJsb2NrLmxpbmVTdHlsZSgxLCBDb25zdGFudHMuQ09MT1JTLkJPUkRFUlMsIENvbnN0YW50cy5DT0xPUlMuQk9SREVSU19UUkFOU1BBUkVOQ1kpO1xuICAgICAgICAgIGJsb2NrLmJlZ2luRmlsbChDb25zdGFudHMuQ09MT1JTLkJBQ0tHUk9VTkQpO1xuICAgICAgICAgIGJsb2NrLmRyYXdSZWN0KDAsIDAsIENvbnN0YW50cy5TUVVBUkVfU0laRSwgQ29uc3RhbnRzLlNRVUFSRV9TSVpFKTtcbiAgICAgICAgICBibG9jay5lbmRGaWxsKCk7XG4gICAgICAgICAgYmxvY2sueCA9IHggKiBDb25zdGFudHMuU1FVQVJFX1NJWkU7XG4gICAgICAgICAgYmxvY2sueSA9IHkgKiBDb25zdGFudHMuU1FVQVJFX1NJWkU7XG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLmFkZENoaWxkKGJsb2NrKTtcbiAgICAgICAgICB0aGlzLl9ibG9ja3NbaV0gPSBibG9jaztcbiAgICAgICAgfVxuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmICd0ZXRyb21pbm8nIGlzIGluIGNvbGxpc2lvbiB3aXRoIHRoZSBzdGFnZVxuICAgKi9cbiAgaXNDb2xsaXNpb24odGV0cm9taW5vKSB7XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB0ZXRyb21pbm8udHlwZS5zaXplOyB4KyspIHtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeSsrKSB7ICAgICAgICBcbiAgICAgICAgaWYgKHRldHJvbWluby54ICsgeCA8IDAgfHwgdGV0cm9taW5vLnggKyB4ID49IENvbnN0YW50cy5XSURUSCB8fCB5ID49IENvbnN0YW50cy5IRUlHSFQgfHwgdGV0cm9taW5vLnkgPj0gMCAmJiB0aGlzLl9kYXRhW3RldHJvbWluby54ICsgeF1bdGV0cm9taW5vLnkgKyB5XSAhPT0gMCkge1xuICAgICAgICAgIGlmICh0ZXRyb21pbm8uaGFzQmxvY2soeCwgeSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH0gIFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdXNpb24gJ3RldHJvbWlubycgd2l0aCB0aGUgc3RhZ2VcbiAgICogSWYgdGhlIGZ1c2lvbiBjcmVhdGUgYSBsaW5lLCB3ZSBjbGVhciB0aGUgbGluZVxuICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBjbGVhcmVkIGxpbmVzXG4gICAqL1xuICB1bml0ZSh0ZXRyb21pbm8pIHtcbiAgICB2YXIgY2xlYXJlZExpbmVzID0gMDtcblxuICAgIC8vIEZ1c2lvbiB0aGUgdGV0cm9taW5vIHdpdGggdGhlIHN0YWdlXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0ZXRyb21pbm8udHlwZS5zaXplOyB5KyspIHtcbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeCsrKSB7XG4gICAgICAgIGlmICh0ZXRyb21pbm8ueCArIHggPCBDb25zdGFudHMuV0lEVEggJiYgdGV0cm9taW5vLnggKyB4ID49IDAgJiYgdGV0cm9taW5vLmhhc0Jsb2NrKHgsIHkpKSB7XG4gICAgICAgICAgdGhpcy5fZGF0YVt0ZXRyb21pbm8ueCArIHhdW3RldHJvbWluby55ICsgeV0gPSB0ZXRyb21pbm8udHlwZS5jb2xvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeSsrKSB7XG4gICAgICAvLyBDaGVjayBpZiB0aGUgZnVzaW9uIGNyZWF0ZWQgYSBuZXcgbGluZVxuICAgICAgdmFyIGVyYXNlTGluZSA9IHRydWU7XG4gICAgICBpZiAoeSArIHRldHJvbWluby55ID49IENvbnN0YW50cy5IRUlHSFQpIHtcbiAgICAgICAgZXJhc2VMaW5lID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBDb25zdGFudHMuV0lEVEg7IHgrKykge1xuICAgICAgICAgIGlmICh0aGlzLl9kYXRhW3hdW3kgKyB0ZXRyb21pbm8ueV0gPT09IDApIHtcbiAgICAgICAgICAgIGVyYXNlTGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBJZiB5ZXMsIHdlIGVyYXNlIGl0IGFuZCBtb3ZlIGFsbCBjb25jZXJuZWQgYmxvY2tzXG4gICAgICBpZiAoZXJhc2VMaW5lKSB7XG4gICAgICAgIGNsZWFyZWRMaW5lcysrO1xuICAgICAgICBmb3IgKGxldCB5eSA9IHkgKyB0ZXRyb21pbm8ueTsgeXkgPj0gMDsgeXktLSkge1xuICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcbiAgICAgICAgICAgIGlmICh5eSA+IDApIHtcbiAgICAgICAgICAgICAgdGhpcy5fZGF0YVt4XVt5eV0gPSB0aGlzLl9kYXRhW3hdW3l5LTFdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5fZGF0YVt4XVt5eV0gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBlbXB0eSB0aGUgYmxvY2tzICh3ZSB3aWxsIG5lZWQgdG8gcmVkcmF3KVxuICAgICAgICB0aGlzLl9ibG9ja3MgPSBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2xlYXJlZExpbmVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IHRoZSBzdGFnZVxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5fZGF0YSA9IFtdO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcbiAgICAgIHRoaXMuX2RhdGEucHVzaChbXSk7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IENvbnN0YW50cy5IRUlHSFQ7IHkrKykge1xuICAgICAgICB0aGlzLl9kYXRhW3hdLnB1c2goMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2Jsb2NrcyA9IFtdO1xuICB9XG59XG4iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgdGV0cm9taW5vXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRldHJvbWlubyB7XG4gIGNvbnN0cnVjdG9yKHR5cGUsIGNvbnRhaW5lcikge1xuICAgIC8vIFNldCB0aGUgY29udGFpbmVyXG4gICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIFxuICAgIC8vIFR5cGUgb2YgdGhlIHRldHJvbWlubyAoSSwgSiwgTCwgTywgUywgVCwgWilcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuXG4gICAgLy8gUG9zaXRpb24gb2YgdGhlIHRldHJvbWlub1xuICAgIHRoaXMueCA9IE1hdGguZmxvb3IoQ29uc3RhbnRzLldJRFRIIC8gMiAtIHRoaXMudHlwZS5zaXplIC8gMik7XG4gICAgdGhpcy55ID0gMDtcblxuICAgIC8vIEFuZ2xlIG9mIHRoZSB0ZXRyb21pbm8gKDA6IDBkZWcsIDE6IDkwZGVnLCAyOiAxODBkZWcsIDM6IDI3MGRlZylcbiAgICB0aGlzLmFuZ2xlID0gMDtcblxuICAgIC8vIFBpeGkncyBibG9ja3NcbiAgICB0aGlzLl9ibG9ja3MgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIHRvIGdldCBhIHJhbmRvbSB0ZXRyb21pbm9cbiAgICovXG4gIHN0YXRpYyBnZXRSYW5kb20oY29udGFpbmVyKSB7XG4gICAgdmFyIHR5cGVzID0gW1R5cGVzLkksIFR5cGVzLkosIFR5cGVzLkwsIFR5cGVzLk8sIFR5cGVzLlMsIFR5cGVzLlQsIFR5cGVzLlpdO1xuICAgIHZhciB0eXBlID0gdHlwZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNyldO1xuICAgIHJldHVybiBuZXcgVGV0cm9taW5vKHR5cGUsIGNvbnRhaW5lcik7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHNoYXBlcyB0byBjb250YWluZXJcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy50eXBlLnNpemU7IHgrKykge1xuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLnR5cGUuc2l6ZTsgeSsrKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUuc2hhcGVzW3RoaXMuYW5nbGVdW3ldW3hdID09PSAxKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX2Jsb2Nrcy5sZW5ndGggIT09IDQpIHtcbiAgICAgICAgICAgIHZhciBibG9jayA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgICAgICAgICBibG9jay5saW5lU3R5bGUoMSwgQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fQk9SREVSUywgMSk7XG4gICAgICAgICAgICBibG9jay5iZWdpbkZpbGwodGhpcy50eXBlLmNvbG9yKTtcbiAgICAgICAgICAgIGJsb2NrLmRyYXdSZWN0KDAsIDAsIENvbnN0YW50cy5TUVVBUkVfU0laRSwgQ29uc3RhbnRzLlNRVUFSRV9TSVpFKTtcbiAgICAgICAgICAgIGJsb2NrLmVuZEZpbGwoKTtcbiAgICAgICAgICAgIHRoaXMuX2Jsb2Nrcy5wdXNoKGJsb2NrKTtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRDaGlsZChibG9jayk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX2Jsb2Nrc1tpXS54ID0gKHRoaXMueCArIHgpICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xuICAgICAgICAgIHRoaXMuX2Jsb2Nrc1tpXS55ID0gKHRoaXMueSArIHkpICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgc2hhcGVzIGZyb20gY29udGFpbmVyXG4gICAqL1xuICByZW1vdmUoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9ibG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX2NvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLl9ibG9ja3NbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGUgdGhlIHRldHJvbWlubyB0byB0aGUgcmlnaHRcbiAgICovXG4gIHJvdGF0ZSgpIHtcbiAgICB0aGlzLmFuZ2xlICs9IDE7XG4gICAgdGhpcy5hbmdsZSAlPSA0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJvdGF0ZSB0aGUgdGV0cm9taW5vIHRvIHRoZSBsZWZ0XG4gICAqL1xuICBhbnRpUm90YXRlKCkge1xuICAgIHRoaXMuYW5nbGUgLT0gMTtcbiAgICBpZiAodGhpcy5hbmdsZSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuYW5nbGUgPSAzO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHRoZSB0ZXRyb21pbm9cbiAgICovXG4gIG1vdmUoZHgsIGR5KSB7XG4gICAgdGhpcy54ICs9IGR4O1xuICAgIHRoaXMueSArPSBkeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0IGlmIHRoZSB0ZXRyb21pbm8gaGFzIGEgYmxvY2sgaW4gdGhlIHBvc2l0aW5vICh4LCB5KVxuICAgKiB4IGFuZCB5IGJlaW5nIHJlbGF0aXZlIHRoZSB0aGUgcG9zaXRpb24gb2YgdGhlIHRldHJvbWlub1xuICAgKi9cbiAgaGFzQmxvY2soeCwgeSkge1xuICAgIHJldHVybiB0aGlzLnR5cGUuc2hhcGVzW3RoaXMuYW5nbGVdW3ldW3hdID09PSAxO1xuICB9XG5cbn1cblxuLyoqXG4gKiBUeXBlcyBvZiB0ZXRyb21pbm9zXG4gKi9cbmV4cG9ydCBjb25zdCBUeXBlcyA9IHtcbiAgSToge1xuICAgIG5hbWU6ICdJJywgLy8gTmFtZSBvZiB0aGUgdGV0cm9taW5vXG4gICAgY29sb3I6IENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX0ksIC8vIEJhY2tncm91bmQgY29sb3JcbiAgICBzaXplOiA0LCAvLyBTaXplIG9mIHRoZSAnY29udGFpbmVyJyBvZiB0aGUgdGV0cm9taW5vXG4gICAgc2hhcGVzOiBbIC8vIEFsbCBzaGFwZXMgb2YgdGhlIHRldHJvbWlubyAob25lIHBlciByb3RhdGlvbiBwb3NpdGlvbilcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwLDBdLFxuICAgICAgICBbMSwxLDEsMV0sXG4gICAgICAgIFswLDAsMCwwXSxcbiAgICAgICAgWzAsMCwwLDBdXG4gICAgICBdLFxuICAgICAgW1xuICAgICAgICBbMCwwLDEsMF0sXG4gICAgICAgIFswLDAsMSwwXSxcbiAgICAgICAgWzAsMCwxLDBdLFxuICAgICAgICBbMCwwLDEsMF1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFswLDAsMCwwXSxcbiAgICAgICAgWzAsMCwwLDBdLFxuICAgICAgICBbMSwxLDEsMV0sXG4gICAgICAgIFswLDAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwLDBdLFxuICAgICAgICBbMCwxLDAsMF0sXG4gICAgICAgIFswLDEsMCwwXSxcbiAgICAgICAgWzAsMSwwLDBdXG4gICAgICBdXG4gICAgXVxuICB9LFxuICBKOiB7XG4gICAgbmFtZTogJ0onLFxuICAgIGNvbG9yOiBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19KLFxuICAgIHNpemU6IDMsXG4gICAgc2hhcGVzOiBbXG4gICAgICBbXG4gICAgICAgIFsxLDAsMF0sXG4gICAgICAgIFsxLDEsMV0sXG4gICAgICAgIFswLDAsMF1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFswLDEsMV0sXG4gICAgICAgIFswLDEsMF0sXG4gICAgICAgIFswLDEsMF1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFswLDAsMF0sXG4gICAgICAgIFsxLDEsMV0sXG4gICAgICAgIFswLDAsMV1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFswLDEsMF0sXG4gICAgICAgIFswLDEsMF0sXG4gICAgICAgIFsxLDEsMF1cbiAgICAgIF1cbiAgICBdXG4gIH0sXG4gIEw6IHtcbiAgICBuYW1lOiAnTCcsXG4gICAgY29sb3I6IENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX0wsXG4gICAgc2l6ZTogMyxcbiAgICBzaGFwZXM6IFtcbiAgICAgIFtcbiAgICAgICAgWzAsMCwxXSxcbiAgICAgICAgWzEsMSwxXSxcbiAgICAgICAgWzAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwxXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwXSxcbiAgICAgICAgWzEsMSwxXSxcbiAgICAgICAgWzEsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXVxuICAgIF1cbiAgfSxcbiAgTzoge1xuICAgIG5hbWU6ICdPJyxcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fTyxcbiAgICBzaXplOiAyLFxuICAgIHNoYXBlczogW1xuICAgICAgW1xuICAgICAgICBbMSwxXSxcbiAgICAgICAgWzEsMV1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFsxLDFdLFxuICAgICAgICBbMSwxXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzEsMV0sXG4gICAgICAgIFsxLDFdXG4gICAgICBdLFxuICAgICAgW1xuICAgICAgICBbMSwxXSxcbiAgICAgICAgWzEsMV1cbiAgICAgIF1cbiAgICBdXG4gIH0sXG4gIFM6IHtcbiAgICBuYW1lOiAnUycsXG4gICAgY29sb3I6IENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX1MsXG4gICAgc2l6ZTogMyxcbiAgICBzaGFwZXM6IFtcbiAgICAgIFtcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzAsMCwxXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzEsMSwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzEsMCwwXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXVxuICAgIF1cbiAgfSxcbiAgVDoge1xuICAgIG5hbWU6ICdUJyxcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fVCxcbiAgICBzaXplIDogMyxcbiAgICBzaGFwZXM6IFtcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzEsMSwxXSxcbiAgICAgICAgWzAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwXSxcbiAgICAgICAgWzEsMSwxXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXVxuICAgIF1cbiAgfSxcbiAgWjoge1xuICAgIG5hbWU6ICdaJyxcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fWixcbiAgICBzaXplIDogMyxcbiAgICBzaGFwZXM6IFtcbiAgICAgIFtcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwxXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwxXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzEsMCwwXVxuICAgICAgXVxuICAgIF1cbiAgfVxufTtcbiIsImltcG9ydCBHYW1lIGZyb20gJy4vR2FtZSc7XG5cbnZhciBnID0gbmV3IEdhbWUoKTtcbiJdfQ==
