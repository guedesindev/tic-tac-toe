const spanEnter = document.getElementById('main-btn-text')
const modal = document.getElementById('modal-enter')
const iptNome = document.getElementById('ipt-name')
const buttonOk = document.getElementById('btn-ok')
const tabuleiro = document.getElementById('game')
const container = document.getElementById('container')
const loading = document.getElementById('loading')
const form = document.getElementById('form')
const tab = document.getElementById('tabuleiro')
const EVENTS = {
  CLICK: 'click',
  CLICKED: 'botao-clicado',
  CURRENT_PLAYER: 'player-atual',
  DEBUG: 'detalhe-debug', //informação-debug
  DEBUG_INFORMATION: 'informacoes-debug',
  DELETE: 'delete-evento',
  GAME_CREATED: 'partida-criada',
  INFORMATION: 'informacao',
  NEXT_PLAYER: 'novo-jogador-atual',
  NOTIFICATIONS: 'notificacoes',
  PLAY: 'jogada',
  PLAYER_CONFIG: 'configurar-player',
  PLAYER_JOINED: 'jogador-entrou',
  START_GAME: 'iniciar-partida',
  TURN_PLAYER: 'proximo',
  USER: 'usuario',
  USER_AUTH: 'autenticarcao',
  USER_NAME: 'nome_usuario',
  WINNER: 'vencedor',
  WINNER_DETECTED: 'vencedor-detectado',
  WINNER_NOTIFY: 'notificacao-vencedor' //'notify-winner',
}

export {
  spanEnter,
  modal,
  iptNome,
  buttonOk,
  tabuleiro,
  container,
  loading,
  form,
  tab,
  EVENTS
}
