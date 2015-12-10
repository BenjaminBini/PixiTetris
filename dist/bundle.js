(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BlockFactory = (function () {
  function BlockFactory() {
    _classCallCheck(this, BlockFactory);
  }

  _createClass(BlockFactory, null, [{
    key: 'createBlock',
    value: function createBlock(x, y, width, height, backgroundColor, borderColor, borderWidth) {
      var block = new PIXI.Container();
      var border = new PIXI.Sprite(getTexture(borderColor));
      border.width = width;
      border.height = height;
      block.addChild(border);
      var background = new PIXI.Sprite(getTexture(backgroundColor));
      background.width = width - 2 * borderWidth;
      background.height = height - 2 * borderWidth;
      background.position.x = borderWidth;
      background.position.y = borderWidth;
      block.addChild(background);
      block.position.x = x;
      block.position.y = y;
      return block;
    }
  }]);

  return BlockFactory;
})();

exports.default = BlockFactory;

function getTexture(color) {
  if (colorTextures[color] === undefined) {
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#' + color.toString(16);
    ctx.beginPath();
    ctx.rect(0, 0, 1, 1);
    ctx.fill();
    ctx.closePath();
    colorTextures[color] = PIXI.Texture.fromCanvas(canvas);
  }
  return colorTextures[color];
};

var colorTextures = {};

},{}],2:[function(require,module,exports){
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
    BORDERS: 0x373C40
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

},{}],3:[function(require,module,exports){
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
        cancelAnimationFrame(this._requestId);
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

},{"./Constants":2,"./ScoreManager":4,"./Stage":5,"./Tetromino":6}],4:[function(require,module,exports){
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

},{"./Constants":2}],5:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Constants = require('./Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _BlockFactory = require('./BlockFactory');

var _BlockFactory2 = _interopRequireDefault(_BlockFactory);

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
            var block = _BlockFactory2.default.createBlock(x * _Constants2.default.SQUARE_SIZE, y * _Constants2.default.SQUARE_SIZE, _Constants2.default.SQUARE_SIZE, _Constants2.default.SQUARE_SIZE, this._data[x][y], _Constants2.default.COLORS.TETROMINO_BORDERS, 0.5);

            this._container.removeChild(this._blocks[i]);
            this._container.addChild(block);
            this._blocks[i] = block;
          } else if (this._blocks[i] === undefined) {
            // Just a grid if empty
            var block = _BlockFactory2.default.createBlock(x * _Constants2.default.SQUARE_SIZE, y * _Constants2.default.SQUARE_SIZE, _Constants2.default.SQUARE_SIZE, _Constants2.default.SQUARE_SIZE, _Constants2.default.COLORS.BACKGROUND, _Constants2.default.COLORS.BORDERS, 0.5);
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

},{"./BlockFactory":1,"./Constants":2}],6:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Types = undefined;

var _Constants = require('./Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _BlockFactory = require('./BlockFactory');

var _BlockFactory2 = _interopRequireDefault(_BlockFactory);

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
              var block = _BlockFactory2.default.createBlock(0, 0, _Constants2.default.SQUARE_SIZE, _Constants2.default.SQUARE_SIZE, this.type.color, _Constants2.default.COLORS.TETROMINO_BORDERS, 0.5);
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

},{"./BlockFactory":1,"./Constants":2}],7:[function(require,module,exports){
'use strict';

var _Game = require('./Game');

var _Game2 = _interopRequireDefault(_Game);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var g = new _Game2.default();

},{"./Game":3}]},{},[7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQmxvY2tGYWN0b3J5LmpzIiwic3JjL0NvbnN0YW50cy5qcyIsInNyYy9HYW1lLmpzIiwic3JjL1Njb3JlTWFuYWdlci5qcyIsInNyYy9TdGFnZS5qcyIsInNyYy9UZXRyb21pbm8uanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0lDQXFCLFlBQVk7V0FBWixZQUFZOzBCQUFaLFlBQVk7OztlQUFaLFlBQVk7O2dDQUNaLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRTtBQUNqRixVQUFJLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNqQyxVQUFJLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDdEQsWUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDckIsWUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDdkIsV0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN2QixVQUFJLFVBQVUsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFDOUQsZ0JBQVUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUM7QUFDM0MsZ0JBQVUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUM7QUFDN0MsZ0JBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztBQUNwQyxnQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDO0FBQ3BDLFdBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDM0IsV0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLFdBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixhQUFPLEtBQUssQ0FBQztLQUNkOzs7U0FoQmtCLFlBQVk7OztrQkFBWixZQUFZOztBQW1CakMsU0FBUyxVQUFVLENBQUMsS0FBSyxFQUFFO0FBQzFCLE1BQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLFNBQVMsRUFBRTtBQUN0QyxRQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzdDLFVBQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFVBQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEMsT0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QyxPQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEIsT0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUNsQixPQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWCxPQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEIsaUJBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUN2RDtBQUNELFNBQU8sYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzVCLENBQUM7O0FBRUYsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDOzs7Ozs7Ozs7OztrQkNoQ1I7QUFDYixPQUFLLEVBQUUsRUFBRTtBQUNULFFBQU0sRUFBRSxFQUFFO0FBQ1YsYUFBVyxFQUFFLEVBQUU7QUFDZixRQUFNLEVBQUU7QUFDUCxxQkFBaUIsRUFBRSxRQUFRO0FBQzNCLGVBQVcsRUFBRSxRQUFRO0FBQ3JCLGVBQVcsRUFBRSxRQUFRO0FBQ3JCLGVBQVcsRUFBRSxRQUFRO0FBQ3JCLGVBQVcsRUFBRSxRQUFRO0FBQ3JCLGVBQVcsRUFBRSxRQUFRO0FBQ3JCLGVBQVcsRUFBRSxRQUFRO0FBQ3JCLGVBQVcsRUFBRSxRQUFRO0FBQ3JCLGNBQVUsRUFBRSxRQUFRO0FBQ3BCLFdBQU8sRUFBRSxRQUFRO0dBQ2pCO0FBQ0QsS0FBRyxFQUFFO0FBQ0osYUFBUyxFQUFFLG1CQUFtQjtBQUM5QixRQUFJLEVBQUUsaUJBQWlCO0FBQ3ZCLGVBQVcsRUFBRSxxQkFBcUI7QUFDakMsU0FBSyxFQUFFLFFBQVE7QUFDZixTQUFLLEVBQUUsUUFBUTtBQUNmLFdBQU8sRUFBRSxVQUFVO0FBQ25CLFFBQUksRUFBRSxhQUFhO0FBQ25CLFdBQU8sRUFBRSxVQUFVO0dBQ3BCO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUN2Qm9CLElBQUk7QUFDdkIsV0FEbUIsSUFBSSxHQUNUOzBCQURLLElBQUk7O0FBRXJCLFdBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDOzs7QUFBQyxBQUdsQixRQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQVUsR0FBRyxDQUFDLFNBQVMsQ0FBQzs7O0FBQUMsQUFHckUsUUFBSSxDQUFDLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQVUsR0FBRyxDQUFDLElBQUksQ0FBQzs7O0FBQUEsQUFHbkUsUUFBSSxDQUFDLG1CQUFtQixFQUFFOzs7QUFBQyxBQUczQixRQUFJLENBQUMsZ0JBQWdCLEVBQUU7OztBQUFDLEFBR3hCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLG9CQUFVLEtBQUssR0FBRyxvQkFBVSxXQUFXLEVBQUUsb0JBQVUsTUFBTSxHQUFHLG9CQUFVLFdBQVcsQ0FBQyxDQUFDOztBQUU1SCxRQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQzs7O0FBQUMsQUFHcEQsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7OztBQUFDLEFBR3ZDLFFBQUksQ0FBQyxNQUFNLEdBQUcsb0JBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQzs7O0FBQUMsQUFHekMsUUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTO0FBQUMsQUFDNUIsUUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTO0FBQUMsQUFDaEMsUUFBSSxDQUFDLGFBQWEsRUFBRTs7O0FBQUMsQUFHckIsUUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHOzs7QUFBQyxBQUdsQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFOzs7QUFBQyxBQUduQyxRQUFJLENBQUMsYUFBYSxHQUFHLDRCQUFrQjs7O0FBQUMsQUFHeEMsUUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTO0FBQUMsQUFDNUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDckIsUUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQ2Y7Ozs7O0FBQUE7ZUE3Q2tCLElBQUk7OzZCQWtEZDs7O0FBQ1AsVUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixVQUFJLENBQUMsVUFBVSxHQUFHLHFCQUFxQixDQUFDO2VBQU0sTUFBSyxLQUFLLEVBQUU7T0FBQSxDQUFDLENBQUM7S0FDN0Q7Ozs7Ozs7OzRCQUtPOzs7QUFDTixVQUFJLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ3BELFlBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNuQyxZQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDZDtBQUNELFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNmLFVBQUksQ0FBQyxVQUFVLEdBQUcscUJBQXFCLENBQUM7ZUFBTSxPQUFLLEtBQUssRUFBRTtPQUFBLENBQUMsQ0FBQztLQUM3RDs7Ozs7Ozs7NkJBS1E7QUFDUCxVQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU87O0FBQUMsQUFFN0IsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLDRCQUFvQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN0QyxnQkFBUSxDQUFDLGFBQWEsQ0FBQyxvQkFBVSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUN2RSxnQkFBUSxDQUFDLGFBQWEsQ0FBQyxvQkFBVSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQztBQUN6RSxnQkFBUSxDQUFDLGFBQWEsQ0FBQyxvQkFBVSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztPQUNwRSxNQUFNO0FBQ0wsWUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2QsZ0JBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQVUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFDL0QsZ0JBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQVUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUM7QUFDdEUsZ0JBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQVUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7T0FDOUQ7S0FDRjs7Ozs7Ozs7NEJBS087QUFDTixVQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUFDLEFBRTNCLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQzVDLFlBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLFlBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekIsWUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3RELFlBQUksWUFBWSxHQUFHLENBQUMsRUFBRTtBQUNwQixjQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNsRDtBQUNELFlBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUN0QyxZQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLFlBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztPQUN0QjtLQUNGOzs7Ozs7OztnQ0FLVztBQUNWLGFBQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDaEQsWUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO09BQzVCO0FBQ0QsVUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN6QixVQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdEQsVUFBSSxZQUFZLEdBQUcsQ0FBQyxFQUFFO0FBQ3BCLFlBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQ2xEO0FBQ0QsVUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQ3RCOzs7Ozs7OztnQ0FLVztBQUNWLFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDcEIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuQixVQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzVCOzs7Ozs7Ozs7b0NBT2U7QUFDZCxVQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN4QixZQUFJLENBQUMsY0FBYyxHQUFHLG9CQUFVLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDNUQ7QUFDRCxVQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7QUFDdEMsVUFBSSxDQUFDLGNBQWMsR0FBRyxvQkFBVSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNELFVBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSTs7QUFBQyxBQUVqRSxVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUM1QyxZQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7T0FDbEI7S0FDRjs7Ozs7Ozs7MENBS3FCOzs7QUFDcEIsVUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqQyxVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQy9CLFVBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbEMsVUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqQyxVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUIsYUFBTyxDQUFDLEtBQUssR0FBRztlQUFNLE9BQUssVUFBVSxFQUFFO09BQUEsQ0FBQztBQUN4QyxXQUFLLENBQUMsS0FBSyxHQUFHO2VBQU0sT0FBSyxRQUFRLEVBQUU7T0FBQSxDQUFDO0FBQ3BDLGNBQVEsQ0FBQyxLQUFLLEdBQUc7ZUFBTSxPQUFLLFdBQVcsRUFBRTtPQUFBLENBQUM7QUFDMUMsYUFBTyxDQUFDLEtBQUssR0FBRztlQUFNLE9BQUssVUFBVSxFQUFFO09BQUEsQ0FBQztBQUN4QyxjQUFRLENBQUMsS0FBSyxHQUFHO2VBQU0sT0FBSyxXQUFXLEVBQUU7T0FBQSxDQUFDO0FBQzFDLFVBQUksQ0FBQyxLQUFLLEdBQUc7ZUFBTSxPQUFLLE1BQU0sRUFBRTtPQUFBLENBQUM7S0FDbEM7Ozs7Ozs7O3VDQUtrQjs7O0FBQ2pCLFVBQUksZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxvQkFBVSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDekUsc0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO2VBQU0sT0FBSyxNQUFNLEVBQUU7T0FBQSxDQUFDLENBQUM7S0FDakU7Ozs7Ozs7O2lDQUtZO0FBQ1gsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDakIsWUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDNUIsWUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDNUMsY0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzVCO09BQ0Y7S0FDRjs7Ozs7Ozs7a0NBS2E7QUFDWixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNqQixZQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0IsWUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDNUMsY0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDN0I7T0FDRjtLQUNGOzs7Ozs7OzsrQkFLVTtBQUNULFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekIsWUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDNUMsY0FBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUM5QjtPQUNGO0tBQ0Y7Ozs7Ozs7O2lDQUtZO0FBQ1gsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDakIsWUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ2Q7S0FDRjs7Ozs7Ozs7a0NBS2E7QUFDWixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNqQixZQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7T0FDbEI7S0FDRjs7Ozs7Ozs7OEJBS1M7QUFDUixVQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUN4Qzs7Ozs7Ozs7OEJBS1MsT0FBTyxFQUFFO0FBQ2pCLFVBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLFNBQUcsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO0FBQ25CLFNBQUcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFNBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFNBQUcsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0FBQ3RCLFNBQUcsQ0FBQyxPQUFPLEdBQUcsU0FBUzs7QUFBQyxBQUV4QixTQUFHLENBQUMsV0FBVyxHQUFHLFVBQVMsS0FBSyxFQUFFO0FBQ2hDLFlBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxHQUFHLENBQUMsSUFBSSxFQUFFO0FBQzlCLGNBQUksR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN2QyxhQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNsQixhQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztBQUNqQixlQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDeEI7T0FDRjs7O0FBQUMsQUFHRixTQUFHLENBQUMsU0FBUyxHQUFHLFVBQVMsS0FBSyxFQUFFO0FBQzlCLFlBQUksS0FBSyxDQUFDLE9BQU8sS0FBSyxHQUFHLENBQUMsSUFBSSxFQUFFO0FBQzlCLGNBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QyxhQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNuQixhQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixlQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDeEI7T0FDRjs7O0FBQUMsQUFHRixZQUFNLENBQUMsZ0JBQWdCLENBQ3JCLFNBQVMsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQzVDLENBQUM7QUFDRixZQUFNLENBQUMsZ0JBQWdCLENBQ3JCLE9BQU8sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQ3hDLENBQUM7QUFDRixhQUFPLEdBQUcsQ0FBQztLQUNaOzs7U0FwUmtCLElBQUk7OztrQkFBSixJQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDSkosWUFBWTtBQUMvQixXQURtQixZQUFZLEdBQ2pCOzBCQURLLFlBQVk7O0FBRTdCLFFBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNkOztlQUhrQixZQUFZOzs0QkFLdkI7QUFDTixVQUFJLENBQUMsSUFBSSxHQUFJLFlBQVksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDakUsVUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDMUIsWUFBSSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7T0FDakQ7QUFDRCxVQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNmLFVBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsVUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDdEIsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQ3RCOzs7K0JBRVUsTUFBTSxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDO0tBQ3RCOzs7b0NBRWUsS0FBSyxFQUFFO0FBQ3JCLFVBQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUM3QyxVQUFJLENBQUMsWUFBWSxJQUFJLEtBQUssQ0FBQztBQUMzQixVQUFJLG9CQUFvQixHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsRUFBRTtBQUN0RCxZQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDZDtBQUNELFVBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtBQUNmLFlBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxDQUFDO09BQ3hDLE1BQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxDQUFDO09BQ3pDLE1BQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxDQUFDO09BQ3pDLE1BQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxDQUFDO09BQzFDO0FBQ0QsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQ3RCOzs7dUNBRWtCO0FBQ2pCLFVBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxDQUFDO0FBQ3RDLFVBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUN0Qjs7O29DQUVlO0FBQ2QsY0FBUSxDQUFDLGFBQWEsQ0FBQyxvQkFBVSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkUsY0FBUSxDQUFDLGFBQWEsQ0FBQyxvQkFBVSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkUsY0FBUSxDQUFDLGFBQWEsQ0FBQyxvQkFBVSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDNUUsY0FBUSxDQUFDLGFBQWEsQ0FBQyxvQkFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDbEU7OztTQWhEa0IsWUFBWTs7O2tCQUFaLFlBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ0laLEtBQUs7QUFDeEIsV0FEbUIsS0FBSyxDQUNaLFNBQVMsRUFBRTswQkFESixLQUFLOzs7QUFHdEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTOzs7OztBQUFDLEFBSzVCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxvQkFBVSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDeEMsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEIsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG9CQUFVLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN6QyxZQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUN2QjtLQUNGOzs7QUFBQSxBQUdELFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0dBQ25COzs7OztBQUFBO2VBbEJrQixLQUFLOzsyQkF1QmpCO0FBQ0wsVUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG9CQUFVLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4QyxhQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsb0JBQVUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztBQUV6QyxjQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzFCLGdCQUFJLEtBQUssR0FBRyx1QkFBYSxXQUFXLENBQUMsQ0FBQyxHQUFHLG9CQUFVLFdBQVcsRUFBRSxDQUFDLEdBQUcsb0JBQVUsV0FBVyxFQUN2RixvQkFBVSxXQUFXLEVBQUUsb0JBQVUsV0FBVyxFQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLG9CQUFVLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFN0QsZ0JBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QyxnQkFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEMsZ0JBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1dBQ3pCLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRTs7QUFDeEMsZ0JBQUksS0FBSyxHQUFHLHVCQUFhLFdBQVcsQ0FBQyxDQUFDLEdBQUcsb0JBQVUsV0FBVyxFQUFFLENBQUMsR0FBRyxvQkFBVSxXQUFXLEVBQ3ZGLG9CQUFVLFdBQVcsRUFBRSxvQkFBVSxXQUFXLEVBQzVDLG9CQUFVLE1BQU0sQ0FBQyxVQUFVLEVBQUUsb0JBQVUsTUFBTSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM5RCxnQkFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEMsZ0JBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1dBQ3pCO0FBQ0QsV0FBQyxFQUFFLENBQUM7U0FDTDtPQUNGO0tBQ0Y7Ozs7Ozs7O2dDQUtXLFNBQVMsRUFBRTtBQUNyQixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUMsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVDLGNBQUksU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLG9CQUFVLEtBQUssSUFBSSxDQUFDLElBQUksb0JBQVUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNoSyxnQkFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUM1QixxQkFBTyxJQUFJLENBQUM7YUFDYjtXQUNGO1NBQ0Y7T0FDRjtBQUNELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7Ozs7Ozs7Ozs7MEJBT0ssU0FBUyxFQUFFO0FBQ2YsVUFBSSxZQUFZLEdBQUcsQ0FBQzs7O0FBQUMsQUFHckIsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVDLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM1QyxjQUFJLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLG9CQUFVLEtBQUssSUFBSSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDekYsZ0JBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1dBQ3JFO1NBQ0Y7T0FDRjs7QUFFRCxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O0FBRTVDLFlBQUksU0FBUyxHQUFHLElBQUksQ0FBQztBQUNyQixZQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxJQUFJLG9CQUFVLE1BQU0sRUFBRTtBQUN2QyxtQkFBUyxHQUFHLEtBQUssQ0FBQztTQUNuQixNQUFNO0FBQ1AsZUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG9CQUFVLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN0QyxnQkFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3hDLHVCQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLG9CQUFNO2FBQ1A7V0FDRjtTQUNGOztBQUFBLEFBRUQsWUFBSSxTQUFTLEVBQUU7QUFDYixzQkFBWSxFQUFFLENBQUM7QUFDZixlQUFLLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUU7QUFDNUMsaUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxvQkFBVSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDeEMsa0JBQUksRUFBRSxHQUFHLENBQUMsRUFBRTtBQUNWLG9CQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDO2VBQ3pDLE1BQU07QUFDTCxvQkFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7ZUFDdkI7YUFDRjtXQUNGOztBQUFBLEFBRUQsY0FBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7U0FDbkI7T0FDRjs7QUFFRCxhQUFPLFlBQVksQ0FBQztLQUNyQjs7Ozs7Ozs7NEJBS087QUFDTixVQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNoQixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsb0JBQVUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3hDLFlBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxvQkFBVSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDekMsY0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdkI7T0FDRjtBQUNELFVBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0tBQ25COzs7U0E5SGtCLEtBQUs7OztrQkFBTCxLQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDQUwsU0FBUztBQUM1QixXQURtQixTQUFTLENBQ2hCLElBQUksRUFBRSxTQUFTLEVBQUU7MEJBRFYsU0FBUzs7O0FBRzFCLFFBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUzs7O0FBQUMsQUFHNUIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJOzs7QUFBQyxBQUdqQixRQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQVUsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM5RCxRQUFJLENBQUMsQ0FBQyxHQUFHLENBQUM7OztBQUFDLEFBR1gsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDOzs7QUFBQyxBQUdmLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0dBQ25COzs7OztBQUFBO2VBakJrQixTQUFTOzs7Ozs7MkJBK0JyQjtBQUNMLFVBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNWLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN2QyxhQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdkMsY0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzVDLGdCQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUM3QixrQkFBSSxLQUFLLEdBQUcsdUJBQWEsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsb0JBQVUsV0FBVyxFQUFFLG9CQUFVLFdBQVcsRUFDckYsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsb0JBQVUsTUFBTSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzVELGtCQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6QixrQkFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDakM7QUFDRCxnQkFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxHQUFJLG9CQUFVLFdBQVcsQ0FBQztBQUN6RCxnQkFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxHQUFJLG9CQUFVLFdBQVcsQ0FBQztBQUN6RCxhQUFDLEVBQUUsQ0FBQztXQUNMO1NBQ0Y7T0FDRjtLQUNGOzs7Ozs7Ozs2QkFLUTtBQUNQLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM1QyxZQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDOUM7S0FDRjs7Ozs7Ozs7NkJBS1E7QUFDUCxVQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUNoQixVQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztLQUNqQjs7Ozs7Ozs7aUNBS1k7QUFDWCxVQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUNoQixVQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDckIsWUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7T0FDaEI7S0FDRjs7Ozs7Ozs7eUJBS0ksRUFBRSxFQUFFLEVBQUUsRUFBRTtBQUNYLFVBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2IsVUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDZDs7Ozs7Ozs7OzZCQU1RLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDYixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDakQ7Ozs4QkFyRWdCLFNBQVMsRUFBRTtBQUMxQixVQUFJLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RSxVQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoRCxhQUFPLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztLQUN2Qzs7O1NBMUJrQixTQUFTOzs7Ozs7O2tCQUFULFNBQVM7QUFrR3ZCLElBQU0sS0FBSyxXQUFMLEtBQUssR0FBRztBQUNuQixHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxvQkFBVSxNQUFNLENBQUMsV0FBVztBQUNuQyxRQUFJLEVBQUUsQ0FBQztBQUNQLFVBQU0sRUFBRTtBQUNOLEtBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxvQkFBVSxNQUFNLENBQUMsV0FBVztBQUNuQyxRQUFJLEVBQUUsQ0FBQztBQUNQLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsb0JBQVUsTUFBTSxDQUFDLFdBQVc7QUFDbkMsUUFBSSxFQUFFLENBQUM7QUFDUCxVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLG9CQUFVLE1BQU0sQ0FBQyxXQUFXO0FBQ25DLFFBQUksRUFBRSxDQUFDO0FBQ1AsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDTCxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDTixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ0wsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ04sRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNMLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNOLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDTCxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDTixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxvQkFBVSxNQUFNLENBQUMsV0FBVztBQUNuQyxRQUFJLEVBQUUsQ0FBQztBQUNQLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsb0JBQVUsTUFBTSxDQUFDLFdBQVc7QUFDbkMsUUFBSSxFQUFHLENBQUM7QUFDUixVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLG9CQUFVLE1BQU0sQ0FBQyxXQUFXO0FBQ25DLFFBQUksRUFBRyxDQUFDO0FBQ1IsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixDQUNGO0dBQ0Y7Q0FDRixDQUFDOzs7Ozs7Ozs7OztBQ3BTRixJQUFJLENBQUMsR0FBRyxvQkFBVSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEJsb2NrRmFjdG9yeSB7XG4gIHN0YXRpYyBjcmVhdGVCbG9jayh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBiYWNrZ3JvdW5kQ29sb3IsIGJvcmRlckNvbG9yLCBib3JkZXJXaWR0aCkge1xuICAgIHZhciBibG9jayA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuICAgIHZhciBib3JkZXIgPSBuZXcgUElYSS5TcHJpdGUoZ2V0VGV4dHVyZShib3JkZXJDb2xvcikpO1xuICAgIGJvcmRlci53aWR0aCA9IHdpZHRoO1xuICAgIGJvcmRlci5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgYmxvY2suYWRkQ2hpbGQoYm9yZGVyKTtcbiAgICB2YXIgYmFja2dyb3VuZCA9IG5ldyBQSVhJLlNwcml0ZShnZXRUZXh0dXJlKGJhY2tncm91bmRDb2xvcikpO1xuICAgIGJhY2tncm91bmQud2lkdGggPSB3aWR0aCAtIDIgKiBib3JkZXJXaWR0aDtcbiAgICBiYWNrZ3JvdW5kLmhlaWdodCA9IGhlaWdodCAtIDIgKiBib3JkZXJXaWR0aDtcbiAgICBiYWNrZ3JvdW5kLnBvc2l0aW9uLnggPSBib3JkZXJXaWR0aDtcbiAgICBiYWNrZ3JvdW5kLnBvc2l0aW9uLnkgPSBib3JkZXJXaWR0aDtcbiAgICBibG9jay5hZGRDaGlsZChiYWNrZ3JvdW5kKTtcbiAgICBibG9jay5wb3NpdGlvbi54ID0geDtcbiAgICBibG9jay5wb3NpdGlvbi55ID0geTtcbiAgICByZXR1cm4gYmxvY2s7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VGV4dHVyZShjb2xvcikge1xuIGlmKGNvbG9yVGV4dHVyZXNbY29sb3JdID09PSB1bmRlZmluZWQpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gIGNhbnZhcy53aWR0aCA9IDE7XG4gIGNhbnZhcy5oZWlnaHQgPSAxO1xuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIGN0eC5maWxsU3R5bGUgPSAnIycgKyBjb2xvci50b1N0cmluZygxNik7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LnJlY3QoMCwwLDEsMSk7XG4gIGN0eC5maWxsKCk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbiAgY29sb3JUZXh0dXJlc1tjb2xvcl0gPSBQSVhJLlRleHR1cmUuZnJvbUNhbnZhcyhjYW52YXMpO1xuIH1cbiByZXR1cm4gY29sb3JUZXh0dXJlc1tjb2xvcl07XG59O1xuXG52YXIgY29sb3JUZXh0dXJlcyA9IHt9OyIsIi8qKlxuICogR2FtZSBjb25zdGFudHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICBXSURUSDogMTIsIC8vIFdpZHRoIG9mIHRoZSBnYW1lIChpbiBudW1iZXIgb2YgYmxvY2tzKVxuICBIRUlHSFQ6IDI0LCAvLyBIZWlnaHQgb2YgdGhlIGdhbWUgKGluIG51bWJlciBvZiBibG9ja3MpXG4gIFNRVUFSRV9TSVpFOiAyNSwgLy8gV2lkdGggYW5kIGhlaWdodCBvZiBhIGJsb2NrIChpbiBweClcbiAgQ09MT1JTOiB7XG4gIFx0VEVUUk9NSU5PX0JPUkRFUlM6IDB4MzczYzQwLFxuICBcdFRFVFJPTUlOT19JOiAweGZmODAwMCxcbiAgXHRURVRST01JTk9fSjogMHgyY2M5OTAsXG4gIFx0VEVUUk9NSU5PX0w6IDB4ZjM0MzQ0LFxuICBcdFRFVFJPTUlOT19POiAweGZmZGYwMCxcbiAgXHRURVRST01JTk9fUzogMHhjY2RjZTQsXG4gIFx0VEVUUk9NSU5PX1Q6IDB4MDA4YWZmLFxuICBcdFRFVFJPTUlOT19aOiAweGZjYjk0MSxcbiAgXHRCQUNLR1JPVU5EOiAweDJkMzIzNixcbiAgXHRCT1JERVJTOiAweDM3M0M0MFxuICB9LFxuICBET006IHtcbiAgXHRDT05UQUlORVI6ICcjY2FudmFzLWNvbnRhaW5lcicsXG4gIFx0TkVYVDogJyNuZXh0LXRldHJvbWlubycsXG4gIFx0U1RBUlRfUEFVU0U6ICcjc3RhcnQtcGF1c2UgYnV0dG9uJyxcbiAgICBMRVZFTDogJyNsZXZlbCcsXG4gICAgU0NPUkU6ICcjc2NvcmUnLFxuICAgIENMRUFSRUQ6ICcjY2xlYXJlZCcsXG4gICAgQkVTVDogJyNiZXN0LXNjb3JlJyxcbiAgICBPVkVSTEFZOiAnI292ZXJsYXknXG4gIH1cbn07XG4iLCJpbXBvcnQgVGV0cm9taW5vIGZyb20gJy4vVGV0cm9taW5vJztcbmltcG9ydCB7VHlwZXN9IGZyb20gJy4vVGV0cm9taW5vJztcbmltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMnO1xuaW1wb3J0IFN0YWdlIGZyb20gJy4vU3RhZ2UnO1xuaW1wb3J0IFNjb3JlTWFuYWdlciBmcm9tICcuL1Njb3JlTWFuYWdlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zb2xlLmxvZyhQSVhJKTtcblxuICAgIC8vIERPTSBjb250YWluZXJcbiAgICB0aGlzLl9kb21Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uQ09OVEFJTkVSKTtcblxuICAgIC8vIE5leHQgdGV0cm9taW5vIERPTSBjb250YWluZXJcbiAgICB0aGlzLl9kb21OZXh0Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLk5FWFQpXG5cbiAgICAvLyBLZXlib2FyZCBldmVudHNcbiAgICB0aGlzLl9pbml0S2V5Ym9hcmRFdmVudHMoKTtcblxuICAgIC8vIE1vdXNlIGV2ZW50c1xuICAgIHRoaXMuX2luaXRNb3VzZUV2ZW50cygpO1xuICAgICBcbiAgICAvLyBTZXQgdXAgUElYSVxuICAgIHRoaXMuX3JlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIoQ29uc3RhbnRzLldJRFRIICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBDb25zdGFudHMuSEVJR0hUICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFKTtcblxuICAgIHRoaXMuX2RvbUNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9yZW5kZXJlci52aWV3KTtcblxuICAgIC8vIFBpeGkgY29udGFpbmVyXG4gICAgdGhpcy5fY29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG5cbiAgICAvLyBHYW1lIGJvYXJkL3N0YWdlXG4gICAgdGhpcy5fc3RhZ2UgPSBuZXcgU3RhZ2UodGhpcy5fY29udGFpbmVyKTsgXG5cbiAgICAvLyBJbml0IHRldHJvbWlub3NcbiAgICB0aGlzLl90ZXRyb21pbm8gPSB1bmRlZmluZWQ7IC8vIFRldHJvbWlubyBvbiB0aGUgc3RhZ2VcbiAgICB0aGlzLl9uZXh0VGV0cm9taW5vID0gdW5kZWZpbmVkOyAvLyBOZXh0IHRldHJvbWlub1xuICAgIHRoaXMuX25ld1RldHJvbWlubygpO1xuXG4gICAgLy8gRGVsYXkgYmV0d2VlbiBtb3Zlc1xuICAgIHRoaXMuX2RlbGF5ID0gMzAwO1xuXG4gICAgLy8gSW5pdCB0aW1lclxuICAgIHRoaXMuX3RpbWVyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAvLyBTY29yZSBtYW5hZ2VyXG4gICAgdGhpcy5fc2NvcmVNYW5hZ2VyID0gbmV3IFNjb3JlTWFuYWdlcigpO1xuXG4gICAgLy8gR08hXG4gICAgdGhpcy5fcmVxdWVzdElkID0gdW5kZWZpbmVkOyAvLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgSUQgKHVzZWQgdG8gcGF1c2UgZ2FtZSlcbiAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdGFydCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBnYW1lXG4gICAqL1xuICBfc3RhcnQoKSB7XG4gICAgdGhpcy5fc3RhZ2UuZHJhdygpO1xuICAgIHRoaXMuX3JlcXVlc3RJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLl9sb29wKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdhbWUgbG9vcFxuICAgKi9cbiAgX2xvb3AoKSB7XG4gICAgaWYgKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGhpcy5fdGltZXIgPiB0aGlzLl9kZWxheSkge1xuICAgICAgdGhpcy5fdGltZXIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuX2Ryb3AoKTtcbiAgICB9XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgdGhpcy5fcmVxdWVzdElkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuX2xvb3AoKSk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2UgdGhlIGdhbWVcbiAgICovXG4gIF9wYXVzZSgpIHtcbiAgICB0aGlzLl9wYXVzZWQgPSAhdGhpcy5fcGF1c2VkO1xuICAgIC8vIFN0b3Agb3IgcmVzdGFydCBsb29wXG4gICAgaWYgKHRoaXMuX3BhdXNlZCkge1xuICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmVxdWVzdElkKTtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TVEFSVF9QQVVTRSkuaW5uZXJUZXh0ID0gJ3Jlc3VtZSc7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uU1RBUlRfUEFVU0UpLmlubmVyVGV4dCA9ICdjb250aW51ZSc7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uT1ZFUkxBWSkuY2xhc3NOYW1lID0gJ2FjdGl2ZSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3N0YXJ0KCk7ICAgXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uU1RBUlRfUEFVU0UpLmlkID0gJ3BhdXNlJztcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TVEFSVF9QQVVTRSkuaW5uZXJUZXh0ID0gJ3BhdXNlJztcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5PVkVSTEFZKS5jbGFzc05hbWUgPSAnJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgY3VycmVudCB0ZXRyb21pbm8gZG93bndhcmRcbiAgICovXG4gIF9kcm9wKCkge1xuICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDAsIDEpOyAvLyBHcmF2aXR5XG4gICAgLy8gSWYgY29sbGlzaW9uLCBjYW5jZWwgIG1vdmUgYW5kIHVuaXRlIHRoZSB0ZXRyb21pbm8gd2l0aCB0aGUgZ2FtZSBzdGFnZVxuICAgIGlmICh0aGlzLl9zdGFnZS5pc0NvbGxpc2lvbih0aGlzLl90ZXRyb21pbm8pKSB7IFxuICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMCwgLTEpO1xuICAgICAgdGhpcy5fdGV0cm9taW5vLnJlbW92ZSgpO1xuICAgICAgdmFyIGNsZWFyZWRMaW5lcyA9IHRoaXMuX3N0YWdlLnVuaXRlKHRoaXMuX3RldHJvbWlubyk7XG4gICAgICBpZiAoY2xlYXJlZExpbmVzID4gMCkge1xuICAgICAgICB0aGlzLl9zY29yZU1hbmFnZXIuYWRkQ2xlYXJlZExpbmVzKGNsZWFyZWRMaW5lcyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9zY29yZU1hbmFnZXIudGV0cm9taW5vRHJvcHBlZCgpO1xuICAgICAgdGhpcy5fc3RhZ2UuZHJhdygpO1xuICAgICAgdGhpcy5fbmV3VGV0cm9taW5vKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIGN1cnJlbnQgdGV0cm9taW5vIGFzIGRvd24gYXMgcG9zc2libGVcbiAgICovXG4gIF9oYXJkRHJvcCgpIHtcbiAgICB3aGlsZSAoIXRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcbiAgICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDAsIDEpO1xuICAgIH1cbiAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgwLCAtMSk7XG4gICAgdGhpcy5fdGV0cm9taW5vLnJlbW92ZSgpO1xuICAgIHZhciBjbGVhcmVkTGluZXMgPSB0aGlzLl9zdGFnZS51bml0ZSh0aGlzLl90ZXRyb21pbm8pO1xuICAgIGlmIChjbGVhcmVkTGluZXMgPiAwKSB7XG4gICAgICB0aGlzLl9zY29yZU1hbmFnZXIuYWRkQ2xlYXJlZExpbmVzKGNsZWFyZWRMaW5lcyk7XG4gICAgfVxuICAgIHRoaXMuX3Njb3JlTWFuYWdlci50ZXRyb21pbm9Ecm9wcGVkKCk7XG4gICAgdGhpcy5fc3RhZ2UuZHJhdygpO1xuICAgIHRoaXMuX25ld1RldHJvbWlubygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBnYW1lIGlzIG92ZXJcbiAgICovXG4gIF9nYW1lT3ZlcigpIHtcbiAgICB0aGlzLl9zdGFnZS5yZXNldCgpO1xuICAgIHRoaXMuX3N0YWdlLmRyYXcoKTtcbiAgICB0aGlzLl9zY29yZU1hbmFnZXIucmVzZXQoKTtcbiAgfVxuICBcblxuICAvKipcbiAgICogUHV0IGEgbmV3IHRldHJvbWlubyBvbiB0aGUgYm9hcmRcbiAgICogQW5kIGNoZWNrIGlmIHRoZSBnYW1lIGlzIGxvc3Qgb3Igbm90XG4gICAqL1xuICBfbmV3VGV0cm9taW5vKCkge1xuICAgIGlmICghdGhpcy5fbmV4dFRldHJvbWlubykge1xuICAgICAgdGhpcy5fbmV4dFRldHJvbWlubyA9IFRldHJvbWluby5nZXRSYW5kb20odGhpcy5fY29udGFpbmVyKTsgIFxuICAgIH1cbiAgICB0aGlzLl90ZXRyb21pbm8gPSB0aGlzLl9uZXh0VGV0cm9taW5vO1xuICAgIHRoaXMuX25leHRUZXRyb21pbm8gPSBUZXRyb21pbm8uZ2V0UmFuZG9tKHRoaXMuX2NvbnRhaW5lcik7XG4gICAgdGhpcy5fZG9tTmV4dENvbnRhaW5lci5jbGFzc05hbWUgPSB0aGlzLl9uZXh0VGV0cm9taW5vLnR5cGUubmFtZTtcbiAgICAvLyBMb3NlISBSZXN0YXJ0XG4gICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcbiAgICAgIHRoaXMuX2dhbWVPdmVyKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXQga2V5Ym9hcmQgZXZlbnRzXG4gICAqL1xuICBfaW5pdEtleWJvYXJkRXZlbnRzKCkge1xuICAgIHZhciBsZWZ0S2V5ID0gdGhpcy5fa2V5Ym9hcmQoMzcpO1xuICAgIHZhciB1cEtleSA9IHRoaXMuX2tleWJvYXJkKDM4KTtcbiAgICB2YXIgcmlnaHRLZXkgPSB0aGlzLl9rZXlib2FyZCgzOSk7XG4gICAgdmFyIGRvd25LZXkgPSB0aGlzLl9rZXlib2FyZCg0MCk7XG4gICAgdmFyIHNwYWNlS2V5ID0gdGhpcy5fa2V5Ym9hcmQoMzIpO1xuICAgIHZhciBwS2V5ID0gdGhpcy5fa2V5Ym9hcmQoODApO1xuICAgIGxlZnRLZXkucHJlc3MgPSAoKSA9PiB0aGlzLl9wcmVzc0xlZnQoKTtcbiAgICB1cEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzVXAoKTtcbiAgICByaWdodEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzUmlnaHQoKTtcbiAgICBkb3duS2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcHJlc3NEb3duKCk7XG4gICAgc3BhY2VLZXkucHJlc3MgPSAoKSA9PiB0aGlzLl9wcmVzc1NwYWNlKCk7XG4gICAgcEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3BhdXNlKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdCBtb3VzZSBldmVudHNcbiAgICovXG4gIF9pbml0TW91c2VFdmVudHMoKSB7XG4gICAgdmFyIHN0YXJ0UGF1c2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uU1RBUlRfUEFVU0UpO1xuICAgIHN0YXJ0UGF1c2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9wYXVzZSgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcIlByZXNzIGxlZnRcIiBldmVudFxuICAgKi9cbiAgX3ByZXNzTGVmdCgpIHtcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xuICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoLTEsIDApO1xuICAgICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcbiAgICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMSwgMCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFwiUHJlc3MgcmlnaHRcIiBldmVudFxuICAgKi9cbiAgX3ByZXNzUmlnaHQoKSB7XG4gICAgaWYgKCF0aGlzLl9wYXVzZWQpIHtcbiAgICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDEsIDApO1xuICAgICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcbiAgICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoLTEsIDApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcIlByZXNzIHVwXCIgZXZlbnRcbiAgICovXG4gIF9wcmVzc1VwKCkge1xuICAgIGlmICghdGhpcy5fcGF1c2VkKSB7XG4gICAgICB0aGlzLl90ZXRyb21pbm8ucm90YXRlKCk7XG4gICAgICBpZiAodGhpcy5fc3RhZ2UuaXNDb2xsaXNpb24odGhpcy5fdGV0cm9taW5vKSkge1xuICAgICAgICB0aGlzLl90ZXRyb21pbm8uYW50aVJvdGF0ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcIlByZXNzIGRvd25cIiBldmVudFxuICAgKi9cbiAgX3ByZXNzRG93bigpIHtcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xuICAgICAgdGhpcy5fZHJvcCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcIlByZXNzIHNwYWNlXCIgZXZlbnRcbiAgICovXG4gIF9wcmVzc1NwYWNlKCkge1xuICAgIGlmICghdGhpcy5fcGF1c2VkKSB7XG4gICAgICB0aGlzLl9oYXJkRHJvcCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgZnVuY3Rpb25cbiAgICovXG4gIF9yZW5kZXIoKSB7XG4gICAgdGhpcy5fdGV0cm9taW5vLmRyYXcoKTtcbiAgICB0aGlzLl9yZW5kZXJlci5yZW5kZXIodGhpcy5fY29udGFpbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBLZXlib2FyZCBldmVudHMgaGVscGVyXG4gICAqL1xuICBfa2V5Ym9hcmQoa2V5Q29kZSkge1xuICAgIHZhciBrZXkgPSB7fTtcbiAgICBrZXkuY29kZSA9IGtleUNvZGU7XG4gICAga2V5LmlzRG93biA9IGZhbHNlO1xuICAgIGtleS5pc1VwID0gdHJ1ZTtcbiAgICBrZXkucHJlc3MgPSB1bmRlZmluZWQ7XG4gICAga2V5LnJlbGVhc2UgPSB1bmRlZmluZWQ7XG4gICAgLy9UaGUgYGRvd25IYW5kbGVyYFxuICAgIGtleS5kb3duSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0ga2V5LmNvZGUpIHtcbiAgICAgICAgaWYgKGtleS5pc1VwICYmIGtleS5wcmVzcykga2V5LnByZXNzKCk7XG4gICAgICAgIGtleS5pc0Rvd24gPSB0cnVlO1xuICAgICAgICBrZXkuaXNVcCA9IGZhbHNlO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvL1RoZSBgdXBIYW5kbGVyYFxuICAgIGtleS51cEhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XG4gICAgICAgIGlmIChrZXkuaXNEb3duICYmIGtleS5yZWxlYXNlKSBrZXkucmVsZWFzZSgpO1xuICAgICAgICBrZXkuaXNEb3duID0gZmFsc2U7XG4gICAgICAgIGtleS5pc1VwID0gdHJ1ZTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy9BdHRhY2ggZXZlbnQgbGlzdGVuZXJzXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAna2V5ZG93bicsIGtleS5kb3duSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXG4gICAgKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICdrZXl1cCcsIGtleS51cEhhbmRsZXIuYmluZChrZXkpLCBmYWxzZVxuICAgICk7XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG59XG4iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NvcmVNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5iZXN0ID0gIGxvY2FsU3RvcmFnZS5iZXN0U2NvcmUgPyBsb2NhbFN0b3JhZ2UuYmVzdFNjb3JlIDogMDtcbiAgICBpZiAodGhpcy5zY29yZSA+IHRoaXMuYmVzdCkge1xuICAgICAgdGhpcy5iZXN0ID0gbG9jYWxTdG9yYWdlLmJlc3RTY29yZSA9IHRoaXMuc2NvcmU7XG4gICAgfVxuICAgIHRoaXMubGV2ZWwgPSAwO1xuICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgIHRoaXMuY2xlYXJlZExpbmVzID0gMDtcbiAgICB0aGlzLnVwZGF0ZURpc3BsYXkoKTtcbiAgfVxuXG4gIF9hZGRQb2ludHMocG9pbnRzKSB7XG4gICAgdGhpcy5zY29yZSArPSBwb2ludHM7XG4gIH1cblxuICBhZGRDbGVhcmVkTGluZXMobGluZXMpIHtcbiAgICB2YXIgcHJldmlvdXNDbGVhcmVkTGluZXMgPSB0aGlzLmNsZWFyZWRMaW5lcztcbiAgICB0aGlzLmNsZWFyZWRMaW5lcyArPSBsaW5lcztcbiAgICBpZiAocHJldmlvdXNDbGVhcmVkTGluZXMgJSAxMCA+IHRoaXMuY2xlYXJlZExpbmVzICUgMTApIHtcbiAgICAgIHRoaXMubGV2ZWwrKztcbiAgICB9XG4gICAgaWYgKGxpbmVzID09PSAxKSB7XG4gICAgICB0aGlzLl9hZGRQb2ludHMoNDAgKiAodGhpcy5sZXZlbCArIDEpKTtcbiAgICB9IGVsc2UgaWYgKGxpbmVzID09PSAyKSB7XG4gICAgICB0aGlzLl9hZGRQb2ludHMoMTAwICogKHRoaXMubGV2ZWwgKyAxKSk7XG4gICAgfSBlbHNlIGlmIChsaW5lcyA9PT0gMykge1xuICAgICAgdGhpcy5fYWRkUG9pbnRzKDMwMCAqICh0aGlzLmxldmVsICsgMSkpO1xuICAgIH0gZWxzZSBpZiAobGluZXMgPT09IDQpIHtcbiAgICAgIHRoaXMuX2FkZFBvaW50cygxMjAwICogKHRoaXMubGV2ZWwgKyAxKSk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlRGlzcGxheSgpO1xuICB9XG5cbiAgdGV0cm9taW5vRHJvcHBlZCgpIHtcbiAgICB0aGlzLl9hZGRQb2ludHMoNSAqICh0aGlzLmxldmVsICsgMSkpO1xuICAgIHRoaXMudXBkYXRlRGlzcGxheSgpO1xuICB9XG5cbiAgdXBkYXRlRGlzcGxheSgpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uTEVWRUwpLmlubmVyVGV4dCA9IHRoaXMubGV2ZWw7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLlNDT1JFKS5pbm5lclRleHQgPSB0aGlzLnNjb3JlO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5DTEVBUkVEKS5pbm5lclRleHQgPSB0aGlzLmNsZWFyZWRMaW5lcztcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uQkVTVCkuaW5uZXJUZXh0ID0gdGhpcy5iZXN0O1xuICB9XG59XG4iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcbmltcG9ydCBCbG9ja0ZhY3RvcnkgZnJvbSAnLi9CbG9ja0ZhY3RvcnknO1xuXG4vKipcbiAqIFJlcHJlc2VudCB0aGUgZ2FtZSBzdGFnZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFnZSB7XG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lcikge1xuICAgIC8vIFNldCB0aGUgY29udGFpbmVyXG4gICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xuXG4gICAgLy8gX2RhdGEgcmVwcmVzZW50cyB0aGUgc3RhdGUgb2YgZXZlcnkgYmxvY2sgb2YgdGhlIHN0YWdlXG4gICAgLy8gMCBmb3IgXCJlbXB0eVwiLCBoZXhhIGNvZGUgY29sb3IgaWYgbm90XG4gICAgLy8gV2UgaW5pdGlhbGl6ZSBpdCB3aXRoIHplcm9zXG4gICAgdGhpcy5fZGF0YSA9IFtdO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcbiAgICAgIHRoaXMuX2RhdGEucHVzaChbXSk7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IENvbnN0YW50cy5IRUlHSFQ7IHkrKykge1xuICAgICAgICB0aGlzLl9kYXRhW3hdLnB1c2goMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUGl4aSdzIGJsb2Nrc1xuICAgIHRoaXMuX2Jsb2NrcyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBzaGFwZXMgdG8gdGhlIF9jb250YWluZXJcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgdmFyIGkgPSAwO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgQ29uc3RhbnRzLkhFSUdIVDsgeSsrKSB7XG4gICAgICAgIC8vIENvbG9yIGJsb2NrcyB3aGVuIG5vdCBlbXB0eVxuICAgICAgICBpZiAodGhpcy5fZGF0YVt4XVt5XSAhPT0gMCkge1xuICAgICAgICAgIHZhciBibG9jayA9IEJsb2NrRmFjdG9yeS5jcmVhdGVCbG9jayh4ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCB5ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBcbiAgICAgICAgICAgIENvbnN0YW50cy5TUVVBUkVfU0laRSwgQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBcbiAgICAgICAgICAgIHRoaXMuX2RhdGFbeF1beV0sIENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX0JPUkRFUlMsIDAuNSk7XG4gICAgICAgICAgXG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMuX2Jsb2Nrc1tpXSk7XG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLmFkZENoaWxkKGJsb2NrKTtcbiAgICAgICAgICB0aGlzLl9ibG9ja3NbaV0gPSBibG9jaztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ibG9ja3NbaV0gPT09IHVuZGVmaW5lZCkgeyAvLyBKdXN0IGEgZ3JpZCBpZiBlbXB0eVxuICAgICAgICAgIHZhciBibG9jayA9IEJsb2NrRmFjdG9yeS5jcmVhdGVCbG9jayh4ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCB5ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBcbiAgICAgICAgICAgIENvbnN0YW50cy5TUVVBUkVfU0laRSwgQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBcbiAgICAgICAgICAgIENvbnN0YW50cy5DT0xPUlMuQkFDS0dST1VORCwgQ29uc3RhbnRzLkNPTE9SUy5CT1JERVJTLCAwLjUpO1xuICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRDaGlsZChibG9jayk7XG4gICAgICAgICAgdGhpcy5fYmxvY2tzW2ldID0gYmxvY2s7XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiAndGV0cm9taW5vJyBpcyBpbiBjb2xsaXNpb24gd2l0aCB0aGUgc3RhZ2VcbiAgICovXG4gIGlzQ29sbGlzaW9uKHRldHJvbWlubykge1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeCsrKSB7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRldHJvbWluby50eXBlLnNpemU7IHkrKykgeyAgICAgICAgXG4gICAgICAgIGlmICh0ZXRyb21pbm8ueCArIHggPCAwIHx8IHRldHJvbWluby54ICsgeCA+PSBDb25zdGFudHMuV0lEVEggfHwgeSA+PSBDb25zdGFudHMuSEVJR0hUIHx8IHRldHJvbWluby55ID49IDAgJiYgdGhpcy5fZGF0YVt0ZXRyb21pbm8ueCArIHhdW3RldHJvbWluby55ICsgeV0gIT09IDApIHtcbiAgICAgICAgICBpZiAodGV0cm9taW5vLmhhc0Jsb2NrKHgsIHkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9ICBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRnVzaW9uICd0ZXRyb21pbm8nIHdpdGggdGhlIHN0YWdlXG4gICAqIElmIHRoZSBmdXNpb24gY3JlYXRlIGEgbGluZSwgd2UgY2xlYXIgdGhlIGxpbmVcbiAgICogUmV0dXJuIHRoZSBudW1iZXIgb2YgY2xlYXJlZCBsaW5lc1xuICAgKi9cbiAgdW5pdGUodGV0cm9taW5vKSB7XG4gICAgdmFyIGNsZWFyZWRMaW5lcyA9IDA7XG5cbiAgICAvLyBGdXNpb24gdGhlIHRldHJvbWlubyB3aXRoIHRoZSBzdGFnZVxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeSsrKSB7XG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRldHJvbWluby50eXBlLnNpemU7IHgrKykge1xuICAgICAgICBpZiAodGV0cm9taW5vLnggKyB4IDwgQ29uc3RhbnRzLldJRFRIICYmIHRldHJvbWluby54ICsgeCA+PSAwICYmIHRldHJvbWluby5oYXNCbG9jayh4LCB5KSkge1xuICAgICAgICAgIHRoaXMuX2RhdGFbdGV0cm9taW5vLnggKyB4XVt0ZXRyb21pbm8ueSArIHldID0gdGV0cm9taW5vLnR5cGUuY29sb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRldHJvbWluby50eXBlLnNpemU7IHkrKykge1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIGZ1c2lvbiBjcmVhdGVkIGEgbmV3IGxpbmVcbiAgICAgIHZhciBlcmFzZUxpbmUgPSB0cnVlO1xuICAgICAgaWYgKHkgKyB0ZXRyb21pbm8ueSA+PSBDb25zdGFudHMuSEVJR0hUKSB7XG4gICAgICAgIGVyYXNlTGluZSA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcbiAgICAgICAgICBpZiAodGhpcy5fZGF0YVt4XVt5ICsgdGV0cm9taW5vLnldID09PSAwKSB7XG4gICAgICAgICAgICBlcmFzZUxpbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gSWYgeWVzLCB3ZSBlcmFzZSBpdCBhbmQgbW92ZSBhbGwgY29uY2VybmVkIGJsb2Nrc1xuICAgICAgaWYgKGVyYXNlTGluZSkge1xuICAgICAgICBjbGVhcmVkTGluZXMrKztcbiAgICAgICAgZm9yIChsZXQgeXkgPSB5ICsgdGV0cm9taW5vLnk7IHl5ID49IDA7IHl5LS0pIHtcbiAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IENvbnN0YW50cy5XSURUSDsgeCsrKSB7XG4gICAgICAgICAgICBpZiAoeXkgPiAwKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2RhdGFbeF1beXldID0gdGhpcy5fZGF0YVt4XVt5eS0xXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuX2RhdGFbeF1beXldID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gZW1wdHkgdGhlIGJsb2NrcyAod2Ugd2lsbCBuZWVkIHRvIHJlZHJhdylcbiAgICAgICAgdGhpcy5fYmxvY2tzID0gW107XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsZWFyZWRMaW5lcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0aGUgc3RhZ2VcbiAgICovXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2RhdGEgPSBbXTtcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IENvbnN0YW50cy5XSURUSDsgeCsrKSB7XG4gICAgICB0aGlzLl9kYXRhLnB1c2goW10pO1xuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBDb25zdGFudHMuSEVJR0hUOyB5KyspIHtcbiAgICAgICAgdGhpcy5fZGF0YVt4XS5wdXNoKDApO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9ibG9ja3MgPSBbXTtcbiAgfVxufVxuIiwiaW1wb3J0IENvbnN0YW50cyBmcm9tICcuL0NvbnN0YW50cyc7XG5pbXBvcnQgQmxvY2tGYWN0b3J5IGZyb20gJy4vQmxvY2tGYWN0b3J5JztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgdGV0cm9taW5vXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRldHJvbWlubyB7XG4gIGNvbnN0cnVjdG9yKHR5cGUsIGNvbnRhaW5lcikge1xuICAgIC8vIFNldCB0aGUgY29udGFpbmVyXG4gICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIFxuICAgIC8vIFR5cGUgb2YgdGhlIHRldHJvbWlubyAoSSwgSiwgTCwgTywgUywgVCwgWilcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuXG4gICAgLy8gUG9zaXRpb24gb2YgdGhlIHRldHJvbWlub1xuICAgIHRoaXMueCA9IE1hdGguZmxvb3IoQ29uc3RhbnRzLldJRFRIIC8gMiAtIHRoaXMudHlwZS5zaXplIC8gMik7XG4gICAgdGhpcy55ID0gMDtcblxuICAgIC8vIEFuZ2xlIG9mIHRoZSB0ZXRyb21pbm8gKDA6IDBkZWcsIDE6IDkwZGVnLCAyOiAxODBkZWcsIDM6IDI3MGRlZylcbiAgICB0aGlzLmFuZ2xlID0gMDtcblxuICAgIC8vIFBpeGkncyBibG9ja3NcbiAgICB0aGlzLl9ibG9ja3MgPSBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIHRvIGdldCBhIHJhbmRvbSB0ZXRyb21pbm9cbiAgICovXG4gIHN0YXRpYyBnZXRSYW5kb20oY29udGFpbmVyKSB7XG4gICAgdmFyIHR5cGVzID0gW1R5cGVzLkksIFR5cGVzLkosIFR5cGVzLkwsIFR5cGVzLk8sIFR5cGVzLlMsIFR5cGVzLlQsIFR5cGVzLlpdO1xuICAgIHZhciB0eXBlID0gdHlwZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNyldO1xuICAgIHJldHVybiBuZXcgVGV0cm9taW5vKHR5cGUsIGNvbnRhaW5lcik7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHNoYXBlcyB0byBjb250YWluZXJcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy50eXBlLnNpemU7IHgrKykge1xuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLnR5cGUuc2l6ZTsgeSsrKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUuc2hhcGVzW3RoaXMuYW5nbGVdW3ldW3hdID09PSAxKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX2Jsb2Nrcy5sZW5ndGggIT09IDQpIHtcbiAgICAgICAgICAgIHZhciBibG9jayA9IEJsb2NrRmFjdG9yeS5jcmVhdGVCbG9jaygwLCAwLCBDb25zdGFudHMuU1FVQVJFX1NJWkUsIENvbnN0YW50cy5TUVVBUkVfU0laRSwgXG4gICAgICAgICAgICAgIHRoaXMudHlwZS5jb2xvciwgQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fQk9SREVSUywgMC41KTtcbiAgICAgICAgICAgIHRoaXMuX2Jsb2Nrcy5wdXNoKGJsb2NrKTtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRDaGlsZChibG9jayk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX2Jsb2Nrc1tpXS54ID0gKHRoaXMueCArIHgpICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xuICAgICAgICAgIHRoaXMuX2Jsb2Nrc1tpXS55ID0gKHRoaXMueSArIHkpICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgc2hhcGVzIGZyb20gY29udGFpbmVyXG4gICAqL1xuICByZW1vdmUoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9ibG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuX2NvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLl9ibG9ja3NbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGUgdGhlIHRldHJvbWlubyB0byB0aGUgcmlnaHRcbiAgICovXG4gIHJvdGF0ZSgpIHtcbiAgICB0aGlzLmFuZ2xlICs9IDE7XG4gICAgdGhpcy5hbmdsZSAlPSA0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJvdGF0ZSB0aGUgdGV0cm9taW5vIHRvIHRoZSBsZWZ0XG4gICAqL1xuICBhbnRpUm90YXRlKCkge1xuICAgIHRoaXMuYW5nbGUgLT0gMTtcbiAgICBpZiAodGhpcy5hbmdsZSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuYW5nbGUgPSAzO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHRoZSB0ZXRyb21pbm9cbiAgICovXG4gIG1vdmUoZHgsIGR5KSB7XG4gICAgdGhpcy54ICs9IGR4O1xuICAgIHRoaXMueSArPSBkeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0IGlmIHRoZSB0ZXRyb21pbm8gaGFzIGEgYmxvY2sgaW4gdGhlIHBvc2l0aW5vICh4LCB5KVxuICAgKiB4IGFuZCB5IGJlaW5nIHJlbGF0aXZlIHRoZSB0aGUgcG9zaXRpb24gb2YgdGhlIHRldHJvbWlub1xuICAgKi9cbiAgaGFzQmxvY2soeCwgeSkge1xuICAgIHJldHVybiB0aGlzLnR5cGUuc2hhcGVzW3RoaXMuYW5nbGVdW3ldW3hdID09PSAxO1xuICB9XG5cbn1cblxuLyoqXG4gKiBUeXBlcyBvZiB0ZXRyb21pbm9zXG4gKi9cbmV4cG9ydCBjb25zdCBUeXBlcyA9IHtcbiAgSToge1xuICAgIG5hbWU6ICdJJywgLy8gTmFtZSBvZiB0aGUgdGV0cm9taW5vXG4gICAgY29sb3I6IENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX0ksIC8vIEJhY2tncm91bmQgY29sb3JcbiAgICBzaXplOiA0LCAvLyBTaXplIG9mIHRoZSAnY29udGFpbmVyJyBvZiB0aGUgdGV0cm9taW5vXG4gICAgc2hhcGVzOiBbIC8vIEFsbCBzaGFwZXMgb2YgdGhlIHRldHJvbWlubyAob25lIHBlciByb3RhdGlvbiBwb3NpdGlvbilcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwLDBdLFxuICAgICAgICBbMSwxLDEsMV0sXG4gICAgICAgIFswLDAsMCwwXSxcbiAgICAgICAgWzAsMCwwLDBdXG4gICAgICBdLFxuICAgICAgW1xuICAgICAgICBbMCwwLDEsMF0sXG4gICAgICAgIFswLDAsMSwwXSxcbiAgICAgICAgWzAsMCwxLDBdLFxuICAgICAgICBbMCwwLDEsMF1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFswLDAsMCwwXSxcbiAgICAgICAgWzAsMCwwLDBdLFxuICAgICAgICBbMSwxLDEsMV0sXG4gICAgICAgIFswLDAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwLDBdLFxuICAgICAgICBbMCwxLDAsMF0sXG4gICAgICAgIFswLDEsMCwwXSxcbiAgICAgICAgWzAsMSwwLDBdXG4gICAgICBdXG4gICAgXVxuICB9LFxuICBKOiB7XG4gICAgbmFtZTogJ0onLFxuICAgIGNvbG9yOiBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19KLFxuICAgIHNpemU6IDMsXG4gICAgc2hhcGVzOiBbXG4gICAgICBbXG4gICAgICAgIFsxLDAsMF0sXG4gICAgICAgIFsxLDEsMV0sXG4gICAgICAgIFswLDAsMF1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFswLDEsMV0sXG4gICAgICAgIFswLDEsMF0sXG4gICAgICAgIFswLDEsMF1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFswLDAsMF0sXG4gICAgICAgIFsxLDEsMV0sXG4gICAgICAgIFswLDAsMV1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFswLDEsMF0sXG4gICAgICAgIFswLDEsMF0sXG4gICAgICAgIFsxLDEsMF1cbiAgICAgIF1cbiAgICBdXG4gIH0sXG4gIEw6IHtcbiAgICBuYW1lOiAnTCcsXG4gICAgY29sb3I6IENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX0wsXG4gICAgc2l6ZTogMyxcbiAgICBzaGFwZXM6IFtcbiAgICAgIFtcbiAgICAgICAgWzAsMCwxXSxcbiAgICAgICAgWzEsMSwxXSxcbiAgICAgICAgWzAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwxXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwXSxcbiAgICAgICAgWzEsMSwxXSxcbiAgICAgICAgWzEsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXVxuICAgIF1cbiAgfSxcbiAgTzoge1xuICAgIG5hbWU6ICdPJyxcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fTyxcbiAgICBzaXplOiAyLFxuICAgIHNoYXBlczogW1xuICAgICAgW1xuICAgICAgICBbMSwxXSxcbiAgICAgICAgWzEsMV1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFsxLDFdLFxuICAgICAgICBbMSwxXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzEsMV0sXG4gICAgICAgIFsxLDFdXG4gICAgICBdLFxuICAgICAgW1xuICAgICAgICBbMSwxXSxcbiAgICAgICAgWzEsMV1cbiAgICAgIF1cbiAgICBdXG4gIH0sXG4gIFM6IHtcbiAgICBuYW1lOiAnUycsXG4gICAgY29sb3I6IENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX1MsXG4gICAgc2l6ZTogMyxcbiAgICBzaGFwZXM6IFtcbiAgICAgIFtcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzAsMCwxXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzEsMSwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzEsMCwwXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXVxuICAgIF1cbiAgfSxcbiAgVDoge1xuICAgIG5hbWU6ICdUJyxcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fVCxcbiAgICBzaXplIDogMyxcbiAgICBzaGFwZXM6IFtcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzEsMSwxXSxcbiAgICAgICAgWzAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwXSxcbiAgICAgICAgWzEsMSwxXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXVxuICAgIF1cbiAgfSxcbiAgWjoge1xuICAgIG5hbWU6ICdaJyxcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fWixcbiAgICBzaXplIDogMyxcbiAgICBzaGFwZXM6IFtcbiAgICAgIFtcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwxXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwxXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzEsMCwwXVxuICAgICAgXVxuICAgIF1cbiAgfVxufTtcbiIsImltcG9ydCBHYW1lIGZyb20gJy4vR2FtZSc7XG5cbnZhciBnID0gbmV3IEdhbWUoKTtcbiJdfQ==
