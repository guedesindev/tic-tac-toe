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
  apiKey: 'AIzaSyBKFqcmWVEqO1rvQhSJsCc4nAC6fDfCYW8',
  authDomain: 'tic-tac-toe-7dc79.firebaseapp.com',
  databaseURL: 'https://tic-tac-toe-7dc79-default-rtdb.firebaseio.com',
  projectId: 'tic-tac-toe-7dc79',
  storageBucket: 'tic-tac-toe-7dc79.firebasestorage.app',
  messagingSenderId: '1000903973824',
  appId: '1:1000903973824:web:0a8922fc30f29c89f00625'
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
