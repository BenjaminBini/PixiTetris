import Constants from './Constants';

export default class Tetromino {
  constructor(type, container) {
    this.type = type;
    this.container = container;
    this.x = 0;
    this.y = 0;
    this.angle = 0;
  }

  static getRandom(container) {
    var types = [Types.I, Types.J, Types.L, Types.O, Types.S, Types.T, Types.Z];
    var type = types[Math.floor(Math.random() * 7)];
    return new Tetromino(type, container);
  }

  draw() {
    for (let x = 0; x < this.type.size; x++) {
      for (let y = 0; y < this.type.size; y++) {
        if (this.type.shapes[this.angle][y][x] === 1) {
          var square = new PIXI.Graphics();
          square.lineStyle(2, 0x0, 1);
          square.beginFill(this.type.color);
          square.drawRect(0, 0, Constants.SQUARE_SIZE, Constants.SQUARE_SIZE);
          square.endFill();
          square.x = (this.x + x) * Constants.SQUARE_SIZE;
          square.y = (this.y + y) * Constants.SQUARE_SIZE;
          this.container.addChild(square);
        }
      }
    }
  }

  rotate() {
    this.angle += 1;
    this.angle %= 4;
  }

  antiRotate() {
    this.angle -= 1;
    if (this.angle === -1) {
      this.angle = 3;
    }
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  hasBlock(x, y) {
    return this.type.shapes[this.angle][y][x] === 1;
  }

}

export const Types = {
  I: {
    name: 'I',
    color: 0xFF8000,
    size: 4,
    shapes: [
      [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
      ],
      [
        [0,0,1,0],
        [0,0,1,0],
        [0,0,1,0],
        [0,0,1,0]
      ],
      [
        [0,0,0,0],
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0]
      ],
      [
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0]
      ]
    ]
  },
  J: {
    name: 'J',
    color: 0x00ffff,
    size: 3,
    shapes: [
      [
        [1,0,0],
        [1,1,1],
        [0,0,0]
      ],
      [
        [0,1,1],
        [0,1,0],
        [0,1,0]
      ],
      [
        [0,0,0],
        [1,1,1],
        [0,0,1]
      ],
      [
        [0,1,0],
        [0,1,0],
        [1,1,0]
      ]
    ]
  },
  L: {
    name: 'L',
    color: 0xFF0000,
    size: 3,
    shapes: [
      [
        [0,0,1],
        [1,1,1],
        [0,0,0]
      ],
      [
        [0,1,0],
        [0,1,0],
        [0,1,1]
      ],
      [
        [0,0,0],
        [1,1,1],
        [1,0,0]
      ],
      [
        [1,1,0],
        [0,1,0],
        [0,1,0]
      ]
    ]
  },
  O: {
    name: '0',
    color: 0xFFFF00,
    size: 2,
    shapes: [
      [
        [1,1],
        [1,1]
      ],
      [
        [1,1],
        [1,1]
      ],
      [
        [1,1],
        [1,1]
      ],
      [
        [1,1],
        [1,1]
      ]
    ]
  },
  S: {
    name: 'S',
    color: 0xFF00FF,
    size: 3,
    shapes: [
      [
        [0,1,1],
        [1,1,0],
        [0,0,0]
      ],
      [
        [0,1,0],
        [0,1,1],
        [0,0,1]
      ],
      [
        [0,0,0],
        [0,1,1],
        [1,1,0]
      ],
      [
        [1,0,0],
        [1,1,0],
        [0,1,0]
      ]
    ]
  },
  T: {
    name: 'I',
    color: 0x80FF00,
    size : 3,
    shapes: [
      [
        [0,1,0],
        [1,1,1],
        [0,0,0]
      ],
      [
        [0,1,0],
        [0,1,1],
        [0,1,0]
      ],
      [
        [0,0,0],
        [1,1,1],
        [0,1,0]
      ],
      [
        [0,1,0],
        [1,1,0],
        [0,1,0]
      ]
    ]
  },
  Z: {
    name: 'Z',
    color: 0xFFC000,
    size : 3,
    shapes: [
      [
        [1,1,0],
        [0,1,1],
        [0,0,0]
      ],
      [
        [0,0,1],
        [0,1,1],
        [0,1,0]
      ],
      [
        [0,0,0],
        [1,1,0],
        [0,1,1]
      ],
      [
        [0,1,0],
        [1,1,0],
        [1,0,0]
      ]
    ]
  }
};
