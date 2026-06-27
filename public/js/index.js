import eventManager from './eventmanager.js'
import game from './game.js'
import {
  tabuleiro,
  tab,
  modal,
  loading,
  iptNome,
  form,
  container,
  spanEnter,
  buttonOk,
  EVENTS
} from './constants.js'

// const app = initApp()
initialize()

let gameAtual = []
let gameAtualizado = {}
let namePlayer
let currentPlayer

spanEnter.addEventListener(EVENTS.CLICK, () => {
  modal.style.display = 'block'
})

buttonOk.addEventListener(EVENTS.CLICK, (e) => {
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
    eventManager.publish(EVENTS.USER_NAME, namePlayer)
  }
})

//inscrever-se para o evento 'iniciar-jogo'
eventManager.subscribe(EVENTS.START_GAME, (data) => {
  /**
   * Estrutura de dados do jogo
   * currentPlayer: 'X' || 'O'
   * players:
   *    player1: {id: 'LU2U53jiTGNiaCUeMqKSyVQi0y23', name: 'p1', value: 'X'}
   *    player2: {id: 'hhoMef5nhIZwWxzqziq8iS7hoZI2', name: 'p2', value: 'O'}
   * sum: 0
   */
  gameAtual = data
  gameAtualizado = {
    player1: gameAtual.players.player1,
    player2: gameAtual.players.player2
  }
  currentPlayer = gameAtual.currentPlayer
  let user = {}
  let opponent = {}

  user =
    gameAtual.players.player1['name'] === namePlayer
      ? gameAtual.players.player1
      : gameAtual.players.player2

  opponent =
    gameAtual.players.player1['name'] === namePlayer
      ? gameAtual.players.player2
      : gameAtual.players.player1

  modal.style.display = 'none'
  loading.style.display = 'none'
  container.style.display = 'none'
  tabuleiro.style.display = 'block'

  document.getElementById('user').innerText = user.name
  document.getElementById('opponent').innerText = opponent.name
  document.getElementById('opponentValue').innerText = opponent.value

  document.getElementById('player-vez').innerText = currentPlayer
})

/**
 * render tabuleiro
 * Este método roda apenas 1 vez
 * @returns
 */
function renderTabuleiro() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let btn = document.createElement('button')
      btn.classList.add('box')
      btn.id = `btn${i}-${j}`
      btn.textContent = ''
      btn.onclick = (event) => handleButtonClick(event.currentTarget.id)
      tab.appendChild(btn)
    }
  }
  return
}

renderTabuleiro()

eventManager.subscribe(EVENTS.NOTIFICATIONS, (data) => {
  let background
  if (data.resultado === 'erro') {
    background = '#DE633E'
  } else if (data.resultado === 'sucesso') {
    background = '#3C8A42'
  } else {
    background = '#F8F237'
  }

  let cor = data.cor ? data.cor : 'white'
  let msg = data.msg

  showNotifications(msg, background, cor)
  eventManager.publish(EVENTS.DELETE, EVENTS.NOTIFICATIONS)
})

eventManager.subscribe(EVENTS.PLAY, (data) => {
  if (data) {
    let dados = data.data
    let player = Object.values(gameAtualizado).find(p => p.name == namePlayer)


    if (player.value !== dados.value) {
      updateBoardUI(dados.btnId, dados.value)
      currentPlayer = toogleTurnPlayer(currentPlayer)
      eventManager.publish(EVENTS.TURN_PLAYER, currentPlayer)
    }
  }
})

eventManager.subscribe(EVENTS.CURRENT_PLAYER, (curPlayer) => {
  if (curPlayer) {
    currentPlayer = curPlayer
    console.debug(`ℹ️ [ INDEX ] evento ${EVENTS.NEXT_PLAYER}: ', ${curPlayer}`)
    document.getElementById('player-vez').innerText = curPlayer
    // eventManager.publish('delete-event', 'current-player')
  }
})

function updateBoardUI(id, p) {
  const btn = document.getElementById(id)
  if (btn) {
    btn.style.fontSize = '3rem'
    let cor = p === 'X' ? 'blue' : 'red'
    btn.style.color = cor
    btn.textContent = p
  }
}

function normalizeId(id) {
  let idCleaned = id.replace('btn', '')
  let [x, y] = idCleaned.split('-').map(Number)
  return [x, y]
}

function disableBoard() {
  const cells = document.querySelectorAll('.box')
  if (cells) {
    cells.forEach((cell) => {
      cell.disabled = true
    })
  }
}

function enableBoard() {
  const cells = document.querySelectorAll('.box')
  if (cells) {
    cells.forEach((cell) => {
      cell.disabled = false
    })
  }
}

function handleButtonClick(cellId) {
  const winner = game.checkWinner()

  let clickData = {}

  if (winner) {
    disableBoard()
    showNotifications(`${winner} ganhou o jogo!`, 'sucesso')
    return
  }

  if (isCellOcupied(cellId)) {
    showNotifications('⛔ Esta casa já está ocupada', '#DE633E', '#FFF')
    return
  }

  if (!isPlayerTurn(currentPlayer)) {
    showNotifications('⛔ Não é a sua vez de jogar!', '#DE633E', '#FFF')
    return
  }

  if (gameAtualizado) {
    if (
      gameAtualizado.player1.name === namePlayer &&
      gameAtualizado.player1.value === currentPlayer
    ) {
      clickData = { value: gameAtualizado.player1.value, btnId: cellId }
      console.debug('🟢 jogada do player1')
    } else if (
      gameAtualizado.player2.name === namePlayer &&
      gameAtualizado.player2.value === currentPlayer
    ) {
      clickData = { value: gameAtualizado.player2.value, btnId: cellId }
      console.debug('🟡 jogada do player2')
    }

    realizarJogada(cellId, clickData.value)
    eventManager.publish(EVENTS.CLICKED, clickData)
    updateBoardUI(clickData.btnId, clickData.value)
    currentPlayer = toogleTurnPlayer(currentPlayer)
    eventManager.publish(EVENTS.TURN_PLAYER, currentPlayer)
  }
  return
}

/**
 *
 * @param {array} id [x, y]
 * @param {*} valor X | Y
 */
function realizarJogada(id, valor) {
  let newId = normalizeId(id)
  let dataToGame = { x: newId[0], y: newId[1], curPlayer: valor }
  game.makeMove(dataToGame)
}

function isCellOcupied(cellId) {
  //verifica se a célula já está ocupada
  const cellButton = document.getElementById(cellId)
  return cellButton.textContent !== ''
}

function isPlayerTurn(player) {
  if (player === gameAtualizado.player1.value) {
    return gameAtualizado.player1.name === namePlayer
  }
  if (player === gameAtualizado.player2.value) {
    return gameAtualizado.player2.name === namePlayer
  }
}

function toogleTurnPlayer(curPlayer) {
  return curPlayer === 'X' ? 'O' : 'X'
}

function showNotifications(msg, background, color) {
  const not = document.getElementById('notificacao')
  not.style.backgroundColor = background
  not.style.color = color
  not.innerText = msg

  not.classList.remove('hidden')
  setTimeout(() => {
    not.classList.add('hidden')
  }, 5000)
}

function initialize() {
  tabuleiro.style.display = 'none'
  modal.style.display = 'none'
  loading.style.display = 'none'
}

function updateBoard(data) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let cellId = `btn${i}-${j}`
      let cellValue = data[i][j]
      let cellButton = document.getElementById(cellId)
      cellButton.textContent = cellValue
    }
  }
}
