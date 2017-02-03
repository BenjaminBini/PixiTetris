# PixiTetris

A simple Tetris game using [Pixi.js](http://github.com/pixijs/pixi.js), ES6 (Babel) and browserify.

[Try it here!](http://static.bini.io/PixiTetris/)

Set up a web server and open `index.html`.

If you modify sources you will need to install dependencies and build the bundle file.



Todo :

- [x] Detect game over
- [x] Pause / Resume
- [x] Levels / Points
- [x] Optimize rendering (do not remove everything from the stage at every move)
- [x] Remember best score
- [x] Change UI on pause
- [ ] Change UI on game over
- [ ] Restart button


## Install dependencies

```sh
	$ bower install
	$ npm install
```

## Build

```sh
	$ gulp build
```

## Watch

```sh
	$ gulp watch
```
