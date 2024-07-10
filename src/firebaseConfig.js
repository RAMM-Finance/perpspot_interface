// Import the functions you need from the SDKs you need
// import firebase from 'firebase/app'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "limitless-c0f3a.firebaseapp.com",
  projectId: "limitless-c0f3a",
  storageBucket: "limitless-c0f3a.appspot.com",
  messagingSenderId: "566464768016",
  appId: "1:566464768016:web:a9053f0a3656c04beac295",
  measurementId: "G-8QWWDJZJCJ"
};
// const firebaseConfig = {
//   apiKey: "",
//   authDomain: "limitless-firebase.firebaseapp.com",
//   projectId: "limitless-firebase",
//   // storageBucket: "limitless-firebase.appspot.com",
//   messagingSenderId: "224627653072",
//   appId: "1:224627653072:web:6e4868649dc16387d761d5",
//   measurementId: "G-65NY762J89"
// };


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "limitless-c0f3a.firebaseapp.com",
  projectId: "limitless-c0f3a",
  storageBucket: "limitless-c0f3a.appspot.com",
  messagingSenderId: "566464768016",
  appId: "1:566464768016:web:a9053f0a3656c04beac295",
  measurementId: "G-8QWWDJZJCJ"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const firestore = getFirestore(app)
