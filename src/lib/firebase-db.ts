import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDuZ1c7ysauWl4kM2S9SPytxXozfZItANI",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "scotty-88bd2.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "scotty-88bd2",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "scotty-88bd2.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "121611073149",
    appId: process.env.FIREBASE_APP_ID || "1:121611073149:web:1d1b00a6e8511c99e52314",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-K7RC38ZW50"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const saveChatMessage = async (
  role: 'user' | 'assistant' | 'system',
  content: string,
  userEmail: string = 'guest'
): Promise<string | null> => {
  try {
    const chatRef = collection(db, "chat_history");
    const docRef = await addDoc(chatRef, {
      role,
      content,
      userEmail,
      timestamp: serverTimestamp()
    });
    console.log(`Saved message to Firebase: ${docRef.id}`);
    return docRef.id;
  } catch (e) {
    console.error("Error adding message to Firebase: ", e);
    return null;
  }
};
