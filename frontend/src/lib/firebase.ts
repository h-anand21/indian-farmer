import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

/**
 * Firebase Client SDK Configuration
 * All values come from environment variables (VITE_ prefixed for Vite)
 * NO API keys are hardcoded — they are loaded from .env.local
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// Initialize Firebase (singleton — prevents duplicate app errors)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth instance for phone OTP
export const auth = getAuth(app);

// Realtime Database instance (pub/sub fallback for queue updates)
export const realtimeDB = getDatabase(app);

export default app;
