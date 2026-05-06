import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, query, orderBy, limit, setDoc, updateDoc, getDoc, getDocs, where, Timestamp } from 'firebase/firestore';

// Note: firebase-applet-config.json is managed by AI Studio. 
// For external deployments (Vercel), use Environment Variables instead.

// Use environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)";

// No longer trying to load configJson to avoid build failures in Vercel
if (!firebaseConfig.apiKey) {
  console.warn("Firebase configuration is missing. Please set VITE_FIREBASE_API_KEY and other environment variables.");
}

// Helper to check if config is complete
const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

if (!isConfigured && import.meta.env.DEV) {
  console.warn("Firebase configuration is missing. Please add VITE_FIREBASE_API_KEY, etc. to your Environment Variables in Settings.");
}

// Initialize Firebase
export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app 
  ? getFirestore(app, firestoreDatabaseId && firestoreDatabaseId !== "(default)" ? firestoreDatabaseId : undefined)
  : null;

// Connection health check
if (db) {
  import('firebase/firestore').then(({ doc, getDocFromCache, getDocFromServer }) => {
    const testDoc = doc(db, 'system', 'connection_test');
    getDocFromServer(testDoc).catch(err => {
      if (err.message.includes('unavailable')) {
        console.error("Firestore ga ulanib bo'lmadi. Tarmoqni tekshiring.");
      }
    });
  });
}

// Re-export Firestore tools for easier use
export { collection, doc, onSnapshot, query, orderBy, limit, setDoc, updateDoc, getDoc, getDocs, where, Timestamp };

// Automatic Anonymous Login
if (auth && isConfigured) {
  signInAnonymously(auth)
    .then(() => {
      console.log("Anonymous login success");
    })
    .catch((error) => {
      // Ignore if user is already signed in with something else or offline
      if (error.code !== 'auth/internal-error') {
        console.warn("Anonymous login warning:", error.message);
      }
    });
}

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase is not configured. Please add environment variables.");
  return signInWithPopup(auth, googleProvider);
};

export const signInWithApple = async () => {
  if (!auth) throw new Error("Firebase is not configured. Please add environment variables.");
  return signInWithPopup(auth, appleProvider);
};

export const logOut = async () => {
  if (!auth) return;
  return signOut(auth);
};

export const signInAnon = async () => {
  if (!auth) throw new Error("Firebase is not configured.");
  return signInAnonymously(auth);
};
