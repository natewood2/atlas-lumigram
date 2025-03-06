// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBi8M6HvMgQJigD6slvckQ7XglvdGZCbXo",
  authDomain: "lumigram-67de3.firebaseapp.com",
  projectId: "lumigram-67de3",
  storageBucket: "lumigram-67de3.firebasestorage.app",
  messagingSenderId: "277729159562",
  appId: "1:277729159562:web:37ad0d99de536deeec4073",
  measurementId: "G-WZPR5HJT2T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize auth
export const auth = initializeAuth(app);

export const firestore = getFirestore(app);
export const storage = getStorage(app);