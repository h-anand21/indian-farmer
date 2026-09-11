/**
 * Google Sign-In Service for KisanQueue
 *
 * Guide Rule (Phase 6): @react-native-google-signin/google-signin crashes in Expo Go
 * because it needs native Android code only available in a real APK build.
 * We use __DEV__ guard so it only loads in production builds.
 *
 * In Expo Go (__DEV__ = true): a mock is returned so the app doesn't crash.
 * In APK (__DEV__ = false): the real native library is used.
 */

import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../config/firebase";

// --- Conditional Native Library Load ---
let GoogleSignin: any = null;
let statusCodes: any = {};

if (!__DEV__) {
  const GSignin = require("@react-native-google-signin/google-signin");
  GoogleSignin = GSignin.GoogleSignin;
  statusCodes = GSignin.statusCodes;

  // Configure with Web Client ID from Firebase Console
  // (NOT the Android Client ID — guide rule!)
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
}

// ── Types ──

export interface GoogleSignInResult {
  success: boolean;
  firebaseToken?: string;
  error?: string;
  isCancelled?: boolean;
}

/**
 * The Golden Flow (Guide Phase 9):
 * 1. Show Google popup → get Google ID Token
 * 2. Sign into Firebase with that token
 * 3. Get Firebase ID Token
 * 4. Return Firebase Token to caller → send to backend
 */
export async function performGoogleSignIn(): Promise<GoogleSignInResult> {
  // In Expo Go, we can't run native Google Sign-in
  if (__DEV__) {
    return {
      success: false,
      error: "DEV_MODE",
    };
  }

  try {
    // Step 1: Check Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Step 2: Open Google Account picker
    const userInfo = await GoogleSignin.signIn();

    // Handle both old and new library response shapes
    const idToken = userInfo?.data?.idToken || userInfo?.idToken;
    if (!idToken) {
      return { success: false, error: "Google token nahi mila!" };
    }

    // Step 3: Silently sign into Firebase with Google credential
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);

    // Step 4: Get Firebase ID Token (this is what backend needs)
    const firebaseToken = await userCredential.user.getIdToken();

    return { success: true, firebaseToken };
  } catch (error: any) {
    if (error?.code === statusCodes?.SIGN_IN_CANCELLED) {
      return { success: false, isCancelled: true };
    }
    if (error?.code === statusCodes?.IN_PROGRESS) {
      return { success: false, error: "Sign-in already in progress" };
    }
    if (error?.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
      return { success: false, error: "Google Play Services not available on this device" };
    }
    console.error("Google Sign-In error:", error);
    return { success: false, error: error?.message || "Google Sign-In failed" };
  }
}

/**
 * Sign out from both Google and Firebase
 */
export async function googleSignOut(): Promise<void> {
  try {
    if (!__DEV__ && GoogleSignin) {
      await GoogleSignin.signOut();
    }
  } catch (e) {
    console.warn("Google sign-out error:", e);
  }
}
