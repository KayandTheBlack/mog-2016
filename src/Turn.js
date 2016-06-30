'use strict'
const C = require('./constants.js')
var clone = require('clone')
function oppositeDir (dir) {
  switch (dir) {
    case C.UP: return C.DOWN
    case C.DOWN: return C.UP
    case C.LEFT: return C.RIGHT
    case C.RIGHT: return C.LEFT
    default: return C.SELF_DESTRUCT
  }
}

class Turn {
  constructor (board, bikes, inputs) {
    this.board = board
    this.bikes = bikes
    this.inputs = inputs
  }
  setInput (bike, inp) {
    this.inputs[bike] = inp
  }
  evolve () {
    var nwbikes = clone(this.bikes)
    var nwboard = clone(this.board)
    var nwinputs = []
    var killMask = []
    for (let i = 0; i < nwbikes.length; i++) {
      nwinputs.push(null)
      if (this.inputs[i] !== null) {
        if (oppositeDir(this.inputs[i]) !== nwbikes[i].dir) nwbikes[i].dir = this.inputs[i]
        if (this.inputs[i] === C.SELF_DESTRUCT) {
          nwbikes[i].alive = false
          killMask[i] = true
        }
      }
      if (nwbikes[i].alive) {
        killMask[i] = false
        if (nwbikes[i].dir === C.UP) {
          nwbikes[i].i --
        } else if (nwbikes[i].dir === C.DOWN) {
          nwbikes[i].i ++
        } else if (nwbikes[i].dir === C.LEFT) {
          nwbikes[i].j --
        } else {
          nwbikes[i].j ++
        }
        for (let j = 0; j < i; j++) {
          if (nwbikes[i].i === nwbikes[j].i & nwbikes[i].j === nwbikes[j].j & nwbikes[j].alive) {
            killMask[i] = true
            killMask[j] = true
          }
        }
        if (nwbikes[i].i < 0 | nwbikes[i].i >= nwboard.length | nwbikes[i].j < 0 | nwbikes[i].j >= nwboard[0].length) {
          killMask[i] = true
        } else if (nwboard[nwbikes[i].i][nwbikes[i].j] !== 0) {
          killMask[i] = true
        }
        if (!killMask[i]) nwboard[nwbikes[i].i][nwbikes[i].j] = i + 1
      }
    }

    for (let i = 0; i < nwboard.length; i++) { // use dfs??
      for (let j = 0; j < nwboard[0].length; j++) {
        if (nwboard[i][j] !== 0) {
          if (killMask[nwboard[i][j] - 1]) nwboard[i][j] = 0
        }
      }
    }
    for (let i = 0; i < nwbikes.length; i++) {
      if (killMask[i]) {
        nwbikes[i].alive = false
        // new erase bikes
        // eraseTrail(this.board, i + 1, nwbikes[i].i, nwbikes[i].j)
      }
    }
    return new Turn(nwboard, nwbikes, nwinputs)
  }
}
exports.Turn = Turn
