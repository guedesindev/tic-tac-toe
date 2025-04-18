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

  makeMove(data) {
    this.currentPlayer = data.curPlayer
    this.board[data.x][data.y] = this.currentPlayer
    let winner = this.checkWinner() ? this.checkWinner() : null
    if (winner) eventManager.publish('vencedor', winner)
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
