/**
 * Game constants
 */
export default {
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
