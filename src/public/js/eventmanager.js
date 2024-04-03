const eventManager = {
  events: {},
  subscribe(eventName, fn) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    } else {
      console.log(
        `Este evento já está registrado. Favor verificar nome do evento!`
      )
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
        `Evento ${eventName} não está registrado. Favor verificar o nome do evento!`
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
        `${eventName} não está registrado. Favor verificar o nome do evento`
      )
    }
  }
}
export default eventManager
