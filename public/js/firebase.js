import { EVENTS } from './constants.js'
import eventManager from './eventmanager.js'
import {
  auth,
  db,
  onAuthStateChanged,
  signInAnonymously,
  set,
  ref,
  get,
  push,
  child,
  onChildAdded,
  onChildChanged,
  update,
  remove,
  onValue
} from './firebaseConfig.js'

/**
 * obs.: tentando usar o padrão nos métodos para setar itens no baco de dados
 *       1º argumento: referência
 *       2º argumento: dados
 */

const player = {}
const gamesRef = ref(db, 'games/game')

var currentMatch = null

eventManager.subscribe(EVENTS.USER_AUTH, async (nome) => {
  if (nome) {
    player.name = nome
    try {
      await signInAnonymously(auth).then(async () => { })

      let usuario = await getAuthenticatedUser()
      if (usuario) {
        usuario.displayName = nome
        eventManager.publish(EVENTS.USER, usuario)
      }
    } catch (error) {
      var errorCode = error.code
      var errorMessage = error.message
      console.error(errorCode, errorMessage)
    }
  }
})

eventManager.subscribe(EVENTS.PLAYER_CONFIG, async (data) => {
  if (data) {
    player.uid = data.uid
    player.id = gerateId()
    player.name = data.displayName
    player.points = 0

    await handleJoinGame(gamesRef, player)
  }
})

eventManager.subscribe(EVENTS.CLICKED, async (data) => {
  try {
    currentMatch = await findGameId(player.id)
    if (currentMatch) {
      const currentMatchRef = child(gamesRef, currentMatch)

      const moveRef = child(currentMatchRef, 'moves')
      let moveData = { btnId: data.btnId, value: data.value }
      await atualizarMovimento(moveRef, moveData)
    } else {
      console.error(`⛔ Partida não encontrada para o jogador: ', ${player.id}`)
      throw error
    }
  } catch (error) {
    console.error('⛔ Erro ao processar clique no botão: ', error.message)
  }
})

eventManager.subscribe(EVENTS.TURN_PLAYER, async (currentPlayer) => {
  let matchRef = child(gamesRef, currentMatch)
  await update(matchRef, { currentPlayer: currentPlayer })

})

eventManager.subscribe(EVENTS.WINNER_DETECTED, async (winner) => {
  const matchRef = child(child(gamesRef, currentMatch), 'winner')

  await set(matchRef, winner)

  if (winner !== 'emptate') {
    atualizarPontuacao(child(gamesRef, currentMatch), winner, 1)
  }
})

async function getAuthenticatedUser() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user)
        return user
      } else {
        reject(new Error('Usuário não autenticado'))
      }
    })
  })
}

async function handleJoinGame(gamesRef, player) {
  /**
   * Neste ponto do código, busca o banco se há partidas criadas
   * SIM
   *    verifica se a partida tem 2 jogadoes ou apenas 1
   *       1 jogador -> adiciona um segundo jogador putPlayer(matchRef, player)
   *       2 jogadores -> cria nova partida startNewGame(gamesRef, player)
   *
   */
  const gamesList = await getMatches(gamesRef)
  if (gamesList) {
    try {
      let matchAvaliableId = findAvaliableGame(gamesList)
      currentMatch = matchAvaliableId
      if (matchAvaliableId) {
        //verificar value do player conectado à partida
        // const matchRef = child(gamesRef, 'game/' + matchAvaliableId) //Somente para testes
        const matchRef = child(gamesRef, matchAvaliableId)

        currentMatch = matchAvaliableId
        await putPlayer(matchRef, player)
      } else {
        console.error('🌐 Não há partidas disponíveis. Criano uma nova...')
        await startNewGame(gamesRef, player)
      }
    } catch (error) {
      console.error('⛔ Erro ao captar lista de partidas: ', error.message)
      throw error
    }
  } else {
    console.error('⛔ Não há partidas a listar. Criano uma nova...')
    try {
      await startNewGame(gamesRef, player)
    } catch (error) {
      console.error('⛔ Erro ao criar nova partida: ', error.message)
    }
  }
  observarMovimentos(child(gamesRef, currentMatch))
  observarJogadores(child(gamesRef, currentMatch))

}

/**
 * Inicia uma nova partida e cadastra player nela
 * @param {Object} player
 * @param {ref} gamesRef
 */
async function startNewGame(gamesRef, player) {
  if (player) {
    player.value = 'X'
  }
  /**
   * Configurações iniciais para criar uma partida
   * Criação da referência geral game (caso não exista) e setar um novo ID
   * Cada vez que o método startNewGame é chamado, é criado uma nova partida
   * com um ID distinto
   * Setar o valor isFull como false e sum como 0
   * Criação da referencia players
   * Criação da referência player1
   */
  // let newGameRef = await push(child(gamesRef, 'game')) //somente para testes

  const newGameRef = await push(gamesRef)

  await set(newGameRef, {
    isFull: false,
    currentPlayer: 'X',
    moves: '',
    currentMatch: newGameRef.key
  })

  const playersRef = await child(newGameRef, 'players')
  const newPlayerRef = await child(playersRef, 'player1')

  currentMatch = newGameRef.key
  try {
    await set(newPlayerRef, {
      id: player.id,
      name: player.name,
      uid: player.uid,
      value: 'X',
      points: player.points
    })
  } catch (error) {
    console.error('⛔[ firebase] Erro ao iniciar nova partida: ', error.message)
    throw error
  }
  observarFimJogo(child(gamesRef, currentMatch))
}

async function putPlayer(matchRef, player) {
  try {
    const gamer = await getMatchPlayers(matchRef)
    if (gamer) {
      player.value = gamer['player1'].value === 'X' ? 'O' : 'X'
      await joinGame(matchRef, player)
      const snapshot = await get(matchRef)
      const gamers = snapshot.val()
      if (gamers) {
        const eventData = {
          currentPlayer: gamers.currentPlayer,
          players: {
            player1: gamers.players['player1'],
            player2: gamers.players['player2']
          }
        }

        // await persistirEventos(matchRef, eventData)
        eventManager.publish(EVENTS.PLAYER_JOINED, eventData)
      }
    }
  } catch (error) {
    console.error('Erro ao buscar partidas ', error.message)
    throw error
  }
}

/**
 * Associa o player a uma partida já existente
 * @param {Object} player
 * @param {ref} matchRef
 */
async function joinGame(matchRef, player) {
  //adiciona o jogador ao nó de jogadores da partida
  let playersRef = child(matchRef, 'players')
  let newPlayerRef = child(playersRef, 'player2')
  //define os dados do novo jogador
  try {
    await set(newPlayerRef, player)

    try {
      await update(matchRef, { isFull: true })
    } catch (error) {
      console.error('Erro ao alterar o valor de isFull: ', error.message)
    }
    let eventData = {
      type: EVENTS.NOTIFICATIONS,
      details: {
        resultado: 'sucesso',
        msg: `${player.name} entrou na partida!`
      }
    }

    try {
      await persistirEventos(matchRef, eventData)
    } catch (error) {
      console.error(
        `Erro ao adicionar evento de sucesso do ${player.name} entrando na partida`
      )
    }
  } catch (error) {
    console.error(
      '⛔ Erro ao adicionar player2 na partida: ',
      matchRef.key,
      error.message
    )
  }
}

function gerateId() {
  let id = Math.floor(Math.random() * 1000000000000000).toString(36)
  return id
}

/**
 * Localiza se há partidas cadastradas
 * @param {ref} gamesRef
 * @returns {Object} matches
 */
async function getMatches(ref) {
  try {
    const snapshot = await get(ref)
    const matches = snapshot.val()
    if (matches) {
      return matches
    }
  } catch (error) {
    console.error(
      '⛔ [firebase] getMatches: erro o obter partidas -',
      error.message
    )
    return null
  }
}

/**
 * localizar players da partida e retornar a lista de players
 * @param {ref} matchRef
 * @returns {Object} gamersList
 */
async function getMatchPlayers(matchRef) {
  try {
    const gamers = await get(child(matchRef, 'players'))
    if (gamers) return gamers.val()
  } catch (error) {
    console.error(
      '⛔ [firebase] Erro ao recuperar jogadores da partida ',
      error.message
    )
    return null
  }
}

/**
 * Verifica se há partidas com apenas 1 player conectado
 * @param {Object} gamesData
 * @returns gameId
 */
function findAvaliableGame(gamesData) {
  //validação dos dados
  try {
    const gamesObject =
      typeof gamesData === 'object' ? gamesData : JSON.parse(gamesData)

    for (const gameKey in gamesObject) {
      if (!gamesObject[gameKey].isFull) {
        return gameKey
      }
    }
  } catch (error) {
    console.error(
      '⛔[firebase] Erro ao buscar partida disponível ',
      error.message
    )
  }

  return null
}

async function findGameId(playerId) {
  try {
    const gameSnapshot = await getMatches(gamesRef)
    if (gameSnapshot) {
      for (const gameId in gameSnapshot) {
        const game = gameSnapshot[gameId]
        const players = game.players

        if (
          players['player1'].id === playerId ||
          players['player2'].id === playerId
        ) {
          return gameId
        }
      }
    }
  } catch (error) {
    console.error('⛔[firebase] Erro ao buscar Id da partida: ', error.message)
  }
  return null
}

async function atualizarPontuacao(matchRef, winner, pontuacao) {
  const players = await getMatchPlayers(matchRef)
  console.log(winner)
  console.log(players)
  let player = Object.values(players).find(p => p.value === winner)
  player.points += 1
  await update(child(matchRef, 'players'), players)
}

/**Métodos para andamento da partida */
//Persistir atualizações no banco de dados
async function atualizarMovimento(ref, moveData) {
  const newMove = push(ref)
  await update(newMove, moveData)
}

async function observarMovimentos(matchRef) {
  const movesRef = await child(matchRef, 'moves')

  onChildAdded(movesRef, (snapshot) => {
    const moves = snapshot.val()

    eventManager.publish(EVENTS.PLAY, { data: moves })
  })
}

async function observarJogadores(matchRef) {

  onValue(child(matchRef, 'isFull'), async snapshot => {
    if (snapshot.val()) {
      const jogadores = await getMatchPlayers(matchRef)
      eventManager.publish(EVENTS.PLAYER_JOINED, { players: jogadores, currentPlayer: 'X' })
    }
  })

  onValue(child(matchRef, 'players'), async snapshot => {
    if (snapshot.val()) {
      console.log(snapshot.val())
      const jogadores = snapshot.val()
      eventManager.publish('atualizar-pontuacao', jogadores)
    }
  })
}

async function observarFimJogo(matchRef) {
  onValue(child(matchRef, 'winner'), async snapshot => {
    if (snapshot.val()) {
      eventManager.publish(EVENTS.WINNER_NOTIFY, snapshot.val())
    }
  })
}

/**
 * Métodos para tratar de eventos
 * @param {ref} matchRef
 * @param {object} eventData
 */
//função para enviar eventos para o firebase
// async function persistirEventos(matchRef, eventData) {
//   const eventosRef = child(matchRef, 'eventos')
//   var thisEvent = child(eventosRef, eventData.type)

//   const dataToSend = eventData
//   try {
//     await set(thisEvent, dataToSend)
//     eventsObserver(gamesRef, currentMatch)
//   } catch (error) {
//     console.error(
//       '⛔ [firebase] Erro ao salvar evento: ',
//       eventData.type,
//       ' -> ',
//       error.message
//     )
//   }
// }

// async function eventsObserver(gamesRef, matchId) {
//   const gameRef = await child(gamesRef, matchId)
//   const eventRef = await child(gameRef, 'eventos')

//   onChildAdded(eventRef, async (snapshot) => {
//     const evento = await snapshot.val()
//     if (evento) eventManager.publish(evento.type, evento.details)
//   })
// }

// async function deletarEventos(data) {
//   const gameRef = ref(db, `games/game/${currentMatch}`)

//   const eventRef = child(gameRef, 'eventos')
//   const eventToDel = child(eventRef, data)

//   await remove(eventToDel)
// }
