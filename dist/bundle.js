(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Game constants
 */
exports.default = {
  WIDTH: 12, // Width of the game (in number of blocks)
  HEIGHT: 24, // Height of the game (in number of blocks)
  SQUARE_SIZE: 25 // Width and height of a block (in px)
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
    var _this = this;

    _classCallCheck(this, Game);

    console.log(PIXI);

    // Keyboard events
    var leftKey = this._keyboard(37);
    var upKey = this._keyboard(38);
    var rightKey = this._keyboard(39);
    var downKey = this._keyboard(40);
    leftKey.press = function () {
      return _this._pressLeft();
    };
    upKey.press = function () {
      return _this._pressUp();
    };
    rightKey.press = function () {
      return _this._pressRight();
    };
    downKey.press = function () {
      return _this._pressDown();
    };

    // Set up PIXI and launch game
    this.renderer = PIXI.autoDetectRenderer(_Constants2.default.WIDTH * _Constants2.default.SQUARE_SIZE, _Constants2.default.HEIGHT * _Constants2.default.SQUARE_SIZE);
    document.body.appendChild(this.renderer.view);

    // Pixi container
    this.container = new PIXI.Container();

    // Game board/stage
    this.stage = new _Stage2.default(this.container);

    // Current moving tetromino
    this.tetromino = _Tetromino2.default.getRandom(this.container);

    // Delay between moves
    this.delay = 300;

    // GO!
    this._start();
  }

  /**
   * Start the game
   */

  _createClass(Game, [{
    key: '_start',
    value: function _start() {
      var self = this;
      var timer = new Date().getTime();
      function loop() {
        // Event loop
        if (new Date().getTime() - timer > self.delay) {
          timer = new Date().getTime();
          self.tetromino.move(0, 1); // Gravity
          // If collision, cancel  move and unite the tetromino with the game stage
          if (self.stage.isCollision(self.tetromino)) {
            self.tetromino.move(0, -1);
            self.stage.unite(self.tetromino);
            self.tetromino = _Tetromino2.default.getRandom(self.container);
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

  }, {
    key: '_pressLeft',
    value: function _pressLeft() {
      this.tetromino.move(-1, 0);
      if (this.stage.isCollision(this.tetromino)) {
        this.tetromino.move(1, 0);
      }
      this._render();
    }

    /**
     * "Press right" event
     */

  }, {
    key: '_pressRight',
    value: function _pressRight() {
      this.tetromino.move(1, 0);
      if (this.stage.isCollision(this.tetromino)) {
        this.tetromino.move(-1, 0);
      }
      this._render();
    }

    /**
     * "Press up" event
     */

  }, {
    key: '_pressUp',
    value: function _pressUp() {
      this.tetromino.rotate();
      if (this.stage.isCollision(this.tetromino)) {
        this.tetromino.antiRotate();
      }
      this._render();
    }

    /**
     * "Press down" event
     */

  }, {
    key: '_pressDown',
    value: function _pressDown() {
      this.tetromino.move(0, 1);
      if (this.stage.isCollision(this.tetromino)) {
        this.tetromino.move(0, -1);
        this.stage.unite(this.tetromino);
        this.tetromino = _Tetromino2.default.getRandom(this.container);
      }
      this._render();
    }

    /**
     * Render function
     */

  }, {
    key: '_render',
    value: function _render() {
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
        }
        event.preventDefault();
      };

      //The `upHandler`
      key.upHandler = function (event) {
        if (event.keyCode === key.code) {
          if (key.isDown && key.release) key.release();
          key.isDown = false;
          key.isUp = true;
        }
        event.preventDefault();
      };

      //Attach event listeners
      window.addEventListener("keydown", key.downHandler.bind(key), false);
      window.addEventListener("keyup", key.upHandler.bind(key), false);
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
            square.lineStyle(2, 0x0, 1);
            square.beginFill(this._data[x][y]);
            square.drawRect(0, 0, _Constants2.default.SQUARE_SIZE, _Constants2.default.SQUARE_SIZE);
            square.endFill();
            square.x = x * _Constants2.default.SQUARE_SIZE;
            square.y = y * _Constants2.default.SQUARE_SIZE;
            this._container.addChild(square);
          } else {
            // Just a white dot in the middle if empty
            var dot = new PIXI.Graphics();
            dot.beginFill(0xffffff);
            dot.drawRect(0, 0, 1, 1);
            dot.x = x * _Constants2.default.SQUARE_SIZE + 0.5 * _Constants2.default.SQUARE_SIZE;
            dot.y = y * _Constants2.default.SQUARE_SIZE + 0.5 * _Constants2.default.SQUARE_SIZE;
            this._container.addChild(dot);
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
            square.lineStyle(2, 0x0, 1);
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
    color: 0xFF8000, // Background color
    size: 4, // Size of the 'container' of the tetromino
    shapes: [// All shapes of the tetromino (one per rotation position)
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]], [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]]
  },
  J: {
    name: 'J',
    color: 0x00ffff,
    size: 3,
    shapes: [[[1, 0, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 1], [0, 1, 0], [0, 1, 0]], [[0, 0, 0], [1, 1, 1], [0, 0, 1]], [[0, 1, 0], [0, 1, 0], [1, 1, 0]]]
  },
  L: {
    name: 'L',
    color: 0xFF0000,
    size: 3,
    shapes: [[[0, 0, 1], [1, 1, 1], [0, 0, 0]], [[0, 1, 0], [0, 1, 0], [0, 1, 1]], [[0, 0, 0], [1, 1, 1], [1, 0, 0]], [[1, 1, 0], [0, 1, 0], [0, 1, 0]]]
  },
  O: {
    name: '0',
    color: 0xFFFF00,
    size: 2,
    shapes: [[[1, 1], [1, 1]], [[1, 1], [1, 1]], [[1, 1], [1, 1]], [[1, 1], [1, 1]]]
  },
  S: {
    name: 'S',
    color: 0xFF00FF,
    size: 3,
    shapes: [[[0, 1, 1], [1, 1, 0], [0, 0, 0]], [[0, 1, 0], [0, 1, 1], [0, 0, 1]], [[0, 0, 0], [0, 1, 1], [1, 1, 0]], [[1, 0, 0], [1, 1, 0], [0, 1, 0]]]
  },
  T: {
    name: 'T',
    color: 0x80FF00,
    size: 3,
    shapes: [[[0, 1, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 0], [0, 1, 1], [0, 1, 0]], [[0, 0, 0], [1, 1, 1], [0, 1, 0]], [[0, 1, 0], [1, 1, 0], [0, 1, 0]]]
  },
  Z: {
    name: 'Z',
    color: 0xFFC000,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXENvbnN0YW50cy5qcyIsInNyY1xcR2FtZS5qcyIsInNyY1xcU3RhZ2UuanMiLCJzcmNcXFRldHJvbWluby5qcyIsInNyY1xcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztrQkNHZTtBQUNiLE9BQUssRUFBRSxFQUFFO0FBQ1QsUUFBTSxFQUFFLEVBQUU7QUFDVixhQUFXLEVBQUUsRUFBRTtBQUFBLENBQ2hCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNGb0IsSUFBSTtBQUN2QixXQURtQixJQUFJLEdBQ1Q7OzswQkFESyxJQUFJOztBQUVyQixXQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQzs7O0FBQUMsQUFHbEIsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqQyxRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQy9CLFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbEMsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqQyxXQUFPLENBQUMsS0FBSyxHQUFHO2FBQU0sTUFBSyxVQUFVLEVBQUU7S0FBQSxDQUFDO0FBQ3hDLFNBQUssQ0FBQyxLQUFLLEdBQUc7YUFBTSxNQUFLLFFBQVEsRUFBRTtLQUFBLENBQUM7QUFDcEMsWUFBUSxDQUFDLEtBQUssR0FBRzthQUFNLE1BQUssV0FBVyxFQUFFO0tBQUEsQ0FBQztBQUMxQyxXQUFPLENBQUMsS0FBSyxHQUFHO2FBQU0sTUFBSyxVQUFVLEVBQUU7S0FBQTs7O0FBQUMsQUFHeEMsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsb0JBQVUsS0FBSyxHQUFHLG9CQUFV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RUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxRQUFRO0FBQ2YsUUFBSSxFQUFFLENBQUM7QUFDUCxVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLFFBQVE7QUFDZixRQUFJLEVBQUUsQ0FBQztBQUNQLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsUUFBUTtBQUNmLFFBQUksRUFBRSxDQUFDO0FBQ1AsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDTCxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDTixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ0wsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ04sRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNMLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNOLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDTCxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDTixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxRQUFRO0FBQ2YsUUFBSSxFQUFFLENBQUM7QUFDUCxVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLFFBQVE7QUFDZixRQUFJLEVBQUcsQ0FBQztBQUNSLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsUUFBUTtBQUNmLFFBQUksRUFBRyxDQUFDO0FBQ1IsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixDQUNGO0dBQ0Y7Q0FDRixDQUFDOzs7Ozs7Ozs7OztBQ3JSRixJQUFJLENBQUMsR0FBRyxvQkFBVSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBHYW1lIGNvbnN0YW50c1xyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIFdJRFRIOiAxMiwgLy8gV2lkdGggb2YgdGhlIGdhbWUgKGluIG51bWJlciBvZiBibG9ja3MpXHJcbiAgSEVJR0hUOiAyNCwgLy8gSGVpZ2h0IG9mIHRoZSBnYW1lIChpbiBudW1iZXIgb2YgYmxvY2tzKVxyXG4gIFNRVUFSRV9TSVpFOiAyNSAvLyBXaWR0aCBhbmQgaGVpZ2h0IG9mIGEgYmxvY2sgKGluIHB4KVxyXG59O1xyXG4iLCJpbXBvcnQgVGV0cm9taW5vIGZyb20gJy4vVGV0cm9taW5vJztcclxuaW1wb3J0IHtUeXBlc30gZnJvbSAnLi9UZXRyb21pbm8nO1xyXG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcclxuaW1wb3J0IFN0YWdlIGZyb20gJy4vU3RhZ2UnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhQSVhJKTtcclxuXHJcbiAgICAvLyBLZXlib2FyZCBldmVudHNcclxuICAgIHZhciBsZWZ0S2V5ID0gdGhpcy5fa2V5Ym9hcmQoMzcpO1xyXG4gICAgdmFyIHVwS2V5ID0gdGhpcy5fa2V5Ym9hcmQoMzgpO1xyXG4gICAgdmFyIHJpZ2h0S2V5ID0gdGhpcy5fa2V5Ym9hcmQoMzkpO1xyXG4gICAgdmFyIGRvd25LZXkgPSB0aGlzLl9rZXlib2FyZCg0MCk7XHJcbiAgICBsZWZ0S2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcHJlc3NMZWZ0KCk7XHJcbiAgICB1cEtleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzVXAoKTtcclxuICAgIHJpZ2h0S2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcHJlc3NSaWdodCgpO1xyXG4gICAgZG93bktleS5wcmVzcyA9ICgpID0+IHRoaXMuX3ByZXNzRG93bigpO1xyXG4gICAgIFxyXG4gICAgLy8gU2V0IHVwIFBJWEkgYW5kIGxhdW5jaCBnYW1lXHJcbiAgICB0aGlzLnJlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIoQ29uc3RhbnRzLldJRFRIICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFLCBDb25zdGFudHMuSEVJR0hUICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFKTtcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5yZW5kZXJlci52aWV3KTtcclxuXHJcbiAgICAvLyBQaXhpIGNvbnRhaW5lclxyXG4gICAgdGhpcy5jb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcclxuXHJcbiAgICAvLyBHYW1lIGJvYXJkL3N0YWdlXHJcbiAgICB0aGlzLnN0YWdlID0gbmV3IFN0YWdlKHRoaXMuY29udGFpbmVyKTsgXHJcblxyXG4gICAgLy8gQ3VycmVudCBtb3ZpbmcgdGV0cm9taW5vXHJcbiAgICB0aGlzLnRldHJvbWlubyA9IFRldHJvbWluby5nZXRSYW5kb20odGhpcy5jb250YWluZXIpO1xyXG5cclxuICAgIC8vIERlbGF5IGJldHdlZW4gbW92ZXNcclxuICAgIHRoaXMuZGVsYXkgPSAzMDA7XHJcblxyXG4gICAgLy8gR08hXHJcbiAgICB0aGlzLl9zdGFydCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhcnQgdGhlIGdhbWVcclxuICAgKi9cclxuICBfc3RhcnQoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICB2YXIgdGltZXIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgIGZ1bmN0aW9uIGxvb3AoKSB7IC8vIEV2ZW50IGxvb3BcclxuICAgICAgaWYgKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGltZXIgPiBzZWxmLmRlbGF5KSB7XHJcbiAgICAgICAgdGltZXIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICBzZWxmLnRldHJvbWluby5tb3ZlKDAsIDEpOyAvLyBHcmF2aXR5XHJcbiAgICAgICAgLy8gSWYgY29sbGlzaW9uLCBjYW5jZWwgIG1vdmUgYW5kIHVuaXRlIHRoZSB0ZXRyb21pbm8gd2l0aCB0aGUgZ2FtZSBzdGFnZVxyXG4gICAgICAgIGlmIChzZWxmLnN0YWdlLmlzQ29sbGlzaW9uKHNlbGYudGV0cm9taW5vKSkgeyBcclxuICAgICAgICAgIHNlbGYudGV0cm9taW5vLm1vdmUoMCwgLTEpO1xyXG4gICAgICAgICAgc2VsZi5zdGFnZS51bml0ZShzZWxmLnRldHJvbWlubyk7XHJcbiAgICAgICAgICBzZWxmLnRldHJvbWlubyA9IFRldHJvbWluby5nZXRSYW5kb20oc2VsZi5jb250YWluZXIpO1xyXG4gICAgICAgICAgLy8gTG9zZSEgUmVzdGFydFxyXG4gICAgICAgICAgaWYgKHNlbGYuc3RhZ2UuaXNDb2xsaXNpb24oc2VsZi50ZXRyb21pbm8pKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc3RhZ2UucmVzZXQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgc2VsZi5fcmVuZGVyKCk7IC8vIFJlbmRlclxyXG4gICAgICB9XHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcclxuICAgIH1cclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiUHJlc3MgbGVmdFwiIGV2ZW50XHJcbiAgICovXHJcbiAgX3ByZXNzTGVmdCgpIHtcclxuICAgIHRoaXMudGV0cm9taW5vLm1vdmUoLTEsIDApO1xyXG4gICAgaWYgKHRoaXMuc3RhZ2UuaXNDb2xsaXNpb24odGhpcy50ZXRyb21pbm8pKSB7XHJcbiAgICAgIHRoaXMudGV0cm9taW5vLm1vdmUoMSwgMCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9yZW5kZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiUHJlc3MgcmlnaHRcIiBldmVudFxyXG4gICAqL1xyXG4gIF9wcmVzc1JpZ2h0KCkge1xyXG4gICAgdGhpcy50ZXRyb21pbm8ubW92ZSgxLCAwKTtcclxuICAgIGlmICh0aGlzLnN0YWdlLmlzQ29sbGlzaW9uKHRoaXMudGV0cm9taW5vKSkge1xyXG4gICAgICB0aGlzLnRldHJvbWluby5tb3ZlKC0xLCAwKTtcclxuICAgIH1cclxuICAgIHRoaXMuX3JlbmRlcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogXCJQcmVzcyB1cFwiIGV2ZW50XHJcbiAgICovXHJcbiAgX3ByZXNzVXAoKSB7XHJcbiAgICB0aGlzLnRldHJvbWluby5yb3RhdGUoKTtcclxuICAgIGlmICh0aGlzLnN0YWdlLmlzQ29sbGlzaW9uKHRoaXMudGV0cm9taW5vKSkge1xyXG4gICAgICB0aGlzLnRldHJvbWluby5hbnRpUm90YXRlKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9yZW5kZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiUHJlc3MgZG93blwiIGV2ZW50XHJcbiAgICovXHJcbiAgX3ByZXNzRG93bigpIHtcclxuICAgIHRoaXMudGV0cm9taW5vLm1vdmUoMCwgMSk7XHJcbiAgICBpZiAodGhpcy5zdGFnZS5pc0NvbGxpc2lvbih0aGlzLnRldHJvbWlubykpIHtcclxuICAgICAgdGhpcy50ZXRyb21pbm8ubW92ZSgwLCAtMSk7XHJcbiAgICAgIHRoaXMuc3RhZ2UudW5pdGUodGhpcy50ZXRyb21pbm8pO1xyXG4gICAgICB0aGlzLnRldHJvbWlubyA9IFRldHJvbWluby5nZXRSYW5kb20odGhpcy5jb250YWluZXIpOyBcclxuICAgIH1cclxuICAgIHRoaXMuX3JlbmRlcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVuZGVyIGZ1bmN0aW9uXHJcbiAgICovXHJcbiAgX3JlbmRlcigpIHtcclxuICAgIC8vIFJlbW92ZSBldmVyeXRoaW5nIGZyb20gdGhlIGNvbnRhaW5lciwgcmVkcmF3IHN0YWdlIGFuZCB0ZXRyb21pbm8gYW5kIHJlbmRlclxyXG4gICAgLy8gVE9ETyA6IGRvIG5vdCByZW1vdmUgYW5kIHJlZHJhdyBhdCBldmVyeSBtb3ZlXHJcbiAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVDaGlsZHJlbigpO1xyXG4gICAgdGhpcy5zdGFnZS5kcmF3KCk7XHJcbiAgICB0aGlzLnRldHJvbWluby5kcmF3KCk7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLmNvbnRhaW5lcik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBLZXlib2FyZCBldmVudHMgaGVscGVyXHJcbiAgICovXHJcbiAgX2tleWJvYXJkKGtleUNvZGUpIHtcclxuICAgIHZhciBrZXkgPSB7fTtcclxuICAgIGtleS5jb2RlID0ga2V5Q29kZTtcclxuICAgIGtleS5pc0Rvd24gPSBmYWxzZTtcclxuICAgIGtleS5pc1VwID0gdHJ1ZTtcclxuICAgIGtleS5wcmVzcyA9IHVuZGVmaW5lZDtcclxuICAgIGtleS5yZWxlYXNlID0gdW5kZWZpbmVkO1xyXG4gICAgLy9UaGUgYGRvd25IYW5kbGVyYFxyXG4gICAga2V5LmRvd25IYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XHJcbiAgICAgICAgaWYgKGtleS5pc1VwICYmIGtleS5wcmVzcykga2V5LnByZXNzKCk7XHJcbiAgICAgICAga2V5LmlzRG93biA9IHRydWU7XHJcbiAgICAgICAga2V5LmlzVXAgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvL1RoZSBgdXBIYW5kbGVyYFxyXG4gICAga2V5LnVwSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSBrZXkuY29kZSkge1xyXG4gICAgICAgIGlmIChrZXkuaXNEb3duICYmIGtleS5yZWxlYXNlKSBrZXkucmVsZWFzZSgpO1xyXG4gICAgICAgIGtleS5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBrZXkuaXNVcCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH07XHJcblxyXG4gICAgLy9BdHRhY2ggZXZlbnQgbGlzdGVuZXJzXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgXCJrZXlkb3duXCIsIGtleS5kb3duSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXHJcbiAgICApO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgIFwia2V5dXBcIiwga2V5LnVwSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIGtleTtcclxuICB9XHJcblxyXG59XHJcbiIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMnO1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudCB0aGUgZ2FtZSBzdGFnZVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhZ2Uge1xyXG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lcikge1xyXG4gICAgLy8gU2V0IHRoZSBjb250YWluZXJcclxuICAgIHRoaXMuX2NvbnRhaW5lciA9IGNvbnRhaW5lcjtcclxuXHJcbiAgICAvLyBfZGF0YSByZXByZXNlbnRzIHRoZSBzdGF0ZSBvZiBldmVyeSBibG9jayBvZiB0aGUgc3RhZ2VcclxuICAgIC8vIDAgZm9yIFwiZW1wdHlcIiwgaGV4YSBjb2RlIGNvbG9yIGlmIG5vdFxyXG4gICAgLy8gV2UgaW5pdGlhbGl6ZSBpdCB3aXRoIHplcm9zXHJcbiAgICB0aGlzLl9kYXRhID0gW107XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IENvbnN0YW50cy5XSURUSDsgeCsrKSB7XHJcbiAgICAgIHRoaXMuX2RhdGEucHVzaChbXSk7XHJcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgQ29uc3RhbnRzLkhFSUdIVDsgeSsrKSB7XHJcbiAgICAgICAgdGhpcy5fZGF0YVt4XS5wdXNoKDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgc2hhcGVzIHRvIHRoZSBfY29udGFpbmVyXHJcbiAgICovXHJcbiAgZHJhdygpIHtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcclxuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBDb25zdGFudHMuSEVJR0hUOyB5KyspIHtcclxuICAgICAgICAvLyBDb2xvciBibG9ja3Mgd2hlbiBub3QgZW1wdHlcclxuICAgICAgICBpZiAodGhpcy5fZGF0YVt4XVt5XSAhPT0gMCkge1xyXG4gICAgICAgICAgdmFyIHNxdWFyZSA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XHJcbiAgICAgICAgICBzcXVhcmUubGluZVN0eWxlKDIsIDB4MCwgMSk7XHJcbiAgICAgICAgICBzcXVhcmUuYmVnaW5GaWxsKHRoaXMuX2RhdGFbeF1beV0pO1xyXG4gICAgICAgICAgc3F1YXJlLmRyYXdSZWN0KDAsIDAsIENvbnN0YW50cy5TUVVBUkVfU0laRSwgQ29uc3RhbnRzLlNRVUFSRV9TSVpFKTtcclxuICAgICAgICAgIHNxdWFyZS5lbmRGaWxsKCk7XHJcbiAgICAgICAgICBzcXVhcmUueCA9IHggKiBDb25zdGFudHMuU1FVQVJFX1NJWkU7XHJcbiAgICAgICAgICBzcXVhcmUueSA9IHkgKiBDb25zdGFudHMuU1FVQVJFX1NJWkU7XHJcbiAgICAgICAgICB0aGlzLl9jb250YWluZXIuYWRkQ2hpbGQoc3F1YXJlKTtcclxuICAgICAgICB9IGVsc2UgeyAvLyBKdXN0IGEgd2hpdGUgZG90IGluIHRoZSBtaWRkbGUgaWYgZW1wdHlcclxuICAgICAgICAgIHZhciBkb3QgPSBuZXcgUElYSS5HcmFwaGljcygpO1xyXG4gICAgICAgICAgZG90LmJlZ2luRmlsbCgweGZmZmZmZik7XHJcbiAgICAgICAgICBkb3QuZHJhd1JlY3QoMCwgMCwgMSwgMSk7XHJcbiAgICAgICAgICBkb3QueCA9ICh4KSAqIENvbnN0YW50cy5TUVVBUkVfU0laRSArIDAuNSAqIENvbnN0YW50cy5TUVVBUkVfU0laRTtcclxuICAgICAgICAgIGRvdC55ID0gKHkpICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFICsgMC41ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xyXG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLmFkZENoaWxkKGRvdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBpZiAndGV0cm9taW5vJyBpcyBpbiBjb2xsaXNpb24gd2l0aCB0aGUgc3RhZ2VcclxuICAgKi9cclxuICBpc0NvbGxpc2lvbih0ZXRyb21pbm8pIHtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeCsrKSB7XHJcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeSsrKSB7ICAgICAgICBcclxuICAgICAgICBpZiAodGV0cm9taW5vLnggKyB4IDwgMCB8fCB0ZXRyb21pbm8ueCArIHggPj0gQ29uc3RhbnRzLldJRFRIIHx8IHkgPj0gQ29uc3RhbnRzLkhFSUdIVCB8fCB0ZXRyb21pbm8ueSA+PSAwICYmIHRoaXMuX2RhdGFbdGV0cm9taW5vLnggKyB4XVt0ZXRyb21pbm8ueSArIHldICE9PSAwKSB7XHJcbiAgICAgICAgICBpZiAodGV0cm9taW5vLmhhc0Jsb2NrKHgsIHkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfSAgXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdXNpb24gJ3RldHJvbWlubycgd2l0aCB0aGUgc3RhZ2VcclxuICAgKiBJZiB0aGUgZnVzaW9uIGNyZWF0ZSBhIGxpbmUsIHdlIGVyYXNlIHRoZSBsaW5lXHJcbiAgICovXHJcbiAgdW5pdGUodGV0cm9taW5vKSB7XHJcbiAgICAvLyBGdXNpb24gdGhlIHRldHJvbWlubyB3aXRoIHRoZSBzdGFnZVxyXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0ZXRyb21pbm8udHlwZS5zaXplOyB5KyspIHtcclxuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0ZXRyb21pbm8udHlwZS5zaXplOyB4KyspIHtcclxuICAgICAgICBpZiAodGV0cm9taW5vLnggKyB4IDwgQ29uc3RhbnRzLldJRFRIICYmIHRldHJvbWluby54ICsgeCA+PSAwICYmIHRldHJvbWluby5oYXNCbG9jayh4LCB5KSkge1xyXG4gICAgICAgICAgdGhpcy5fZGF0YVt0ZXRyb21pbm8ueCArIHhdW3RldHJvbWluby55ICsgeV0gPSB0ZXRyb21pbm8udHlwZS5jb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRldHJvbWluby50eXBlLnNpemU7IHkrKykge1xyXG4gICAgICAvLyBDaGVjayBpZiB0aGUgZnVzaW9uIGNyZWF0ZWQgYSBuZXcgbGluZVxyXG4gICAgICB2YXIgZXJhc2VMaW5lID0gdHJ1ZTtcclxuICAgICAgaWYgKHkgKyB0ZXRyb21pbm8ueSA+PSBDb25zdGFudHMuSEVJR0hUKSB7XHJcbiAgICAgICAgZXJhc2VMaW5lID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcclxuICAgICAgICAgIGlmICh0aGlzLl9kYXRhW3hdW3kgKyB0ZXRyb21pbm8ueV0gPT09IDApIHtcclxuICAgICAgICAgICAgZXJhc2VMaW5lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyBJZiB5ZXMsIHdlIGVyYXNlIGl0IGFuZCBtb3ZlIGFsbCBjb25jZXJuZWQgYmxvY2tzXHJcbiAgICAgIGlmIChlcmFzZUxpbmUpIHtcclxuICAgICAgICBmb3IgKGxldCB5eSA9IHkgKyB0ZXRyb21pbm8ueTsgeXkgPj0gMDsgeXktLSkge1xyXG4gICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBDb25zdGFudHMuV0lEVEg7IHgrKykge1xyXG4gICAgICAgICAgICBpZiAoeXkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fZGF0YVt4XVt5eV0gPSB0aGlzLl9kYXRhW3hdW3l5LTFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2RhdGFbeF1beXldID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdGhlIHN0YWdlXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLl9kYXRhID0gW107XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IENvbnN0YW50cy5XSURUSDsgeCsrKSB7XHJcbiAgICAgIHRoaXMuX2RhdGEucHVzaChbXSk7XHJcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgQ29uc3RhbnRzLkhFSUdIVDsgeSsrKSB7XHJcbiAgICAgICAgdGhpcy5fZGF0YVt4XS5wdXNoKDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCBDb25zdGFudHMgZnJvbSAnLi9Db25zdGFudHMnO1xyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSB0ZXRyb21pbm9cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRldHJvbWlubyB7XHJcbiAgY29uc3RydWN0b3IodHlwZSwgY29udGFpbmVyKSB7XHJcbiAgICAvLyBTZXQgdGhlIGNvbnRhaW5lclxyXG4gICAgdGhpcy5fY29udGFpbmVyID0gY29udGFpbmVyO1xyXG4gICAgXHJcbiAgICAvLyBUeXBlIG9mIHRoZSB0ZXRyb21pbm8gKEksIEosIEwsIE8sIFMsIFQsIFopXHJcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG5cclxuICAgIC8vIFBvc2l0aW9uIG9mIHRoZSB0ZXRyb21pbm9cclxuICAgIHRoaXMueCA9IE1hdGguZmxvb3IoQ29uc3RhbnRzLldJRFRIIC8gMiAtIHRoaXMudHlwZS5zaXplIC8gMik7XHJcbiAgICB0aGlzLnkgPSAwO1xyXG5cclxuICAgIC8vIEFuZ2xlIG9mIHRoZSB0ZXRyb21pbm8gKDA6IDBkZWcsIDE6IDkwZGVnLCAyOiAxODBkZWcsIDM6IDI3MGRlZylcclxuICAgIHRoaXMuYW5nbGUgPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhdGljIG1ldGhvZCB0byBnZXQgYSByYW5kb20gdGV0cm9taW5vXHJcbiAgICovXHJcbiAgc3RhdGljIGdldFJhbmRvbShjb250YWluZXIpIHtcclxuICAgIHZhciB0eXBlcyA9IFtUeXBlcy5JLCBUeXBlcy5KLCBUeXBlcy5MLCBUeXBlcy5PLCBUeXBlcy5TLCBUeXBlcy5ULCBUeXBlcy5aXTtcclxuICAgIHZhciB0eXBlID0gdHlwZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNyldO1xyXG4gICAgcmV0dXJuIG5ldyBUZXRyb21pbm8odHlwZSwgY29udGFpbmVyKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBzaGFwZXMgdG8gX2NvbnRhaW5lclxyXG4gICAqL1xyXG4gIGRyYXcoKSB7XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMudHlwZS5zaXplOyB4KyspIHtcclxuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLnR5cGUuc2l6ZTsgeSsrKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudHlwZS5zaGFwZXNbdGhpcy5hbmdsZV1beV1beF0gPT09IDEpIHtcclxuICAgICAgICAgIHZhciBzcXVhcmUgPSBuZXcgUElYSS5HcmFwaGljcygpO1xyXG4gICAgICAgICAgc3F1YXJlLmxpbmVTdHlsZSgyLCAweDAsIDEpO1xyXG4gICAgICAgICAgc3F1YXJlLmJlZ2luRmlsbCh0aGlzLnR5cGUuY29sb3IpO1xyXG4gICAgICAgICAgc3F1YXJlLmRyYXdSZWN0KDAsIDAsIENvbnN0YW50cy5TUVVBUkVfU0laRSwgQ29uc3RhbnRzLlNRVUFSRV9TSVpFKTtcclxuICAgICAgICAgIHNxdWFyZS5lbmRGaWxsKCk7XHJcbiAgICAgICAgICBzcXVhcmUueCA9ICh0aGlzLnggKyB4KSAqIENvbnN0YW50cy5TUVVBUkVfU0laRTtcclxuICAgICAgICAgIHNxdWFyZS55ID0gKHRoaXMueSArIHkpICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xyXG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLmFkZENoaWxkKHNxdWFyZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSb3RhdGUgdGhlIHRldHJvbWlubyB0byB0aGUgcmlnaHRcclxuICAgKi9cclxuICByb3RhdGUoKSB7XHJcbiAgICB0aGlzLmFuZ2xlICs9IDE7XHJcbiAgICB0aGlzLmFuZ2xlICU9IDQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSb3RhdGUgdGhlIHRldHJvbWlubyB0byB0aGUgbGVmdFxyXG4gICAqL1xyXG4gIGFudGlSb3RhdGUoKSB7XHJcbiAgICB0aGlzLmFuZ2xlIC09IDE7XHJcbiAgICBpZiAodGhpcy5hbmdsZSA9PT0gLTEpIHtcclxuICAgICAgdGhpcy5hbmdsZSA9IDM7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlIHRoZSB0ZXRyb21pbm9cclxuICAgKi9cclxuICBtb3ZlKGR4LCBkeSkge1xyXG4gICAgdGhpcy54ICs9IGR4O1xyXG4gICAgdGhpcy55ICs9IGR5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGVzdCBpZiB0aGUgdGV0cm9taW5vIGhhcyBhIGJsb2NrIGluIHRoZSBwb3NpdGlubyAoeCwgeSlcclxuICAgKiB4IGFuZCB5IGJlaW5nIHJlbGF0aXZlIHRoZSB0aGUgcG9zaXRpb24gb2YgdGhlIHRldHJvbWlub1xyXG4gICAqL1xyXG4gIGhhc0Jsb2NrKHgsIHkpIHtcclxuICAgIHJldHVybiB0aGlzLnR5cGUuc2hhcGVzW3RoaXMuYW5nbGVdW3ldW3hdID09PSAxO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUeXBlcyBvZiB0ZXRyb21pbm9zXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgVHlwZXMgPSB7XHJcbiAgSToge1xyXG4gICAgbmFtZTogJ0knLCAvLyBOYW1lIG9mIHRoZSB0ZXRyb21pbm9cclxuICAgIGNvbG9yOiAweEZGODAwMCwgLy8gQmFja2dyb3VuZCBjb2xvclxyXG4gICAgc2l6ZTogNCwgLy8gU2l6ZSBvZiB0aGUgJ2NvbnRhaW5lcicgb2YgdGhlIHRldHJvbWlub1xyXG4gICAgc2hhcGVzOiBbIC8vIEFsbCBzaGFwZXMgb2YgdGhlIHRldHJvbWlubyAob25lIHBlciByb3RhdGlvbiBwb3NpdGlvbilcclxuICAgICAgW1xyXG4gICAgICAgIFswLDAsMCwwXSxcclxuICAgICAgICBbMSwxLDEsMV0sXHJcbiAgICAgICAgWzAsMCwwLDBdLFxyXG4gICAgICAgIFswLDAsMCwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwxLDBdLFxyXG4gICAgICAgIFswLDAsMSwwXSxcclxuICAgICAgICBbMCwwLDEsMF0sXHJcbiAgICAgICAgWzAsMCwxLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDAsMF0sXHJcbiAgICAgICAgWzAsMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMSwxXSxcclxuICAgICAgICBbMCwwLDAsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMCwwXSxcclxuICAgICAgICBbMCwxLDAsMF0sXHJcbiAgICAgICAgWzAsMSwwLDBdLFxyXG4gICAgICAgIFswLDEsMCwwXVxyXG4gICAgICBdXHJcbiAgICBdXHJcbiAgfSxcclxuICBKOiB7XHJcbiAgICBuYW1lOiAnSicsXHJcbiAgICBjb2xvcjogMHgwMGZmZmYsXHJcbiAgICBzaXplOiAzLFxyXG4gICAgc2hhcGVzOiBbXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwwLDBdLFxyXG4gICAgICAgIFsxLDEsMV0sXHJcbiAgICAgICAgWzAsMCwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMSwxXSxcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDAsMF0sXHJcbiAgICAgICAgWzEsMSwxXSxcclxuICAgICAgICBbMCwwLDFdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwwXVxyXG4gICAgICBdXHJcbiAgICBdXHJcbiAgfSxcclxuICBMOiB7XHJcbiAgICBuYW1lOiAnTCcsXHJcbiAgICBjb2xvcjogMHhGRjAwMDAsXHJcbiAgICBzaXplOiAzLFxyXG4gICAgc2hhcGVzOiBbXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDFdLFxyXG4gICAgICAgIFsxLDEsMV0sXHJcbiAgICAgICAgWzAsMCwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDAsMF0sXHJcbiAgICAgICAgWzEsMSwxXSxcclxuICAgICAgICBbMSwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwxLDBdLFxyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdXHJcbiAgICBdXHJcbiAgfSxcclxuICBPOiB7XHJcbiAgICBuYW1lOiAnMCcsXHJcbiAgICBjb2xvcjogMHhGRkZGMDAsXHJcbiAgICBzaXplOiAyLFxyXG4gICAgc2hhcGVzOiBbXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwxXSxcclxuICAgICAgICBbMSwxXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzEsMV0sXHJcbiAgICAgICAgWzEsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDFdLFxyXG4gICAgICAgIFsxLDFdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwxXSxcclxuICAgICAgICBbMSwxXVxyXG4gICAgICBdXHJcbiAgICBdXHJcbiAgfSxcclxuICBTOiB7XHJcbiAgICBuYW1lOiAnUycsXHJcbiAgICBjb2xvcjogMHhGRjAwRkYsXHJcbiAgICBzaXplOiAzLFxyXG4gICAgc2hhcGVzOiBbXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDFdLFxyXG4gICAgICAgIFsxLDEsMF0sXHJcbiAgICAgICAgWzAsMCwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMCwxLDFdLFxyXG4gICAgICAgIFswLDAsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDAsMF0sXHJcbiAgICAgICAgWzAsMSwxXSxcclxuICAgICAgICBbMSwxLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwwLDBdLFxyXG4gICAgICAgIFsxLDEsMF0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdXHJcbiAgICBdXHJcbiAgfSxcclxuICBUOiB7XHJcbiAgICBuYW1lOiAnVCcsXHJcbiAgICBjb2xvcjogMHg4MEZGMDAsXHJcbiAgICBzaXplIDogMyxcclxuICAgIHNoYXBlczogW1xyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDAsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwxXSxcclxuICAgICAgICBbMCwxLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMV0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMSwxLDBdLFxyXG4gICAgICAgIFswLDEsMF1cclxuICAgICAgXVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgWjoge1xyXG4gICAgbmFtZTogJ1onLFxyXG4gICAgY29sb3I6IDB4RkZDMDAwLFxyXG4gICAgc2l6ZSA6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDEsMF0sXHJcbiAgICAgICAgWzAsMSwxXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDFdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMSwxLDBdLFxyXG4gICAgICAgIFswLDEsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMSwwLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9XHJcbn07XHJcbiIsImltcG9ydCBHYW1lIGZyb20gJy4vR2FtZSc7XHJcblxyXG52YXIgZyA9IG5ldyBHYW1lKCk7XHJcbiJdfQ==
