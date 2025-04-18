## TIC TAC TOE

# O famoso Jogo da Velha

## Introdução

Tudo que vejo acontecer imagino como seria um código daquilo. Não, não estou ficando louco e não é brincadeira, literalmente tudo que vejo acontecer imagino como seria um código para aquilo. E toda vez que via o jogo da velha pensava: "Poxa, como será que é fazer um jogo da velha em javascript puro, sem frameworks e biblioteca?"

Tentei uma vez, e travei na verificação do vencedor da partida, foi um design me feio, mas a ideia era focar no código. Na primeira vez que tentei, foi tanto if~else que minha cabeça deu um nó, aí vi um vídeo do Filipe Deschamps falando dos desenvolvedores inexperientes quando exageram nos ifs~else, eu tentei melhorar aquilo, pensei, pensei, pensei e nada. Então mais um projeto engavetado.

Certa feita, pensei, agora eu sei um pouco mais, vou tentar de novo, e claro como um perfeito procrastinador, comecei do zero, que `aproveitar código` que nada, pra mostrar que vou até o fim, vou começar do começo, afinal: "Temos de começar do começo, senão acabamos nunca acabando", pois então, travei de novo. Perdi horas e horas no visual, posição de X, posição de O, onde vai ficar o nome do player, e o placar? Não tem de ficar numa posição.... Já percebue o drama não é? Mais uma vez focado no que não era tão importante. Mais uma vez aquela gaveta sem fundo do hd cheio de diretórios com projetos não acabados.

Mas agora, está aqui, estou me comprometendo a terminar o projeto e é claro, se não colocar nada às vistas de outros que possam me cobrar, voltaria para a gaveta e este projeto: 'Quebrando Padrões Mentais' é o jeito que achei de colocar o bloco na avenida, mesmo que as fantasias não estejam prontas. O projeto que apresentarei a vocês nesta série de posts não está pronto, obstáculos, barreiras que aos poucos serão todos vencidos.

Vamos colocar a mão na massa?

### Tecnologias

![Tecnologias](https://skillicons.dev/icons?i=html,css,js,firebase)

**Firebase**:

- Authentication
- Database Realtime

### Observer Pattern

Esse padrão de projeto (design pattern) é muito usado em sistemas baseados em `eventos`.

A ideia principal é:

>"Um objeto (o sujeito) mantém uma lista de dependentes (os observadores) e os notifica automaticamente sempre que houver uma mudança no estado do evento."

Quando inicie a jornada para desenvolver este projeto, queria aprender a usar o `firebase` no `html`. Aí percebi que não estava usando no html, mas sim no javascript (rsrs). O bom é que aprendi, não é?

A intenção sempre foi não usar frameworks e nem bibliotecas para front-end ou backend, literalmente fazer tudo _na unha_, por isso optei por desenvolver um observer pattern para o projeto, o arquivo `eventManager.js` faz esse papel.

Este módulo `js` possui um objeto com 4 funções: `subscribe`, `ubsubscribe`, `publish`, `reset`.

- subscribe: um observador se registra para receber notificações de quando algum evento é disparado;
- usubscribe: a verdade é que nem usei este método, pode ser até que precisasse. Em resumo, o observador diz ao eventManager que não quer mais ser notificado por aquele evento.
- publish: um evento publicado para avisar aos observadores, para este evento registrados, que o estado foi alterado e assim eles realizam as ações necessárias.
- reset: o objeto é esvaziado não havendo mais observadores a serem notificados. Para este projeto serve para resetar a partida.

Exemplo:

O módulo index.js publica o evento: EVENTS.USER_NAME assim que o usuário clica no botão 'OK' no formulário. Junto com o evento, `user_name` o index.js envia o nome salvo na variável `namePlayer` que o usuário preencheu no formulário.

```javascript
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
    // console.clear()
    eventManager.publish(EVENTS.USER_NAME, namePlayer)
  }
})
```

O módulo `client.js`, que age como se fosse o back-end da estrutura cliente-servidor, recebe do front-end `index.js` o nome que o player digitou no formulário. O valor recebido é adicionado à estrutura do objeto player com `player.name = name` e envia este valor para autenticação no `firebase auth`

```javascript
// client.js
eventManager.subscribe(EVENTS.USER_NAME, (name) => {
  player.name = name
  eventManager.publish(EVENTS.USER_AUTH, name)
})
```

Perecba que os módulos subscrevem-se para sere, notificados de alterações de estado e os mesmos tratam os dados recebidos que repassam por meio de publicação de eventos.

O evento EVENTS.USER_AUTH é publicado, e então o módulo firebase.js que está escrito para receber notificações para este evento, recebe anotifação e os dados passados com o evento, faz a autenticação do usuário e torna publicar o evento, agora o evento é com os dados usuário: `nome` e `uid`.
```javascript
eventManager.publish(EVENTS.USER, usuario)
```
O método publish é como uma publicação que tem em seu cabeçalho: 'A quem interessar possa, aí vão dados' e quem se interesa subscreve-se para receber esses dados. Muito legal, não é?

Neste processo de, eventos que vão, eventos que vêm é muito fácil se perder nos nomes de eventos já criados e eventos que se pode subscrever. Enquanto você está desenvolvendo aquela funcionalidade, o nome fica 'fresco' em sua mente, aí você não se perde, mas na hora de um apossível manutenção, a coisa fica complicada.

Para evitar este transtorno de ficar perseguindo o evento para entender de onde veio e pra onde vai, criei uma constante, que é um objeto com os eventos q eu estava criando, tentei seguir o mesmo princípio que usamos para a criação de nomes de variáveis, nomes descritivos.
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
Ainda assim, não foi fácil catalogar todos os possíveis eventos, então enquanto ia tendo a necessidade, eu ia adicionando neste objeto mais um evento, e por enquanto está nisso aí.