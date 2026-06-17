import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCn2QooFoAhDYnT3PSzQtzvPYRIuuMl9c0",
  authDomain: "damexmarege.firebaseapp.com",
  projectId: "damexmarege",
  storageBucket: "damexmarege.firebasestorage.app",
  messagingSenderId: "442215248712",
  appId: "1:442215248712:web:34ba3142ff004f0333b97d",
  measurementId: "G-VZRYDN4NW2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
};
