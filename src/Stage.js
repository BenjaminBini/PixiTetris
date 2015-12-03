import Constants from './Constants';

export default class Stage {
  constructor(container) {
    this.container = container;
    this.data = [];
    for (let x = 0; x < Constants.WIDTH; x++) {
      this.data.push([]);
      for (let y = 0; y < Constants.HEIGHT; y++) {
        this.data[x].push(0);
      }
    }
  }

  draw() {
    for (let x = 0; x < Constants.WIDTH; x++) {
      for (let y = 0; y < Constants.HEIGHT; y++) {
        if (this.data[x][y] !== 0) {
          var square = new PIXI.Graphics();
          square.lineStyle(2, 0x0, 1);
          square.beginFill(this.data[x][y]);
          square.drawRect(0, 0, Constants.SQUARE_SIZE, Constants.SQUARE_SIZE);
          square.endFill();
          square.x = x * Constants.SQUARE_SIZE;
          square.y = y * Constants.SQUARE_SIZE;
          this.container.addChild(square);
        } else {
          var dot = new PIXI.Graphics();
          dot.beginFill(0xffffff);
          dot.drawRect(0, 0, 1, 1);
          dot.x = (x) * Constants.SQUARE_SIZE + 0.5 * Constants.SQUARE_SIZE;
          dot.y = (y) * Constants.SQUARE_SIZE + 0.5 * Constants.SQUARE_SIZE;
          this.container.addChild(dot);
        }
      }
    }
  }

  isCollision(tetromino) {
    for (let x = 0; x < tetromino.type.size; x++) {
      for (let y = 0; y < tetromino.type.size; y++) {
        
        if (tetromino.x + x < 0 || tetromino.x + x >= Constants.WIDTH || y >= Constants.HEIGHT || tetromino.y >= 0 && this.data[tetromino.x + x][tetromino.y + y] !== 0) {
          if (tetromino.hasBlock(x, y)) {
            return true;
          }  
        }
      }
    }
    return false;
  }

  unite(tetromino) {
    for (let y = 0; y < tetromino.type.size; y++) {
      for (let x = 0; x < tetromino.type.size; x++) {
        if (tetromino.x + x < Constants.WIDTH && tetromino.x + x >= 0 && tetromino.hasBlock(x, y)) {
          this.data[tetromino.x + x][tetromino.y + y] = tetromino.type.color;
        }
      }
    }

    for (let y = 0; y < tetromino.type.size; y++) {
      var eraseLine = true;
      if (y + tetromino.y >= Constants.HEIGHT) {
        eraseLine = false;
      } else {
      for (let x = 0; x < Constants.WIDTH; x++) {
          if (this.data[x][y + tetromino.y] === 0) {
            eraseLine = false;
            break;
          }
        }
      }
      if (eraseLine) {
        for (let yy = y + tetromino.y; yy >= 0; yy--) {
          for (let x = 0; x < Constants.WIDTH; x++) {
            if (yy > 0) {
              this.data[x][yy] = this.data[x][yy-1];
            } else {
              this.data[x][yy] = 0;
            }
          }
        }
      }
    }
  }
}
