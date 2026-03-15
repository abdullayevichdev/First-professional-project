import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCRI_uFBdXc20slLGWbm0K53GBT6mfgODE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tahqiq-87f79.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tahqiq-87f79",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tahqiq-87f79.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "415984827866",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:415984827866:web:08e196f183a0541d4894e3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QX1GSZZ5WS"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

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
