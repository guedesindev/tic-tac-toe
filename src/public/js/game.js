import eventManager from './eventmanager.js'

class TicTacToe {
  constructor() {
    this.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ]
    this.currentPlayer = 'X'
  }

  makeMove(x, y) {
    if (this.isValidMove(x, y)) {
      this.board[x][y] = this.currentPlayer
      let winner = this.checkWinner() ? this.checkWinner() : null
      this.togglePlayer()
      //publicar o evento 'move-made' com o estado atual do tabuleiro e o jogador atual
      eventManager.publish('move-made', {
        board: this.board,
        currentPlayer: this.currentPlayer,
        winner: winner
      })
    }
  }

  isValidMove(x, y) {
    if (x >= 0 && x < 3 && y >= 0 && y < 3) {
      return this.board[x][y] === ''
    } else {
      //se x ou y estiverem fora dos limites, retorna false
      return false
    }
  }

  togglePlayer() {
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X'
  }

  checkWinner() {
    //verificação linhas
    for (let i = 0; i < 3; i++) {
      if (
        this.board[i][0] === this.currentPlayer &&
        this.board[i][1] === this.currentPlayer &&
        this.board[i][2] === this.currentPlayer
      ) {
        return this.currentPlayer
      }
    }
    //verificação colunas
    for (let i = 0; i < 3; i++) {
      if (
        this.board[0][i] === this.currentPlayer &&
        this.board[1][i] === this.currentPlayer &&
        this.board[2][i] === this.currentPlayer
      ) {
        return this.currentPlayer
      }
    }
    //verificação diagonal principal
    if (
      this.board[0][0] === this.currentPlayer &&
      this.board[1][1] === this.currentPlayer &&
      this.board[2][2] === this.currentPlayer
    ) {
      return this.currentPlayer
    }

    //verificação diagonal secundária
    if (
      this.board[0][2] === this.currentPlayer &&
      this.board[1][1] === this.currentPlayer &&
      this.board[2][0] === this.currentPlayer
    ) {
      return this.currentPlayer
    }

    //verifica empate
    if (this.board.flat().every((cell) => cell !== '')) {
      return 'Empate'
    }
    //Se não houver vencedor ou empate, retorna null (partida continua)
    return null
  }
}

const game = new TicTacToe()

export default game
