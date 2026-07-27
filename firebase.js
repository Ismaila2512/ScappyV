// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDuZ1c7ysauWl4kM2S9SPytxXozfZItANI",
    authDomain: "scotty-88bd2.firebaseapp.com",
    projectId: "scotty-88bd2",
    storageBucket: "scotty-88bd2.firebasestorage.app",
    messagingSenderId: "121611073149",
    appId: "1:121611073149:web:1d1b00a6e8511c99e52314",
    measurementId: "G-K7RC38ZW50"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);