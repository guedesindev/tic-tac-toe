import eventManager from './eventmanager.js'
import { EVENTS } from './constants.js'

const player = {}

eventManager.subscribe(EVENTS.USER_NAME, (name) => {
  player.name = name
  eventManager.publish(EVENTS.USER_AUTH, name)
})

//evento disparado por firebase.js
eventManager.subscribe(EVENTS.USER, (data) => {
  eventManager.publish(EVENTS.PLAYER_CONFIG, data)
})

//evento disparado por firebase.js
eventManager.subscribe(EVENTS.PLAYER_JOINED, (data) => {
  //evento enviado para o index atualizar o front-end e direcionar os players ao tabuleiro
  if (data) {
    let players = data['players']
    for (let id in players) {
      if (players[id].name === player.name) {
        player.id = players[id].id
        player.value = players[id].value
      }
    }
    eventManager.publish(EVENTS.START_GAME, data)
  }

  // console.clear()
})

eventManager.subscribe(EVENTS.CURRENT_PLAYER, (data) => {
  if (data) {
    eventManager.publish(EVENTS.NEXT_PLAYER, data.value)
  }
})

// eventManager.subscribe(EVENTS.DEBUG_INFORMATION, (data) => {
//   eventManager.publish(EVENTS.DELETE, EVENTS.DEBUG)
// })

eventManager.subscribe(EVENTS.INFORMATION, (data) => {
  // eventManager.publish('delete-event', 'informação')
})


eventManager.subscribe(EVENTS.WINNER, (winner) => {
  if (winner) {
    eventManager.publish(EVENTS.WINNER_DETECTED, winner)
  }
})

eventManager.subscribe(EVENTS.WINNER_NOTIFY, (data) => {
  let resultado = ''
  let msg = ''

  if (data === player.value) {
    msg = 'Parabéns você venceu 🍾'
  } else if (data === 'empate') {
    msg = 'Opa o jogo empatou 🤷🏾'
  } else {
    msg = 'Que pena você perdeu ☹️'
  }

  resultado =
    data === player.value
      ? 'sucesso'
      : data === 'empate'
        ? 'alert'
        : 'erro'

  let cor = data === player.value ? '#FFF' : '#444'
  let eventdata = {
    type: EVENTS.NOTIFICATIONS,
    details: {
      msg: msg,
      resultado: resultado,
      cor: cor
    }
  }

  eventManager.publish(eventdata.type, eventdata.details)
})
