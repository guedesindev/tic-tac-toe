import eventManager from './eventmanager.js'
const socket = io()

let nomePlayer = ''
let value = ''
eventManager.subscribe('user-name', (user) => {
  console.log(`>Client: user-name: ${user.nome}`)
  nomePlayer = user.nome
  socket.emit('user-name', user.nome)
})

socket.on('iniciar-jogo', (game) => {
  eventManager.publish('iniciar-jogo', game)
})

eventManager.subscribe('botao-clicado', (btnId) => {
  //enviar jogada para o servidor
  socket.emit('playing', btnId)
})

socket.on('estado-atualizado', (data) => {
  //data: {p1:{dados player1}, p2:{dados player2}, sum, vez: 'X'||'O'}
  value = data.p1.name === nomePlayer ? data.p1.value : data.p2.value
  const playerThatMoved = data.p1.move ? data.p1 : data.p2
  eventManager.publish('jogada', playerThatMoved)
})

eventManager.subscribe('verifica-vencedor', (winner) => {
  if (winner !== value) {
    console.log(`>Cliente - vencedor: ${winner}`)
    if (winner !== 'Empate') {
      alert(`${winner} venceu`)
    } else {
      alert('EMPATOU!!!')
    }
  }
})

socket.on('fim-de-jogo', (winner) => {
  console.log('>Client:fim-de-jogo-> winner: ', winner)
  alert(`${winner} venceu!`)
})
