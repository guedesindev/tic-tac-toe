import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js'
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js'
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  child,
  onChildAdded,
  onChildChanged,
  update,
  remove,
  onValue
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js'

const firebaseConfig = {
  //cole aqui as configurações da tua aplicação firebase
}

initializeApp(firebaseConfig)

const auth = getAuth()
const db = getDatabase()

export {
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
  onValue,
  update,
  remove
}
