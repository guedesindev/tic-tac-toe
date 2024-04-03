import eventManager from './eventmanager.js'
import game from './game.js'

const spanEnter = document.getElementById('main-btn-text')
const modal = document.getElementById('modal-enter')
const iptNome = document.getElementById('ipt-name')
const buttonOk = document.getElementById('btn-ok')
const tabuleiro = document.getElementById('game')
const container = document.getElementById('container')
const loading = document.getElementById('loading')
const form = document.getElementById('form')
const tab = document.getElementById('tabuleiro')

tabuleiro.style.display = 'none'
modal.style.display = 'none'
loading.style.display = 'none'

let gameAtual
let namePlayer
let id

spanEnter.addEventListener('click', () => {
  modal.style.display = 'block'
})

buttonOk.addEventListener('click', (e) => {
  e.preventDefault()

  const userName = iptNome.value

  namePlayer = userName
  if (userName === '') {
    return alert('Insira um nome de usuário')
  } else {
    form.style.display = 'none'
    modal.style.display = 'flex'
    modal.style.justifyContent = 'center'
    modal.style.alignItems = 'center'
    loading.style.display = 'block'
    loading.style.height = '100%'
    loading.style.width = '50%'
    eventManager.publish('user-name', { nome: userName })
  }
})

//inscrever-se para o evento 'iniciar-jogo'
eventManager.subscribe('iniciar-jogo', (game) => {
  gameAtual = game
  /*gameAtual
   * p1:{id:socket.id, name:'digitado', value: 'X'},
   * p2:{id:socket.opponent.id, name:'digitado', value:'O'},
   * sum:
   */

  modal.style.display = 'none'
  loading.style.display = 'none'
  container.style.display = 'none'
  tabuleiro.style.display = 'block'

  let user = gameAtual.p1.name === namePlayer ? gameAtual.p1 : gameAtual.p2

  let opponent = gameAtual.p2.name === namePlayer ? gameAtual.p1 : gameAtual.p2

  document.getElementById('user').innerText = user.name
  document.getElementById('opponent').innerText = opponent.name
  document.getElementById('opponetValue').innerText = opponent.value

  if (gameAtual.sum % 2 === 1) {
    document.getElementById('player-vez').innerText = user.value
  } else {
    document.getElementById('player-vez').innerText = opponent.value
  }
})

//render tabuleiro
function renderTabuleiro() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let btn = document.createElement('button')
      btn.classList.add('box')
      btn.id = `btn${i}-${j}`
      btn.textContent = ''
      btn.onclick = (event) => jogada(event.currentTarget.id)
      tab.appendChild(btn)
    }
  }

  return
}
renderTabuleiro()
//fim render tabuleiro

function jogada(btn) {
  if (btn) {
    eventManager.publish('botao-clicado', {
      id: btn
    })
  }
}

//Inscrever-se para o evento 'jogada-feita' para atualizar a interface do usuário quando a jogada é feita
eventManager.subscribe('jogada', (data) => {
  //data = playerThatMoved = {id:socket.id, name:p1, value:'X'||'O',move:'btn.id}
  document.getElementById('player-vez').innerText = data.value
  let [x, y] = normalizeId(data.move)
  game.makeMove(x, y)
  let id = `btn${x}-${y}`
  updateBoardUI(id, data.value)
})

eventManager.subscribe('move-made', (data) => {
  if (data.winner !== null) {
    console.log('>Index: winner', data.winner)
    disableBoard()
    eventManager.publish('verifica-vencedor', data.winner)
  }
})

function updateBoardUI(id, p) {
  if (id) {
    const btn = document.getElementById(id)
    btn.style.fontSize = '3rem'
    let cor = p === 'X' ? 'blue' : 'red'
    btn.style.color = cor
    btn.textContent = p
  }
}

eventManager.subscribe('atualizar-jogo', (data) => {
  const board = game.board
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      let cellId = `btn${i}-${j}`
      let cellValue = board[i][j]
      let cellButton = document.getElementById(cellId)
      cellButton.textContent = cellValue
    }
  }
})

function normalizeId(id) {
  let idCleaned = id.replace('btn', '')
  let [x, y] = idCleaned.split('-').map(Number)
  return [x, y]
}

function disableBoard() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let cellId = `btn${i}-${j}`
      document.getElementById(cellId).disabled = true
    }
  }
}
