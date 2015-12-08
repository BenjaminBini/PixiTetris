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
    START_PAUSE: '#start-pause button'
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
  }, {
    key: '_loop',
    value: function _loop() {
      var _this2 = this;

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
      this._requestId = requestAnimationFrame(function () {
        return _this2._loop();
      });
    }
  }, {
    key: '_pause',
    value: function _pause() {
      this._paused = !this._paused;
      // Stop or restart loop
      if (this._paused) {
        cancelAnimationFrame(this._requestId);
        document.querySelector(_Constants2.default.DOM.START_PAUSE).id = 'start';
        document.querySelector(_Constants2.default.DOM.START_PAUSE).innerText = 'start';
      } else {
        this._start();
        document.querySelector(_Constants2.default.DOM.START_PAUSE).id = 'pause';
        document.querySelector(_Constants2.default.DOM.START_PAUSE).innerText = 'pause';
      }
    }
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
        this._stage.reset();
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

  }, {
    key: '_pressSpace',
    value: function _pressSpace() {
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

  }, {
    key: '_render',
    value: function _render() {
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

},{"./Constants":1,"./Stage":3,"./Tetromino":4}],3:[function(require,module,exports){
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
  }

  /**
   * Add shapes to the _container
   */

  _createClass(Stage, [{
    key: 'draw',
    value: function draw() {
      for (var x = 0; x < _Constants2.default.WIDTH; x++) {
        for (var y = 0; y < _Constants2.default.HEIGHT; y++) {
          // Color blocks when not empty
          if (this._data[x][y] !== 0) {
            var square = new PIXI.Graphics();
            square.lineStyle(1, _Constants2.default.COLORS.TETROMINO_BORDERS, 1);
            square.beginFill(this._data[x][y]);
            square.drawRect(0, 0, _Constants2.default.SQUARE_SIZE, _Constants2.default.SQUARE_SIZE);
            square.endFill();
            square.x = x * _Constants2.default.SQUARE_SIZE;
            square.y = y * _Constants2.default.SQUARE_SIZE;
            this._container.addChild(square);
          } else {
            // Just a white dot in the middle if empty
            var square = new PIXI.Graphics();
            square.lineStyle(1, _Constants2.default.COLORS.BORDERS, _Constants2.default.COLORS.BORDERS_TRANSPARENCY);
            square.beginFill(_Constants2.default.COLORS.BACKGROUND);
            square.drawRect(0, 0, _Constants2.default.SQUARE_SIZE, _Constants2.default.SQUARE_SIZE);
            square.endFill();
            square.x = x * _Constants2.default.SQUARE_SIZE;
            square.y = y * _Constants2.default.SQUARE_SIZE;
            this._container.addChild(square);
          }
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
     * If the fusion create a line, we erase the line
     */

  }, {
    key: 'unite',
    value: function unite(tetromino) {
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
          for (var yy = y + tetromino.y; yy >= 0; yy--) {
            for (var x = 0; x < _Constants2.default.WIDTH; x++) {
              if (yy > 0) {
                this._data[x][yy] = this._data[x][yy - 1];
              } else {
                this._data[x][yy] = 0;
              }
            }
          }
        }
      }
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
    }
  }]);

  return Stage;
})();

exports.default = Stage;

},{"./Constants":1}],4:[function(require,module,exports){
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
  }

  /**
   * Static method to get a random tetromino
   */

  _createClass(Tetromino, [{
    key: 'draw',

    /**
     * Add shapes to _container
     */
    value: function draw() {
      for (var x = 0; x < this.type.size; x++) {
        for (var y = 0; y < this.type.size; y++) {
          if (this.type.shapes[this.angle][y][x] === 1) {
            var square = new PIXI.Graphics();
            square.lineStyle(1, _Constants2.default.COLORS.TETROMINO_BORDERS, 1);
            square.beginFill(this.type.color);
            square.drawRect(0, 0, _Constants2.default.SQUARE_SIZE, _Constants2.default.SQUARE_SIZE);
            square.endFill();
            square.x = (this.x + x) * _Constants2.default.SQUARE_SIZE;
            square.y = (this.y + y) * _Constants2.default.SQUARE_SIZE;
            this._container.addChild(square);
          }
        }
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

},{"./Constants":1}],5:[function(require,module,exports){
'use strict';

var _Game = require('./Game');

var _Game2 = _interopRequireDefault(_Game);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var g = new _Game2.default();

},{"./Game":2}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXENvbnN0YW50cy5qcyIsInNyY1xcR2FtZS5qcyIsInNyY1xcU3RhZ2UuanMiLCJzcmNcXFRldHJvbWluby5qcyIsInNyY1xcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztrQkNHZTtBQUNiLE9BQUssRUFBRSxFQUFFO0FBQ1QsUUFBTSxFQUFFLEVBQUU7QUFDVixhQUFXLEVBQUUsRUFBRTtBQUNmLFFBQU0sRUFBRTtBQUNQLHFCQUFpQixFQUFFLFFBQVE7QUFDM0IsZUFBVyxFQUFFLFFBQVE7QUFDckIsZUFBVyxFQUFFLFFBQVE7QUFDckIsZUFBVyxFQUFFLFFBQVE7QUFDckIsZUFBVyxFQUFFLFFBQVE7QUFDckIsZUFBVyxFQUFFLFFBQVE7QUFDckIsZUFBVyxFQUFFLFFBQVE7QUFDckIsZUFBVyxFQUFFLFFBQVE7QUFDckIsY0FBVSxFQUFFLFFBQVE7QUFDcEIsV0FBTyxFQUFFLFFBQVE7QUFDakIsd0JBQW9CLEVBQUUsQ0FBQztHQUN2QjtBQUNELEtBQUcsRUFBRTtBQUNKLGFBQVMsRUFBRSxPQUFPO0FBQ2xCLFFBQUksRUFBRSxpQkFBaUI7QUFDdkIsZUFBVyxFQUFFLHFCQUFxQjtHQUNsQztDQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNwQm9CLElBQUk7QUFDdkIsV0FEbUIsSUFBSSxHQUNUOzBCQURLLElBQUk7O0FBRXJCLFdBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDOzs7QUFBQyxBQUdsQixRQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQVUsR0FBRyxDQUFDLFNBQVMsQ0FBQzs7O0FBQUMsQUFHckUsUUFBSSxDQUFDLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQVUsR0FBRyxDQUFDLElBQUksQ0FBQzs7O0FBQUEsQUFHbkUsUUFBSSxDQUFDLG1CQUFtQixF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QyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1YsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1YsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1YsQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsb0JBQVUsTUFBTSxDQUFDLFdBQVc7QUFDbkMsUUFBSSxFQUFFLENBQUM7QUFDUCxVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLG9CQUFVLE1BQU0sQ0FBQyxXQUFXO0FBQ25DLFFBQUksRUFBRSxDQUFDO0FBQ1AsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxvQkFBVSxNQUFNLENBQUMsV0FBVztBQUNuQyxRQUFJLEVBQUUsQ0FBQztBQUNQLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ0wsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ04sRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNMLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNOLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDTCxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDTixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ0wsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ04sQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsb0JBQVUsTUFBTSxDQUFDLFdBQVc7QUFDbkMsUUFBSSxFQUFFLENBQUM7QUFDUCxVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLG9CQUFVLE1BQU0sQ0FBQyxXQUFXO0FBQ25DLFFBQUksRUFBRyxDQUFDO0FBQ1IsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxvQkFBVSxNQUFNLENBQUMsV0FBVztBQUNuQyxRQUFJLEVBQUcsQ0FBQztBQUNSLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsQ0FDRjtHQUNGO0NBQ0YsQ0FBQzs7Ozs7Ozs7Ozs7QUNyUkYsSUFBSSxDQUFDLEdBQUcsb0JBQVUsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogR2FtZSBjb25zdGFudHNcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICBXSURUSDogMTIsIC8vIFdpZHRoIG9mIHRoZSBnYW1lIChpbiBudW1iZXIgb2YgYmxvY2tzKVxyXG4gIEhFSUdIVDogMjQsIC8vIEhlaWdodCBvZiB0aGUgZ2FtZSAoaW4gbnVtYmVyIG9mIGJsb2NrcylcclxuICBTUVVBUkVfU0laRTogMjUsIC8vIFdpZHRoIGFuZCBoZWlnaHQgb2YgYSBibG9jayAoaW4gcHgpXHJcbiAgQ09MT1JTOiB7XHJcbiAgXHRURVRST01JTk9fQk9SREVSUzogMHgzNzNjNDAsXHJcbiAgXHRURVRST01JTk9fSTogMHhmZjgwMDAsXHJcbiAgXHRURVRST01JTk9fSjogMHgyY2M5OTAsXHJcbiAgXHRURVRST01JTk9fTDogMHhmMzQzNDQsXHJcbiAgXHRURVRST01JTk9fTzogMHhmZmRmMDAsXHJcbiAgXHRURVRST01JTk9fUzogMHhjY2RjZTQsXHJcbiAgXHRURVRST01JTk9fVDogMHgwMDhhZmYsXHJcbiAgXHRURVRST01JTk9fWjogMHhmY2I5NDEsXHJcbiAgXHRCQUNLR1JPVU5EOiAweDJkMzIzNixcclxuICBcdEJPUkRFUlM6IDB4MzczQzQwLFxyXG4gIFx0Qk9SREVSU19UUkFOU1BBUkVOQ1k6IDFcclxuICB9LFxyXG4gIERPTToge1xyXG4gIFx0Q09OVEFJTkVSOiAnI2dhbWUnLFxyXG4gIFx0TkVYVDogJyNuZXh0LXRldHJvbWlubycsXHJcbiAgXHRTVEFSVF9QQVVTRTogJyNzdGFydC1wYXVzZSBidXR0b24nXHJcbiAgfVxyXG59O1xyXG4iLCJpbXBvcnQgVGV0cm9taW5vIGZyb20gJy4vVGV0cm9taW5vJztcclxuaW1wb3J0IHtUeXBlc30gZnJvbSAnLi9UZXRyb21pbm8nO1xyXG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcclxuaW1wb3J0IFN0YWdlIGZyb20gJy4vU3RhZ2UnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhQSVhJKTtcclxuXHJcbiAgICAvLyBET00gY29udGFpbmVyXHJcbiAgICB0aGlzLl9kb21Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uQ09OVEFJTkVSKTtcclxuXHJcbiAgICAvLyBOZXh0IHRldHJvbWlubyBET00gY29udGFpbmVyXHJcbiAgICB0aGlzLl9kb21OZXh0Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLk5FWFQpXHJcblxyXG4gICAgLy8gS2V5Ym9hcmQgZXZlbnRzXHJcbiAgICB0aGlzLl9pbml0S2V5Ym9hcmRFdmVudHMoKTtcclxuXHJcbiAgICAvLyBNb3VzZSBldmVudHNcclxuICAgIHRoaXMuX2luaXRNb3VzZUV2ZW50cygpO1xyXG4gICAgIFxyXG4gICAgLy8gU2V0IHVwIFBJWElcclxuICAgIHRoaXMuX3JlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIoQ29uc3RhbnRzLldJRFRIICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBDb25zdGFudHMuSEVJR0hUICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFKTtcclxuXHJcbiAgICB0aGlzLl9kb21Db250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fcmVuZGVyZXIudmlldyk7XHJcblxyXG4gICAgLy8gUGl4aSBjb250YWluZXJcclxuICAgIHRoaXMuX2NvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xyXG5cclxuICAgIC8vIEdhbWUgYm9hcmQvc3RhZ2VcclxuICAgIHRoaXMuX3N0YWdlID0gbmV3IFN0YWdlKHRoaXMuX2NvbnRhaW5lcik7IFxyXG5cclxuICAgIC8vIEluaXQgdGV0cm9taW5vc1xyXG4gICAgdGhpcy5fdGV0cm9taW5vID0gdW5kZWZpbmVkOyAvLyBUZXRyb21pbm8gb24gdGhlIHN0YWdlXHJcbiAgICB0aGlzLl9uZXh0VGV0cm9taW5vID0gdW5kZWZpbmVkOyAvLyBOZXh0IHRldHJvbWlub1xyXG4gICAgdGhpcy5fbmV3VGV0cm9taW5vKCk7XHJcblxyXG4gICAgLy8gRGVsYXkgYmV0d2VlbiBtb3Zlc1xyXG4gICAgdGhpcy5fZGVsYXkgPSAzMDA7XHJcblxyXG4gICAgLy8gSW5pdCB0aW1lclxyXG4gICAgdGhpcy5fdGltZXIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuXHJcbiAgICAvLyBHTyFcclxuICAgIHRoaXMuX3JlcXVlc3RJZCA9IHVuZGVmaW5lZDsgLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIElEICh1c2VkIHRvIHBhdXNlIGdhbWUpXHJcbiAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuX3N0YXJ0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGFydCB0aGUgZ2FtZVxyXG4gICAqL1xyXG4gIF9zdGFydCgpIHtcclxuICAgIHRoaXMuX3JlcXVlc3RJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLl9sb29wKCkpO1xyXG4gIH1cclxuXHJcbiAgX2xvb3AoKSB7XHJcbiAgICBpZiAobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aGlzLl90aW1lciA+IHRoaXMuX2RlbGF5KSB7XHJcbiAgICAgIHRoaXMuX3RpbWVyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDAsIDEpOyAvLyBHcmF2aXR5XHJcbiAgICAgIC8vIElmIGNvbGxpc2lvbiwgY2FuY2VsICBtb3ZlIGFuZCB1bml0ZSB0aGUgdGV0cm9taW5vIHdpdGggdGhlIGdhbWUgc3RhZ2VcclxuICAgICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHsgXHJcbiAgICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMCwgLTEpO1xyXG4gICAgICAgIHRoaXMuX3N0YWdlLnVuaXRlKHRoaXMuX3RldHJvbWlubyk7XHJcbiAgICAgICAgdGhpcy5fbmV3VGV0cm9taW5vKCk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5fcmVuZGVyKCk7IC8vIFJlbmRlclxyXG4gICAgfVxyXG4gICAgdGhpcy5fcmVxdWVzdElkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuX2xvb3AoKSk7XHJcbiAgfVxyXG5cclxuICBfcGF1c2UoKSB7XHJcbiAgICB0aGlzLl9wYXVzZWQgPSAhdGhpcy5fcGF1c2VkO1xyXG4gICAgLy8gU3RvcCBvciByZXN0YXJ0IGxvb3BcclxuICAgIGlmICh0aGlzLl9wYXVzZWQpIHtcclxuICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmVxdWVzdElkKTtcclxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLlNUQVJUX1BBVVNFKS5pZCA9ICdzdGFydCc7XHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TVEFSVF9QQVVTRSkuaW5uZXJUZXh0ID0gJ3N0YXJ0JztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX3N0YXJ0KCk7ICAgXHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ29uc3RhbnRzLkRPTS5TVEFSVF9QQVVTRSkuaWQgPSAncGF1c2UnO1xyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENvbnN0YW50cy5ET00uU1RBUlRfUEFVU0UpLmlubmVyVGV4dCA9ICdwYXVzZSc7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBfbmV3VGV0cm9taW5vKCkge1xyXG4gICAgaWYgKCF0aGlzLl9uZXh0VGV0cm9taW5vKSB7XHJcbiAgICAgIHRoaXMuX25leHRUZXRyb21pbm8gPSBUZXRyb21pbm8uZ2V0UmFuZG9tKHRoaXMuX2NvbnRhaW5lcik7ICBcclxuICAgIH1cclxuICAgIHRoaXMuX3RldHJvbWlubyA9IHRoaXMuX25leHRUZXRyb21pbm87XHJcbiAgICB0aGlzLl9uZXh0VGV0cm9taW5vID0gVGV0cm9taW5vLmdldFJhbmRvbSh0aGlzLl9jb250YWluZXIpO1xyXG4gICAgdGhpcy5fZG9tTmV4dENvbnRhaW5lci5jbGFzc05hbWUgPSB0aGlzLl9uZXh0VGV0cm9taW5vLnR5cGUubmFtZTtcclxuICAgIC8vIExvc2UhIFJlc3RhcnRcclxuICAgIGlmICh0aGlzLl9zdGFnZS5pc0NvbGxpc2lvbih0aGlzLl90ZXRyb21pbm8pKSB7XHJcbiAgICAgIHRoaXMuX3N0YWdlLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbml0IGtleWJvYXJkIGV2ZW50c1xyXG4gICAqL1xyXG4gIF9pbml0S2V5Ym9hcmRFdmVudHMoKSB7XHJcbiAgICB2YXIgbGVmdEtleSA9IHRoaXMuX2tleWJvYXJkKDM3KTtcclxuICAgIHZhciB1cEtleSA9IHRoaXMuX2tleWJvYXJkKDM4KTtcclxuICAgIHZhciByaWdodEtleSA9IHRoaXMuX2tleWJvYXJkKDM5KTtcclxuICAgIHZhciBkb3duS2V5ID0gdGhpcy5fa2V5Ym9hcmQoNDApO1xyXG4gICAgdmFyIHNwYWNlS2V5ID0gdGhpcy5fa2V5Ym9hcmQoMzIpO1xyXG4gICAgdmFyIHBLZXkgPSB0aGlzLl9rZXlib2FyZCg4MCk7XHJcbiAgICBsZWZ0S2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcHJlc3NMZWZ0KCk7XHJcbiAgICB1cEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzVXAoKTtcclxuICAgIHJpZ2h0S2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcHJlc3NSaWdodCgpO1xyXG4gICAgZG93bktleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzRG93bigpO1xyXG4gICAgc3BhY2VLZXkucHJlc3MgPSAoKSA9PiB0aGlzLl9wcmVzc1NwYWNlKCk7XHJcbiAgICBwS2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcGF1c2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXQgbW91c2UgZXZlbnRzXHJcbiAgICovXHJcbiAgX2luaXRNb3VzZUV2ZW50cygpIHtcclxuICAgIHZhciBzdGFydFBhdXNlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihDb25zdGFudHMuRE9NLlNUQVJUX1BBVVNFKTtcclxuICAgIHN0YXJ0UGF1c2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLl9wYXVzZSgpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiUHJlc3MgbGVmdFwiIGV2ZW50XHJcbiAgICovXHJcbiAgX3ByZXNzTGVmdCgpIHtcclxuICAgIGlmICghdGhpcy5fcGF1c2VkKSB7XHJcbiAgICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKC0xLCAwKTtcclxuICAgICAgaWYgKHRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcclxuICAgICAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgxLCAwKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLl9yZW5kZXIoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiUHJlc3MgcmlnaHRcIiBldmVudFxyXG4gICAqL1xyXG4gIF9wcmVzc1JpZ2h0KCkge1xyXG4gICAgaWYgKCF0aGlzLl9wYXVzZWQpIHtcclxuICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoMSwgMCk7XHJcbiAgICAgIGlmICh0aGlzLl9zdGFnZS5pc0NvbGxpc2lvbih0aGlzLl90ZXRyb21pbm8pKSB7XHJcbiAgICAgICAgdGhpcy5fdGV0cm9taW5vLm1vdmUoLTEsIDApO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuX3JlbmRlcigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogXCJQcmVzcyB1cFwiIGV2ZW50XHJcbiAgICovXHJcbiAgX3ByZXNzVXAoKSB7XHJcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xyXG4gICAgICB0aGlzLl90ZXRyb21pbm8ucm90YXRlKCk7XHJcbiAgICAgIGlmICh0aGlzLl9zdGFnZS5pc0NvbGxpc2lvbih0aGlzLl90ZXRyb21pbm8pKSB7XHJcbiAgICAgICAgdGhpcy5fdGV0cm9taW5vLmFudGlSb3RhdGUoKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLl9yZW5kZXIoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiUHJlc3MgZG93blwiIGV2ZW50XHJcbiAgICovXHJcbiAgX3ByZXNzRG93bigpIHtcclxuICAgIGlmICghdGhpcy5fcGF1c2VkKSB7XHJcbiAgICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDAsIDEpO1xyXG4gICAgICBpZiAodGhpcy5fc3RhZ2UuaXNDb2xsaXNpb24odGhpcy5fdGV0cm9taW5vKSkge1xyXG4gICAgICAgIHRoaXMuX3RldHJvbWluby5tb3ZlKDAsIC0xKTtcclxuICAgICAgICB0aGlzLl9zdGFnZS51bml0ZSh0aGlzLl90ZXRyb21pbm8pO1xyXG4gICAgICAgIHRoaXMuX25ld1RldHJvbWlubygpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuX3JlbmRlcigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogXCJQcmVzcyBzcGFjZVwiIGV2ZW50XHJcbiAgICovXHJcbiAgX3ByZXNzU3BhY2UoKSB7XHJcbiAgICBpZiAoIXRoaXMuX3BhdXNlZCkge1xyXG4gICAgICB3aGlsZSAoIXRoaXMuX3N0YWdlLmlzQ29sbGlzaW9uKHRoaXMuX3RldHJvbWlubykpIHtcclxuICAgICAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgwLCAxKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLl90ZXRyb21pbm8ubW92ZSgwLCAtMSk7XHJcbiAgICAgIHRoaXMuX3N0YWdlLnVuaXRlKHRoaXMuX3RldHJvbWlubyk7XHJcbiAgICAgIHRoaXMuX25ld1RldHJvbWlubygpO1xyXG4gICAgICB0aGlzLl9yZW5kZXIoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbmRlciBmdW5jdGlvblxyXG4gICAqL1xyXG4gIF9yZW5kZXIoKSB7XHJcbiAgICAvLyBSZW1vdmUgZXZlcnl0aGluZyBmcm9tIHRoZSBjb250YWluZXIsIHJlZHJhdyBzdGFnZSBhbmQgdGV0cm9taW5vIGFuZCByZW5kZXJcclxuICAgIC8vIFRPRE8gOiBkbyBub3QgcmVtb3ZlIGFuZCByZWRyYXcgYXQgZXZlcnkgbW92ZVxyXG4gICAgdGhpcy5fY29udGFpbmVyLnJlbW92ZUNoaWxkcmVuKCk7XHJcbiAgICB0aGlzLl9zdGFnZS5kcmF3KCk7XHJcbiAgICB0aGlzLl90ZXRyb21pbm8uZHJhdygpO1xyXG4gICAgdGhpcy5fcmVuZGVyZXIucmVuZGVyKHRoaXMuX2NvbnRhaW5lcik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBLZXlib2FyZCBldmVudHMgaGVscGVyXHJcbiAgICovXHJcbiAgX2tleWJvYXJkKGtleUNvZGUpIHtcclxuICAgIHZhciBrZXkgPSB7fTtcclxuICAgIGtleS5jb2RlID0ga2V5Q29kZTtcclxuICAgIGtleS5pc0Rvd24gPSBmYWxzZTtcclxuICAgIGtleS5pc1VwID0gdHJ1ZTtcclxuICAgIGtleS5wcmVzcyA9IHVuZGVmaW5lZDtcclxuICAgIGtleS5yZWxlYXNlID0gdW5kZWZpbmVkO1xyXG4gICAgLy9UaGUgYGRvd25IYW5kbGVyYFxyXG4gICAga2V5LmRvd25IYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XHJcbiAgICAgICAgaWYgKGtleS5pc1VwICYmIGtleS5wcmVzcykga2V5LnByZXNzKCk7XHJcbiAgICAgICAga2V5LmlzRG93biA9IHRydWU7XHJcbiAgICAgICAga2V5LmlzVXAgPSBmYWxzZTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vVGhlIGB1cEhhbmRsZXJgXHJcbiAgICBrZXkudXBIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XHJcbiAgICAgICAgaWYgKGtleS5pc0Rvd24gJiYga2V5LnJlbGVhc2UpIGtleS5yZWxlYXNlKCk7XHJcbiAgICAgICAga2V5LmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIGtleS5pc1VwID0gdHJ1ZTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vQXR0YWNoIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICdrZXlkb3duJywga2V5LmRvd25IYW5kbGVyLmJpbmQoa2V5KSwgZmFsc2VcclxuICAgICk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgJ2tleXVwJywga2V5LnVwSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIGtleTtcclxuICB9XHJcblxyXG59XHJcbiIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMnO1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudCB0aGUgZ2FtZSBzdGFnZVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhZ2Uge1xyXG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lcikge1xyXG4gICAgLy8gU2V0IHRoZSBjb250YWluZXJcclxuICAgIHRoaXMuX2NvbnRhaW5lciA9IGNvbnRhaW5lcjtcclxuXHJcbiAgICAvLyBfZGF0YSByZXByZXNlbnRzIHRoZSBzdGF0ZSBvZiBldmVyeSBibG9jayBvZiB0aGUgc3RhZ2VcclxuICAgIC8vIDAgZm9yIFwiZW1wdHlcIiwgaGV4YSBjb2RlIGNvbG9yIGlmIG5vdFxyXG4gICAgLy8gV2UgaW5pdGlhbGl6ZSBpdCB3aXRoIHplcm9zXHJcbiAgICB0aGlzLl9kYXRhID0gW107XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IENvbnN0YW50cy5XSURUSDsgeCsrKSB7XHJcbiAgICAgIHRoaXMuX2RhdGEucHVzaChbXSk7XHJcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgQ29uc3RhbnRzLkhFSUdIVDsgeSsrKSB7XHJcbiAgICAgICAgdGhpcy5fZGF0YVt4XS5wdXNoKDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgc2hhcGVzIHRvIHRoZSBfY29udGFpbmVyXHJcbiAgICovXHJcbiAgZHJhdygpIHtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcclxuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBDb25zdGFudHMuSEVJR0hUOyB5KyspIHtcclxuICAgICAgICAvLyBDb2xvciBibG9ja3Mgd2hlbiBub3QgZW1wdHlcclxuICAgICAgICBpZiAodGhpcy5fZGF0YVt4XVt5XSAhPT0gMCkge1xyXG4gICAgICAgICAgdmFyIHNxdWFyZSA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XHJcbiAgICAgICAgICBzcXVhcmUubGluZVN0eWxlKDEsIENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX0JPUkRFUlMsIDEpO1xyXG4gICAgICAgICAgc3F1YXJlLmJlZ2luRmlsbCh0aGlzLl9kYXRhW3hdW3ldKTtcclxuICAgICAgICAgIHNxdWFyZS5kcmF3UmVjdCgwLCAwLCBDb25zdGFudHMuU1FVQVJFX1NJWkUsIENvbnN0YW50cy5TUVVBUkVfU0laRSk7XHJcbiAgICAgICAgICBzcXVhcmUuZW5kRmlsbCgpO1xyXG4gICAgICAgICAgc3F1YXJlLnggPSB4ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xyXG4gICAgICAgICAgc3F1YXJlLnkgPSB5ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xyXG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLmFkZENoaWxkKHNxdWFyZSk7XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gSnVzdCBhIHdoaXRlIGRvdCBpbiB0aGUgbWlkZGxlIGlmIGVtcHR5XHJcbiAgICAgICAgICB2YXIgc3F1YXJlID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcclxuICAgICAgICAgIHNxdWFyZS5saW5lU3R5bGUoMSwgQ29uc3RhbnRzLkNPTE9SUy5CT1JERVJTLCBDb25zdGFudHMuQ09MT1JTLkJPUkRFUlNfVFJBTlNQQVJFTkNZKTtcclxuICAgICAgICAgIHNxdWFyZS5iZWdpbkZpbGwoQ29uc3RhbnRzLkNPTE9SUy5CQUNLR1JPVU5EKTtcclxuICAgICAgICAgIHNxdWFyZS5kcmF3UmVjdCgwLCAwLCBDb25zdGFudHMuU1FVQVJFX1NJWkUsIENvbnN0YW50cy5TUVVBUkVfU0laRSk7XHJcbiAgICAgICAgICBzcXVhcmUuZW5kRmlsbCgpO1xyXG4gICAgICAgICAgc3F1YXJlLnggPSB4ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xyXG4gICAgICAgICAgc3F1YXJlLnkgPSB5ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xyXG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLmFkZENoaWxkKHNxdWFyZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBpZiAndGV0cm9taW5vJyBpcyBpbiBjb2xsaXNpb24gd2l0aCB0aGUgc3RhZ2VcclxuICAgKi9cclxuICBpc0NvbGxpc2lvbih0ZXRyb21pbm8pIHtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeCsrKSB7XHJcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeSsrKSB7ICAgICAgICBcclxuICAgICAgICBpZiAodGV0cm9taW5vLnggKyB4IDwgMCB8fCB0ZXRyb21pbm8ueCArIHggPj0gQ29uc3RhbnRzLldJRFRIIHx8IHkgPj0gQ29uc3RhbnRzLkhFSUdIVCB8fCB0ZXRyb21pbm8ueSA+PSAwICYmIHRoaXMuX2RhdGFbdGV0cm9taW5vLnggKyB4XVt0ZXRyb21pbm8ueSArIHldICE9PSAwKSB7XHJcbiAgICAgICAgICBpZiAodGV0cm9taW5vLmhhc0Jsb2NrKHgsIHkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfSAgXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdXNpb24gJ3RldHJvbWlubycgd2l0aCB0aGUgc3RhZ2VcclxuICAgKiBJZiB0aGUgZnVzaW9uIGNyZWF0ZSBhIGxpbmUsIHdlIGVyYXNlIHRoZSBsaW5lXHJcbiAgICovXHJcbiAgdW5pdGUodGV0cm9taW5vKSB7XHJcbiAgICAvLyBGdXNpb24gdGhlIHRldHJvbWlubyB3aXRoIHRoZSBzdGFnZVxyXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0ZXRyb21pbm8udHlwZS5zaXplOyB5KyspIHtcclxuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0ZXRyb21pbm8udHlwZS5zaXplOyB4KyspIHtcclxuICAgICAgICBpZiAodGV0cm9taW5vLnggKyB4IDwgQ29uc3RhbnRzLldJRFRIICYmIHRldHJvbWluby54ICsgeCA+PSAwICYmIHRldHJvbWluby5oYXNCbG9jayh4LCB5KSkge1xyXG4gICAgICAgICAgdGhpcy5fZGF0YVt0ZXRyb21pbm8ueCArIHhdW3RldHJvbWluby55ICsgeV0gPSB0ZXRyb21pbm8udHlwZS5jb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRldHJvbWluby50eXBlLnNpemU7IHkrKykge1xyXG4gICAgICAvLyBDaGVjayBpZiB0aGUgZnVzaW9uIGNyZWF0ZWQgYSBuZXcgbGluZVxyXG4gICAgICB2YXIgZXJhc2VMaW5lID0gdHJ1ZTtcclxuICAgICAgaWYgKHkgKyB0ZXRyb21pbm8ueSA+PSBDb25zdGFudHMuSEVJR0hUKSB7XHJcbiAgICAgICAgZXJhc2VMaW5lID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcclxuICAgICAgICAgIGlmICh0aGlzLl9kYXRhW3hdW3kgKyB0ZXRyb21pbm8ueV0gPT09IDApIHtcclxuICAgICAgICAgICAgZXJhc2VMaW5lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyBJZiB5ZXMsIHdlIGVyYXNlIGl0IGFuZCBtb3ZlIGFsbCBjb25jZXJuZWQgYmxvY2tzXHJcbiAgICAgIGlmIChlcmFzZUxpbmUpIHtcclxuICAgICAgICBmb3IgKGxldCB5eSA9IHkgKyB0ZXRyb21pbm8ueTsgeXkgPj0gMDsgeXktLSkge1xyXG4gICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBDb25zdGFudHMuV0lEVEg7IHgrKykge1xyXG4gICAgICAgICAgICBpZiAoeXkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fZGF0YVt4XVt5eV0gPSB0aGlzLl9kYXRhW3hdW3l5LTFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2RhdGFbeF1beXldID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdGhlIHN0YWdlXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLl9kYXRhID0gW107XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IENvbnN0YW50cy5XSURUSDsgeCsrKSB7XHJcbiAgICAgIHRoaXMuX2RhdGEucHVzaChbXSk7XHJcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgQ29uc3RhbnRzLkhFSUdIVDsgeSsrKSB7XHJcbiAgICAgICAgdGhpcy5fZGF0YVt4XS5wdXNoKDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMnO1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSB0ZXRyb21pbm9cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRldHJvbWlubyB7XHJcbiAgY29uc3RydWN0b3IodHlwZSwgY29udGFpbmVyKSB7XHJcbiAgICAvLyBTZXQgdGhlIGNvbnRhaW5lclxyXG4gICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xyXG4gICAgXHJcbiAgICAvLyBUeXBlIG9mIHRoZSB0ZXRyb21pbm8gKEksIEosIEwsIE8sIFMsIFQsIFopXHJcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG5cclxuICAgIC8vIFBvc2l0aW9uIG9mIHRoZSB0ZXRyb21pbm9cclxuICAgIHRoaXMueCA9IE1hdGguZmxvb3IoQ29uc3RhbnRzLldJRFRIIC8gMiAtIHRoaXMudHlwZS5zaXplIC8gMik7XHJcbiAgICB0aGlzLnkgPSAwO1xyXG5cclxuICAgIC8vIEFuZ2xlIG9mIHRoZSB0ZXRyb21pbm8gKDA6IDBkZWcsIDE6IDkwZGVnLCAyOiAxODBkZWcsIDM6IDI3MGRlZylcclxuICAgIHRoaXMuYW5nbGUgPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhdGljIG1ldGhvZCB0byBnZXQgYSByYW5kb20gdGV0cm9taW5vXHJcbiAgICovXHJcbiAgc3RhdGljIGdldFJhbmRvbShjb250YWluZXIpIHtcclxuICAgIHZhciB0eXBlcyA9IFtUeXBlcy5JLCBUeXBlcy5KLCBUeXBlcy5MLCBUeXBlcy5PLCBUeXBlcy5TLCBUeXBlcy5ULCBUeXBlcy5aXTtcclxuICAgIHZhciB0eXBlID0gdHlwZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNyldO1xyXG4gICAgcmV0dXJuIG5ldyBUZXRyb21pbm8odHlwZSwgY29udGFpbmVyKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBzaGFwZXMgdG8gX2NvbnRhaW5lclxyXG4gICAqL1xyXG4gIGRyYXcoKSB7XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMudHlwZS5zaXplOyB4KyspIHtcclxuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLnR5cGUuc2l6ZTsgeSsrKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudHlwZS5zaGFwZXNbdGhpcy5hbmdsZV1beV1beF0gPT09IDEpIHtcclxuICAgICAgICAgIHZhciBzcXVhcmUgPSBuZXcgUElYSS5HcmFwaGljcygpO1xyXG4gICAgICAgICAgc3F1YXJlLmxpbmVTdHlsZSgxLCBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19CT1JERVJTLCAxKTtcclxuICAgICAgICAgIHNxdWFyZS5iZWdpbkZpbGwodGhpcy50eXBlLmNvbG9yKTtcclxuICAgICAgICAgIHNxdWFyZS5kcmF3UmVjdCgwLCAwLCBDb25zdGFudHMuU1FVQVJFX1NJWkUsIENvbnN0YW50cy5TUVVBUkVfU0laRSk7XHJcbiAgICAgICAgICBzcXVhcmUuZW5kRmlsbCgpO1xyXG4gICAgICAgICAgc3F1YXJlLnggPSAodGhpcy54ICsgeCkgKiBDb25zdGFudHMuU1FVQVJFX1NJWkU7XHJcbiAgICAgICAgICBzcXVhcmUueSA9ICh0aGlzLnkgKyB5KSAqIENvbnN0YW50cy5TUVVBUkVfU0laRTtcclxuICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRDaGlsZChzcXVhcmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlIHRoZSB0ZXRyb21pbm8gdG8gdGhlIHJpZ2h0XHJcbiAgICovXHJcbiAgcm90YXRlKCkge1xyXG4gICAgdGhpcy5hbmdsZSArPSAxO1xyXG4gICAgdGhpcy5hbmdsZSAlPSA0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlIHRoZSB0ZXRyb21pbm8gdG8gdGhlIGxlZnRcclxuICAgKi9cclxuICBhbnRpUm90YXRlKCkge1xyXG4gICAgdGhpcy5hbmdsZSAtPSAxO1xyXG4gICAgaWYgKHRoaXMuYW5nbGUgPT09IC0xKSB7XHJcbiAgICAgIHRoaXMuYW5nbGUgPSAzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZSB0aGUgdGV0cm9taW5vXHJcbiAgICovXHJcbiAgbW92ZShkeCwgZHkpIHtcclxuICAgIHRoaXMueCArPSBkeDtcclxuICAgIHRoaXMueSArPSBkeTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3QgaWYgdGhlIHRldHJvbWlubyBoYXMgYSBibG9jayBpbiB0aGUgcG9zaXRpbm8gKHgsIHkpXHJcbiAgICogeCBhbmQgeSBiZWluZyByZWxhdGl2ZSB0aGUgdGhlIHBvc2l0aW9uIG9mIHRoZSB0ZXRyb21pbm9cclxuICAgKi9cclxuICBoYXNCbG9jayh4LCB5KSB7XHJcbiAgICByZXR1cm4gdGhpcy50eXBlLnNoYXBlc1t0aGlzLmFuZ2xlXVt5XVt4XSA9PT0gMTtcclxuICB9XHJcblxyXG59XHJcblxyXG4vKipcclxuICogVHlwZXMgb2YgdGV0cm9taW5vc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFR5cGVzID0ge1xyXG4gIEk6IHtcclxuICAgIG5hbWU6ICdJJywgLy8gTmFtZSBvZiB0aGUgdGV0cm9taW5vXHJcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fSSwgLy8gQmFja2dyb3VuZCBjb2xvclxyXG4gICAgc2l6ZTogNCwgLy8gU2l6ZSBvZiB0aGUgJ2NvbnRhaW5lcicgb2YgdGhlIHRldHJvbWlub1xyXG4gICAgc2hhcGVzOiBbIC8vIEFsbCBzaGFwZXMgb2YgdGhlIHRldHJvbWlubyAob25lIHBlciByb3RhdGlvbiBwb3NpdGlvbilcclxuICAgICAgW1xyXG4gICAgICAgIFswLDAsMCwwXSxcclxuICAgICAgICBbMSwxLDEsMV0sXHJcbiAgICAgICAgWzAsMCwwLDBdLFxyXG4gICAgICAgIFswLDAsMCwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwxLDBdLFxyXG4gICAgICAgIFswLDAsMSwwXSxcclxuICAgICAgICBbMCwwLDEsMF0sXHJcbiAgICAgICAgWzAsMCwxLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDAsMF0sXHJcbiAgICAgICAgWzAsMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMSwxXSxcclxuICAgICAgICBbMCwwLDAsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMCwwXSxcclxuICAgICAgICBbMCwxLDAsMF0sXHJcbiAgICAgICAgWzAsMSwwLDBdLFxyXG4gICAgICAgIFswLDEsMCwwXVxyXG4gICAgICBdXHJcbiAgICBdXHJcbiAgfSxcclxuICBKOiB7XHJcbiAgICBuYW1lOiAnSicsXHJcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fSixcclxuICAgIHNpemU6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDAsMF0sXHJcbiAgICAgICAgWzEsMSwxXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDFdLFxyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDAsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMSwxLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG4gIEw6IHtcclxuICAgIG5hbWU6ICdMJyxcclxuICAgIGNvbG9yOiBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19MLFxyXG4gICAgc2l6ZTogMyxcclxuICAgIHNoYXBlczogW1xyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwxXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDAsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMCwxLDFdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMV0sXHJcbiAgICAgICAgWzEsMCwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMF1cclxuICAgICAgXVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgTzoge1xyXG4gICAgbmFtZTogJ08nLFxyXG4gICAgY29sb3I6IENvbnN0YW50cy5DT0xPUlMuVEVUUk9NSU5PX08sXHJcbiAgICBzaXplOiAyLFxyXG4gICAgc2hhcGVzOiBbXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwxXSxcclxuICAgICAgICBbMSwxXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzEsMV0sXHJcbiAgICAgICAgWzEsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDFdLFxyXG4gICAgICAgIFsxLDFdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwxXSxcclxuICAgICAgICBbMSwxXVxyXG4gICAgICBdXHJcbiAgICBdXHJcbiAgfSxcclxuICBTOiB7XHJcbiAgICBuYW1lOiAnUycsXHJcbiAgICBjb2xvcjogQ29uc3RhbnRzLkNPTE9SUy5URVRST01JTk9fUyxcclxuICAgIHNpemU6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMCwxXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMCwxLDFdLFxyXG4gICAgICAgIFsxLDEsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDAsMF0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwxLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG4gIFQ6IHtcclxuICAgIG5hbWU6ICdUJyxcclxuICAgIGNvbG9yOiBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19ULFxyXG4gICAgc2l6ZSA6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwxXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDEsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwxLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG4gIFo6IHtcclxuICAgIG5hbWU6ICdaJyxcclxuICAgIGNvbG9yOiBDb25zdGFudHMuQ09MT1JTLlRFVFJPTUlOT19aLFxyXG4gICAgc2l6ZSA6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDEsMF0sXHJcbiAgICAgICAgWzAsMSwxXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDFdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMSwxLDBdLFxyXG4gICAgICAgIFswLDEsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMSwwLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9XHJcbn07XHJcbiIsImltcG9ydCBHYW1lIGZyb20gJy4vR2FtZSc7XHJcblxyXG52YXIgZyA9IG5ldyBHYW1lKCk7XHJcbiJdfQ==
