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

    // DOM container
    this._domContainer = document.getElementById('game');

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
    this._domContainer.appendChild(this.renderer.view);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXENvbnN0YW50cy5qcyIsInNyY1xcR2FtZS5qcyIsInNyY1xcU3RhZ2UuanMiLCJzcmNcXFRldHJvbWluby5qcyIsInNyY1xcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztrQkNHZTtBQUNiLE9BQUssRUFBRSxFQUFFO0FBQ1QsUUFBTSxFQUFFLEVBQUU7QUFDVixhQUFXLEVBQUUsRUFBRTtBQUFBLENBQ2hCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNGb0IsSUFBSTtBQUN2QixXQURtQixJQUFJLEdBQ1Q7OzswQkFESyxJQUFJOztBQUVyQixXQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQzs7O0FBQUMsQUFHbEIsUUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7O0FBQUMsQUFHckQsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqQyxRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQy9CLFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbEMsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqQyxXQUFPLENBQUMsS0FBSyxHQUFHO2FBQU0sTUFBSyxVQUFVLEVBQUU7S0FBQSxDQUFDO0FBQ3hDLFNBQUssQ0FBQyxLQUFLLEdBQUc7YUFBTSxNQUFLLFFBQVEsRUFBRTtLQUFBLENBQUM7QUFDcEMsWUFBUSxDQUFDLEtBQUssR0FBRzthQUFNLE1BQUssV0FBVyxFQUFFO0tBQUEsQ0FBQztBQUMxQyxXQUFPLENBQUMsS0FBSyxHQUFHO2FBQU0sTUFBSyxVQUFVLEVBQUU7S0FBQTs7O0FBQUMsQUFHeEMs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QUMsQ0FDVixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDVCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNULENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1QsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDVixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxRQUFRO0FBQ2YsUUFBSSxFQUFFLENBQUM7QUFDUCxVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLFFBQVE7QUFDZixRQUFJLEVBQUUsQ0FBQztBQUNQLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsUUFBUTtBQUNmLFFBQUksRUFBRSxDQUFDO0FBQ1AsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDTCxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDTixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ0wsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ04sRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNMLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNOLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDTCxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDTixDQUNGO0dBQ0Y7QUFDRCxHQUFDLEVBQUU7QUFDRCxRQUFJLEVBQUUsR0FBRztBQUNULFNBQUssRUFBRSxRQUFRO0FBQ2YsUUFBSSxFQUFFLENBQUM7QUFDUCxVQUFNLEVBQUUsQ0FDTixDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLENBQ0Y7R0FDRjtBQUNELEdBQUMsRUFBRTtBQUNELFFBQUksRUFBRSxHQUFHO0FBQ1QsU0FBSyxFQUFFLFFBQVE7QUFDZixRQUFJLEVBQUcsQ0FBQztBQUNSLFVBQU0sRUFBRSxDQUNOLENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsQ0FDRjtHQUNGO0FBQ0QsR0FBQyxFQUFFO0FBQ0QsUUFBSSxFQUFFLEdBQUc7QUFDVCxTQUFLLEVBQUUsUUFBUTtBQUNmLFFBQUksRUFBRyxDQUFDO0FBQ1IsVUFBTSxFQUFFLENBQ04sQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixFQUNELENBQ0UsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDRCxDQUNFLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0QsQ0FDRSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FDUixDQUNGO0dBQ0Y7Q0FDRixDQUFDOzs7Ozs7Ozs7OztBQ3JSRixJQUFJLENBQUMsR0FBRyxvQkFBVSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBHYW1lIGNvbnN0YW50c1xyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIFdJRFRIOiAxMiwgLy8gV2lkdGggb2YgdGhlIGdhbWUgKGluIG51bWJlciBvZiBibG9ja3MpXHJcbiAgSEVJR0hUOiAyNCwgLy8gSGVpZ2h0IG9mIHRoZSBnYW1lIChpbiBudW1iZXIgb2YgYmxvY2tzKVxyXG4gIFNRVUFSRV9TSVpFOiAyNSAvLyBXaWR0aCBhbmQgaGVpZ2h0IG9mIGEgYmxvY2sgKGluIHB4KVxyXG59O1xyXG4iLCJpbXBvcnQgVGV0cm9taW5vIGZyb20gJy4vVGV0cm9taW5vJztcclxuaW1wb3J0IHtUeXBlc30gZnJvbSAnLi9UZXRyb21pbm8nO1xyXG5pbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcclxuaW1wb3J0IFN0YWdlIGZyb20gJy4vU3RhZ2UnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhQSVhJKTtcclxuXHJcbiAgICAvLyBET00gY29udGFpbmVyXHJcbiAgICB0aGlzLl9kb21Db250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZScpO1xyXG5cclxuICAgIC8vIEtleWJvYXJkIGV2ZW50c1xyXG4gICAgdmFyIGxlZnRLZXkgPSB0aGlzLl9rZXlib2FyZCgzNyk7XHJcbiAgICB2YXIgdXBLZXkgPSB0aGlzLl9rZXlib2FyZCgzOCk7XHJcbiAgICB2YXIgcmlnaHRLZXkgPSB0aGlzLl9rZXlib2FyZCgzOSk7XHJcbiAgICB2YXIgZG93bktleSA9IHRoaXMuX2tleWJvYXJkKDQwKTtcclxuICAgIGxlZnRLZXkucHJlc3MgPSAoKSA9PiB0aGlzLl9wcmVzc0xlZnQoKTtcclxuICAgIHVwS2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcHJlc3NVcCgpO1xyXG4gICAgcmlnaHRLZXkucHJlc3MgPSAoKSA9PiB0aGlzLl9wcmVzc1JpZ2h0KCk7XHJcbiAgICBkb3duS2V5LnByZXNzID0gKCkgPT4gdGhpcy5fcHJlc3NEb3duKCk7XHJcbiAgICAgXHJcbiAgICAvLyBTZXQgdXAgUElYSSBhbmQgbGF1bmNoIGdhbWVcclxuICAgIHRoaXMucmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcihDb25zdGFudHMuV0lEVEggKiBDb25zdGFudHMuU1FVQVJFX1NJWkUsIENvbnN0YW50cy5IRUlHSFQgKiBDb25zdGFudHMuU1FVQVJFX1NJWkUpO1xyXG4gICAgdGhpcy5fZG9tQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucmVuZGVyZXIudmlldyk7XHJcblxyXG4gICAgLy8gUGl4aSBjb250YWluZXJcclxuICAgIHRoaXMuY29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XHJcblxyXG4gICAgLy8gR2FtZSBib2FyZC9zdGFnZVxyXG4gICAgdGhpcy5zdGFnZSA9IG5ldyBTdGFnZSh0aGlzLmNvbnRhaW5lcik7IFxyXG5cclxuICAgIC8vIEN1cnJlbnQgbW92aW5nIHRldHJvbWlub1xyXG4gICAgdGhpcy50ZXRyb21pbm8gPSBUZXRyb21pbm8uZ2V0UmFuZG9tKHRoaXMuY29udGFpbmVyKTtcclxuXHJcbiAgICAvLyBEZWxheSBiZXR3ZWVuIG1vdmVzXHJcbiAgICB0aGlzLmRlbGF5ID0gMzAwO1xyXG5cclxuICAgIC8vIEdPIVxyXG4gICAgdGhpcy5fc3RhcnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXJ0IHRoZSBnYW1lXHJcbiAgICovXHJcbiAgX3N0YXJ0KCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIHRpbWVyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICBmdW5jdGlvbiBsb29wKCkgeyAvLyBFdmVudCBsb29wXHJcbiAgICAgIGlmIChuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRpbWVyID4gc2VsZi5kZWxheSkge1xyXG4gICAgICAgIHRpbWVyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcbiAgICAgICAgc2VsZi50ZXRyb21pbm8ubW92ZSgwLCAxKTsgLy8gR3Jhdml0eVxyXG4gICAgICAgIC8vIElmIGNvbGxpc2lvbiwgY2FuY2VsICBtb3ZlIGFuZCB1bml0ZSB0aGUgdGV0cm9taW5vIHdpdGggdGhlIGdhbWUgc3RhZ2VcclxuICAgICAgICBpZiAoc2VsZi5zdGFnZS5pc0NvbGxpc2lvbihzZWxmLnRldHJvbWlubykpIHsgXHJcbiAgICAgICAgICBzZWxmLnRldHJvbWluby5tb3ZlKDAsIC0xKTtcclxuICAgICAgICAgIHNlbGYuc3RhZ2UudW5pdGUoc2VsZi50ZXRyb21pbm8pO1xyXG4gICAgICAgICAgc2VsZi50ZXRyb21pbm8gPSBUZXRyb21pbm8uZ2V0UmFuZG9tKHNlbGYuY29udGFpbmVyKTtcclxuICAgICAgICAgIC8vIExvc2UhIFJlc3RhcnRcclxuICAgICAgICAgIGlmIChzZWxmLnN0YWdlLmlzQ29sbGlzaW9uKHNlbGYudGV0cm9taW5vKSkge1xyXG4gICAgICAgICAgICBzZWxmLnN0YWdlLnJlc2V0KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlbGYuX3JlbmRlcigpOyAvLyBSZW5kZXJcclxuICAgICAgfVxyXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XHJcbiAgICB9XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9vcCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBcIlByZXNzIGxlZnRcIiBldmVudFxyXG4gICAqL1xyXG4gIF9wcmVzc0xlZnQoKSB7XHJcbiAgICB0aGlzLnRldHJvbWluby5tb3ZlKC0xLCAwKTtcclxuICAgIGlmICh0aGlzLnN0YWdlLmlzQ29sbGlzaW9uKHRoaXMudGV0cm9taW5vKSkge1xyXG4gICAgICB0aGlzLnRldHJvbWluby5tb3ZlKDEsIDApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fcmVuZGVyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBcIlByZXNzIHJpZ2h0XCIgZXZlbnRcclxuICAgKi9cclxuICBfcHJlc3NSaWdodCgpIHtcclxuICAgIHRoaXMudGV0cm9taW5vLm1vdmUoMSwgMCk7XHJcbiAgICBpZiAodGhpcy5zdGFnZS5pc0NvbGxpc2lvbih0aGlzLnRldHJvbWlubykpIHtcclxuICAgICAgdGhpcy50ZXRyb21pbm8ubW92ZSgtMSwgMCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9yZW5kZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiUHJlc3MgdXBcIiBldmVudFxyXG4gICAqL1xyXG4gIF9wcmVzc1VwKCkge1xyXG4gICAgdGhpcy50ZXRyb21pbm8ucm90YXRlKCk7XHJcbiAgICBpZiAodGhpcy5zdGFnZS5pc0NvbGxpc2lvbih0aGlzLnRldHJvbWlubykpIHtcclxuICAgICAgdGhpcy50ZXRyb21pbm8uYW50aVJvdGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fcmVuZGVyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBcIlByZXNzIGRvd25cIiBldmVudFxyXG4gICAqL1xyXG4gIF9wcmVzc0Rvd24oKSB7XHJcbiAgICB0aGlzLnRldHJvbWluby5tb3ZlKDAsIDEpO1xyXG4gICAgaWYgKHRoaXMuc3RhZ2UuaXNDb2xsaXNpb24odGhpcy50ZXRyb21pbm8pKSB7XHJcbiAgICAgIHRoaXMudGV0cm9taW5vLm1vdmUoMCwgLTEpO1xyXG4gICAgICB0aGlzLnN0YWdlLnVuaXRlKHRoaXMudGV0cm9taW5vKTtcclxuICAgICAgdGhpcy50ZXRyb21pbm8gPSBUZXRyb21pbm8uZ2V0UmFuZG9tKHRoaXMuY29udGFpbmVyKTsgXHJcbiAgICB9XHJcbiAgICB0aGlzLl9yZW5kZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbmRlciBmdW5jdGlvblxyXG4gICAqL1xyXG4gIF9yZW5kZXIoKSB7XHJcbiAgICAvLyBSZW1vdmUgZXZlcnl0aGluZyBmcm9tIHRoZSBjb250YWluZXIsIHJlZHJhdyBzdGFnZSBhbmQgdGV0cm9taW5vIGFuZCByZW5kZXJcclxuICAgIC8vIFRPRE8gOiBkbyBub3QgcmVtb3ZlIGFuZCByZWRyYXcgYXQgZXZlcnkgbW92ZVxyXG4gICAgdGhpcy5jb250YWluZXIucmVtb3ZlQ2hpbGRyZW4oKTtcclxuICAgIHRoaXMuc3RhZ2UuZHJhdygpO1xyXG4gICAgdGhpcy50ZXRyb21pbm8uZHJhdygpO1xyXG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5jb250YWluZXIpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogS2V5Ym9hcmQgZXZlbnRzIGhlbHBlclxyXG4gICAqL1xyXG4gIF9rZXlib2FyZChrZXlDb2RlKSB7XHJcbiAgICB2YXIga2V5ID0ge307XHJcbiAgICBrZXkuY29kZSA9IGtleUNvZGU7XHJcbiAgICBrZXkuaXNEb3duID0gZmFsc2U7XHJcbiAgICBrZXkuaXNVcCA9IHRydWU7XHJcbiAgICBrZXkucHJlc3MgPSB1bmRlZmluZWQ7XHJcbiAgICBrZXkucmVsZWFzZSA9IHVuZGVmaW5lZDtcclxuICAgIC8vVGhlIGBkb3duSGFuZGxlcmBcclxuICAgIGtleS5kb3duSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSBrZXkuY29kZSkge1xyXG4gICAgICAgIGlmIChrZXkuaXNVcCAmJiBrZXkucHJlc3MpIGtleS5wcmVzcygpO1xyXG4gICAgICAgIGtleS5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIGtleS5pc1VwID0gZmFsc2U7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvL1RoZSBgdXBIYW5kbGVyYFxyXG4gICAga2V5LnVwSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSBrZXkuY29kZSkge1xyXG4gICAgICAgIGlmIChrZXkuaXNEb3duICYmIGtleS5yZWxlYXNlKSBrZXkucmVsZWFzZSgpO1xyXG4gICAgICAgIGtleS5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBrZXkuaXNVcCA9IHRydWU7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvL0F0dGFjaCBldmVudCBsaXN0ZW5lcnNcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAna2V5ZG93bicsIGtleS5kb3duSGFuZGxlci5iaW5kKGtleSksIGZhbHNlXHJcbiAgICApO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICdrZXl1cCcsIGtleS51cEhhbmRsZXIuYmluZChrZXkpLCBmYWxzZVxyXG4gICAgKTtcclxuICAgIHJldHVybiBrZXk7XHJcbiAgfVxyXG5cclxufVxyXG4iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnQgdGhlIGdhbWUgc3RhZ2VcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YWdlIHtcclxuICBjb25zdHJ1Y3Rvcihjb250YWluZXIpIHtcclxuICAgIC8vIFNldCB0aGUgY29udGFpbmVyXHJcbiAgICB0aGlzLl9jb250YWluZXIgPSBjb250YWluZXI7XHJcblxyXG4gICAgLy8gX2RhdGEgcmVwcmVzZW50cyB0aGUgc3RhdGUgb2YgZXZlcnkgYmxvY2sgb2YgdGhlIHN0YWdlXHJcbiAgICAvLyAwIGZvciBcImVtcHR5XCIsIGhleGEgY29kZSBjb2xvciBpZiBub3RcclxuICAgIC8vIFdlIGluaXRpYWxpemUgaXQgd2l0aCB6ZXJvc1xyXG4gICAgdGhpcy5fZGF0YSA9IFtdO1xyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBDb25zdGFudHMuV0lEVEg7IHgrKykge1xyXG4gICAgICB0aGlzLl9kYXRhLnB1c2goW10pO1xyXG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IENvbnN0YW50cy5IRUlHSFQ7IHkrKykge1xyXG4gICAgICAgIHRoaXMuX2RhdGFbeF0ucHVzaCgwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIHNoYXBlcyB0byB0aGUgX2NvbnRhaW5lclxyXG4gICAqL1xyXG4gIGRyYXcoKSB7XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IENvbnN0YW50cy5XSURUSDsgeCsrKSB7XHJcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgQ29uc3RhbnRzLkhFSUdIVDsgeSsrKSB7XHJcbiAgICAgICAgLy8gQ29sb3IgYmxvY2tzIHdoZW4gbm90IGVtcHR5XHJcbiAgICAgICAgaWYgKHRoaXMuX2RhdGFbeF1beV0gIT09IDApIHtcclxuICAgICAgICAgIHZhciBzcXVhcmUgPSBuZXcgUElYSS5HcmFwaGljcygpO1xyXG4gICAgICAgICAgc3F1YXJlLmxpbmVTdHlsZSgyLCAweDAsIDEpO1xyXG4gICAgICAgICAgc3F1YXJlLmJlZ2luRmlsbCh0aGlzLl9kYXRhW3hdW3ldKTtcclxuICAgICAgICAgIHNxdWFyZS5kcmF3UmVjdCgwLCAwLCBDb25zdGFudHMuU1FVQVJFX1NJWkUsIENvbnN0YW50cy5TUVVBUkVfU0laRSk7XHJcbiAgICAgICAgICBzcXVhcmUuZW5kRmlsbCgpO1xyXG4gICAgICAgICAgc3F1YXJlLnggPSB4ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xyXG4gICAgICAgICAgc3F1YXJlLnkgPSB5ICogQ29uc3RhbnRzLlNRVUFSRV9TSVpFO1xyXG4gICAgICAgICAgdGhpcy5fY29udGFpbmVyLmFkZENoaWxkKHNxdWFyZSk7XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gSnVzdCBhIHdoaXRlIGRvdCBpbiB0aGUgbWlkZGxlIGlmIGVtcHR5XHJcbiAgICAgICAgICB2YXIgZG90ID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcclxuICAgICAgICAgIGRvdC5iZWdpbkZpbGwoMHhmZmZmZmYpO1xyXG4gICAgICAgICAgZG90LmRyYXdSZWN0KDAsIDAsIDEsIDEpO1xyXG4gICAgICAgICAgZG90LnggPSAoeCkgKiBDb25zdGFudHMuU1FVQVJFX1NJWkUgKyAwLjUgKiBDb25zdGFudHMuU1FVQVJFX1NJWkU7XHJcbiAgICAgICAgICBkb3QueSA9ICh5KSAqIENvbnN0YW50cy5TUVVBUkVfU0laRSArIDAuNSAqIENvbnN0YW50cy5TUVVBUkVfU0laRTtcclxuICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRDaGlsZChkb3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgaWYgJ3RldHJvbWlubycgaXMgaW4gY29sbGlzaW9uIHdpdGggdGhlIHN0YWdlXHJcbiAgICovXHJcbiAgaXNDb2xsaXNpb24odGV0cm9taW5vKSB7XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRldHJvbWluby50eXBlLnNpemU7IHgrKykge1xyXG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRldHJvbWluby50eXBlLnNpemU7IHkrKykgeyAgICAgICAgXHJcbiAgICAgICAgaWYgKHRldHJvbWluby54ICsgeCA8IDAgfHwgdGV0cm9taW5vLnggKyB4ID49IENvbnN0YW50cy5XSURUSCB8fCB5ID49IENvbnN0YW50cy5IRUlHSFQgfHwgdGV0cm9taW5vLnkgPj0gMCAmJiB0aGlzLl9kYXRhW3RldHJvbWluby54ICsgeF1bdGV0cm9taW5vLnkgKyB5XSAhPT0gMCkge1xyXG4gICAgICAgICAgaWYgKHRldHJvbWluby5oYXNCbG9jayh4LCB5KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH0gIFxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVzaW9uICd0ZXRyb21pbm8nIHdpdGggdGhlIHN0YWdlXHJcbiAgICogSWYgdGhlIGZ1c2lvbiBjcmVhdGUgYSBsaW5lLCB3ZSBlcmFzZSB0aGUgbGluZVxyXG4gICAqL1xyXG4gIHVuaXRlKHRldHJvbWlubykge1xyXG4gICAgLy8gRnVzaW9uIHRoZSB0ZXRyb21pbm8gd2l0aCB0aGUgc3RhZ2VcclxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeSsrKSB7XHJcbiAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGV0cm9taW5vLnR5cGUuc2l6ZTsgeCsrKSB7XHJcbiAgICAgICAgaWYgKHRldHJvbWluby54ICsgeCA8IENvbnN0YW50cy5XSURUSCAmJiB0ZXRyb21pbm8ueCArIHggPj0gMCAmJiB0ZXRyb21pbm8uaGFzQmxvY2soeCwgeSkpIHtcclxuICAgICAgICAgIHRoaXMuX2RhdGFbdGV0cm9taW5vLnggKyB4XVt0ZXRyb21pbm8ueSArIHldID0gdGV0cm9taW5vLnR5cGUuY29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0ZXRyb21pbm8udHlwZS5zaXplOyB5KyspIHtcclxuICAgICAgLy8gQ2hlY2sgaWYgdGhlIGZ1c2lvbiBjcmVhdGVkIGEgbmV3IGxpbmVcclxuICAgICAgdmFyIGVyYXNlTGluZSA9IHRydWU7XHJcbiAgICAgIGlmICh5ICsgdGV0cm9taW5vLnkgPj0gQ29uc3RhbnRzLkhFSUdIVCkge1xyXG4gICAgICAgIGVyYXNlTGluZSA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IENvbnN0YW50cy5XSURUSDsgeCsrKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5fZGF0YVt4XVt5ICsgdGV0cm9taW5vLnldID09PSAwKSB7XHJcbiAgICAgICAgICAgIGVyYXNlTGluZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLy8gSWYgeWVzLCB3ZSBlcmFzZSBpdCBhbmQgbW92ZSBhbGwgY29uY2VybmVkIGJsb2Nrc1xyXG4gICAgICBpZiAoZXJhc2VMaW5lKSB7XHJcbiAgICAgICAgZm9yIChsZXQgeXkgPSB5ICsgdGV0cm9taW5vLnk7IHl5ID49IDA7IHl5LS0pIHtcclxuICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgQ29uc3RhbnRzLldJRFRIOyB4KyspIHtcclxuICAgICAgICAgICAgaWYgKHl5ID4gMCkge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2RhdGFbeF1beXldID0gdGhpcy5fZGF0YVt4XVt5eS0xXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0aGlzLl9kYXRhW3hdW3l5XSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoZSBzdGFnZVxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5fZGF0YSA9IFtdO1xyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBDb25zdGFudHMuV0lEVEg7IHgrKykge1xyXG4gICAgICB0aGlzLl9kYXRhLnB1c2goW10pO1xyXG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IENvbnN0YW50cy5IRUlHSFQ7IHkrKykge1xyXG4gICAgICAgIHRoaXMuX2RhdGFbeF0ucHVzaCgwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgQ29uc3RhbnRzIGZyb20gJy4vQ29uc3RhbnRzJztcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgdGV0cm9taW5vXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXRyb21pbm8ge1xyXG4gIGNvbnN0cnVjdG9yKHR5cGUsIGNvbnRhaW5lcikge1xyXG4gICAgLy8gU2V0IHRoZSBjb250YWluZXJcclxuICAgIHRoaXMuX2NvbnRhaW5lciA9IGNvbnRhaW5lcjtcclxuICAgIFxyXG4gICAgLy8gVHlwZSBvZiB0aGUgdGV0cm9taW5vIChJLCBKLCBMLCBPLCBTLCBULCBaKVxyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuXHJcbiAgICAvLyBQb3NpdGlvbiBvZiB0aGUgdGV0cm9taW5vXHJcbiAgICB0aGlzLnggPSBNYXRoLmZsb29yKENvbnN0YW50cy5XSURUSCAvIDIgLSB0aGlzLnR5cGUuc2l6ZSAvIDIpO1xyXG4gICAgdGhpcy55ID0gMDtcclxuXHJcbiAgICAvLyBBbmdsZSBvZiB0aGUgdGV0cm9taW5vICgwOiAwZGVnLCAxOiA5MGRlZywgMjogMTgwZGVnLCAzOiAyNzBkZWcpXHJcbiAgICB0aGlzLmFuZ2xlID0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXRpYyBtZXRob2QgdG8gZ2V0IGEgcmFuZG9tIHRldHJvbWlub1xyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRSYW5kb20oY29udGFpbmVyKSB7XHJcbiAgICB2YXIgdHlwZXMgPSBbVHlwZXMuSSwgVHlwZXMuSiwgVHlwZXMuTCwgVHlwZXMuTywgVHlwZXMuUywgVHlwZXMuVCwgVHlwZXMuWl07XHJcbiAgICB2YXIgdHlwZSA9IHR5cGVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpXTtcclxuICAgIHJldHVybiBuZXcgVGV0cm9taW5vKHR5cGUsIGNvbnRhaW5lcik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgc2hhcGVzIHRvIF9jb250YWluZXJcclxuICAgKi9cclxuICBkcmF3KCkge1xyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLnR5cGUuc2l6ZTsgeCsrKSB7XHJcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGhpcy50eXBlLnNpemU7IHkrKykge1xyXG4gICAgICAgIGlmICh0aGlzLnR5cGUuc2hhcGVzW3RoaXMuYW5nbGVdW3ldW3hdID09PSAxKSB7XHJcbiAgICAgICAgICB2YXIgc3F1YXJlID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcclxuICAgICAgICAgIHNxdWFyZS5saW5lU3R5bGUoMiwgMHgwLCAxKTtcclxuICAgICAgICAgIHNxdWFyZS5iZWdpbkZpbGwodGhpcy50eXBlLmNvbG9yKTtcclxuICAgICAgICAgIHNxdWFyZS5kcmF3UmVjdCgwLCAwLCBDb25zdGFudHMuU1FVQVJFX1NJWkUsIENvbnN0YW50cy5TUVVBUkVfU0laRSk7XHJcbiAgICAgICAgICBzcXVhcmUuZW5kRmlsbCgpO1xyXG4gICAgICAgICAgc3F1YXJlLnggPSAodGhpcy54ICsgeCkgKiBDb25zdGFudHMuU1FVQVJFX1NJWkU7XHJcbiAgICAgICAgICBzcXVhcmUueSA9ICh0aGlzLnkgKyB5KSAqIENvbnN0YW50cy5TUVVBUkVfU0laRTtcclxuICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5hZGRDaGlsZChzcXVhcmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlIHRoZSB0ZXRyb21pbm8gdG8gdGhlIHJpZ2h0XHJcbiAgICovXHJcbiAgcm90YXRlKCkge1xyXG4gICAgdGhpcy5hbmdsZSArPSAxO1xyXG4gICAgdGhpcy5hbmdsZSAlPSA0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUm90YXRlIHRoZSB0ZXRyb21pbm8gdG8gdGhlIGxlZnRcclxuICAgKi9cclxuICBhbnRpUm90YXRlKCkge1xyXG4gICAgdGhpcy5hbmdsZSAtPSAxO1xyXG4gICAgaWYgKHRoaXMuYW5nbGUgPT09IC0xKSB7XHJcbiAgICAgIHRoaXMuYW5nbGUgPSAzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZSB0aGUgdGV0cm9taW5vXHJcbiAgICovXHJcbiAgbW92ZShkeCwgZHkpIHtcclxuICAgIHRoaXMueCArPSBkeDtcclxuICAgIHRoaXMueSArPSBkeTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRlc3QgaWYgdGhlIHRldHJvbWlubyBoYXMgYSBibG9jayBpbiB0aGUgcG9zaXRpbm8gKHgsIHkpXHJcbiAgICogeCBhbmQgeSBiZWluZyByZWxhdGl2ZSB0aGUgdGhlIHBvc2l0aW9uIG9mIHRoZSB0ZXRyb21pbm9cclxuICAgKi9cclxuICBoYXNCbG9jayh4LCB5KSB7XHJcbiAgICByZXR1cm4gdGhpcy50eXBlLnNoYXBlc1t0aGlzLmFuZ2xlXVt5XVt4XSA9PT0gMTtcclxuICB9XHJcblxyXG59XHJcblxyXG4vKipcclxuICogVHlwZXMgb2YgdGV0cm9taW5vc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFR5cGVzID0ge1xyXG4gIEk6IHtcclxuICAgIG5hbWU6ICdJJywgLy8gTmFtZSBvZiB0aGUgdGV0cm9taW5vXHJcbiAgICBjb2xvcjogMHhGRjgwMDAsIC8vIEJhY2tncm91bmQgY29sb3JcclxuICAgIHNpemU6IDQsIC8vIFNpemUgb2YgdGhlICdjb250YWluZXInIG9mIHRoZSB0ZXRyb21pbm9cclxuICAgIHNoYXBlczogWyAvLyBBbGwgc2hhcGVzIG9mIHRoZSB0ZXRyb21pbm8gKG9uZSBwZXIgcm90YXRpb24gcG9zaXRpb24pXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDAsMF0sXHJcbiAgICAgICAgWzEsMSwxLDFdLFxyXG4gICAgICAgIFswLDAsMCwwXSxcclxuICAgICAgICBbMCwwLDAsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDAsMSwwXSxcclxuICAgICAgICBbMCwwLDEsMF0sXHJcbiAgICAgICAgWzAsMCwxLDBdLFxyXG4gICAgICAgIFswLDAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwLDBdLFxyXG4gICAgICAgIFswLDAsMCwwXSxcclxuICAgICAgICBbMSwxLDEsMV0sXHJcbiAgICAgICAgWzAsMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDAsMF0sXHJcbiAgICAgICAgWzAsMSwwLDBdLFxyXG4gICAgICAgIFswLDEsMCwwXSxcclxuICAgICAgICBbMCwxLDAsMF1cclxuICAgICAgXVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgSjoge1xyXG4gICAgbmFtZTogJ0onLFxyXG4gICAgY29sb3I6IDB4MDBmZmZmLFxyXG4gICAgc2l6ZTogMyxcclxuICAgIHNoYXBlczogW1xyXG4gICAgICBbXHJcbiAgICAgICAgWzEsMCwwXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDAsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMCwxLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMV0sXHJcbiAgICAgICAgWzAsMCwxXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFsxLDEsMF1cclxuICAgICAgXVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgTDoge1xyXG4gICAgbmFtZTogJ0wnLFxyXG4gICAgY29sb3I6IDB4RkYwMDAwLFxyXG4gICAgc2l6ZTogMyxcclxuICAgIHNoYXBlczogW1xyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwxXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDAsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwwXSxcclxuICAgICAgICBbMCwxLDFdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDBdLFxyXG4gICAgICAgIFsxLDEsMV0sXHJcbiAgICAgICAgWzEsMCwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMF1cclxuICAgICAgXVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgTzoge1xyXG4gICAgbmFtZTogJzAnLFxyXG4gICAgY29sb3I6IDB4RkZGRjAwLFxyXG4gICAgc2l6ZTogMixcclxuICAgIHNoYXBlczogW1xyXG4gICAgICBbXHJcbiAgICAgICAgWzEsMV0sXHJcbiAgICAgICAgWzEsMV1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFsxLDFdLFxyXG4gICAgICAgIFsxLDFdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwxXSxcclxuICAgICAgICBbMSwxXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzEsMV0sXHJcbiAgICAgICAgWzEsMV1cclxuICAgICAgXVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgUzoge1xyXG4gICAgbmFtZTogJ1MnLFxyXG4gICAgY29sb3I6IDB4RkYwMEZGLFxyXG4gICAgc2l6ZTogMyxcclxuICAgIHNoYXBlczogW1xyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMSwxXSxcclxuICAgICAgICBbMSwxLDBdLFxyXG4gICAgICAgIFswLDAsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzAsMSwxXSxcclxuICAgICAgICBbMCwwLDFdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwwLDBdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzEsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzEsMCwwXSxcclxuICAgICAgICBbMSwxLDBdLFxyXG4gICAgICAgIFswLDEsMF1cclxuICAgICAgXVxyXG4gICAgXVxyXG4gIH0sXHJcbiAgVDoge1xyXG4gICAgbmFtZTogJ1QnLFxyXG4gICAgY29sb3I6IDB4ODBGRjAwLFxyXG4gICAgc2l6ZSA6IDMsXHJcbiAgICBzaGFwZXM6IFtcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwxXSxcclxuICAgICAgICBbMCwwLDBdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMSwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwwXSxcclxuICAgICAgICBbMSwxLDFdLFxyXG4gICAgICAgIFswLDEsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDEsMF0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwxLDBdXHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG4gIFo6IHtcclxuICAgIG5hbWU6ICdaJyxcclxuICAgIGNvbG9yOiAweEZGQzAwMCxcclxuICAgIHNpemUgOiAzLFxyXG4gICAgc2hhcGVzOiBbXHJcbiAgICAgIFtcclxuICAgICAgICBbMSwxLDBdLFxyXG4gICAgICAgIFswLDEsMV0sXHJcbiAgICAgICAgWzAsMCwwXVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAgWzAsMCwxXSxcclxuICAgICAgICBbMCwxLDFdLFxyXG4gICAgICAgIFswLDEsMF1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIFswLDAsMF0sXHJcbiAgICAgICAgWzEsMSwwXSxcclxuICAgICAgICBbMCwxLDFdXHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICBbMCwxLDBdLFxyXG4gICAgICAgIFsxLDEsMF0sXHJcbiAgICAgICAgWzEsMCwwXVxyXG4gICAgICBdXHJcbiAgICBdXHJcbiAgfVxyXG59O1xyXG4iLCJpbXBvcnQgR2FtZSBmcm9tICcuL0dhbWUnO1xyXG5cclxudmFyIGcgPSBuZXcgR2FtZSgpO1xyXG4iXX0=
