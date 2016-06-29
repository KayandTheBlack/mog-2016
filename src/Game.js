'use strict'
var { Turn } = require('./Turn.js')
const C = require('./constants.js')
class Game {
  constructor () {
    this.players = {}
    this.sockets = []
    this.turn = new Turn([], [], [])
  }
  onPlayerConnected (socket) {
    let nplayer = this.turn.bikes.length
    this.players[socket.id] = nplayer
    this.sockets.push(socket)
    this.turn.bikes.push({ i: 0, j: 0, dir: C.UP, alive: true })
    this.turn.inputs.push(null)
    this.turn = new Turn([], this.turn.bikes, this.turn.inputs)
    for (let i = 0; i < this.sockets.length; i++) {
      this.sockets[i].emit('game:state', {turn: this.turn, players: this.players})
    }
  }
}
exports.Game = Game
