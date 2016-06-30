const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const { Game } = require('./Game.js')

const game = new Game()
setInterval(game.tick.bind(game), 400)

app.use(express.static('dist'))
app.get('/', function (req, res) {
  res.sendfile('../dist/index.html')
})

io.on('connection', function (socket) {
  console.log(`${socket.id} connected`)
  game.onPlayerJoin(socket)

  socket.on('changeDir', function (dir) {
    game.onChangeDir(socket, dir)
  })

  socket.on('disconnect', function () {
    console.log(`${socket.id} disconnected`)
    game.onPlayerLeave(socket)
  })
})

const PORT = process.env.PORT || 3000
http.listen(PORT, function () {
  console.log(`listening on *:${PORT}`)
})
