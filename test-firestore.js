import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCRI_uFBdXc20slLGWbm0K53GBT6mfgODE",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "tahqiq-87f79.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "tahqiq-87f79",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "tahqiq-87f79.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "415984827866",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:415984827866:web:08e196f183a0541d4894e3",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QX1GSZZ5WS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const querySnapshot = await getDocs(collection(db, "test"));
    console.log("Firestore is accessible!");
  } catch (e) {
    console.error("Firestore error:", e);
  }
}

test();
