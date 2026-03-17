import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseAppletConfig.measurementId
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId;

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase is not configured. Please add environment variables.");
  return signInWithRedirect(auth, googleProvider);
};

export const signInWithApple = async () => {
  if (!auth) throw new Error("Firebase is not configured. Please add environment variables.");
  return signInWithRedirect(auth, appleProvider);
};

export const handleRedirectResult = async () => {
  if (!auth) return null;
  return getRedirectResult(auth);
};

export const logOut = async () => {
  if (!auth) return;
  return signOut(auth);
};
