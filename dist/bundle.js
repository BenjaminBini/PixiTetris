(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Game constants
 */
exports.default = {
  WIDTH: 120, // Width of the game (in number of blocks)
  HEIGHT: 240, // Height of the game (in number of blocks)
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
    CONTAINER: '#canvas-container',
    NEXT: '#next-tetromino',
    START_PAUSE: '#start-pause button',
    LEVEL: '#level',
    SCORE: '#score',
    CLEARED: '#cleared',
    BEST: '#best-score',
    OVERLAY: '#overlay'
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

      this._stage.draw();
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
      }
      this._render();
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
        document.querySelector(_Constants2.default.DOM.START_PAUSE).innerText = 'resume';
        document.querySelector(_Constants2.default.DOM.START_PAUSE).innerText = 'continue';
        document.querySelector(_Constants2.default.DOM.OVERLAY).className = 'active';
      } else {
        this._start();
        document.querySelector(_Constants2.default.DOM.START_PAUSE).id = 'pause';
        document.querySelector(_Constants2.default.DOM.START_PAUSE).innerText = 'pause';
        document.querySelector(_Constants2.default.DOM.OVERLAY).className = '';
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
        this._stage.draw();
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
      this._stage.draw();
      this._newTetromino();
    }

    /**
     * Called when the game is over
     */

  }, {
    key: '_gameOver',
    value: function _gameOver() {
      this._stage.reset();
      this._stage.draw();
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
      }
    }

    /**
     * Render function
     */

  }, {
    key: '_render',
    value: function _render() {
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
      this.best = localStorage.bestScore ? localStorage.bestScore : 0;
      if (this.score > this.best) {
        this.best = localStorage.bestScore = this.score;
      }
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
      document.querySelector(_Constants2.default.DOM.BEST).innerText = this.best;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXENvbnN0YW50cy5qcyIsInNyY1xcR2FtZS5qcyIsInNyY1xcU2NvcmVNYW5hZ2VyLmpzIiwic3JjXFxTdGFnZS5qcyIsInNyY1xcVGV0cm9taW5vLmpzIiwic3JjXFxpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O2tCQ0dlO0FBQ2IsT0FBSyxFQUFFLEdBQUc7QUFDVixRQUFNLEVBQUUsR0FBRztBQUNYLGFBQVcsRUFBRSxFQUFFO0FBQ2YsUUFBTSxFQUFFO0FBQ1AscUJBQWlCLEVBQUUsUUFBUTtBQUMzQixlQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFXLEVBQUUsUUFBUTtBQUNyQixjQUFVLEVBQUUsUUFBUTtBQUNwQixXQUFPLEVBQUUsUUFBUTtBQUNqQix3QkFBb0IsRUFBRSxDQUFDO0dBQ3ZCO0FBQ0QsS0FBRyxFQUFFO0FBQ0osYUFBUyxFQUFFLG1CQUFtQjtBQUM5QixRQUFJLEVBQUUsaUJBQWlCO0FBQ3ZCLGVBQVcsRUFBRSxxQkFBcUI7QUFDakMsU0FBSyxFQUFFLFFBQVE7QUFDZixTQUFLLEVBQUUsUUFBUTtBQUNmLFdBQU8sRUFBRSxVQUFVO0FBQ25CLFFBQUksRUFBRSxhQUFhO0FBQ25CLFdBQU8sRUFBRSxVQUFVO0dBQ3BCO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUN4Qm9CLElBQUk7QUFDdkIsV0FEbUIsSUFBSSxHQUNUOzBCQURLLElBQUk7O0FBRXJCLFdBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDOzs7QUFBQyxBQUdsQixRQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQVUs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QUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsb0JBQVUsTUFBTSxDQUFDLFdBQVc7QUFDbkMsUUFBSSxFQUFFLENBQUM7QUFDUCxVQUFNLEVBQUU7QUFDTixLQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1YsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1YsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1YsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1YsQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsb0JBQVUsTUFBTSxDQUFDLFdBQVc7QUFDbkMsUUFBSSxFQUFFLENBQUM7QUFDUCxVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLG9CQUFVLE1BQU0sQ0FBQyxXQUFXO0FBQ25DLFFBQUksRUFBRSxDQUFDO0FBQ1AsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxvQkFBVSxNQUFNLENBQUMsV0FBVztBQUNuQyxRQUFJLEVBQUUsQ0FBQztBQUNQLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ0wsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ04sRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNMLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNOLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDTCxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDTixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ0wsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ04sQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsb0JBQVUsTUFBTSxDQUFDLFdBQVc7QUFDbkMsUUFBSSxFQUFFLENBQUM7QUFDUCxVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLG9CQUFVLE1BQU0sQ0FBQyxXQUFXO0FBQ25DLFFBQUksRUFBRyxDQUFDO0FBQ1IsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxvQkFBVSxNQUFNLENBQUMsV0FBVztBQUNuQyxRQUFJLEVBQUcsQ0FBQztBQUNSLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsQ0FDRjtHQUNGO0NBQ0YsQ0FBQzs7Ozs7Ozs7Ozs7QUN0U0YsSUFBSSxDQUFDLEdBQUcsb0JBQVUsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogR2FtZSBjb25zdGFudHNcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBXSURUSDogMTIwLCAvLyBXaWR0aCBvZiB0aGUgZ2FtZSAoaW4gbnVtYmVyIG9mIGJsb2NrcylcclxuICBIRUlHSFQ6IDI0MCwgLy8gSGVpZ2h0IG9mIHRoZSBnYW1lIChpbiBudW1iZXIgb2YgYmxvY2tzKVxyXG4gIFNRVUFSRV9TSVpFOiAyNSwgLy8gV2lkdGggYW5kIGhlaWdodCBvZiBhIGJsb2NrIChpbiBweClcclxuICBDT0xPUlM6IHtcclxuICBcdFRFVFJPTUlOT19CT1JERVJTOiAweDM3M2M0MCxcclxuICBcdFRFVFJPTUlOT19JOiAweGZmODAwMCxcclxuICBcdFRFVFJPTUlOT19KOiAweDJjYzk5MCxcclxuICBcdFRFVFJPTUlOT19MOiAweGYzNDM0NCxcclxuICBcdFRFVFJPTUlOT19POiAweGZmZGYwMCxcclxuICBcdFRFVFJPTUlOT19TOiAweGNjZGNlNCxcclxuICBcdFRFVFJPTUlOT19UOiAweDAwOGFmZixcclxuICBcdFRFVFJPTUlOT19aOiAweGZjYjk0MSxcclxuICBcdEJBQ0tHUk9VTkQ6IDB4MmQzMjM2LFxyXG4gIFx0Qk9SREVSUzogMHgzNzNDNDAsXHJcbiAgXHRCT1JERVJTX1RSQU5TUEFSRU5DWTogMVxyXG4gIH0sXHJcbiAgRE9NOiB7XHJcbiAgXHRDT05UQUlORVI6ICcjY2FudmFzLWNvbnRhaW5lcicsXHJcbiAgXHRORVhUOiAnI25leHQtdGV0cm9taW5vJyxcclxuICBcdFNUQVJUX1BBVVNFOiAnI3N0YXJ0LXBhdXNlIGJ1dHRvbicsXHJcbiAgICBMRVZFTDogJyNsZXZlbCcsXHJcbiAgICBTQ09SRTogJyNzY29yZScsXHJcbiAgICBDTEVBUkVEOiAnI2NsZWFyZWQnLFxyXG4gICAgQkVTVDogJyNiZXN0LXNjb3JlJyxcclxuICAgIE9WRVJMQVk6ICcjb3ZlcmxheSdcclxuICB9XHJcbn07XHJcbiIsImltcG9ydCBUZXRyb21pbm8gZnJvbSAnLi9UZXRyb21pbm8nO1xyXG5pbXBvcnQge1R5cGVzfSBmcm9tICcuL1RldHJvbWlubyc7XHJcbmltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMnO1xyXG5pbXBvcnQgU3RhZ2UgZnJvbSAnLi9TdGFnZSc7XHJcbmltcG9ydCBTY29yZU1hbmFnZXIgZnJvbSAnLi9TY29yZU1hbmFnZXInO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhQSVhJKTtcclxuXHJcbiAgICAvLyBET00gY29udGFpbmVyXHJcbiAgICB0aGlzLl9kb21Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uQ09OVEFJTkVSKTtcclxuXHJcbiAgICAvLyBOZXh0IHRldHJvbWlubyBET00gY29udGFpbmVyXHJcbiAgICB0aGlzLl9kb21OZXh0Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLk5FWFQpXHJcblxyXG4gICAgLy8gS2V5Ym9hcmQgZXZlbnRzXHJcbiAgICB0aGlzLl9pbml0S2V5Ym9hcmRFdmVudHMoKTtcclxuXHJcbiAgICAvLyBNb3VzZSBldmVudHNcclxuICAgIHRoaXMuX2luaXRNb3VzZUV2ZW50cygpO1xyXG4gICAgIFxyXG4gICAgLy8gU2V0IHVwIFBJWElcclxuICAgIHRoaXMuX3JlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIoQ29uc3RhbnRzLldJRFRIICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBDb25zdGFudHMuSEVJR0hUICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFKTtcclxuXHJcbiAgICB0aGlzLl9kb21Db250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fcmVuZGVyZXIudmlldyk7XHJcblxyXG4gICAgLy8gUGl4aSBjb250YWluZXJcclxuICAgIHRoaXMuX2NvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xyXG5cclxuICAgIC8vIEdhbWUgYm9hcmQvc3RhZ2VcclxuICAgIHRoaXMuX3N0YWdlID0gbmV3IFN0YWdlKHRoaXMuX2NvbnRhaW5lcik7IFxyXG5cclxuICAgIC8vIEluaXQgdGV0cm9taW5vc1xyXG4gICAgdGhpcy5fdGV0cm9taW5vID0gdW5kZWZpbmVkOyAvLyBUZXRyb21pbm8gb24gdGhlIHN0YWdlXHJcbiAgICB0aGlzLl9uZXh0VGV0cm9taW5vID0gdW5kZWZpbmVkOyAvLyBOZXh0IHRldHJvbWlub1xyXG4gICAgdGhpcy5fbmV3VGV0cm9taW5vKCk7XHJcblxyXG4gICAgLy8gRGVsYXkgYmV0d2VlbiBtb3Zlc1xyXG4gICAgdGhpcy5fZGVsYXkgPSAzMDA7XHJcblxyXG4gICAgLy8gSW5pdCB0aW1lclxyXG4gICAgdGhpcy5fdGltZXIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICAvLyBTY29yZSBtYW5hZ2VyXHJcbiAgICB0aGlzLl9zY29yZU1hbmFnZXIgPSBuZXcgU2NvcmVNYW5hZ2VyKCk7XHJcblxyXG4gICAgLy8gR08hXHJcbiAgICB0aGlzLl9yZXF1ZXN0SWQgPSB1bmRlZmluZWQ7IC8vIHJlcXVlc3RBbmltYXRpb25GcmFtZSBJRCAodXNlZCB0byBwYXVzZSBnYW1lKVxyXG4gICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLl9zdGFydCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhcnQgdGhlIGdhbWVcclxuICAgKi9cclxuICBfc3RhcnQoKSB7XHJcbiAgICB0aGlzLl9zdGFnZS5kcmF3KCk7XHJcbiAgICB0aGlzLl9yZXF1ZXN0SWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5fbG9vcCgpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdhbWUgbG9vcFxyXG4gICAqL1xyXG4gIF9sb29wKCkge1xyXG4gICAgaWYgKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGhpcy5fdGltZXIgPiB0aGlzLl9kZWxheSkge1xyXG4gICAgICB0aGlzLl90aW1lciA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICB0aGlzLl9kcm9wKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9yZW5kZXIoKTtcclxuICAgIHRoaXMuX3JlcXVlc3RJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLl9sb29wKCkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGF1c2UgdGhlIGdhbWVcclxuICAgKi9cclxuICBfcGF1c2UoKSB7XHJcbiAgICB0aGlzLl9wYXVzZWQgPSAhdGhpcy5fcGF1c2VkO1xyXG4gICAgLy8gU3RvcCBvciByZXN0YXJ0IGxvb3BcclxuICAgIGlmICh0aGlzLl9wYXVzZWQpIHtcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLlNUQVJUX1BBVVNFKS5pbm5lclRleHQgPSAncmVzdW1lJztcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLlNUQVJUX1BBVVNFKS5pbm5lclRleHQgPSAnY29udGludWUnO1xyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uT1ZFUkxBWSkuY2xhc3NOYW1lID0gJ2FjdGl2ZSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9zdGFydCgpOyAgIFxyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uU1RBUlRfUEFVU0UpLmlkID0gJ3BhdXNlJztcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLlNUQVJUX1BBVVNFKS5pbm5lclRleHQgPSAncGF1c2UnO1xyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uT1ZFUkxBWSkuY2xhc3NOYW1lID0gJyc7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlIHRoZSBjdXJyZW50IHRldHJvbWlubyBkb3dud2FyZFxyXG4gICAqL1xyXG4gIF9kcm9wKCkge1xyXG4gICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMCwgMSk7IC8vIEdyYXZpdHlcclxuICAgIC8vIElmIGNvbGxpc2lvbiwgY2FuY2VsICBtb3ZlIGFuZCB1bml0ZSB0aGUgdGV0cm9taW5vIHdpdGggdGhlIGdhbWUgc3RhZ2VcclxuICAgIGlmICh0aGlzLl9zdGFnZS5pc0NvbGxpc2lvbih0aGlzLl90ZXRyb21pbm8pKSB7IFxyXG4gICAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgwLCAtMSk7XHJcbiAgICAgIHRoaXMuX3RldHJvbWluby5yZW1vdmUoKTtcclxuICAgICAgdmFyIGNsZWFyZWRMaW5lcyA9IHRoaXMuX3N0YWdlLnVuaXRlKHRoaXMuX3RldHJvbWlubyk7XHJcbiAgICAgIGlmIChjbGVhcmVkTGluZXMgPiAwKSB7XHJcbiAgICAgICAgdGhpcy5fc2NvcmVNYW5hZ2VyLmFkZENsZWFyZWRMaW5lcyhjbGVhcmVkTGluZXMpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuX3Njb3JlTWFuYWdlci50ZXRyb21pbm9Ecm9wcGVkKCk7XHJcbiAgICAgIHRoaXMuX3N0YWdlLmRyYXcoKTtcclxuICAgICAgdGhpcy5fbmV3VGV0cm9taW5vKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlIHRoZSBjdXJyZW50IHRldHJvbWlubyBhcyBkb3duIGFzIHBvc3NpYmxlXHJcbiAgICovXHJcbiAgX2hhcmREcm9wKCkge1xyXG4gICAgd2hpbGUgKCF0aGlzLl9zdGFnZS5pc0NvbGxpc2lvbih0aGlzLl90ZXRyb21pbm8pKSB7XHJcbiAgICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDAsIDEpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMCwgLTEpO1xyXG4gICAgdGhpcy5fdGV0cm9taW5vLnJlbW92ZSgpO1xyXG4gICAgdmFyIGNsZWFyZWRMaW5lcyA9IHRoaXMuX3N0YWdlLnVuaXRlKHRoaXMuX3RldHJvbWlubyk7XHJcbiAgICBpZiAoY2xlYXJlZExpbmVzID4gMCkge1xyXG4gICAgICB0aGlzLl9zY29yZU1hbmFnZXIuYWRkQ2xlYXJlZExpbmVzKGNsZWFyZWRMaW5lcyk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9zY29yZU1hbmFnZXIudGV0cm9taW5vRHJvcHBlZCgpO1xyXG4gICAgdGhpcy5fc3RhZ2UuZHJhdygpO1xyXG4gICAgdGhpcy5fbmV3VGV0cm9taW5vKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgZ2FtZSBpcyBvdmVyXHJcbiAgICovXHJcbiAgX2dhbWVPdmVyKCkge1xyXG4gICAgdGhpcy5fc3RhZ2UucmVzZXQoKTtcclxuICAgIHRoaXMuX3N0YWdlLmRyYXcoKTtcclxuICAgIHRoaXMuX3Njb3JlTWFuYWdlci5yZXNldCgpO1xyXG4gIH1cclxuICBcclxuXHJcbiAgLyoqXHJcbiAgICogUHV0IGEgbmV3IHRldHJvbWlubyBvbiB0aGUgYm9hcmRcclxuICAgKiBBbmQgY2hlY2sgaWYgdGhlIGdhbWUgaXMgbG9zdCBvciBub3RcclxuICAgKi9cclxuICBfbmV3VGV0cm9taW5vKCkge1xyXG4gICAgaWYgKCF0aGlzLl9uZXh0VGV0cm9taW5vKSB7XHJcbiAgICAgIHRoaXMuX25leHRUZXRyb21pbm8gPSBUZXRyb21pbm8uZ2V0UmFuZG9tKHRoaXMuX2NvbnRhaW5lcik7ICBcclxuICAgIH1cclxuICAgIHRoaXMuX3RldHJvbWlubyA9IHRoaXMuX25leHRUZXRyb21pbm87XHJcbiAgICB0aGlzLl9uZXh0VGV0cm9taW5vID0gVGV0cm9taW5vLmdldFJhbmRvbSh0aGlzLl9jb250YWluZXIpO1xyXG4gICAgdGhpcy5fZG9tTmV4dENvbnRhaW5lci5jbGFzc05hbWUgPSB0aGlzLl9uZXh0VGV0cm9taW5vLnR5cGUubmFtZTtcclxuICAgIC8vIExvc2UhIFJlc3RhcnRcclxuICAgIGlmICh0aGlzLl9zdGFnZS5pc0NvbGxpc2lvbih0aGlzLl90ZXRyb21pbm8pKSB7XHJcbiAgICAgIHRoaXMuX2dhbWVPdmVyKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbml0IGtleWJvYXJkIGV2ZW50c1xyXG4gICAqL1xyXG4gIF9pbml0S2V5Ym9hcmRFdmVudHMoKSB7XHJcbiAgICB2YXIgbGVmdEtleSA9IHRoaXMuX2tleWJvYXJkKDM3KTtcclxuICAgIHZhciB1cEtleSA9IHRoaXMuX2tleWJvYXJkKDM4KTtcclxuICAgIHZhciByaWdodEtleSA9IHRoaXMuX2tleWJvYXJkKDM5KTtcclxuICAgIHZhciBkb3duS2V5ID0gdGhpcy5fa2V5Ym9hcmQoNDApO1xyXG4gICAgdmFyIHNwYWNlS2V5ID0gdGhpcy5fa2V5Ym9hcmQoMzIpO1xyXG4gICAgdmFyIHBLZXkgPSB0aGlzLl9rZXlib2FyZCg4MCk7XHJcbiAgICBsZWZ0S2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcHJlc3NMZWZ0KCk7XHJcbiAgICB1cEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzVXAoKTtcclxuICAgIHJpZ2h0S2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcHJlc3NSaWdodCgpO1xyXG4gICAgZG93bktleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzRG93bigpO1xyXG4gICAgc3BhY2VLZXkucHJlc3MgPSAoKSA9PiB0aGlzLl9wcmVzc1NwYWNlKCk7XHJcbiAgICBwS2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcGF1c2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXQgbW91c2UgZXZlbnRzXHJcbiAgICovXHJcbiAgX2luaXRNb3VzZUV2ZW50cygpIHtcclxuICAgIHZhciBzdGFydFBhdXNlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLlNUQVJUX1BBVVNFKTtcclxuICAgIHN0YXJ0UGF1c2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9wYXVzZSgpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiUHJlc3MgbGVmdFwiIGV2ZW50XHJcbiAgICovXHJcbiAgX3ByZXNzTGVmdCgpIHtcclxuICAgIGlmICghdGhpcy5fcGF1c2VkKSB7XHJcbiAgICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKC0xLCAwKTtcclxuICAgICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcclxuICAgICAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgxLCAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogXCJQcmVzcyByaWdodFwiIGV2ZW50XHJcbiAgICovXHJcbiAgX3ByZXNzUmlnaHQoKSB7XHJcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xyXG4gICAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgxLCAwKTtcclxuICAgICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcclxuICAgICAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgtMSwgMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiUHJlc3MgdXBcIiBldmVudFxyXG4gICAqL1xyXG4gIF9wcmVzc1VwKCkge1xyXG4gICAgaWYgKCF0aGlzLl9wYXVzZWQpIHtcclxuICAgICAgdGhpcy5fdGV0cm9taW5vLnJvdGF0ZSgpO1xyXG4gICAgICBpZiAodGhpcy5fc3RhZ2UuaXNDb2xsaXNpb24odGhpcy5fdGV0cm9taW5vKSkge1xyXG4gICAgICAgIHRoaXMuX3RldHJvbWluby5hbnRpUm90YXRlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiUHJlc3MgZG93blwiIGV2ZW50XHJcbiAgICovXHJcbiAgX3ByZXNzRG93bigpIHtcclxuICAgIGlmICghdGhpcy5fcGF1c2VkKSB7XHJcbiAgICAgIHRoaXMuX2Ryb3AoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiUHJlc3Mgc3BhY2VcIiBldmVudFxyXG4gICAqL1xyXG4gIF9wcmVzc1NwYWNlKCkge1xyXG4gICAgaWYgKCF0aGlzLl9wYXVzZWQpIHtcclxuICAgICAgdGhpcy5faGFyZERyb3AoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbmRlciBmdW5jdGlvblxyXG4gICAqL1xyXG4gIF9yZW5kZXIoKSB7XHJcbiAgICB0aGlzLl90ZXRyb21pbm8uZHJhdygpO1xyXG4gICAgdGhpcy5fcmVuZGVyZXIucmVuZGVyKHRoaXMuX2NvbnRhaW5lcik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBLZXlib2FyZCBldmVudHMgaGVscGVyXHJcbiAgICovXHJcbiAgX2tleWJvYXJkKGtleUNvZGUpIHtcclxuICAgIHZhciBrZXkgPSB7fTtcclxuICAgIGtleS5jb2RlID0ga2V5Q29kZTtcclxuICAgIGtleS5pc0Rvd24gPSBmYWxzZTtcclxuICAgIGtleS5pc1VwID0gdHJ1ZTtcclxuICAgIGtleS5wcmVzcyA9IHVuZGVmaW5lZDtcclxuICAgIGtleS5yZWxlYXNlID0gdW5kZWZpbmVkO1xyXG4gICAgLy9UaGUgYGRvd25IYW5kbGVyYFxyXG4gICAga2V5LmRvd25IYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XHJcbiAgICAgICAgaWYgKGtleS5pc1VwICYmIGtleS5wcmVzcykga2V5LnByZXNzKCk7XHJcbiAgICAgICAga2V5LmlzRG93biA9IHRydWU7XHJcbiAgICAgICAga2V5LmlzVXAgPSBmYWxzZTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vVGhlIGB1cEhhbmRsZXJgXHJcbiAgICBrZXkudXBIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XHJcbiAgICAgICAgaWYgKGtleS5pc0Rvd24gJiYga2V5LnJlbGVhc2UpIGtleS5yZWxlYXNlKCk7XHJcbiAgICAgICAga2V5LmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIGtleS5pc1VwID0gdHJ1ZTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vQXR0YWNoIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICdrZXlkb3duJywga2V5LmRvd25IYW5kbGVyLmJpbmQoa2V5KSwgZmFsc2VcclxuICAgICk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgJ2tleXVwJywga2V5LnVwSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIGtleTtcclxuICB9XHJcblxyXG59XHJcbiIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NvcmVNYW5hZ2VyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5iZXN0ID0gIGxvY2FsU3RvcmFnZS5iZXN0U2NvcmUgPyBsb2NhbFN0b3JhZ2UuYmVzdFNjb3JlIDogMDtcclxuICAgIGlmICh0aGlzLnNjb3JlID4gdGhpcy5iZXN0KSB7XHJcbiAgICAgIHRoaXMuYmVzdCA9IGxvY2FsU3RvcmFnZS5iZXN0U2NvcmUgPSB0aGlzLnNjb3JlO1xyXG4gICAgfVxyXG4gICAgdGhpcy5sZXZlbCA9IDA7XHJcbiAgICB0aGlzLnNjb3JlID0gMDtcclxuICAgIHRoaXMuY2xlYXJlZExpbmVzID0gMDtcclxuICAgIHRoaXMudXBkYXRlRGlzcGxheSgpO1xyXG4gIH1cclxuXHJcbiAgX2FkZFBvaW50cyhwb2ludHMpIHtcclxuICAgIHRoaXMuc2NvcmUgKz0gcG9pbnRzO1xyXG4gIH1cclxuXHJcbiAgYWRkQ2xlYXJlZExpbmVzKGxpbmVzKSB7XHJcbiAgICB2YXIgcHJldmlvdXNDbGVhcmVkTGluZXMgPSB0aGlzLmNsZWFyZWRMaW5lcztcclxuICAgIHRoaXMuY2xlYXJlZExpbmVzICs9IGxpbmVzO1xyXG4gICAgaWYgKHByZXZpb3VzQ2xlYXJlZExpbmVzICUgMTAgPiB0aGlzLmNsZWFyZWRMaW5lcyAlIDEwKSB7XHJcbiAgICAgIHRoaXMubGV2ZWwrKztcclxuICAgIH1cclxuICAgIGlmIChsaW5lcyA9PT0gMSkge1xyXG4gICAgICB0aGlzLl9hZGRQb2ludHMoNDAgKiAodGhpcy5sZXZlbCArIDEpKTtcclxuICAgIH0gZWxzZSBpZiAobGluZXMgPT09IDIpIHtcclxuICAgICAgdGhpcy5fYWRkUG9pbnRzKDEwMCAqICh0aGlzLmxldmVsICsgMSkpO1xyXG4gICAgfSBlbHNlIGlmIChsaW5lcyA9PT0gMykge1xyXG4gICAgICB0aGlzLl9hZGRQb2ludHMoMzAwICogKHRoaXMubGV2ZWwgKyAxKSk7XHJcbiAgICB9IGVsc2UgaWYgKGxpbmVzID09PSA0KSB7XHJcbiAgICAgIHRoaXMuX2FkZFBvaW50cygxMjAwICogKHRoaXMubGV2ZWwgKyAxKSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnVwZGF0ZURpc3BsYXkoKTtcclxuICB9XHJcblxyXG4gIHRldHJvbWlub0Ryb3BwZWQoKSB7XHJcbiAgICB0aGlzLl9hZGRQb2ludHMoNSAqICh0aGlzLmxldmVsICsgMSkpO1xyXG4gICAgdGhpcy51cGRhdGVEaXNwbGF5KCk7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVEaXNwbGF5KCkge1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLkxFVkVMKS5pbm5lclRleHQgPSB0aGlzLmxldmVsO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLlNDT1JFKS5pbm5lclRleHQgPSB0aGlzLnNjb3JlO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLkNMRUFSRUQpLmlubmVyVGV4dCA9IHRoaXMuY2xlYXJlZExpbmVzO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLkJFU1QpLmlubmVyVGV4dCA9IHRoaXMuYmVzdDtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IENvbnN0YW50cyBmcm9tICcuL0NvbnN0YW50cyc7XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50IHRoZSBnYW1lIHN0YWdlXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFnZSB7XHJcbiAgY29uc3RydWN0b3IoY29udGFpbmVyKSB7XHJcbiAgICAvLyBTZXQgdGhlIGNvbnRhaW5lclxyXG4gICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xyXG5cclxuICAgIC8vIF9kYXRhIHJlcHJlc2VudHMgdGhlIHN0YXRlIG9mIGV2ZXJ5IGJsb2NrIG9mIHRoZSBzdGFnZVxyXG4gICAgLy8gMCBmb3IgXCJlbXB0eVwiLCBoZXhhIGNvZGUgY29sb3IgaWYgbm90XHJcbiAgICAvLyBXZSBpbml0aWFsaXplIGl0IHdpdGggemVyb3NcclxuICAgIHRoaXMuX2RhdGEgPSBbXTtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcclxuICAgICAgdGhpcy5fZGF0YS5wdXNoKFtdKTtcclxuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBDb25zdGFudHMuSEVJR0hUOyB5KyspIHtcclxuICAgICAgICB0aGlzLl9kYXRhW3hdLnB1c2goMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBQaXhpJ3MgYmxvY2tzXHJcbiAgICB0aGlzLl9ibG9ja3MgPSBbXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBzaGFwZXMgdG8gdGhlIF9jb250YWluZXJcclxuICAgKi9cclxuICBkcmF3KCkge1xyXG4gICAgdmFyIGkgPSAwO1xyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBDb25zdGFudHMuV0lEVEg7IHgrKykge1xyXG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IENvbnN0YW50cy5IRUlHSFQ7IHkrKykge1xyXG4gICAgICAgIC8vIENvbG9yIGJsb2NrcyB3aGVuIG5vdCBlbXB0eVxyXG4gICAgICAgIGlmICh0aGlzLl9kYXRhW3hdW3ldICE9PSAwKSB7XHJcbiAgICAgICAgICB2YXIgYmxvY2sgPSBuZXcgUElYSS5HcmFwaGljcygpO1xyXG4gICAgICAgICAgYmxvY2subGluZVN0eWxlKDEsIENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX0JPUkRFUlMsIDEpO1xyXG4gICAgICAgICAgYmxvY2suYmVnaW5GaWxsKHRoaXMuX2RhdGFbeF1beV0pO1xyXG4gICAgICAgICAgYmxvY2suZHJhd1JlY3QoMCwgMCwgQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBDb25zdGFudHMuU1FVQVJFX1NJWkUpO1xyXG4gICAgICAgICAgYmxvY2suZW5kRmlsbCgpO1xyXG4gICAgICAgICAgYmxvY2sueCA9IHggKiBDb25zdGFudHMuU1FVQVJFX1NJWkU7XHJcbiAgICAgICAgICBibG9jay55ID0geSAqIENvbnN0YW50cy5TUVVBUkVfU0laRTtcclxuICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLl9ibG9ja3NbaV0pO1xyXG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLmFkZENoaWxkKGJsb2NrKTtcclxuICAgICAgICAgIHRoaXMuX2Jsb2Nrc1tpXSA9IGJsb2NrO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmxvY2tzW2ldID09PSB1bmRlZmluZWQpIHsgLy8gSnVzdCBhIGdyaWQgaWYgZW1wdHlcclxuICAgICAgICAgIHZhciBibG9jayA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XHJcbiAgICAgICAgICBibG9jay5saW5lU3R5bGUoMSwgQ29uc3RhbnRzLkNPTE9SUy5CT1JERVJTLCBDb25zdGFudHMuQ09MT1JTLkJPUkRFUlNfVFJBTlNQQVJFTkNZKTtcclxuICAgICAgICAgIGJsb2NrLmJlZ2luRmlsbChDb25zdGFudHMuQ09MT1JTLkJBQ0tHUk9VTkQpO1xyXG4gICAgICAgICAgYmxvY2suZHJhd1JlY3QoMCwgMCwgQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBDb25zdGFudHMuU1FVQVJFX1NJWkUpO1xyXG4gICAgICAgICAgYmxvY2suZW5kRmlsbCgpO1xyXG4gICAgICAgICAgYmxvY2sueCA9IHggKiBDb25zdGFudHMuU1FVQVJFX1NJWkU7XHJcbiAgICAgICAgICBibG9jay55ID0geSAqIENvbnN0YW50cy5TUVVBUkVfU0laRTtcclxuICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRDaGlsZChibG9jayk7XHJcbiAgICAgICAgICB0aGlzLl9ibG9ja3NbaV0gPSBibG9jaztcclxuICAgICAgICB9XHJcbiAgICAgICAgaSsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBpZiAndGV0cm9taW5vJyBpcyBpbiBjb2xsaXNpb24gd2l0aCB0aGUgc3RhZ2VcclxuICAgKi9cclxuICBpc0NvbGxpc2lvbih0ZXRyb21pbm8pIHtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeCsrKSB7XHJcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeSsrKSB7ICAgICAgICBcclxuICAgICAgICBpZiAodGV0cm9taW5vLnggKyB4IDwgMCB8fCB0ZXRyb21pbm8ueCArIHggPj0gQ29uc3RhbnRzLldJRFRIIHx8IHkgPj0gQ29uc3RhbnRzLkhFSUdIVCB8fCB0ZXRyb21pbm8ueSA+PSAwICYmIHRoaXMuX2RhdGFbdGV0cm9taW5vLnggKyB4XVt0ZXRyb21pbm8ueSArIHldICE9PSAwKSB7XHJcbiAgICAgICAgICBpZiAodGV0cm9taW5vLmhhc0Jsb2NrKHgsIHkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfSAgXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdXNpb24gJ3RldHJvbWlubycgd2l0aCB0aGUgc3RhZ2VcclxuICAgKiBJZiB0aGUgZnVzaW9uIGNyZWF0ZSBhIGxpbmUsIHdlIGNsZWFyIHRoZSBsaW5lXHJcbiAgICogUmV0dXJuIHRoZSBudW1iZXIgb2YgY2xlYXJlZCBsaW5lc1xyXG4gICAqL1xyXG4gIHVuaXRlKHRldHJvbWlubykge1xyXG4gICAgdmFyIGNsZWFyZWRMaW5lcyA9IDA7XHJcblxyXG4gICAgLy8gRnVzaW9uIHRoZSB0ZXRyb21pbm8gd2l0aCB0aGUgc3RhZ2VcclxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeSsrKSB7XHJcbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeCsrKSB7XHJcbiAgICAgICAgaWYgKHRldHJvbWluby54ICsgeCA8IENvbnN0YW50cy5XSURUSCAmJiB0ZXRyb21pbm8ueCArIHggPj0gMCAmJiB0ZXRyb21pbm8uaGFzQmxvY2soeCwgeSkpIHtcclxuICAgICAgICAgIHRoaXMuX2RhdGFbdGV0cm9taW5vLnggKyB4XVt0ZXRyb21pbm8ueSArIHldID0gdGV0cm9taW5vLnR5cGUuY29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0ZXRyb21pbm8udHlwZS5zaXplOyB5KyspIHtcclxuICAgICAgLy8gQ2hlY2sgaWYgdGhlIGZ1c2lvbiBjcmVhdGVkIGEgbmV3IGxpbmVcclxuICAgICAgdmFyIGVyYXNlTGluZSA9IHRydWU7XHJcbiAgICAgIGlmICh5ICsgdGV0cm9taW5vLnkgPj0gQ29uc3RhbnRzLkhFSUdIVCkge1xyXG4gICAgICAgIGVyYXNlTGluZSA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IENvbnN0YW50cy5XSURUSDsgeCsrKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5fZGF0YVt4XVt5ICsgdGV0cm9taW5vLnldID09PSAwKSB7XHJcbiAgICAgICAgICAgIGVyYXNlTGluZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLy8gSWYgeWVzLCB3ZSBlcmFzZSBpdCBhbmQgbW92ZSBhbGwgY29uY2VybmVkIGJsb2Nrc1xyXG4gICAgICBpZiAoZXJhc2VMaW5lKSB7XHJcbiAgICAgICAgY2xlYXJlZExpbmVzKys7XHJcbiAgICAgICAgZm9yIChsZXQgeXkgPSB5ICsgdGV0cm9taW5vLnk7IHl5ID49IDA7IHl5LS0pIHtcclxuICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcclxuICAgICAgICAgICAgaWYgKHl5ID4gMCkge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2RhdGFbeF1beXldID0gdGhpcy5fZGF0YVt4XVt5eS0xXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0aGlzLl9kYXRhW3hdW3l5XSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZW1wdHkgdGhlIGJsb2NrcyAod2Ugd2lsbCBuZWVkIHRvIHJlZHJhdylcclxuICAgICAgICB0aGlzLl9ibG9ja3MgPSBbXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjbGVhcmVkTGluZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCB0aGUgc3RhZ2VcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuX2RhdGEgPSBbXTtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcclxuICAgICAgdGhpcy5fZGF0YS5wdXNoKFtdKTtcclxuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBDb25zdGFudHMuSEVJR0hUOyB5KyspIHtcclxuICAgICAgICB0aGlzLl9kYXRhW3hdLnB1c2goMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuX2Jsb2NrcyA9IFtdO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgdGV0cm9taW5vXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXRyb21pbm8ge1xyXG4gIGNvbnN0cnVjdG9yKHR5cGUsIGNvbnRhaW5lcikge1xyXG4gICAgLy8gU2V0IHRoZSBjb250YWluZXJcclxuICAgIHRoaXMuX2NvbnRhaW5lciA9IGNvbnRhaW5lcjtcclxuICAgIFxyXG4gICAgLy8gVHlwZSBvZiB0aGUgdGV0cm9taW5vIChJLCBKLCBMLCBPLCBTLCBULCBaKVxyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuXHJcbiAgICAvLyBQb3NpdGlvbiBvZiB0aGUgdGV0cm9taW5vXHJcbiAgICB0aGlzLnggPSBNYXRoLmZsb29yKENvbnN0YW50cy5XSURUSCAvIDIgLSB0aGlzLnR5cGUuc2l6ZSAvIDIpO1xyXG4gICAgdGhpcy55ID0gMDtcclxuXHJcbiAgICAvLyBBbmdsZSBvZiB0aGUgdGV0cm9taW5vICgwOiAwZGVnLCAxOiA5MGRlZywgMjogMTgwZGVnLCAzOiAyNzBkZWcpXHJcbiAgICB0aGlzLmFuZ2xlID0gMDtcclxuXHJcbiAgICAvLyBQaXhpJ3MgYmxvY2tzXHJcbiAgICB0aGlzLl9ibG9ja3MgPSBbXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXRpYyBtZXRob2QgdG8gZ2V0IGEgcmFuZG9tIHRldHJvbWlub1xyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRSYW5kb20oY29udGFpbmVyKSB7XHJcbiAgICB2YXIgdHlwZXMgPSBbVHlwZXMuSSwgVHlwZXMuSiwgVHlwZXMuTCwgVHlwZXMuTywgVHlwZXMuUywgVHlwZXMuVCwgVHlwZXMuWl07XHJcbiAgICB2YXIgdHlwZSA9IHR5cGVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpXTtcclxuICAgIHJldHVybiBuZXcgVGV0cm9taW5vKHR5cGUsIGNvbnRhaW5lcik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgc2hhcGVzIHRvIGNvbnRhaW5lclxyXG4gICAqL1xyXG4gIGRyYXcoKSB7XHJcbiAgICBsZXQgaSA9IDA7XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMudHlwZS5zaXplOyB4KyspIHtcclxuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLnR5cGUuc2l6ZTsgeSsrKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudHlwZS5zaGFwZXNbdGhpcy5hbmdsZV1beV1beF0gPT09IDEpIHtcclxuICAgICAgICAgIGlmICh0aGlzLl9ibG9ja3MubGVuZ3RoICE9PSA0KSB7XHJcbiAgICAgICAgICAgIHZhciBibG9jayA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XHJcbiAgICAgICAgICAgIGJsb2NrLmxpbmVTdHlsZSgxLCBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19CT1JERVJTLCAxKTtcclxuICAgICAgICAgICAgYmxvY2suYmVnaW5GaWxsKHRoaXMudHlwZS5jb2xvcik7XHJcbiAgICAgICAgICAgIGJsb2NrLmRyYXdSZWN0KDAsIDAsIENvbnN0YW50cy5TUVVBUkVfU0laRSwgQ29uc3RhbnRzLlNRVUFSRV9TSVpFKTtcclxuICAgICAgICAgICAgYmxvY2suZW5kRmlsbCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9ibG9ja3MucHVzaChibG9jayk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRDaGlsZChibG9jayk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLl9ibG9ja3NbaV0ueCA9ICh0aGlzLnggKyB4KSAqIENvbnN0YW50cy5TUVVBUkVfU0laRTtcclxuICAgICAgICAgIHRoaXMuX2Jsb2Nrc1tpXS55ID0gKHRoaXMueSArIHkpICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xyXG4gICAgICAgICAgaSsrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIHNoYXBlcyBmcm9tIGNvbnRhaW5lclxyXG4gICAqL1xyXG4gIHJlbW92ZSgpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fYmxvY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHRoaXMuX2NvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLl9ibG9ja3NbaV0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlIHRoZSB0ZXRyb21pbm8gdG8gdGhlIHJpZ2h0XHJcbiAgICovXHJcbiAgcm90YXRlKCkge1xyXG4gICAgdGhpcy5hbmdsZSArPSAxO1xyXG4gICAgdGhpcy5hbmdsZSAlPSA0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlIHRoZSB0ZXRyb21pbm8gdG8gdGhlIGxlZnRcclxuICAgKi9cclxuICBhbnRpUm90YXRlKCkge1xyXG4gICAgdGhpcy5hbmdsZSAtPSAxO1xyXG4gICAgaWYgKHRoaXMuYW5nbGUgPT09IC0xKSB7XHJcbiAgICAgIHRoaXMuYW5nbGUgPSAzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZSB0aGUgdGV0cm9taW5vXHJcbiAgICovXHJcbiAgbW92ZShkeCwgZHkpIHtcclxuICAgIHRoaXMueCArPSBkeDtcclxuICAgIHRoaXMueSArPSBkeTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3QgaWYgdGhlIHRldHJvbWlubyBoYXMgYSBibG9jayBpbiB0aGUgcG9zaXRpbm8gKHgsIHkpXHJcbiAgICogeCBhbmQgeSBiZWluZyByZWxhdGl2ZSB0aGUgdGhlIHBvc2l0aW9uIG9mIHRoZSB0ZXRyb21pbm9cclxuICAgKi9cclxuICBoYXNCbG9jayh4LCB5KSB7XHJcbiAgICByZXR1cm4gdGhpcy50eXBlLnNoYXBlc1t0aGlzLmFuZ2xlXVt5XVt4XSA9PT0gMTtcclxuICB9XHJcblxyXG59XHJcblxyXG4vKipcclxuICogVHlwZXMgb2YgdGV0cm9taW5vc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFR5cGVzID0ge1xyXG4gIEk6IHtcclxuICAgIG5hbWU6ICdJJywgLy8gTmFtZSBvZiB0aGUgdGV0cm9taW5vXHJcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fSSwgLy8gQmFja2dyb3VuZCBjb2xvclxyXG4gICAgc2l6ZTogNCwgLy8gU2l6ZSBvZiB0aGUgJ2NvbnRhaW5lcicgb2YgdGhlIHRldHJvbWlub1xyXG4gICAgc2hhcGVzOiBbIC8vIEFsbCBzaGFwZXMgb2YgdGhlIHRldHJvbWlubyAob25lIHBlciByb3RhdGlvbiBwb3NpdGlvbilcclxuICAgICAgW1xyXG4gICAgICAgIFswLDAsMCwwXSxcclxuICAgICAgICBbMSwxLDEsMV0sXHJcbiAgICAgICAgWzAsMCwwLDBdLFxyXG4gICAgICAgIFswLDAsMCwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwxLDBdLFxyXG4gICAgICAgIFswLDAsMSwwXSxcclxuICAgICAgICBbMCwwLDEsMF0sXHJcbiAgICAgICAgWzAsMCwxLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDAsMF0sXHJcbiAgICAgICAgWzAsMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMSwxXSxcclxuICAgICAgICBbMCwwLDAsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMCwwXSxcclxuICAgICAgICBbMCwxLDAsMF0sXHJcbiAgICAgICAgWzAsMSwwLDBdLFxyXG4gICAgICAgIFswLDEsMCwwXVxyXG4gICAgICBdXHJcbiAgICBdXHJcbiAgfSxcclxuICBKOiB7XHJcbiAgICBuYW1lOiAnSicsXHJcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fSixcclxuICAgIHNpemU6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDAsMF0sXHJcbiAgICAgICAgWzEsMSwxXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDFdLFxyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDAsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMSwxLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG4gIEw6IHtcclxuICAgIG5hbWU6ICdMJyxcclxuICAgIGNvbG9yOiBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19MLFxyXG4gICAgc2l6ZTogMyxcclxuICAgIHNoYXBlczogW1xyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwxXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDAsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMCwxLDFdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMV0sXHJcbiAgICAgICAgWzEsMCwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMF1cclxuICAgICAgXVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgTzoge1xyXG4gICAgbmFtZTogJ08nLFxyXG4gICAgY29sb3I6IENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX08sXHJcbiAgICBzaXplOiAyLFxyXG4gICAgc2hhcGVzOiBbXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwxXSxcclxuICAgICAgICBbMSwxXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzEsMV0sXHJcbiAgICAgICAgWzEsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDFdLFxyXG4gICAgICAgIFsxLDFdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwxXSxcclxuICAgICAgICBbMSwxXVxyXG4gICAgICBdXHJcbiAgICBdXHJcbiAgfSxcclxuICBTOiB7XHJcbiAgICBuYW1lOiAnUycsXHJcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fUyxcclxuICAgIHNpemU6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMCwxXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMCwxLDFdLFxyXG4gICAgICAgIFsxLDEsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDAsMF0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwxLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG4gIFQ6IHtcclxuICAgIG5hbWU6ICdUJyxcclxuICAgIGNvbG9yOiBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19ULFxyXG4gICAgc2l6ZSA6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwxXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDEsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwxLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG4gIFo6IHtcclxuICAgIG5hbWU6ICdaJyxcclxuICAgIGNvbG9yOiBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19aLFxyXG4gICAgc2l6ZSA6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDEsMF0sXHJcbiAgICAgICAgWzAsMSwxXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDFdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMSwxLDBdLFxyXG4gICAgICAgIFswLDEsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMSwwLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9XHJcbn07XHJcbiIsImltcG9ydCBHYW1lIGZyb20gJy4vR2FtZSc7XHJcblxyXG52YXIgZyA9IG5ldyBHYW1lKCk7XHJcbiJdfQ==
