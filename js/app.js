const acceder = document.getElementById('acceder');
const salir = document.getElementById('salir');
const formulario= document.getElementById('formulario');
const templateChat = document.getElementById('templateChat').content;
const chat = document.getElementById('chat');
const btnEnviar = document.getElementById('btnEnviar');
const mensajeLogOut = document.getElementById('acceder');

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
    getAuth, // Autetiticacion de Google
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    query, 
    onSnapshot,              
    orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZAMnu1wa1iW4c1p5hPGVoQQcttdEZFpE",
  authDomain: "chat-firebase-freelancer.firebaseapp.com",
  projectId: "chat-firebase-freelancer",
  storageBucket: "chat-firebase-freelancer.appspot.com",
  messagingSenderId: "550679644933",
  appId: "1:550679644933:web:e7b3113f5c2de25ede456c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);  // Generamos conexion
const auth = getAuth(app); // Para obtener autoteticacion.
const db = getFirestore(app); // Llamamos al a base de datos

const mostrarElemento = elemento => {  // Funcion generica que recibe elementos de HTML
    elemento.classList.remove('d-none')
}

const ocultarElemento = elemento => {
    elemento.classList.add('d-none')
}

// ---- APARATADO DE DETECCION DE AUTETICACION ----
let unsuscribed // VAriable que me ayuda a saber si esta logeado o NO logeado

onAuthStateChanged(auth, (user) => {
    if(user) {
        mostrarElemento(chat)
        mostrarElemento(formulario)
        mostrarElemento(salir)
        ocultarElemento(acceder)
        ocultarElemento(mensajeLogOut)

        chat.innerHTML = ''
        // Si tenemos informacion, la traemos de la base de datos:
        const q = query(collection(db, 'chat'), orderBy('fecha')) // en la constante q almacena todo lo encontrado en los chats
        console.log(q); // Hasta aqui entra !!!!!!
        unsuscribed = onSnapshot(q, (snapshot) => {
            console.log(snapshot)
            snapshot.docChanges().forEach((change) => {
                if(change.type === 'added') {
                    dibujarChat(change.doc.data())
                    console.log(change.doc.data())
                }
                chat.scrollTop = chat.scrollHeight
            })
        })
    }  else {
        ocultarElemento(chat)
        ocultarElemento(formulario)
        ocultarElemento(salir)
        mostrarElemento(acceder)
        mostrarElemento(mensajeLogOut)    

        if(unsuscribed) {
            unsuscribed() // metodo de auteticacion 
        }
    }
})

acceder.addEventListener('click', async () => {
    try{ // al hacer la conexion necesitamos un provedor, en este caso es de Google:
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        console.log('---> acceso correcto!!');
    } catch(error) {
        console.log('==> ERROR!= ',error);
    }
})

salir.addEventListener('click', async () => {
    try {
        await signOut(auth)
    }
    catch (error) {
        console.log('==> Error',error);
    }
})

formulario.addEventListener('submit', async (e) => {
    e.preventDefault(); // No recibe mas eventos 
    // Validamos que no haya espacios vacios:
    if(!formulario.msg.value.trim()) {
        formulario.msg.focus()
        formulario.msg.value = ''
        return  
    }

    try {
        btnEnviar.disabled = true
        const mensaje = await addDoc(collection(db, 'chat'), {
            msg: formulario.msg.value.trim(),
            fecha: Date.now(),
            uid: auth.currentUser.uid            
        })
        formulario.msg.value = ''
    } catch (error) {
        console.log('==> ', error)
    } finally { // Haya o NO haya error el Finally se ejecutara siempre
        btnEnviar.disabled = false
    } 
})

const dibujarChat = ({msg, uid}) => {
    const clone = templateChat.cloneNode(true)
    if(uid === auth.currentUser.uid) {
        clone.querySelector('div').classList.add('text-end') 
        clone.querySelector('span').classList.add('bg-success')
        clone.querySelector('.mio').textContent = msg
    }
    else {
        clone.querySelector('div').classList.add('text-start') 
        clone.querySelector('span').classList.add('bg-secundary') 
        clone.querySelector('.otro').textContent = msg
    }
    chat.appendChild(clone)
}
