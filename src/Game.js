'use strict'
var { Turn } = require('./Turn.js')
const C = require('./constants.js')
class Game {
  constructor () {
    this.players = {}
    this.sockets = []
    this.size = 30
    let myLevMatrix = new Array(this.size)
    for (let x = 0; x < this.size; x++) {
      myLevMatrix[x] = new Array(this.size)
      for (let y = 0; y < this.size; y++) myLevMatrix[x][y] = 0
    }
    this.turn = new Turn(myLevMatrix, [], [])
    this.turns = [this.turn]
  }
  onPlayerJoin (socket) {
    if (this.turns.length !== 1) return
    let nplayer = 0
    while (this.sockets[nplayer] !== null & nplayer < this.sockets.length) nplayer++
    if (nplayer === this.sockets.length) this.sockets.push(socket)
    else this.sockets[nplayer] = socket
    console.log('PN')
    this.sockets[nplayer] = socket
    this.players[socket.id] = nplayer
    var bike = { i: 0, j: 0, dir: C.LEFT, alive: true }
    switch (nplayer) {
      case 0: break
      case 1:
        bike.i = this.size - 1
        bike.dir = C.DOWN
        break
      case 3:
        bike.i = this.size - 1
        bike.j = this.size - 1
        bike.dir = C.UP
        break
      case 2:
        bike.j = this.size - 1
        bike.dir = C.RIGHT
    }
    this.turn.bikes.push(bike)
    this.turn.inputs.push(null)
    this.turn.board[bike.i][bike.j] = nplayer + 1
    for (let i = 0; i < this.sockets.length; i++) {
      if (this.sockets[i] !== null) this.sockets[i].emit('game:state', {turn: this.turn, players: this.players})
    }
  }
  onPlayerLeave (socket) {
    var nplayer = this.players[socket.id]
    this.sockets[nplayer] = null
    delete this.players[socket.id]
    this.turn.inputs[nplayer] = C.SELF_DESTRUCT
  }
  onChangeDir (socket, dir) {
    this.turn.setInput(this.players[socket.id], dir)
    for (let i = 0; i < this.sockets.length; i++) {
      this.sockets[i].emit('game:state', {turn: this.turn, players: this.players})
    }
  }
  tick () {
    const nextTurn = this.turn.evolve()
    this.turn = nextTurn
    this.turns.push(nextTurn)
    this.sendState()
  }
  sendState () {
    const state = {
      turn: this.turn,
      players: this.players
    }
    this.sockets.forEach((socket) => socket && socket.emit('game:state', state))
  }
}
exports.Game = Game
