const eventManager = {
  events: {},
  subscribe(eventName, fn) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    const alreadySubscribed = this.events[eventName].includes(fn)
    if (alreadySubscribed) {
      console.log(
        `[⚠️ EventManager] Função já está inscrita no evento ${eventName}`
      )
      return
    }

    this.events[eventName].push(fn)
  },
  unsubscribe(eventName, fn) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(
        (eventFn) => fn !== eventFn
      )
    } else {
      console.log(
        `[⚠️ EventManager] Evento ${eventName} não está registrado. Favor verificar o nome do evento!`
      )
    }
  },
  publish(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((fn) => {
        fn(data)
      })
    } else {
      console.log(
        `[⚠️ EventManager] ${eventName} não está registrado. Favor verificar o nome do evento`
      )
    }
  },
  reset() {
    this.event = {}
    console.log(`[✅ EventManager] Limpa a coleção de eventos`)
  }
}

export default eventManager
