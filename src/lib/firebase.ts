import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration Firebase - utilise les variables d'environnement
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB0XYb5kib1qvNRAcWaxE3L3-OpcvvfJ00",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cvapp-658dc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cvapp-658dc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cvapp-658dc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1006150464263",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1006150464263:web:98d2e69e7319aee872cba2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-K12XNKHYYG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;