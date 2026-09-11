import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import Constants from "expo-constants";

/**
 * Firebase Client SDK Configuration for KisanQueue Mobile App
 * All values loaded from EXPO_PUBLIC_ environment variables or app.json extra
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || Constants.expoConfig?.extra?.firebaseProjectId || "kisanqueue-25ea7",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || Constants.expoConfig?.extra?.firebaseAppId,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || Constants.expoConfig?.extra?.firebaseDatabaseUrl,
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth instance for Firebase Auth
export const auth = getAuth(app);

// Realtime Database instance (pub/sub queue fallback)
export const realtimeDB = getDatabase(app);

export default app;
