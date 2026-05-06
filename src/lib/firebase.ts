import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { initializeFirestore, collection, doc, onSnapshot, query, orderBy, limit, setDoc, updateDoc, getDoc, getDocs, where, Timestamp } from 'firebase/firestore';
import configJson from '../../firebase-applet-config.json';

const configData = configJson as any;

// Use config from JSON file as primary source to ensure migration works
const firebaseConfig = {
  apiKey: configData.apiKey,
  authDomain: configData.authDomain,
  projectId: configData.projectId,
  storageBucket: configData.storageBucket,
  messagingSenderId: configData.messagingSenderId,
  appId: configData.appId,
  measurementId: configData.measurementId
};

const firestoreDatabaseId = configData.firestoreDatabaseId;

// Helper to check if config is complete
const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

if (!isConfigured && import.meta.env.DEV) {
  console.warn("Firebase configuration is missing. Please add VITE_FIREBASE_API_KEY, etc. to your Environment Variables in Settings.");
}

// Initialize Firebase
export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app 
  ? (firestoreDatabaseId && firestoreDatabaseId !== "(default)"
    ? initializeFirestore(app, { 
        experimentalForceLongPolling: true,
        experimentalAutoDetectLongPolling: false,
      }, firestoreDatabaseId)
    : initializeFirestore(app, { 
        experimentalForceLongPolling: true,
        experimentalAutoDetectLongPolling: false,
      }))
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
