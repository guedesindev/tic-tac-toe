import express from 'express'
import http from 'http'
import path, { dirname } from 'path'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'

const app = express()
const serverHTTP = http.Server(app)
const io = new Server(serverHTTP)
const PORT = process.env.PORT || 3000

const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(express.static(path.join(__dirname, '/src/public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/routes/index.html'))
})

//game's variables
let players = []
let games = []

//socket's methods
io.on('connection', (socket) => {
  socket.on('user-name', (nome) => {
    if (nome) {
      players.push({
        id: socket.id,
        name: nome,
        value: players.length % 2 === 0 ? 'X' : 'O'
      })

      if (players.length === 2) {
        let game = {
          p1: players[0],
          p2: players[1],
          sum: 1
        }
        games.push(game)
        players.splice(0, 2)

        io.emit('iniciar-jogo', game)
      }
    }
  })

  socket.on('playing', (btnId) => {
    console.log('Server: playing(btnId)')
    console.log(btnId)
    //btnId:{id}

    let game = games.find((g) => g.p1.id === socket.id || g.p2.id === socket.id)
    if (game) {
      //Determinar qual jogador ('p1' ou 'p2') está fazendo a jogada
      let playerKey = game.p1.id === socket.id ? 'p1' : 'p2'
      let proximaVez = ''

      //Registrar a jogada do jogador
      if (playerKey === 'p1') {
        game.p1.move = btnId.id
        game.p2.move = ''
        proximaVez = '0'
      } else {
        game.p1.move = ''
        game.p2.move = btnId.id
        proximaVez = 'X'
      }

      //incrimentar o contador de jogadas
      game.sum++

      game.vez = proximaVez
      // console.log('>Server: game')
      // console.log(game)

      //emitir o estado atualizado do jogo para todos os clientes
      io.emit('estado-atualizado', game)
    }
  })

  socket.on('fim-jogo', (winner) => {
    console.log('>Server: Winner: ', winner)
    io.emit('fim-de-jogo', winner)
  })
})

//end of socket's methods

serverHTTP.listen(PORT, () => {
  console.log(`Tic-Tac-Toe is running on PORT:${PORT}`)
})
