/**
 * Game constants
 */
export default {
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
