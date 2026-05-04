import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

// On Vercel or production, these should be set via environment variables.
// In AI Studio, ensure they are set in the Settings -> Environment Variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;

// Helper to check if config is complete
const isConfigured = !!firebaseConfig.apiKey;

// Initialize Firebase
export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app 
  ? (firestoreDatabaseId && firestoreDatabaseId !== "(default)"
    ? initializeFirestore(app, { experimentalForceLongPolling: true }, firestoreDatabaseId)
    : initializeFirestore(app, { experimentalForceLongPolling: true }))
  : null;

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
