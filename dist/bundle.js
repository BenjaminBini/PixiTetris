(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BlockFactory = function () {
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
}();

exports.default = BlockFactory;


function getTexture(color) {
  if (colorTextures[color] === undefined) {
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
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
    TETROMINO_BORDERS: '#373c40',
    TETROMINO_I: '#ff8000',
    TETROMINO_J: '#2cc990',
    TETROMINO_L: '#f34344',
    TETROMINO_O: '#ffdf00',
    TETROMINO_S: '#ccdce4',
    TETROMINO_T: '#008aff',
    TETROMINO_Z: '#fcb941',
    BACKGROUND: '#2d3236',
    BORDERS: '#373C40'
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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var Game = function () {
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
}();

exports.default = Game;

},{"./Constants":2,"./ScoreManager":4,"./Stage":5,"./Tetromino":6}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Constants = require('./Constants');

var _Constants2 = _interopRequireDefault(_Constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScoreManager = function () {
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
}();

exports.default = ScoreManager;

},{"./Constants":2}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Constants = require('./Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _BlockFactory = require('./BlockFactory');

var _BlockFactory2 = _interopRequireDefault(_BlockFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represent the game stage
 */
var Stage = function () {
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
            delete this._blocks[i];
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

      for (var _y = 0; _y < tetromino.type.size; _y++) {
        // Check if the fusion created a new line
        var eraseLine = true;
        if (_y + tetromino.y >= _Constants2.default.HEIGHT) {
          eraseLine = false;
        } else {
          for (var _x = 0; _x < _Constants2.default.WIDTH; _x++) {
            if (this._data[_x][_y + tetromino.y] === 0) {
              eraseLine = false;
              break;
            }
          }
        }
        // If yes, we erase it and move all concerned blocks
        if (eraseLine) {
          clearedLines++;
          for (var yy = _y + tetromino.y; yy >= 0; yy--) {
            for (var _x2 = 0; _x2 < _Constants2.default.WIDTH; _x2++) {
              if (yy > 0) {
                this._data[_x2][yy] = this._data[_x2][yy - 1];
              } else {
                this._data[_x2][yy] = 0;
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
}();

exports.default = Stage;

},{"./BlockFactory":1,"./Constants":2}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Types = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Constants = require('./Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _BlockFactory = require('./BlockFactory');

var _BlockFactory2 = _interopRequireDefault(_BlockFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a tetromino
 */
var Tetromino = function () {
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
        delete this._blocks[i];
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
}();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQmxvY2tGYWN0b3J5LmpzIiwic3JjL0NvbnN0YW50cy5qcyIsInNyYy9HYW1lLmpzIiwic3JjL1Njb3JlTWFuYWdlci5qcyIsInNyYy9TdGFnZS5qcyIsInNyYy9UZXRyb21pbm8uanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0lDQXFCLFk7Ozs7Ozs7Z0NBQ0EsQyxFQUFHLEMsRUFBRyxLLEVBQU8sTSxFQUFRLGUsRUFBaUIsVyxFQUFhLFcsRUFBYTtBQUNqRixVQUFJLFFBQVEsSUFBSSxLQUFLLFNBQVQsRUFBWjtBQUNBLFVBQUksU0FBUyxJQUFJLEtBQUssTUFBVCxDQUFnQixXQUFXLFdBQVgsQ0FBaEIsQ0FBYjtBQUNBLGFBQU8sS0FBUCxHQUFlLEtBQWY7QUFDQSxhQUFPLE1BQVAsR0FBZ0IsTUFBaEI7QUFDQSxZQUFNLFFBQU4sQ0FBZSxNQUFmO0FBQ0EsVUFBSSxhQUFhLElBQUksS0FBSyxNQUFULENBQWdCLFdBQVcsZUFBWCxDQUFoQixDQUFqQjtBQUNBLGlCQUFXLEtBQVgsR0FBbUIsUUFBUSxJQUFJLFdBQS9CO0FBQ0EsaUJBQVcsTUFBWCxHQUFvQixTQUFTLElBQUksV0FBakM7QUFDQSxpQkFBVyxRQUFYLENBQW9CLENBQXBCLEdBQXdCLFdBQXhCO0FBQ0EsaUJBQVcsUUFBWCxDQUFvQixDQUFwQixHQUF3QixXQUF4QjtBQUNBLFlBQU0sUUFBTixDQUFlLFVBQWY7QUFDQSxZQUFNLFFBQU4sQ0FBZSxDQUFmLEdBQW1CLENBQW5CO0FBQ0EsWUFBTSxRQUFOLENBQWUsQ0FBZixHQUFtQixDQUFuQjtBQUNBLGFBQU8sS0FBUDtBQUNEOzs7Ozs7a0JBaEJrQixZOzs7QUFtQnJCLFNBQVMsVUFBVCxDQUFvQixLQUFwQixFQUEyQjtBQUMxQixNQUFHLGNBQWMsS0FBZCxNQUF5QixTQUE1QixFQUF1QztBQUN0QyxR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QUFILEVBQUssQ0FBTCxDQUhGLENBRE0sRUFNTixDQUNFLENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLENBREYsRUFFRSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQUZGLEVBR0UsQ0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUwsQ0FIRixDQU5NLEVBV04sQ0FDRSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQURGLEVBRUUsQ0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUwsQ0FGRixFQUdFLENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLENBSEYsQ0FYTSxFQWdCTixDQUNFLENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLENBREYsRUFFRSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQUZGLEVBR0UsQ0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUwsQ0FIRixDQWhCTTtBQUpQO0FBbktnQixDQUFkOzs7OztBQ3pHUDs7Ozs7O0FBRUEsSUFBSSxJQUFJLG9CQUFSIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEJsb2NrRmFjdG9yeSB7XG4gIHN0YXRpYyBjcmVhdGVCbG9jayh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBiYWNrZ3JvdW5kQ29sb3IsIGJvcmRlckNvbG9yLCBib3JkZXJXaWR0aCkge1xuICAgIHZhciBibG9jayA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuICAgIHZhciBib3JkZXIgPSBuZXcgUElYSS5TcHJpdGUoZ2V0VGV4dHVyZShib3JkZXJDb2xvcikpO1xuICAgIGJvcmRlci53aWR0aCA9IHdpZHRoO1xuICAgIGJvcmRlci5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgYmxvY2suYWRkQ2hpbGQoYm9yZGVyKTtcbiAgICB2YXIgYmFja2dyb3VuZCA9IG5ldyBQSVhJLlNwcml0ZShnZXRUZXh0dXJlKGJhY2tncm91bmRDb2xvcikpO1xuICAgIGJhY2tncm91bmQud2lkdGggPSB3aWR0aCAtIDIgKiBib3JkZXJXaWR0aDtcbiAgICBiYWNrZ3JvdW5kLmhlaWdodCA9IGhlaWdodCAtIDIgKiBib3JkZXJXaWR0aDtcbiAgICBiYWNrZ3JvdW5kLnBvc2l0aW9uLnggPSBib3JkZXJXaWR0aDtcbiAgICBiYWNrZ3JvdW5kLnBvc2l0aW9uLnkgPSBib3JkZXJXaWR0aDtcbiAgICBibG9jay5hZGRDaGlsZChiYWNrZ3JvdW5kKTtcbiAgICBibG9jay5wb3NpdGlvbi54ID0geDtcbiAgICBibG9jay5wb3NpdGlvbi55ID0geTtcbiAgICByZXR1cm4gYmxvY2s7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VGV4dHVyZShjb2xvcikge1xuIGlmKGNvbG9yVGV4dHVyZXNbY29sb3JdID09PSB1bmRlZmluZWQpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gIGNhbnZhcy53aWR0aCA9IDE7XG4gIGNhbnZhcy5oZWlnaHQgPSAxO1xuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgucmVjdCgwLDAsMSwxKTtcbiAgY3R4LmZpbGwoKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuICBjb2xvclRleHR1cmVzW2NvbG9yXSA9IFBJWEkuVGV4dHVyZS5mcm9tQ2FudmFzKGNhbnZhcyk7XG4gfVxuIHJldHVybiBjb2xvclRleHR1cmVzW2NvbG9yXTtcbn07XG5cbnZhciBjb2xvclRleHR1cmVzID0ge307IiwiLyoqXG4gKiBHYW1lIGNvbnN0YW50c1xuICovXG5leHBvcnQgZGVmYXVsdCB7XG4gIFdJRFRIOiAxMiwgLy8gV2lkdGggb2YgdGhlIGdhbWUgKGluIG51bWJlciBvZiBibG9ja3MpXG4gIEhFSUdIVDogMjQsIC8vIEhlaWdodCBvZiB0aGUgZ2FtZSAoaW4gbnVtYmVyIG9mIGJsb2NrcylcbiAgU1FVQVJFX1NJWkU6IDI1LCAvLyBXaWR0aCBhbmQgaGVpZ2h0IG9mIGEgYmxvY2sgKGluIHB4KVxuICBDT0xPUlM6IHtcbiAgXHRURVRST01JTk9fQk9SREVSUzogJyMzNzNjNDAnLFxuICBcdFRFVFJPTUlOT19JOiAnI2ZmODAwMCcsXG4gIFx0VEVUUk9NSU5PX0o6ICcjMmNjOTkwJyxcbiAgXHRURVRST01JTk9fTDogJyNmMzQzNDQnLFxuICBcdFRFVFJPTUlOT19POiAnI2ZmZGYwMCcsXG4gIFx0VEVUUk9NSU5PX1M6ICcjY2NkY2U0JyxcbiAgXHRURVRST01JTk9fVDogJyMwMDhhZmYnLFxuICBcdFRFVFJPTUlOT19aOiAnI2ZjYjk0MScsXG4gIFx0QkFDS0dST1VORDogJyMyZDMyMzYnLFxuICBcdEJPUkRFUlM6ICcjMzczQzQwJ1xuICB9LFxuICBET006IHtcbiAgXHRDT05UQUlORVI6ICcjY2FudmFzLWNvbnRhaW5lcicsXG4gIFx0TkVYVDogJyNuZXh0LXRldHJvbWlubycsXG4gIFx0U1RBUlRfUEFVU0U6ICcjc3RhcnQtcGF1c2UgYnV0dG9uJyxcbiAgICBMRVZFTDogJyNsZXZlbCcsXG4gICAgU0NPUkU6ICcjc2NvcmUnLFxuICAgIENMRUFSRUQ6ICcjY2xlYXJlZCcsXG4gICAgQkVTVDogJyNiZXN0LXNjb3JlJyxcbiAgICBPVkVSTEFZOiAnI292ZXJsYXknXG4gIH1cbn07XG4iLCJpbXBvcnQgVGV0cm9taW5vIGZyb20gJy4vVGV0cm9taW5vJztcbmltcG9ydCB7VHlwZXN9IGZyb20gJy4vVGV0cm9taW5vJztcbmltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMnO1xuaW1wb3J0IFN0YWdlIGZyb20gJy4vU3RhZ2UnO1xuaW1wb3J0IFNjb3JlTWFuYWdlciBmcm9tICcuL1Njb3JlTWFuYWdlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zb2xlLmxvZyhQSVhJKTtcblxuICAgIC8vIERPTSBjb250YWluZXJcbiAgICB0aGlzLl9kb21Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uQ09OVEFJTkVSKTtcblxuICAgIC8vIE5leHQgdGV0cm9taW5vIERPTSBjb250YWluZXJcbiAgICB0aGlzLl9kb21OZXh0Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLk5FWFQpXG5cbiAgICAvLyBLZXlib2FyZCBldmVudHNcbiAgICB0aGlzLl9pbml0S2V5Ym9hcmRFdmVudHMoKTtcblxuICAgIC8vIE1vdXNlIGV2ZW50c1xuICAgIHRoaXMuX2luaXRNb3VzZUV2ZW50cygpO1xuICAgICBcbiAgICAvLyBTZXQgdXAgUElYSVxuICAgIHRoaXMuX3JlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIoQ29uc3RhbnRzLldJRFRIICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBDb25zdGFudHMuSEVJR0hUICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFKTtcblxuICAgIHRoaXMuX2RvbUNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9yZW5kZXJlci52aWV3KTtcblxuICAgIC8vIFBpeGkgY29udGFpbmVyXG4gICAgdGhpcy5fY29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG5cbiAgICAvLyBHYW1lIGJvYXJkL3N0YWdlXG4gICAgdGhpcy5fc3RhZ2UgPSBuZXcgU3RhZ2UodGhpcy5fY29udGFpbmVyKTsgXG5cbiAgICAvLyBJbml0IHRldHJvbWlub3NcbiAgICB0aGlzLl90ZXRyb21pbm8gPSB1bmRlZmluZWQ7IC8vIFRldHJvbWlubyBvbiB0aGUgc3RhZ2VcbiAgICB0aGlzLl9uZXh0VGV0cm9taW5vID0gdW5kZWZpbmVkOyAvLyBOZXh0IHRldHJvbWlub1xuICAgIHRoaXMuX25ld1RldHJvbWlubygpO1xuXG4gICAgLy8gRGVsYXkgYmV0d2VlbiBtb3Zlc1xuICAgIHRoaXMuX2RlbGF5ID0gMzAwO1xuXG4gICAgLy8gSW5pdCB0aW1lclxuICAgIHRoaXMuX3RpbWVyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAvLyBTY29yZSBtYW5hZ2VyXG4gICAgdGhpcy5fc2NvcmVNYW5hZ2VyID0gbmV3IFNjb3JlTWFuYWdlcigpO1xuXG4gICAgLy8gR08hXG4gICAgdGhpcy5fcmVxdWVzdElkID0gdW5kZWZpbmVkOyAvLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgSUQgKHVzZWQgdG8gcGF1c2UgZ2FtZSlcbiAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdGFydCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBnYW1lXG4gICAqL1xuICBfc3RhcnQoKSB7XG4gICAgdGhpcy5fc3RhZ2UuZHJhdygpO1xuICAgIHRoaXMuX3JlcXVlc3RJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLl9sb29wKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdhbWUgbG9vcFxuICAgKi9cbiAgX2xvb3AoKSB7XG4gICAgaWYgKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGhpcy5fdGltZXIgPiB0aGlzLl9kZWxheSkge1xuICAgICAgdGhpcy5fdGltZXIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuX2Ryb3AoKTtcbiAgICB9XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgdGhpcy5fcmVxdWVzdElkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuX2xvb3AoKSk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2UgdGhlIGdhbWVcbiAgICovXG4gIF9wYXVzZSgpIHtcbiAgICB0aGlzLl9wYXVzZWQgPSAhdGhpcy5fcGF1c2VkO1xuICAgIC8vIFN0b3Agb3IgcmVzdGFydCBsb29wXG4gICAgaWYgKHRoaXMuX3BhdXNlZCkge1xuICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmVxdWVzdElkKTtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TVEFSVF9QQVVTRSkuaW5uZXJUZXh0ID0gJ3Jlc3VtZSc7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uU1RBUlRfUEFVU0UpLmlubmVyVGV4dCA9ICdjb250aW51ZSc7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uT1ZFUkxBWSkuY2xhc3NOYW1lID0gJ2FjdGl2ZSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3N0YXJ0KCk7ICAgXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uU1RBUlRfUEFVU0UpLmlkID0gJ3BhdXNlJztcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TVEFSVF9QQVVTRSkuaW5uZXJUZXh0ID0gJ3BhdXNlJztcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5PVkVSTEFZKS5jbGFzc05hbWUgPSAnJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgY3VycmVudCB0ZXRyb21pbm8gZG93bndhcmRcbiAgICovXG4gIF9kcm9wKCkge1xuICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDAsIDEpOyAvLyBHcmF2aXR5XG4gICAgLy8gSWYgY29sbGlzaW9uLCBjYW5jZWwgIG1vdmUgYW5kIHVuaXRlIHRoZSB0ZXRyb21pbm8gd2l0aCB0aGUgZ2FtZSBzdGFnZVxuICAgIGlmICh0aGlzLl9zdGFnZS5pc0NvbGxpc2lvbih0aGlzLl90ZXRyb21pbm8pKSB7IFxuICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMCwgLTEpO1xuICAgICAgdGhpcy5fdGV0cm9taW5vLnJlbW92ZSgpO1xuICAgICAgdmFyIGNsZWFyZWRMaW5lcyA9IHRoaXMuX3N0YWdlLnVuaXRlKHRoaXMuX3RldHJvbWlubyk7XG4gICAgICBpZiAoY2xlYXJlZExpbmVzID4gMCkge1xuICAgICAgICB0aGlzLl9zY29yZU1hbmFnZXIuYWRkQ2xlYXJlZExpbmVzKGNsZWFyZWRMaW5lcyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9zY29yZU1hbmFnZXIudGV0cm9taW5vRHJvcHBlZCgpO1xuICAgICAgdGhpcy5fc3RhZ2UuZHJhdygpO1xuICAgICAgdGhpcy5fbmV3VGV0cm9taW5vKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIGN1cnJlbnQgdGV0cm9taW5vIGFzIGRvd24gYXMgcG9zc2libGVcbiAgICovXG4gIF9oYXJkRHJvcCgpIHtcbiAgICB3aGlsZSAoIXRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcbiAgICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDAsIDEpO1xuICAgIH1cbiAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgwLCAtMSk7XG4gICAgdGhpcy5fdGV0cm9taW5vLnJlbW92ZSgpO1xuICAgIHZhciBjbGVhcmVkTGluZXMgPSB0aGlzLl9zdGFnZS51bml0ZSh0aGlzLl90ZXRyb21pbm8pO1xuICAgIGlmIChjbGVhcmVkTGluZXMgPiAwKSB7XG4gICAgICB0aGlzLl9zY29yZU1hbmFnZXIuYWRkQ2xlYXJlZExpbmVzKGNsZWFyZWRMaW5lcyk7XG4gICAgfVxuICAgIHRoaXMuX3Njb3JlTWFuYWdlci50ZXRyb21pbm9Ecm9wcGVkKCk7XG4gICAgdGhpcy5fc3RhZ2UuZHJhdygpO1xuICAgIHRoaXMuX25ld1RldHJvbWlubygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBnYW1lIGlzIG92ZXJcbiAgICovXG4gIF9nYW1lT3ZlcigpIHtcbiAgICB0aGlzLl9zdGFnZS5yZXNldCgpO1xuICAgIHRoaXMuX3N0YWdlLmRyYXcoKTtcbiAgICB0aGlzLl9zY29yZU1hbmFnZXIucmVzZXQoKTtcbiAgfVxuICBcblxuICAvKipcbiAgICogUHV0IGEgbmV3IHRldHJvbWlubyBvbiB0aGUgYm9hcmRcbiAgICogQW5kIGNoZWNrIGlmIHRoZSBnYW1lIGlzIGxvc3Qgb3Igbm90XG4gICAqL1xuICBfbmV3VGV0cm9taW5vKCkge1xuICAgIGlmICghdGhpcy5fbmV4dFRldHJvbWlubykge1xuICAgICAgdGhpcy5fbmV4dFRldHJvbWlubyA9IFRldHJvbWluby5nZXRSYW5kb20odGhpcy5fY29udGFpbmVyKTsgIFxuICAgIH1cbiAgICB0aGlzLl90ZXRyb21pbm8gPSB0aGlzLl9uZXh0VGV0cm9taW5vO1xuICAgIHRoaXMuX25leHRUZXRyb21pbm8gPSBUZXRyb21pbm8uZ2V0UmFuZG9tKHRoaXMuX2NvbnRhaW5lcik7XG4gICAgdGhpcy5fZG9tTmV4dENvbnRhaW5lci5jbGFzc05hbWUgPSB0aGlzLl9uZXh0VGV0cm9taW5vLnR5cGUubmFtZTtcbiAgICAvLyBMb3NlISBSZXN0YXJ0XG4gICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcbiAgICAgIHRoaXMuX2dhbWVPdmVyKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXQga2V5Ym9hcmQgZXZlbnRzXG4gICAqL1xuICBfaW5pdEtleWJvYXJkRXZlbnRzKCkge1xuICAgIHZhciBsZWZ0S2V5ID0gdGhpcy5fa2V5Ym9hcmQoMzcpO1xuICAgIHZhciB1cEtleSA9IHRoaXMuX2tleWJvYXJkKDM4KTtcbiAgICB2YXIgcmlnaHRLZXkgPSB0aGlzLl9rZXlib2FyZCgzOSk7XG4gICAgdmFyIGRvd25LZXkgPSB0aGlzLl9rZXlib2FyZCg0MCk7XG4gICAgdmFyIHNwYWNlS2V5ID0gdGhpcy5fa2V5Ym9hcmQoMzIpO1xuICAgIHZhciBwS2V5ID0gdGhpcy5fa2V5Ym9hcmQoODApO1xuICAgIGxlZnRLZXkucHJlc3MgPSAoKSA9PiB0aGlzLl9wcmVzc0xlZnQoKTtcbiAgICB1cEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzVXAoKTtcbiAgICByaWdodEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzUmlnaHQoKTtcbiAgICBkb3duS2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcHJlc3NEb3duKCk7XG4gICAgc3BhY2VLZXkucHJlc3MgPSAoKSA9PiB0aGlzLl9wcmVzc1NwYWNlKCk7XG4gICAgcEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3BhdXNlKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdCBtb3VzZSBldmVudHNcbiAgICovXG4gIF9pbml0TW91c2VFdmVudHMoKSB7XG4gICAgdmFyIHN0YXJ0UGF1c2VCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uU1RBUlRfUEFVU0UpO1xuICAgIHN0YXJ0UGF1c2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9wYXVzZSgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcIlByZXNzIGxlZnRcIiBldmVudFxuICAgKi9cbiAgX3ByZXNzTGVmdCgpIHtcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xuICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoLTEsIDApO1xuICAgICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcbiAgICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMSwgMCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFwiUHJlc3MgcmlnaHRcIiBldmVudFxuICAgKi9cbiAgX3ByZXNzUmlnaHQoKSB7XG4gICAgaWYgKCF0aGlzLl9wYXVzZWQpIHtcbiAgICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDEsIDApO1xuICAgICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcbiAgICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoLTEsIDApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcIlByZXNzIHVwXCIgZXZlbnRcbiAgICovXG4gIF9wcmVzc1VwKCkge1xuICAgIGlmICghdGhpcy5fcGF1c2VkKSB7XG4gICAgICB0aGlzLl90ZXRyb21pbm8ucm90YXRlKCk7XG4gICAgICBpZiAodGhpcy5fc3RhZ2UuaXNDb2xsaXNpb24odGhpcy5fdGV0cm9taW5vKSkge1xuICAgICAgICB0aGlzLl90ZXRyb21pbm8uYW50aVJvdGF0ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcIlByZXNzIGRvd25cIiBldmVudFxuICAgKi9cbiAgX3ByZXNzRG93bigpIHtcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xuICAgICAgdGhpcy5fZHJvcCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBcIlByZXNzIHNwYWNlXCIgZXZlbnRcbiAgICovXG4gIF9wcmVzc1NwYWNlKCkge1xuICAgIGlmICghdGhpcy5fcGF1c2VkKSB7XG4gICAgICB0aGlzLl9oYXJkRHJvcCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgZnVuY3Rpb25cbiAgICovXG4gIF9yZW5kZXIoKSB7XG4gICAgdGhpcy5fdGV0cm9taW5vLmRyYXcoKTtcbiAgICB0aGlzLl9yZW5kZXJlci5yZW5kZXIodGhpcy5fY29udGFpbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBLZXlib2FyZCBldmVudHMgaGVscGVyXG4gICAqL1xuICBfa2V5Ym9hcmQoa2V5Q29kZSkge1xuICAgIHZhciBrZXkgPSB7fTtcbiAgICBrZXkuY29kZSA9IGtleUNvZGU7XG4gICAga2V5LmlzRG93biA9IGZhbHNlO1xuICAgIGtleS5pc1VwID0gdHJ1ZTtcbiAgICBrZXkucHJlc3MgPSB1bmRlZmluZWQ7XG4gICAga2V5LnJlbGVhc2UgPSB1bmRlZmluZWQ7XG4gICAgLy9UaGUgYGRvd25IYW5kbGVyYFxuICAgIGtleS5kb3duSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0ga2V5LmNvZGUpIHtcbiAgICAgICAgaWYgKGtleS5pc1VwICYmIGtleS5wcmVzcykga2V5LnByZXNzKCk7XG4gICAgICAgIGtleS5pc0Rvd24gPSB0cnVlO1xuICAgICAgICBrZXkuaXNVcCA9IGZhbHNlO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvL1RoZSBgdXBIYW5kbGVyYFxuICAgIGtleS51cEhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XG4gICAgICAgIGlmIChrZXkuaXNEb3duICYmIGtleS5yZWxlYXNlKSBrZXkucmVsZWFzZSgpO1xuICAgICAgICBrZXkuaXNEb3duID0gZmFsc2U7XG4gICAgICAgIGtleS5pc1VwID0gdHJ1ZTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy9BdHRhY2ggZXZlbnQgbGlzdGVuZXJzXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAna2V5ZG93bicsIGtleS5kb3duSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXG4gICAgKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICdrZXl1cCcsIGtleS51cEhhbmRsZXIuYmluZChrZXkpLCBmYWxzZVxuICAgICk7XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG59XG4iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NvcmVNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5iZXN0ID0gIGxvY2FsU3RvcmFnZS5iZXN0U2NvcmUgPyBsb2NhbFN0b3JhZ2UuYmVzdFNjb3JlIDogMDtcbiAgICBpZiAodGhpcy5zY29yZSA+IHRoaXMuYmVzdCkge1xuICAgICAgdGhpcy5iZXN0ID0gbG9jYWxTdG9yYWdlLmJlc3RTY29yZSA9IHRoaXMuc2NvcmU7XG4gICAgfVxuICAgIHRoaXMubGV2ZWwgPSAwO1xuICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgIHRoaXMuY2xlYXJlZExpbmVzID0gMDtcbiAgICB0aGlzLnVwZGF0ZURpc3BsYXkoKTtcbiAgfVxuXG4gIF9hZGRQb2ludHMocG9pbnRzKSB7XG4gICAgdGhpcy5zY29yZSArPSBwb2ludHM7XG4gIH1cblxuICBhZGRDbGVhcmVkTGluZXMobGluZXMpIHtcbiAgICB2YXIgcHJldmlvdXNDbGVhcmVkTGluZXMgPSB0aGlzLmNsZWFyZWRMaW5lcztcbiAgICB0aGlzLmNsZWFyZWRMaW5lcyArPSBsaW5lcztcbiAgICBpZiAocHJldmlvdXNDbGVhcmVkTGluZXMgJSAxMCA+IHRoaXMuY2xlYXJlZExpbmVzICUgMTApIHtcbiAgICAgIHRoaXMubGV2ZWwrKztcbiAgICB9XG4gICAgaWYgKGxpbmVzID09PSAxKSB7XG4gICAgICB0aGlzLl9hZGRQb2ludHMoNDAgKiAodGhpcy5sZXZlbCArIDEpKTtcbiAgICB9IGVsc2UgaWYgKGxpbmVzID09PSAyKSB7XG4gICAgICB0aGlzLl9hZGRQb2ludHMoMTAwICogKHRoaXMubGV2ZWwgKyAxKSk7XG4gICAgfSBlbHNlIGlmIChsaW5lcyA9PT0gMykge1xuICAgICAgdGhpcy5fYWRkUG9pbnRzKDMwMCAqICh0aGlzLmxldmVsICsgMSkpO1xuICAgIH0gZWxzZSBpZiAobGluZXMgPT09IDQpIHtcbiAgICAgIHRoaXMuX2FkZFBvaW50cygxMjAwICogKHRoaXMubGV2ZWwgKyAxKSk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlRGlzcGxheSgpO1xuICB9XG5cbiAgdGV0cm9taW5vRHJvcHBlZCgpIHtcbiAgICB0aGlzLl9hZGRQb2ludHMoNSAqICh0aGlzLmxldmVsICsgMSkpO1xuICAgIHRoaXMudXBkYXRlRGlzcGxheSgpO1xuICB9XG5cbiAgdXBkYXRlRGlzcGxheSgpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uTEVWRUwpLmlubmVyVGV4dCA9IHRoaXMubGV2ZWw7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLlNDT1JFKS5pbm5lclRleHQgPSB0aGlzLnNjb3JlO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5DTEVBUkVEKS5pbm5lclRleHQgPSB0aGlzLmNsZWFyZWRMaW5lcztcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uQkVTVCkuaW5uZXJUZXh0ID0gdGhpcy5iZXN0O1xuICB9XG59XG4iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcbmltcG9ydCBCbG9ja0ZhY3RvcnkgZnJvbSAnLi9CbG9ja0ZhY3RvcnknO1xuXG4vKipcbiAqIFJlcHJlc2VudCB0aGUgZ2FtZSBzdGFnZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFnZSB7XG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lcikge1xuICAgIC8vIFNldCB0aGUgY29udGFpbmVyXG4gICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xuXG4gICAgLy8gX2RhdGEgcmVwcmVzZW50cyB0aGUgc3RhdGUgb2YgZXZlcnkgYmxvY2sgb2YgdGhlIHN0YWdlXG4gICAgLy8gMCBmb3IgXCJlbXB0eVwiLCBoZXhhIGNvZGUgY29sb3IgaWYgbm90XG4gICAgLy8gV2UgaW5pdGlhbGl6ZSBpdCB3aXRoIHplcm9zXG4gICAgdGhpcy5fZGF0YSA9IFtdO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcbiAgICAgIHRoaXMuX2RhdGEucHVzaChbXSk7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IENvbnN0YW50cy5IRUlHSFQ7IHkrKykge1xuICAgICAgICB0aGlzLl9kYXRhW3hdLnB1c2goMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUGl4aSdzIGJsb2Nrc1xuICAgIHRoaXMuX2Jsb2NrcyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBzaGFwZXMgdG8gdGhlIF9jb250YWluZXJcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgdmFyIGkgPSAwO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgQ29uc3RhbnRzLkhFSUdIVDsgeSsrKSB7XG4gICAgICAgIC8vIENvbG9yIGJsb2NrcyB3aGVuIG5vdCBlbXB0eVxuICAgICAgICBpZiAodGhpcy5fZGF0YVt4XVt5XSAhPT0gMCkge1xuICAgICAgICAgIHZhciBibG9jayA9IEJsb2NrRmFjdG9yeS5jcmVhdGVCbG9jayh4ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCB5ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBcbiAgICAgICAgICAgIENvbnN0YW50cy5TUVVBUkVfU0laRSwgQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBcbiAgICAgICAgICAgIHRoaXMuX2RhdGFbeF1beV0sIENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX0JPUkRFUlMsIDAuNSk7XG4gICAgICAgICAgXG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMuX2Jsb2Nrc1tpXSk7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2Jsb2Nrc1tpXTtcbiAgICAgICAgICB0aGlzLl9jb250YWluZXIuYWRkQ2hpbGQoYmxvY2spO1xuICAgICAgICAgIHRoaXMuX2Jsb2Nrc1tpXSA9IGJsb2NrO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2Jsb2Nrc1tpXSA9PT0gdW5kZWZpbmVkKSB7IC8vIEp1c3QgYSBncmlkIGlmIGVtcHR5XG4gICAgICAgICAgdmFyIGJsb2NrID0gQmxvY2tGYWN0b3J5LmNyZWF0ZUJsb2NrKHggKiBDb25zdGFudHMuU1FVQVJFX1NJWkUsIHkgKiBDb25zdGFudHMuU1FVQVJFX1NJWkUsIFxuICAgICAgICAgICAgQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBDb25zdGFudHMuU1FVQVJFX1NJWkUsIFxuICAgICAgICAgICAgQ29uc3RhbnRzLkNPTE9SUy5CQUNLR1JPVU5ELCBDb25zdGFudHMuQ09MT1JTLkJPUkRFUlMsIDAuNSk7XG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLmFkZENoaWxkKGJsb2NrKTtcbiAgICAgICAgICB0aGlzLl9ibG9ja3NbaV0gPSBibG9jaztcbiAgICAgICAgfVxuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmICd0ZXRyb21pbm8nIGlzIGluIGNvbGxpc2lvbiB3aXRoIHRoZSBzdGFnZVxuICAgKi9cbiAgaXNDb2xsaXNpb24odGV0cm9taW5vKSB7XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB0ZXRyb21pbm8udHlwZS5zaXplOyB4KyspIHtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeSsrKSB7ICAgICAgICBcbiAgICAgICAgaWYgKHRldHJvbWluby54ICsgeCA8IDAgfHwgdGV0cm9taW5vLnggKyB4ID49IENvbnN0YW50cy5XSURUSCB8fCB5ID49IENvbnN0YW50cy5IRUlHSFQgfHwgdGV0cm9taW5vLnkgPj0gMCAmJiB0aGlzLl9kYXRhW3RldHJvbWluby54ICsgeF1bdGV0cm9taW5vLnkgKyB5XSAhPT0gMCkge1xuICAgICAgICAgIGlmICh0ZXRyb21pbm8uaGFzQmxvY2soeCwgeSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH0gIFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdXNpb24gJ3RldHJvbWlubycgd2l0aCB0aGUgc3RhZ2VcbiAgICogSWYgdGhlIGZ1c2lvbiBjcmVhdGUgYSBsaW5lLCB3ZSBjbGVhciB0aGUgbGluZVxuICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBjbGVhcmVkIGxpbmVzXG4gICAqL1xuICB1bml0ZSh0ZXRyb21pbm8pIHtcbiAgICB2YXIgY2xlYXJlZExpbmVzID0gMDtcblxuICAgIC8vIEZ1c2lvbiB0aGUgdGV0cm9taW5vIHdpdGggdGhlIHN0YWdlXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0ZXRyb21pbm8udHlwZS5zaXplOyB5KyspIHtcbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeCsrKSB7XG4gICAgICAgIGlmICh0ZXRyb21pbm8ueCArIHggPCBDb25zdGFudHMuV0lEVEggJiYgdGV0cm9taW5vLnggKyB4ID49IDAgJiYgdGV0cm9taW5vLmhhc0Jsb2NrKHgsIHkpKSB7XG4gICAgICAgICAgdGhpcy5fZGF0YVt0ZXRyb21pbm8ueCArIHhdW3RldHJvbWluby55ICsgeV0gPSB0ZXRyb21pbm8udHlwZS5jb2xvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeSsrKSB7XG4gICAgICAvLyBDaGVjayBpZiB0aGUgZnVzaW9uIGNyZWF0ZWQgYSBuZXcgbGluZVxuICAgICAgdmFyIGVyYXNlTGluZSA9IHRydWU7XG4gICAgICBpZiAoeSArIHRldHJvbWluby55ID49IENvbnN0YW50cy5IRUlHSFQpIHtcbiAgICAgICAgZXJhc2VMaW5lID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBDb25zdGFudHMuV0lEVEg7IHgrKykge1xuICAgICAgICAgIGlmICh0aGlzLl9kYXRhW3hdW3kgKyB0ZXRyb21pbm8ueV0gPT09IDApIHtcbiAgICAgICAgICAgIGVyYXNlTGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBJZiB5ZXMsIHdlIGVyYXNlIGl0IGFuZCBtb3ZlIGFsbCBjb25jZXJuZWQgYmxvY2tzXG4gICAgICBpZiAoZXJhc2VMaW5lKSB7XG4gICAgICAgIGNsZWFyZWRMaW5lcysrO1xuICAgICAgICBmb3IgKGxldCB5eSA9IHkgKyB0ZXRyb21pbm8ueTsgeXkgPj0gMDsgeXktLSkge1xuICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcbiAgICAgICAgICAgIGlmICh5eSA+IDApIHtcbiAgICAgICAgICAgICAgdGhpcy5fZGF0YVt4XVt5eV0gPSB0aGlzLl9kYXRhW3hdW3l5LTFdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5fZGF0YVt4XVt5eV0gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBlbXB0eSB0aGUgYmxvY2tzICh3ZSB3aWxsIG5lZWQgdG8gcmVkcmF3KVxuICAgICAgICB0aGlzLl9ibG9ja3MgPSBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2xlYXJlZExpbmVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IHRoZSBzdGFnZVxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5fZGF0YSA9IFtdO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcbiAgICAgIHRoaXMuX2RhdGEucHVzaChbXSk7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IENvbnN0YW50cy5IRUlHSFQ7IHkrKykge1xuICAgICAgICB0aGlzLl9kYXRhW3hdLnB1c2goMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2Jsb2NrcyA9IFtdO1xuICB9XG59XG4iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcbmltcG9ydCBCbG9ja0ZhY3RvcnkgZnJvbSAnLi9CbG9ja0ZhY3RvcnknO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSB0ZXRyb21pbm9cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV0cm9taW5vIHtcbiAgY29uc3RydWN0b3IodHlwZSwgY29udGFpbmVyKSB7XG4gICAgLy8gU2V0IHRoZSBjb250YWluZXJcbiAgICB0aGlzLl9jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgXG4gICAgLy8gVHlwZSBvZiB0aGUgdGV0cm9taW5vIChJLCBKLCBMLCBPLCBTLCBULCBaKVxuICAgIHRoaXMudHlwZSA9IHR5cGU7XG5cbiAgICAvLyBQb3NpdGlvbiBvZiB0aGUgdGV0cm9taW5vXG4gICAgdGhpcy54ID0gTWF0aC5mbG9vcihDb25zdGFudHMuV0lEVEggLyAyIC0gdGhpcy50eXBlLnNpemUgLyAyKTtcbiAgICB0aGlzLnkgPSAwO1xuXG4gICAgLy8gQW5nbGUgb2YgdGhlIHRldHJvbWlubyAoMDogMGRlZywgMTogOTBkZWcsIDI6IDE4MGRlZywgMzogMjcwZGVnKVxuICAgIHRoaXMuYW5nbGUgPSAwO1xuXG4gICAgLy8gUGl4aSdzIGJsb2Nrc1xuICAgIHRoaXMuX2Jsb2NrcyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBtZXRob2QgdG8gZ2V0IGEgcmFuZG9tIHRldHJvbWlub1xuICAgKi9cbiAgc3RhdGljIGdldFJhbmRvbShjb250YWluZXIpIHtcbiAgICB2YXIgdHlwZXMgPSBbVHlwZXMuSSwgVHlwZXMuSiwgVHlwZXMuTCwgVHlwZXMuTywgVHlwZXMuUywgVHlwZXMuVCwgVHlwZXMuWl07XG4gICAgdmFyIHR5cGUgPSB0eXBlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA3KV07XG4gICAgcmV0dXJuIG5ldyBUZXRyb21pbm8odHlwZSwgY29udGFpbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgc2hhcGVzIHRvIGNvbnRhaW5lclxuICAgKi9cbiAgZHJhdygpIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLnR5cGUuc2l6ZTsgeCsrKSB7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMudHlwZS5zaXplOyB5KyspIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZS5zaGFwZXNbdGhpcy5hbmdsZV1beV1beF0gPT09IDEpIHtcbiAgICAgICAgICBpZiAodGhpcy5fYmxvY2tzLmxlbmd0aCAhPT0gNCkge1xuICAgICAgICAgICAgdmFyIGJsb2NrID0gQmxvY2tGYWN0b3J5LmNyZWF0ZUJsb2NrKDAsIDAsIENvbnN0YW50cy5TUVVBUkVfU0laRSwgQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBcbiAgICAgICAgICAgICAgdGhpcy50eXBlLmNvbG9yLCBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19CT1JERVJTLCAwLjUpO1xuICAgICAgICAgICAgdGhpcy5fYmxvY2tzLnB1c2goYmxvY2spO1xuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyLmFkZENoaWxkKGJsb2NrKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5fYmxvY2tzW2ldLnggPSAodGhpcy54ICsgeCkgKiBDb25zdGFudHMuU1FVQVJFX1NJWkU7XG4gICAgICAgICAgdGhpcy5fYmxvY2tzW2ldLnkgPSAodGhpcy55ICsgeSkgKiBDb25zdGFudHMuU1FVQVJFX1NJWkU7XG4gICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBzaGFwZXMgZnJvbSBjb250YWluZXJcbiAgICovXG4gIHJlbW92ZSgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2Jsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fY29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMuX2Jsb2Nrc1tpXSk7XG4gICAgICBkZWxldGUgdGhpcy5fYmxvY2tzW2ldO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGUgdGhlIHRldHJvbWlubyB0byB0aGUgcmlnaHRcbiAgICovXG4gIHJvdGF0ZSgpIHtcbiAgICB0aGlzLmFuZ2xlICs9IDE7XG4gICAgdGhpcy5hbmdsZSAlPSA0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJvdGF0ZSB0aGUgdGV0cm9taW5vIHRvIHRoZSBsZWZ0XG4gICAqL1xuICBhbnRpUm90YXRlKCkge1xuICAgIHRoaXMuYW5nbGUgLT0gMTtcbiAgICBpZiAodGhpcy5hbmdsZSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuYW5nbGUgPSAzO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHRoZSB0ZXRyb21pbm9cbiAgICovXG4gIG1vdmUoZHgsIGR5KSB7XG4gICAgdGhpcy54ICs9IGR4O1xuICAgIHRoaXMueSArPSBkeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0IGlmIHRoZSB0ZXRyb21pbm8gaGFzIGEgYmxvY2sgaW4gdGhlIHBvc2l0aW5vICh4LCB5KVxuICAgKiB4IGFuZCB5IGJlaW5nIHJlbGF0aXZlIHRoZSB0aGUgcG9zaXRpb24gb2YgdGhlIHRldHJvbWlub1xuICAgKi9cbiAgaGFzQmxvY2soeCwgeSkge1xuICAgIHJldHVybiB0aGlzLnR5cGUuc2hhcGVzW3RoaXMuYW5nbGVdW3ldW3hdID09PSAxO1xuICB9XG5cbn1cblxuLyoqXG4gKiBUeXBlcyBvZiB0ZXRyb21pbm9zXG4gKi9cbmV4cG9ydCBjb25zdCBUeXBlcyA9IHtcbiAgSToge1xuICAgIG5hbWU6ICdJJywgLy8gTmFtZSBvZiB0aGUgdGV0cm9taW5vXG4gICAgY29sb3I6IENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX0ksIC8vIEJhY2tncm91bmQgY29sb3JcbiAgICBzaXplOiA0LCAvLyBTaXplIG9mIHRoZSAnY29udGFpbmVyJyBvZiB0aGUgdGV0cm9taW5vXG4gICAgc2hhcGVzOiBbIC8vIEFsbCBzaGFwZXMgb2YgdGhlIHRldHJvbWlubyAob25lIHBlciByb3RhdGlvbiBwb3NpdGlvbilcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwLDBdLFxuICAgICAgICBbMSwxLDEsMV0sXG4gICAgICAgIFswLDAsMCwwXSxcbiAgICAgICAgWzAsMCwwLDBdXG4gICAgICBdLFxuICAgICAgW1xuICAgICAgICBbMCwwLDEsMF0sXG4gICAgICAgIFswLDAsMSwwXSxcbiAgICAgICAgWzAsMCwxLDBdLFxuICAgICAgICBbMCwwLDEsMF1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFswLDAsMCwwXSxcbiAgICAgICAgWzAsMCwwLDBdLFxuICAgICAgICBbMSwxLDEsMV0sXG4gICAgICAgIFswLDAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwLDBdLFxuICAgICAgICBbMCwxLDAsMF0sXG4gICAgICAgIFswLDEsMCwwXSxcbiAgICAgICAgWzAsMSwwLDBdXG4gICAgICBdXG4gICAgXVxuICB9LFxuICBKOiB7XG4gICAgbmFtZTogJ0onLFxuICAgIGNvbG9yOiBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19KLFxuICAgIHNpemU6IDMsXG4gICAgc2hhcGVzOiBbXG4gICAgICBbXG4gICAgICAgIFsxLDAsMF0sXG4gICAgICAgIFsxLDEsMV0sXG4gICAgICAgIFswLDAsMF1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFswLDEsMV0sXG4gICAgICAgIFswLDEsMF0sXG4gICAgICAgIFswLDEsMF1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFswLDAsMF0sXG4gICAgICAgIFsxLDEsMV0sXG4gICAgICAgIFswLDAsMV1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFswLDEsMF0sXG4gICAgICAgIFswLDEsMF0sXG4gICAgICAgIFsxLDEsMF1cbiAgICAgIF1cbiAgICBdXG4gIH0sXG4gIEw6IHtcbiAgICBuYW1lOiAnTCcsXG4gICAgY29sb3I6IENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX0wsXG4gICAgc2l6ZTogMyxcbiAgICBzaGFwZXM6IFtcbiAgICAgIFtcbiAgICAgICAgWzAsMCwxXSxcbiAgICAgICAgWzEsMSwxXSxcbiAgICAgICAgWzAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwxXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwXSxcbiAgICAgICAgWzEsMSwxXSxcbiAgICAgICAgWzEsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXVxuICAgIF1cbiAgfSxcbiAgTzoge1xuICAgIG5hbWU6ICdPJyxcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fTyxcbiAgICBzaXplOiAyLFxuICAgIHNoYXBlczogW1xuICAgICAgW1xuICAgICAgICBbMSwxXSxcbiAgICAgICAgWzEsMV1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFsxLDFdLFxuICAgICAgICBbMSwxXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzEsMV0sXG4gICAgICAgIFsxLDFdXG4gICAgICBdLFxuICAgICAgW1xuICAgICAgICBbMSwxXSxcbiAgICAgICAgWzEsMV1cbiAgICAgIF1cbiAgICBdXG4gIH0sXG4gIFM6IHtcbiAgICBuYW1lOiAnUycsXG4gICAgY29sb3I6IENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX1MsXG4gICAgc2l6ZTogMyxcbiAgICBzaGFwZXM6IFtcbiAgICAgIFtcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzAsMCwxXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzEsMSwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzEsMCwwXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXVxuICAgIF1cbiAgfSxcbiAgVDoge1xuICAgIG5hbWU6ICdUJyxcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fVCxcbiAgICBzaXplIDogMyxcbiAgICBzaGFwZXM6IFtcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzEsMSwxXSxcbiAgICAgICAgWzAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwXSxcbiAgICAgICAgWzEsMSwxXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXVxuICAgIF1cbiAgfSxcbiAgWjoge1xuICAgIG5hbWU6ICdaJyxcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fWixcbiAgICBzaXplIDogMyxcbiAgICBzaGFwZXM6IFtcbiAgICAgIFtcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzAsMCwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwxXSxcbiAgICAgICAgWzAsMSwxXSxcbiAgICAgICAgWzAsMSwwXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMCwwXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzAsMSwxXVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgWzAsMSwwXSxcbiAgICAgICAgWzEsMSwwXSxcbiAgICAgICAgWzEsMCwwXVxuICAgICAgXVxuICAgIF1cbiAgfVxufTtcbiIsImltcG9ydCBHYW1lIGZyb20gJy4vR2FtZSc7XG5cbnZhciBnID0gbmV3IEdhbWUoKTtcbiJdfQ==
