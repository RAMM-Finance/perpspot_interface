// Import the functions you need from the SDKs you need
// import firebase from 'firebase/app'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXM0b99jAttP6XVHkJLgbC-Wa8zdVhRX0",
  authDomain: "limitless-firebase.firebaseapp.com",
  projectId: "limitless-firebase",
  storageBucket: "limitless-firebase.appspot.com",
  messagingSenderId: "224627653072",
  appId: "1:224627653072:web:6e4868649dc16387d761d5",
  measurementId: "G-65NY762J89"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const firestore = getFirestore(app)