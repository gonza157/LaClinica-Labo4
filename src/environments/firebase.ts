// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
   apiKey: "AIzaSyBKhhspqYqLkjQxZX9rJhmdTL5SCqYTA2o",
  authDomain: "clinica-online-da668.firebaseapp.com",
  projectId: "clinica-online-da668",
  storageBucket: "clinica-online-da668.firebasestorage.app",
  messagingSenderId: "1082058402418",
  appId: "1:1082058402418:web:6914cc7ae8a68f2a2070eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);