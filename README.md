## TIC TAC TOE

# O famoso Jogo da Velha

## Visão Geral do Projeto

Um jogo antigo e divertido, com baixa complexidade de regras, mas muito rico quando se trata de tecnologia para desenvolvê-lo. O projeto tem foco no jogo multiplayer, 1 vs 1, sem uso de frameworks e bibliotecas.

### Tecnologias Usadas

![Tecnologias](https://skillicons.dev/icons?i=html,css,js,firebase)

**Firebase**:

- Authentication
- Database Realtime

### Padrões de Arquitetura

#### 🎯 Padrão de Projeto: Observer Pattern

O projeto utiliza o padrão Observer, comum em aplicações baseadas em eventos. Esse padrão permite que diferentes partes do sistema se comuniquem de forma desacoplada.

Definição: Um objeto (sujeito) mantém uma lista de observadores e os notifica automaticamente quando seu estado muda.

📦 Implementação
O módulo `eventManager.js` é responsável por essa funcionalidade. Ele expõe quatro métodos principais:

`subscribe(event, callback)` – Registra uma função para ser chamada quando o evento for disparado.

`unsubscribe(event, callback)` – Remove um observador previamente registrado (não utilizado neste projeto).

`publish(event, data)` – Dispara um evento, notificando todos os observadores registrados.

`reset()` – Limpa todos os observadores registrados. Neste projeto, é utilizado para reiniciar a partida.

🔁 Exemplo de Fluxo
O módulo `index.js` publica o evento `USER_NAME` com o nome do jogador preenchido no formulário:

```javascript
eventManager.publish(EVENTS.USER_NAME, namePlayer)
```

O módulo `client.js` está inscrito nesse evento, atualiza o objeto `player` e dispara o evento `USER_AUTH`:

```javascript
eventManager.subscribe(EVENTS.USER_NAME, (name) => {
  player.name = name
  eventManager.publish(EVENTS.USER_AUTH, name)
})
```

O módulo `firebase.js` escuta o evento `USER_AUTH`, autentica o usuário e publica o evento `USER` com os dados:

```javascript
eventManager.subscribe(EVENTS.USER_AUTH, (name) => {
  // autentica no Firebase
  eventManager.publish(EVENTS.USER, usuario)
})
```

💡 Observação: Há uma redundância aqui — o evento `USER` é novamente escutado por `client.js`, que apenas repassa os dados. Isso poderia ser simplificado tratando os dados diretamente após `USER_AUTH`.

📑 Organização de Eventos
Para evitar conflitos ou repetições, todos os eventos são centralizados no objeto `EVENTS`, garantindo nomes descritivos e padronizados:

```javascript
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
```

Catalogar todos os possíveis eventos, não é um trabalho trivial, por isso enquanto percebia a necessidade, adicionava neste objeto mais um evento, e esta é a estrutura atual.
