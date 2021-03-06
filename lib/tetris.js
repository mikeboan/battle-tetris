import Board from './board';
import * as Tetrominos from './tetrominos';

class Tetris {
  constructor($hook, keyBindings) {
    this.$hook = $hook; // root div in index.html
    this.board = new Board($hook);
    this.dropInterval = 500; //milliseconds
    this.clearedRows = 0;
    this.resetCurrentTetromino();
    this.paused = false;
    this.keyBindings = keyBindings || {
      UP: 38,
      LEFT: 37,
      RIGHT: 39,
      DOWN: 40,
      DROP: 191
    };
    document.addEventListener('keydown', this.handleKeypress.bind(this), false);
  }

  resetCurrentTetromino() {
    this.currentTetromino = {
      row: 0,
      col: 4,
      tetromino: this.nextTetromino || this.randomTetromino(),
      rotation: 0
    };
    this.nextTetromino = this.randomTetromino();
    this.board.render();
  }

  randomTetromino() {
    const tetrominos = [Tetrominos.o, Tetrominos.i, Tetrominos.j, Tetrominos.l,
      Tetrominos.z, Tetrominos.s, Tetrominos.t];
    return tetrominos[Math.floor(Math.random() * tetrominos.length)];
  }

  removeTetromino(tetromino) {
    this.board.eachBlock(
      tetromino.row,
      tetromino.col,
      tetromino.tetromino,
      tetromino.rotation,
      function (x, y) {
        this.board.setBlock(x, y, undefined);
      }.bind(this)
    );
  }

  removeCurrentTetromino() {
    this.removeTetromino(this.currentTetromino);
  }

  placeTetromino(tetromino) {
    this.board.eachBlock(
      tetromino.row,
      tetromino.col,
      tetromino.tetromino,
      tetromino.rotation,
      function(x, y) {
        this.board.setBlock(x, y, tetromino.tetromino);
      }.bind(this)
    );
  }

  placeCurrentTetromino() {
    this.placeTetromino(this.currentTetromino);
  }

  rotateTetromino(tetromino) {
    this.removeTetromino(tetromino);
    if (!this.board.isOccupied(
      tetromino.row,
      tetromino.col,
      tetromino.tetromino,
      (tetromino.rotation + 1) % 4
    )) {
      tetromino.rotation =
      (tetromino.rotation + 1) % 4;
    }

    this.placeTetromino(tetromino);
  }

  rotateCurrentTetromino() {
    this.rotateTetromino(this.currentTetromino);
  }

  move(dRow, dCol, tetromino) {
    if (!tetromino) tetromino = this.currentTetromino;

    const newRow = tetromino.row + dRow;
    const newCol = tetromino.col + dCol;
    this.removeTetromino(tetromino);
    let moved = false;

    if (!this.board.isOccupied(newRow, newCol, tetromino.tetromino, tetromino.rotation)) {
      tetromino.row = newRow;
      tetromino.col = newCol;
      moved = true;
    }

    this.placeTetromino(tetromino);
    return moved;
  }

  /**
   * Drop current piece as far as possible
   */
  drop() {
    while (this.move(1, 0)) {
      continue;
    }
  }

  /**
   * Remove completed rows from board, and update dropinterval as necessary
   * Return number of rows cleared
   */
  clearRows() {
    let removedRows = 0;
    for (let row = 0; row < this.board.gridHeight; row++) {
      let complete = true;
      for (let col = 0; col < this.board.gridWidth; col++) {
        if (
          !this.board.blockAt(row, col) ||
          this.board.blockAt(row,col).string === 'B' // brick piece
        ){
          complete = false;
          break;
        }
      }
      if (complete) {
        this.board.removeRow(row);
        removedRows++;
        row--;
      }
    }
    return removedRows;
  }

  /**
   * Increase game speed as more lines are cleared
   */
  updateDropInterval() {
    if (this.dropInterval > 100) {
      this.dropInterval = 500 - (10 * Math.floor(this.clearedRows / 10));
    }
  }

  /**
   * Handle user input according to given keyBindings
   */
  handleKeypress(e) {
    switch (e.keyCode) {
      case this.keyBindings.UP:
        e.preventDefault();
        this.rotateCurrentTetromino();
        break;
      case this.keyBindings.LEFT:
        e.preventDefault();
        this.move(0, -1);
        break;
      case this.keyBindings.RIGHT:
        e.preventDefault();
        this.move(0, 1);
        break;
      case this.keyBindings.DOWN:
        e.preventDefault();
        this.move(1, 0);
        break;
      case this.keyBindings.DROP:
        e.preventDefault();
        this.drop();
        break;
    }
    this.board.render();
  }

  /**
   * Main gameplay loop
   */
  play() {
    setTimeout(function () {
      if (!this.move(1, 0)) {
        if (this.currentTetromino.row === 0) {
          alert ('you lose!');
          return;
        }
        this.clearRows();
        this.resetCurrentTetromino();
      }
      this.play();
    }.bind(this), this.dropInterval);
    this.board.render();
  }
}


export default Tetris;
