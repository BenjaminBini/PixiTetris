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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXEJsb2NrRmFjdG9yeS5qcyIsInNyY1xcQ29uc3RhbnRzLmpzIiwic3JjXFxHYW1lLmpzIiwic3JjXFxTY29yZU1hbmFnZXIuanMiLCJzcmNcXFN0YWdlLmpzIiwic3JjXFxUZXRyb21pbm8uanMiLCJzcmNcXGluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztJQ0FxQixZQUFZO1dBQVosWUFBWTswQkFBWixZQUFZOzs7ZUFBWixZQUFZOztnQ0FDWixDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUU7QUFDakYsVUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDakMsVUFBSSxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQ3RELFlBQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFlBQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3ZCLFdBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdkIsVUFBSSxVQUFVLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0FBQzlELGdCQUFVLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDO0FBQzNDLGdCQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDO0FBQzdDLGdCQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUM7QUFDcEMsZ0JBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztBQUNwQyxXQUFLLENBQUMsUUFB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QUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsb0JBQVUsTUFBTSxDQUFDLFdBQVc7QUFDbkMsUUFBSSxFQUFFLENBQUM7QUFDUCxVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNMLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNOLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDTCxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDTixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ0wsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ04sRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNMLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNOLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLG9CQUFVLE1BQU0sQ0FBQyxXQUFXO0FBQ25DLFFBQUksRUFBRSxDQUFDO0FBQ1AsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxvQkFBVSxNQUFNLENBQUMsV0FBVztBQUNuQyxRQUFJLEVBQUcsQ0FBQztBQUNSLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsb0JBQVUsTUFBTSxDQUFDLFdBQVc7QUFDbkMsUUFBSSxFQUFHLENBQUM7QUFDUixVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtDQUNGLENBQUM7Ozs7Ozs7Ozs7O0FDclNGLElBQUksQ0FBQyxHQUFHLG9CQUFVLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmxvY2tGYWN0b3J5IHtcclxuICBzdGF0aWMgY3JlYXRlQmxvY2soeCwgeSwgd2lkdGgsIGhlaWdodCwgYmFja2dyb3VuZENvbG9yLCBib3JkZXJDb2xvciwgYm9yZGVyV2lkdGgpIHtcclxuICAgIHZhciBibG9jayA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xyXG4gICAgdmFyIGJvcmRlciA9IG5ldyBQSVhJLlNwcml0ZShnZXRUZXh0dXJlKGJvcmRlckNvbG9yKSk7XHJcbiAgICBib3JkZXIud2lkdGggPSB3aWR0aDtcclxuICAgIGJvcmRlci5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICBibG9jay5hZGRDaGlsZChib3JkZXIpO1xyXG4gICAgdmFyIGJhY2tncm91bmQgPSBuZXcgUElYSS5TcHJpdGUoZ2V0VGV4dHVyZShiYWNrZ3JvdW5kQ29sb3IpKTtcclxuICAgIGJhY2tncm91bmQud2lkdGggPSB3aWR0aCAtIDIgKiBib3JkZXJXaWR0aDtcclxuICAgIGJhY2tncm91bmQuaGVpZ2h0ID0gaGVpZ2h0IC0gMiAqIGJvcmRlcldpZHRoO1xyXG4gICAgYmFja2dyb3VuZC5wb3NpdGlvbi54ID0gYm9yZGVyV2lkdGg7XHJcbiAgICBiYWNrZ3JvdW5kLnBvc2l0aW9uLnkgPSBib3JkZXJXaWR0aDtcclxuICAgIGJsb2NrLmFkZENoaWxkKGJhY2tncm91bmQpO1xyXG4gICAgYmxvY2sucG9zaXRpb24ueCA9IHg7XHJcbiAgICBibG9jay5wb3NpdGlvbi55ID0geTtcclxuICAgIHJldHVybiBibG9jaztcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRleHR1cmUoY29sb3IpIHtcclxuIGlmKGNvbG9yVGV4dHVyZXNbY29sb3JdID09PSB1bmRlZmluZWQpIHtcclxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcclxuICBjYW52YXMud2lkdGggPSAxO1xyXG4gIGNhbnZhcy5oZWlnaHQgPSAxO1xyXG4gIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICBjdHguZmlsbFN0eWxlID0gY29sb3I7XHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5yZWN0KDAsMCwxLDEpO1xyXG4gIGN0eC5maWxsKCk7XHJcbiAgY3R4LmNsb3NlUGF0aCgpO1xyXG4gIGNvbG9yVGV4dHVyZXNbY29sb3JdID0gUElYSS5UZXh0dXJlLmZyb21DYW52YXMoY2FudmFzKTtcclxuIH1cclxuIHJldHVybiBjb2xvclRleHR1cmVzW2NvbG9yXTtcclxufTtcclxuXHJcbnZhciBjb2xvclRleHR1cmVzID0ge307IiwiLyoqXHJcbiAqIEdhbWUgY29uc3RhbnRzXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgV0lEVEg6IDEyLCAvLyBXaWR0aCBvZiB0aGUgZ2FtZSAoaW4gbnVtYmVyIG9mIGJsb2NrcylcclxuICBIRUlHSFQ6IDI0LCAvLyBIZWlnaHQgb2YgdGhlIGdhbWUgKGluIG51bWJlciBvZiBibG9ja3MpXHJcbiAgU1FVQVJFX1NJWkU6IDI1LCAvLyBXaWR0aCBhbmQgaGVpZ2h0IG9mIGEgYmxvY2sgKGluIHB4KVxyXG4gIENPTE9SUzoge1xyXG4gIFx0VEVUUk9NSU5PX0JPUkRFUlM6ICcjMzczYzQwJyxcclxuICBcdFRFVFJPTUlOT19JOiAnI2ZmODAwMCcsXHJcbiAgXHRURVRST01JTk9fSjogJyMyY2M5OTAnLFxyXG4gIFx0VEVUUk9NSU5PX0w6ICcjZjM0MzQ0JyxcclxuICBcdFRFVFJPTUlOT19POiAnI2ZmZGYwMCcsXHJcbiAgXHRURVRST01JTk9fUzogJyNjY2RjZTQnLFxyXG4gIFx0VEVUUk9NSU5PX1Q6ICcjMDA4YWZmJyxcclxuICBcdFRFVFJPTUlOT19aOiAnI2ZjYjk0MScsXHJcbiAgXHRCQUNLR1JPVU5EOiAnIzJkMzIzNicsXHJcbiAgXHRCT1JERVJTOiAnIzM3M0M0MCdcclxuICB9LFxyXG4gIERPTToge1xyXG4gIFx0Q09OVEFJTkVSOiAnI2NhbnZhcy1jb250YWluZXInLFxyXG4gIFx0TkVYVDogJyNuZXh0LXRldHJvbWlubycsXHJcbiAgXHRTVEFSVF9QQVVTRTogJyNzdGFydC1wYXVzZSBidXR0b24nLFxyXG4gICAgTEVWRUw6ICcjbGV2ZWwnLFxyXG4gICAgU0NPUkU6ICcjc2NvcmUnLFxyXG4gICAgQ0xFQVJFRDogJyNjbGVhcmVkJyxcclxuICAgIEJFU1Q6ICcjYmVzdC1zY29yZScsXHJcbiAgICBPVkVSTEFZOiAnI292ZXJsYXknXHJcbiAgfVxyXG59O1xyXG4iLCJpbXBvcnQgVGV0cm9taW5vIGZyb20gJy4vVGV0cm9taW5vJztcclxuaW1wb3J0IHtUeXBlc30gZnJvbSAnLi9UZXRyb21pbm8nO1xyXG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcclxuaW1wb3J0IFN0YWdlIGZyb20gJy4vU3RhZ2UnO1xyXG5pbXBvcnQgU2NvcmVNYW5hZ2VyIGZyb20gJy4vU2NvcmVNYW5hZ2VyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWUge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc29sZS5sb2coUElYSSk7XHJcblxyXG4gICAgLy8gRE9NIGNvbnRhaW5lclxyXG4gICAgdGhpcy5fZG9tQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLkNPTlRBSU5FUik7XHJcblxyXG4gICAgLy8gTmV4dCB0ZXRyb21pbm8gRE9NIGNvbnRhaW5lclxyXG4gICAgdGhpcy5fZG9tTmV4dENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5ORVhUKVxyXG5cclxuICAgIC8vIEtleWJvYXJkIGV2ZW50c1xyXG4gICAgdGhpcy5faW5pdEtleWJvYXJkRXZlbnRzKCk7XHJcblxyXG4gICAgLy8gTW91c2UgZXZlbnRzXHJcbiAgICB0aGlzLl9pbml0TW91c2VFdmVudHMoKTtcclxuICAgICBcclxuICAgIC8vIFNldCB1cCBQSVhJXHJcbiAgICB0aGlzLl9yZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKENvbnN0YW50cy5XSURUSCAqIENvbnN0YW50cy5TUVVBUkVfU0laRSwgQ29uc3RhbnRzLkhFSUdIVCAqIENvbnN0YW50cy5TUVVBUkVfU0laRSk7XHJcblxyXG4gICAgdGhpcy5fZG9tQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX3JlbmRlcmVyLnZpZXcpO1xyXG5cclxuICAgIC8vIFBpeGkgY29udGFpbmVyXHJcbiAgICB0aGlzLl9jb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcclxuXHJcbiAgICAvLyBHYW1lIGJvYXJkL3N0YWdlXHJcbiAgICB0aGlzLl9zdGFnZSA9IG5ldyBTdGFnZSh0aGlzLl9jb250YWluZXIpOyBcclxuXHJcbiAgICAvLyBJbml0IHRldHJvbWlub3NcclxuICAgIHRoaXMuX3RldHJvbWlubyA9IHVuZGVmaW5lZDsgLy8gVGV0cm9taW5vIG9uIHRoZSBzdGFnZVxyXG4gICAgdGhpcy5fbmV4dFRldHJvbWlubyA9IHVuZGVmaW5lZDsgLy8gTmV4dCB0ZXRyb21pbm9cclxuICAgIHRoaXMuX25ld1RldHJvbWlubygpO1xyXG5cclxuICAgIC8vIERlbGF5IGJldHdlZW4gbW92ZXNcclxuICAgIHRoaXMuX2RlbGF5ID0gMzAwO1xyXG5cclxuICAgIC8vIEluaXQgdGltZXJcclxuICAgIHRoaXMuX3RpbWVyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblxyXG4gICAgLy8gU2NvcmUgbWFuYWdlclxyXG4gICAgdGhpcy5fc2NvcmVNYW5hZ2VyID0gbmV3IFNjb3JlTWFuYWdlcigpO1xyXG5cclxuICAgIC8vIEdPIVxyXG4gICAgdGhpcy5fcmVxdWVzdElkID0gdW5kZWZpbmVkOyAvLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgSUQgKHVzZWQgdG8gcGF1c2UgZ2FtZSlcclxuICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5fc3RhcnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXJ0IHRoZSBnYW1lXHJcbiAgICovXHJcbiAgX3N0YXJ0KCkge1xyXG4gICAgdGhpcy5fc3RhZ2UuZHJhdygpO1xyXG4gICAgdGhpcy5fcmVxdWVzdElkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuX2xvb3AoKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHYW1lIGxvb3BcclxuICAgKi9cclxuICBfbG9vcCgpIHtcclxuICAgIGlmIChuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRoaXMuX3RpbWVyID4gdGhpcy5fZGVsYXkpIHtcclxuICAgICAgdGhpcy5fdGltZXIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgdGhpcy5fZHJvcCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fcmVuZGVyKCk7XHJcbiAgICB0aGlzLl9yZXF1ZXN0SWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5fbG9vcCgpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhdXNlIHRoZSBnYW1lXHJcbiAgICovXHJcbiAgX3BhdXNlKCkge1xyXG4gICAgdGhpcy5fcGF1c2VkID0gIXRoaXMuX3BhdXNlZDtcclxuICAgIC8vIFN0b3Agb3IgcmVzdGFydCBsb29wXHJcbiAgICBpZiAodGhpcy5fcGF1c2VkKSB7XHJcbiAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3JlcXVlc3RJZCk7XHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TVEFSVF9QQVVTRSkuaW5uZXJUZXh0ID0gJ3Jlc3VtZSc7XHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TVEFSVF9QQVVTRSkuaW5uZXJUZXh0ID0gJ2NvbnRpbnVlJztcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLk9WRVJMQVkpLmNsYXNzTmFtZSA9ICdhY3RpdmUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fc3RhcnQoKTsgICBcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLlNUQVJUX1BBVVNFKS5pZCA9ICdwYXVzZSc7XHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TVEFSVF9QQVVTRSkuaW5uZXJUZXh0ID0gJ3BhdXNlJztcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLk9WRVJMQVkpLmNsYXNzTmFtZSA9ICcnO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZSB0aGUgY3VycmVudCB0ZXRyb21pbm8gZG93bndhcmRcclxuICAgKi9cclxuICBfZHJvcCgpIHtcclxuICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDAsIDEpOyAvLyBHcmF2aXR5XHJcbiAgICAvLyBJZiBjb2xsaXNpb24sIGNhbmNlbCAgbW92ZSBhbmQgdW5pdGUgdGhlIHRldHJvbWlubyB3aXRoIHRoZSBnYW1lIHN0YWdlXHJcbiAgICBpZiAodGhpcy5fc3RhZ2UuaXNDb2xsaXNpb24odGhpcy5fdGV0cm9taW5vKSkgeyBcclxuICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMCwgLTEpO1xyXG4gICAgICB0aGlzLl90ZXRyb21pbm8ucmVtb3ZlKCk7XHJcbiAgICAgIHZhciBjbGVhcmVkTGluZXMgPSB0aGlzLl9zdGFnZS51bml0ZSh0aGlzLl90ZXRyb21pbm8pO1xyXG4gICAgICBpZiAoY2xlYXJlZExpbmVzID4gMCkge1xyXG4gICAgICAgIHRoaXMuX3Njb3JlTWFuYWdlci5hZGRDbGVhcmVkTGluZXMoY2xlYXJlZExpbmVzKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLl9zY29yZU1hbmFnZXIudGV0cm9taW5vRHJvcHBlZCgpO1xyXG4gICAgICB0aGlzLl9zdGFnZS5kcmF3KCk7XHJcbiAgICAgIHRoaXMuX25ld1RldHJvbWlubygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZSB0aGUgY3VycmVudCB0ZXRyb21pbm8gYXMgZG93biBhcyBwb3NzaWJsZVxyXG4gICAqL1xyXG4gIF9oYXJkRHJvcCgpIHtcclxuICAgIHdoaWxlICghdGhpcy5fc3RhZ2UuaXNDb2xsaXNpb24odGhpcy5fdGV0cm9taW5vKSkge1xyXG4gICAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgwLCAxKTtcclxuICAgIH1cclxuICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDAsIC0xKTtcclxuICAgIHRoaXMuX3RldHJvbWluby5yZW1vdmUoKTtcclxuICAgIHZhciBjbGVhcmVkTGluZXMgPSB0aGlzLl9zdGFnZS51bml0ZSh0aGlzLl90ZXRyb21pbm8pO1xyXG4gICAgaWYgKGNsZWFyZWRMaW5lcyA+IDApIHtcclxuICAgICAgdGhpcy5fc2NvcmVNYW5hZ2VyLmFkZENsZWFyZWRMaW5lcyhjbGVhcmVkTGluZXMpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fc2NvcmVNYW5hZ2VyLnRldHJvbWlub0Ryb3BwZWQoKTtcclxuICAgIHRoaXMuX3N0YWdlLmRyYXcoKTtcclxuICAgIHRoaXMuX25ld1RldHJvbWlubygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGdhbWUgaXMgb3ZlclxyXG4gICAqL1xyXG4gIF9nYW1lT3ZlcigpIHtcclxuICAgIHRoaXMuX3N0YWdlLnJlc2V0KCk7XHJcbiAgICB0aGlzLl9zdGFnZS5kcmF3KCk7XHJcbiAgICB0aGlzLl9zY29yZU1hbmFnZXIucmVzZXQoKTtcclxuICB9XHJcbiAgXHJcblxyXG4gIC8qKlxyXG4gICAqIFB1dCBhIG5ldyB0ZXRyb21pbm8gb24gdGhlIGJvYXJkXHJcbiAgICogQW5kIGNoZWNrIGlmIHRoZSBnYW1lIGlzIGxvc3Qgb3Igbm90XHJcbiAgICovXHJcbiAgX25ld1RldHJvbWlubygpIHtcclxuICAgIGlmICghdGhpcy5fbmV4dFRldHJvbWlubykge1xyXG4gICAgICB0aGlzLl9uZXh0VGV0cm9taW5vID0gVGV0cm9taW5vLmdldFJhbmRvbSh0aGlzLl9jb250YWluZXIpOyAgXHJcbiAgICB9XHJcbiAgICB0aGlzLl90ZXRyb21pbm8gPSB0aGlzLl9uZXh0VGV0cm9taW5vO1xyXG4gICAgdGhpcy5fbmV4dFRldHJvbWlubyA9IFRldHJvbWluby5nZXRSYW5kb20odGhpcy5fY29udGFpbmVyKTtcclxuICAgIHRoaXMuX2RvbU5leHRDb250YWluZXIuY2xhc3NOYW1lID0gdGhpcy5fbmV4dFRldHJvbWluby50eXBlLm5hbWU7XHJcbiAgICAvLyBMb3NlISBSZXN0YXJ0XHJcbiAgICBpZiAodGhpcy5fc3RhZ2UuaXNDb2xsaXNpb24odGhpcy5fdGV0cm9taW5vKSkge1xyXG4gICAgICB0aGlzLl9nYW1lT3ZlcigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdCBrZXlib2FyZCBldmVudHNcclxuICAgKi9cclxuICBfaW5pdEtleWJvYXJkRXZlbnRzKCkge1xyXG4gICAgdmFyIGxlZnRLZXkgPSB0aGlzLl9rZXlib2FyZCgzNyk7XHJcbiAgICB2YXIgdXBLZXkgPSB0aGlzLl9rZXlib2FyZCgzOCk7XHJcbiAgICB2YXIgcmlnaHRLZXkgPSB0aGlzLl9rZXlib2FyZCgzOSk7XHJcbiAgICB2YXIgZG93bktleSA9IHRoaXMuX2tleWJvYXJkKDQwKTtcclxuICAgIHZhciBzcGFjZUtleSA9IHRoaXMuX2tleWJvYXJkKDMyKTtcclxuICAgIHZhciBwS2V5ID0gdGhpcy5fa2V5Ym9hcmQoODApO1xyXG4gICAgbGVmdEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzTGVmdCgpO1xyXG4gICAgdXBLZXkucHJlc3MgPSAoKSA9PiB0aGlzLl9wcmVzc1VwKCk7XHJcbiAgICByaWdodEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzUmlnaHQoKTtcclxuICAgIGRvd25LZXkucHJlc3MgPSAoKSA9PiB0aGlzLl9wcmVzc0Rvd24oKTtcclxuICAgIHNwYWNlS2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcHJlc3NTcGFjZSgpO1xyXG4gICAgcEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3BhdXNlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbml0IG1vdXNlIGV2ZW50c1xyXG4gICAqL1xyXG4gIF9pbml0TW91c2VFdmVudHMoKSB7XHJcbiAgICB2YXIgc3RhcnRQYXVzZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TVEFSVF9QQVVTRSk7XHJcbiAgICBzdGFydFBhdXNlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5fcGF1c2UoKSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBcIlByZXNzIGxlZnRcIiBldmVudFxyXG4gICAqL1xyXG4gIF9wcmVzc0xlZnQoKSB7XHJcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xyXG4gICAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgtMSwgMCk7XHJcbiAgICAgIGlmICh0aGlzLl9zdGFnZS5pc0NvbGxpc2lvbih0aGlzLl90ZXRyb21pbm8pKSB7XHJcbiAgICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMSwgMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiUHJlc3MgcmlnaHRcIiBldmVudFxyXG4gICAqL1xyXG4gIF9wcmVzc1JpZ2h0KCkge1xyXG4gICAgaWYgKCF0aGlzLl9wYXVzZWQpIHtcclxuICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMSwgMCk7XHJcbiAgICAgIGlmICh0aGlzLl9zdGFnZS5pc0NvbGxpc2lvbih0aGlzLl90ZXRyb21pbm8pKSB7XHJcbiAgICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoLTEsIDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBcIlByZXNzIHVwXCIgZXZlbnRcclxuICAgKi9cclxuICBfcHJlc3NVcCgpIHtcclxuICAgIGlmICghdGhpcy5fcGF1c2VkKSB7XHJcbiAgICAgIHRoaXMuX3RldHJvbWluby5yb3RhdGUoKTtcclxuICAgICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcclxuICAgICAgICB0aGlzLl90ZXRyb21pbm8uYW50aVJvdGF0ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBcIlByZXNzIGRvd25cIiBldmVudFxyXG4gICAqL1xyXG4gIF9wcmVzc0Rvd24oKSB7XHJcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xyXG4gICAgICB0aGlzLl9kcm9wKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBcIlByZXNzIHNwYWNlXCIgZXZlbnRcclxuICAgKi9cclxuICBfcHJlc3NTcGFjZSgpIHtcclxuICAgIGlmICghdGhpcy5fcGF1c2VkKSB7XHJcbiAgICAgIHRoaXMuX2hhcmREcm9wKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW5kZXIgZnVuY3Rpb25cclxuICAgKi9cclxuICBfcmVuZGVyKCkge1xyXG4gICAgdGhpcy5fdGV0cm9taW5vLmRyYXcoKTtcclxuICAgIHRoaXMuX3JlbmRlcmVyLnJlbmRlcih0aGlzLl9jb250YWluZXIpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogS2V5Ym9hcmQgZXZlbnRzIGhlbHBlclxyXG4gICAqL1xyXG4gIF9rZXlib2FyZChrZXlDb2RlKSB7XHJcbiAgICB2YXIga2V5ID0ge307XHJcbiAgICBrZXkuY29kZSA9IGtleUNvZGU7XHJcbiAgICBrZXkuaXNEb3duID0gZmFsc2U7XHJcbiAgICBrZXkuaXNVcCA9IHRydWU7XHJcbiAgICBrZXkucHJlc3MgPSB1bmRlZmluZWQ7XHJcbiAgICBrZXkucmVsZWFzZSA9IHVuZGVmaW5lZDtcclxuICAgIC8vVGhlIGBkb3duSGFuZGxlcmBcclxuICAgIGtleS5kb3duSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSBrZXkuY29kZSkge1xyXG4gICAgICAgIGlmIChrZXkuaXNVcCAmJiBrZXkucHJlc3MpIGtleS5wcmVzcygpO1xyXG4gICAgICAgIGtleS5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIGtleS5pc1VwID0gZmFsc2U7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvL1RoZSBgdXBIYW5kbGVyYFxyXG4gICAga2V5LnVwSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSBrZXkuY29kZSkge1xyXG4gICAgICAgIGlmIChrZXkuaXNEb3duICYmIGtleS5yZWxlYXNlKSBrZXkucmVsZWFzZSgpO1xyXG4gICAgICAgIGtleS5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBrZXkuaXNVcCA9IHRydWU7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvL0F0dGFjaCBldmVudCBsaXN0ZW5lcnNcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAna2V5ZG93bicsIGtleS5kb3duSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXHJcbiAgICApO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICdrZXl1cCcsIGtleS51cEhhbmRsZXIuYmluZChrZXkpLCBmYWxzZVxyXG4gICAgKTtcclxuICAgIHJldHVybiBrZXk7XHJcbiAgfVxyXG5cclxufVxyXG4iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3JlTWFuYWdlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuYmVzdCA9ICBsb2NhbFN0b3JhZ2UuYmVzdFNjb3JlID8gbG9jYWxTdG9yYWdlLmJlc3RTY29yZSA6IDA7XHJcbiAgICBpZiAodGhpcy5zY29yZSA+IHRoaXMuYmVzdCkge1xyXG4gICAgICB0aGlzLmJlc3QgPSBsb2NhbFN0b3JhZ2UuYmVzdFNjb3JlID0gdGhpcy5zY29yZTtcclxuICAgIH1cclxuICAgIHRoaXMubGV2ZWwgPSAwO1xyXG4gICAgdGhpcy5zY29yZSA9IDA7XHJcbiAgICB0aGlzLmNsZWFyZWRMaW5lcyA9IDA7XHJcbiAgICB0aGlzLnVwZGF0ZURpc3BsYXkoKTtcclxuICB9XHJcblxyXG4gIF9hZGRQb2ludHMocG9pbnRzKSB7XHJcbiAgICB0aGlzLnNjb3JlICs9IHBvaW50cztcclxuICB9XHJcblxyXG4gIGFkZENsZWFyZWRMaW5lcyhsaW5lcykge1xyXG4gICAgdmFyIHByZXZpb3VzQ2xlYXJlZExpbmVzID0gdGhpcy5jbGVhcmVkTGluZXM7XHJcbiAgICB0aGlzLmNsZWFyZWRMaW5lcyArPSBsaW5lcztcclxuICAgIGlmIChwcmV2aW91c0NsZWFyZWRMaW5lcyAlIDEwID4gdGhpcy5jbGVhcmVkTGluZXMgJSAxMCkge1xyXG4gICAgICB0aGlzLmxldmVsKys7XHJcbiAgICB9XHJcbiAgICBpZiAobGluZXMgPT09IDEpIHtcclxuICAgICAgdGhpcy5fYWRkUG9pbnRzKDQwICogKHRoaXMubGV2ZWwgKyAxKSk7XHJcbiAgICB9IGVsc2UgaWYgKGxpbmVzID09PSAyKSB7XHJcbiAgICAgIHRoaXMuX2FkZFBvaW50cygxMDAgKiAodGhpcy5sZXZlbCArIDEpKTtcclxuICAgIH0gZWxzZSBpZiAobGluZXMgPT09IDMpIHtcclxuICAgICAgdGhpcy5fYWRkUG9pbnRzKDMwMCAqICh0aGlzLmxldmVsICsgMSkpO1xyXG4gICAgfSBlbHNlIGlmIChsaW5lcyA9PT0gNCkge1xyXG4gICAgICB0aGlzLl9hZGRQb2ludHMoMTIwMCAqICh0aGlzLmxldmVsICsgMSkpO1xyXG4gICAgfVxyXG4gICAgdGhpcy51cGRhdGVEaXNwbGF5KCk7XHJcbiAgfVxyXG5cclxuICB0ZXRyb21pbm9Ecm9wcGVkKCkge1xyXG4gICAgdGhpcy5fYWRkUG9pbnRzKDUgKiAodGhpcy5sZXZlbCArIDEpKTtcclxuICAgIHRoaXMudXBkYXRlRGlzcGxheSgpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlRGlzcGxheSgpIHtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5MRVZFTCkuaW5uZXJUZXh0ID0gdGhpcy5sZXZlbDtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TQ09SRSkuaW5uZXJUZXh0ID0gdGhpcy5zY29yZTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5DTEVBUkVEKS5pbm5lclRleHQgPSB0aGlzLmNsZWFyZWRMaW5lcztcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5CRVNUKS5pbm5lclRleHQgPSB0aGlzLmJlc3Q7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMnO1xyXG5pbXBvcnQgQmxvY2tGYWN0b3J5IGZyb20gJy4vQmxvY2tGYWN0b3J5JztcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnQgdGhlIGdhbWUgc3RhZ2VcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YWdlIHtcclxuICBjb25zdHJ1Y3Rvcihjb250YWluZXIpIHtcclxuICAgIC8vIFNldCB0aGUgY29udGFpbmVyXHJcbiAgICB0aGlzLl9jb250YWluZXIgPSBjb250YWluZXI7XHJcblxyXG4gICAgLy8gX2RhdGEgcmVwcmVzZW50cyB0aGUgc3RhdGUgb2YgZXZlcnkgYmxvY2sgb2YgdGhlIHN0YWdlXHJcbiAgICAvLyAwIGZvciBcImVtcHR5XCIsIGhleGEgY29kZSBjb2xvciBpZiBub3RcclxuICAgIC8vIFdlIGluaXRpYWxpemUgaXQgd2l0aCB6ZXJvc1xyXG4gICAgdGhpcy5fZGF0YSA9IFtdO1xyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBDb25zdGFudHMuV0lEVEg7IHgrKykge1xyXG4gICAgICB0aGlzLl9kYXRhLnB1c2goW10pO1xyXG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IENvbnN0YW50cy5IRUlHSFQ7IHkrKykge1xyXG4gICAgICAgIHRoaXMuX2RhdGFbeF0ucHVzaCgwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFBpeGkncyBibG9ja3NcclxuICAgIHRoaXMuX2Jsb2NrcyA9IFtdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIHNoYXBlcyB0byB0aGUgX2NvbnRhaW5lclxyXG4gICAqL1xyXG4gIGRyYXcoKSB7XHJcbiAgICB2YXIgaSA9IDA7XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IENvbnN0YW50cy5XSURUSDsgeCsrKSB7XHJcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgQ29uc3RhbnRzLkhFSUdIVDsgeSsrKSB7XHJcbiAgICAgICAgLy8gQ29sb3IgYmxvY2tzIHdoZW4gbm90IGVtcHR5XHJcbiAgICAgICAgaWYgKHRoaXMuX2RhdGFbeF1beV0gIT09IDApIHtcclxuICAgICAgICAgIHZhciBibG9jayA9IEJsb2NrRmFjdG9yeS5jcmVhdGVCbG9jayh4ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCB5ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBcclxuICAgICAgICAgICAgQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBDb25zdGFudHMuU1FVQVJFX1NJWkUsIFxyXG4gICAgICAgICAgICB0aGlzLl9kYXRhW3hdW3ldLCBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19CT1JERVJTLCAwLjUpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICB0aGlzLl9jb250YWluZXIucmVtb3ZlQ2hpbGQodGhpcy5fYmxvY2tzW2ldKTtcclxuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ibG9ja3NbaV07XHJcbiAgICAgICAgICB0aGlzLl9jb250YWluZXIuYWRkQ2hpbGQoYmxvY2spO1xyXG4gICAgICAgICAgdGhpcy5fYmxvY2tzW2ldID0gYmxvY2s7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ibG9ja3NbaV0gPT09IHVuZGVmaW5lZCkgeyAvLyBKdXN0IGEgZ3JpZCBpZiBlbXB0eVxyXG4gICAgICAgICAgdmFyIGJsb2NrID0gQmxvY2tGYWN0b3J5LmNyZWF0ZUJsb2NrKHggKiBDb25zdGFudHMuU1FVQVJFX1NJWkUsIHkgKiBDb25zdGFudHMuU1FVQVJFX1NJWkUsIFxyXG4gICAgICAgICAgICBDb25zdGFudHMuU1FVQVJFX1NJWkUsIENvbnN0YW50cy5TUVVBUkVfU0laRSwgXHJcbiAgICAgICAgICAgIENvbnN0YW50cy5DT0xPUlMuQkFDS0dST1VORCwgQ29uc3RhbnRzLkNPTE9SUy5CT1JERVJTLCAwLjUpO1xyXG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLmFkZENoaWxkKGJsb2NrKTtcclxuICAgICAgICAgIHRoaXMuX2Jsb2Nrc1tpXSA9IGJsb2NrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIGlmICd0ZXRyb21pbm8nIGlzIGluIGNvbGxpc2lvbiB3aXRoIHRoZSBzdGFnZVxyXG4gICAqL1xyXG4gIGlzQ29sbGlzaW9uKHRldHJvbWlubykge1xyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB0ZXRyb21pbm8udHlwZS5zaXplOyB4KyspIHtcclxuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0ZXRyb21pbm8udHlwZS5zaXplOyB5KyspIHsgICAgICAgIFxyXG4gICAgICAgIGlmICh0ZXRyb21pbm8ueCArIHggPCAwIHx8IHRldHJvbWluby54ICsgeCA+PSBDb25zdGFudHMuV0lEVEggfHwgeSA+PSBDb25zdGFudHMuSEVJR0hUIHx8IHRldHJvbWluby55ID49IDAgJiYgdGhpcy5fZGF0YVt0ZXRyb21pbm8ueCArIHhdW3RldHJvbWluby55ICsgeV0gIT09IDApIHtcclxuICAgICAgICAgIGlmICh0ZXRyb21pbm8uaGFzQmxvY2soeCwgeSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9ICBcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1c2lvbiAndGV0cm9taW5vJyB3aXRoIHRoZSBzdGFnZVxyXG4gICAqIElmIHRoZSBmdXNpb24gY3JlYXRlIGEgbGluZSwgd2UgY2xlYXIgdGhlIGxpbmVcclxuICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBjbGVhcmVkIGxpbmVzXHJcbiAgICovXHJcbiAgdW5pdGUodGV0cm9taW5vKSB7XHJcbiAgICB2YXIgY2xlYXJlZExpbmVzID0gMDtcclxuXHJcbiAgICAvLyBGdXNpb24gdGhlIHRldHJvbWlubyB3aXRoIHRoZSBzdGFnZVxyXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0ZXRyb21pbm8udHlwZS5zaXplOyB5KyspIHtcclxuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0ZXRyb21pbm8udHlwZS5zaXplOyB4KyspIHtcclxuICAgICAgICBpZiAodGV0cm9taW5vLnggKyB4IDwgQ29uc3RhbnRzLldJRFRIICYmIHRldHJvbWluby54ICsgeCA+PSAwICYmIHRldHJvbWluby5oYXNCbG9jayh4LCB5KSkge1xyXG4gICAgICAgICAgdGhpcy5fZGF0YVt0ZXRyb21pbm8ueCArIHhdW3RldHJvbWluby55ICsgeV0gPSB0ZXRyb21pbm8udHlwZS5jb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRldHJvbWluby50eXBlLnNpemU7IHkrKykge1xyXG4gICAgICAvLyBDaGVjayBpZiB0aGUgZnVzaW9uIGNyZWF0ZWQgYSBuZXcgbGluZVxyXG4gICAgICB2YXIgZXJhc2VMaW5lID0gdHJ1ZTtcclxuICAgICAgaWYgKHkgKyB0ZXRyb21pbm8ueSA+PSBDb25zdGFudHMuSEVJR0hUKSB7XHJcbiAgICAgICAgZXJhc2VMaW5lID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcclxuICAgICAgICAgIGlmICh0aGlzLl9kYXRhW3hdW3kgKyB0ZXRyb21pbm8ueV0gPT09IDApIHtcclxuICAgICAgICAgICAgZXJhc2VMaW5lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyBJZiB5ZXMsIHdlIGVyYXNlIGl0IGFuZCBtb3ZlIGFsbCBjb25jZXJuZWQgYmxvY2tzXHJcbiAgICAgIGlmIChlcmFzZUxpbmUpIHtcclxuICAgICAgICBjbGVhcmVkTGluZXMrKztcclxuICAgICAgICBmb3IgKGxldCB5eSA9IHkgKyB0ZXRyb21pbm8ueTsgeXkgPj0gMDsgeXktLSkge1xyXG4gICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBDb25zdGFudHMuV0lEVEg7IHgrKykge1xyXG4gICAgICAgICAgICBpZiAoeXkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fZGF0YVt4XVt5eV0gPSB0aGlzLl9kYXRhW3hdW3l5LTFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2RhdGFbeF1beXldID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBlbXB0eSB0aGUgYmxvY2tzICh3ZSB3aWxsIG5lZWQgdG8gcmVkcmF3KVxyXG4gICAgICAgIHRoaXMuX2Jsb2NrcyA9IFtdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNsZWFyZWRMaW5lcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoZSBzdGFnZVxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5fZGF0YSA9IFtdO1xyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBDb25zdGFudHMuV0lEVEg7IHgrKykge1xyXG4gICAgICB0aGlzLl9kYXRhLnB1c2goW10pO1xyXG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IENvbnN0YW50cy5IRUlHSFQ7IHkrKykge1xyXG4gICAgICAgIHRoaXMuX2RhdGFbeF0ucHVzaCgwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5fYmxvY2tzID0gW107XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMnO1xyXG5pbXBvcnQgQmxvY2tGYWN0b3J5IGZyb20gJy4vQmxvY2tGYWN0b3J5JztcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgdGV0cm9taW5vXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXRyb21pbm8ge1xyXG4gIGNvbnN0cnVjdG9yKHR5cGUsIGNvbnRhaW5lcikge1xyXG4gICAgLy8gU2V0IHRoZSBjb250YWluZXJcclxuICAgIHRoaXMuX2NvbnRhaW5lciA9IGNvbnRhaW5lcjtcclxuICAgIFxyXG4gICAgLy8gVHlwZSBvZiB0aGUgdGV0cm9taW5vIChJLCBKLCBMLCBPLCBTLCBULCBaKVxyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuXHJcbiAgICAvLyBQb3NpdGlvbiBvZiB0aGUgdGV0cm9taW5vXHJcbiAgICB0aGlzLnggPSBNYXRoLmZsb29yKENvbnN0YW50cy5XSURUSCAvIDIgLSB0aGlzLnR5cGUuc2l6ZSAvIDIpO1xyXG4gICAgdGhpcy55ID0gMDtcclxuXHJcbiAgICAvLyBBbmdsZSBvZiB0aGUgdGV0cm9taW5vICgwOiAwZGVnLCAxOiA5MGRlZywgMjogMTgwZGVnLCAzOiAyNzBkZWcpXHJcbiAgICB0aGlzLmFuZ2xlID0gMDtcclxuXHJcbiAgICAvLyBQaXhpJ3MgYmxvY2tzXHJcbiAgICB0aGlzLl9ibG9ja3MgPSBbXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXRpYyBtZXRob2QgdG8gZ2V0IGEgcmFuZG9tIHRldHJvbWlub1xyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRSYW5kb20oY29udGFpbmVyKSB7XHJcbiAgICB2YXIgdHlwZXMgPSBbVHlwZXMuSSwgVHlwZXMuSiwgVHlwZXMuTCwgVHlwZXMuTywgVHlwZXMuUywgVHlwZXMuVCwgVHlwZXMuWl07XHJcbiAgICB2YXIgdHlwZSA9IHR5cGVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpXTtcclxuICAgIHJldHVybiBuZXcgVGV0cm9taW5vKHR5cGUsIGNvbnRhaW5lcik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgc2hhcGVzIHRvIGNvbnRhaW5lclxyXG4gICAqL1xyXG4gIGRyYXcoKSB7XHJcbiAgICBsZXQgaSA9IDA7XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMudHlwZS5zaXplOyB4KyspIHtcclxuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLnR5cGUuc2l6ZTsgeSsrKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudHlwZS5zaGFwZXNbdGhpcy5hbmdsZV1beV1beF0gPT09IDEpIHtcclxuICAgICAgICAgIGlmICh0aGlzLl9ibG9ja3MubGVuZ3RoICE9PSA0KSB7XHJcbiAgICAgICAgICAgIHZhciBibG9jayA9IEJsb2NrRmFjdG9yeS5jcmVhdGVCbG9jaygwLCAwLCBDb25zdGFudHMuU1FVQVJFX1NJWkUsIENvbnN0YW50cy5TUVVBUkVfU0laRSwgXHJcbiAgICAgICAgICAgICAgdGhpcy50eXBlLmNvbG9yLCBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19CT1JERVJTLCAwLjUpO1xyXG4gICAgICAgICAgICB0aGlzLl9ibG9ja3MucHVzaChibG9jayk7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRDaGlsZChibG9jayk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLl9ibG9ja3NbaV0ueCA9ICh0aGlzLnggKyB4KSAqIENvbnN0YW50cy5TUVVBUkVfU0laRTtcclxuICAgICAgICAgIHRoaXMuX2Jsb2Nrc1tpXS55ID0gKHRoaXMueSArIHkpICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xyXG4gICAgICAgICAgaSsrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIHNoYXBlcyBmcm9tIGNvbnRhaW5lclxyXG4gICAqL1xyXG4gIHJlbW92ZSgpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fYmxvY2tzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHRoaXMuX2NvbnRhaW5lci5yZW1vdmVDaGlsZCh0aGlzLl9ibG9ja3NbaV0pO1xyXG4gICAgICBkZWxldGUgdGhpcy5fYmxvY2tzW2ldO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlIHRoZSB0ZXRyb21pbm8gdG8gdGhlIHJpZ2h0XHJcbiAgICovXHJcbiAgcm90YXRlKCkge1xyXG4gICAgdGhpcy5hbmdsZSArPSAxO1xyXG4gICAgdGhpcy5hbmdsZSAlPSA0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlIHRoZSB0ZXRyb21pbm8gdG8gdGhlIGxlZnRcclxuICAgKi9cclxuICBhbnRpUm90YXRlKCkge1xyXG4gICAgdGhpcy5hbmdsZSAtPSAxO1xyXG4gICAgaWYgKHRoaXMuYW5nbGUgPT09IC0xKSB7XHJcbiAgICAgIHRoaXMuYW5nbGUgPSAzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZSB0aGUgdGV0cm9taW5vXHJcbiAgICovXHJcbiAgbW92ZShkeCwgZHkpIHtcclxuICAgIHRoaXMueCArPSBkeDtcclxuICAgIHRoaXMueSArPSBkeTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3QgaWYgdGhlIHRldHJvbWlubyBoYXMgYSBibG9jayBpbiB0aGUgcG9zaXRpbm8gKHgsIHkpXHJcbiAgICogeCBhbmQgeSBiZWluZyByZWxhdGl2ZSB0aGUgdGhlIHBvc2l0aW9uIG9mIHRoZSB0ZXRyb21pbm9cclxuICAgKi9cclxuICBoYXNCbG9jayh4LCB5KSB7XHJcbiAgICByZXR1cm4gdGhpcy50eXBlLnNoYXBlc1t0aGlzLmFuZ2xlXVt5XVt4XSA9PT0gMTtcclxuICB9XHJcblxyXG59XHJcblxyXG4vKipcclxuICogVHlwZXMgb2YgdGV0cm9taW5vc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFR5cGVzID0ge1xyXG4gIEk6IHtcclxuICAgIG5hbWU6ICdJJywgLy8gTmFtZSBvZiB0aGUgdGV0cm9taW5vXHJcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fSSwgLy8gQmFja2dyb3VuZCBjb2xvclxyXG4gICAgc2l6ZTogNCwgLy8gU2l6ZSBvZiB0aGUgJ2NvbnRhaW5lcicgb2YgdGhlIHRldHJvbWlub1xyXG4gICAgc2hhcGVzOiBbIC8vIEFsbCBzaGFwZXMgb2YgdGhlIHRldHJvbWlubyAob25lIHBlciByb3RhdGlvbiBwb3NpdGlvbilcclxuICAgICAgW1xyXG4gICAgICAgIFswLDAsMCwwXSxcclxuICAgICAgICBbMSwxLDEsMV0sXHJcbiAgICAgICAgWzAsMCwwLDBdLFxyXG4gICAgICAgIFswLDAsMCwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwxLDBdLFxyXG4gICAgICAgIFswLDAsMSwwXSxcclxuICAgICAgICBbMCwwLDEsMF0sXHJcbiAgICAgICAgWzAsMCwxLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDAsMF0sXHJcbiAgICAgICAgWzAsMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMSwxXSxcclxuICAgICAgICBbMCwwLDAsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMCwwXSxcclxuICAgICAgICBbMCwxLDAsMF0sXHJcbiAgICAgICAgWzAsMSwwLDBdLFxyXG4gICAgICAgIFswLDEsMCwwXVxyXG4gICAgICBdXHJcbiAgICBdXHJcbiAgfSxcclxuICBKOiB7XHJcbiAgICBuYW1lOiAnSicsXHJcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fSixcclxuICAgIHNpemU6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDAsMF0sXHJcbiAgICAgICAgWzEsMSwxXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDFdLFxyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDAsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMSwxLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG4gIEw6IHtcclxuICAgIG5hbWU6ICdMJyxcclxuICAgIGNvbG9yOiBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19MLFxyXG4gICAgc2l6ZTogMyxcclxuICAgIHNoYXBlczogW1xyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwxXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDAsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMCwxLDFdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMV0sXHJcbiAgICAgICAgWzEsMCwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMF1cclxuICAgICAgXVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgTzoge1xyXG4gICAgbmFtZTogJ08nLFxyXG4gICAgY29sb3I6IENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX08sXHJcbiAgICBzaXplOiAyLFxyXG4gICAgc2hhcGVzOiBbXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwxXSxcclxuICAgICAgICBbMSwxXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzEsMV0sXHJcbiAgICAgICAgWzEsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDFdLFxyXG4gICAgICAgIFsxLDFdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwxXSxcclxuICAgICAgICBbMSwxXVxyXG4gICAgICBdXHJcbiAgICBdXHJcbiAgfSxcclxuICBTOiB7XHJcbiAgICBuYW1lOiAnUycsXHJcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fUyxcclxuICAgIHNpemU6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMCwxXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMCwxLDFdLFxyXG4gICAgICAgIFsxLDEsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDAsMF0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwxLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG4gIFQ6IHtcclxuICAgIG5hbWU6ICdUJyxcclxuICAgIGNvbG9yOiBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19ULFxyXG4gICAgc2l6ZSA6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwxXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDEsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwxLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG4gIFo6IHtcclxuICAgIG5hbWU6ICdaJyxcclxuICAgIGNvbG9yOiBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19aLFxyXG4gICAgc2l6ZSA6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDEsMF0sXHJcbiAgICAgICAgWzAsMSwxXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDFdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMSwxLDBdLFxyXG4gICAgICAgIFswLDEsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMSwwLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9XHJcbn07XHJcbiIsImltcG9ydCBHYW1lIGZyb20gJy4vR2FtZSc7XHJcblxyXG52YXIgZyA9IG5ldyBHYW1lKCk7XHJcbiJdfQ==
