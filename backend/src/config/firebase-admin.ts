import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { env } from "./env";

// Initialize Firebase Admin SDK with service account credentials from env vars
// In development, if private key is not provided yet, fallback gracefully to dev mode
let app: any;
let isDevAuth = false;

try {
  if (
    !env.FIREBASE_PRIVATE_KEY ||
    env.FIREBASE_PRIVATE_KEY.includes("YOUR_PRIVATE_KEY_HERE") ||
    env.FIREBASE_CLIENT_EMAIL.includes("xxxxx")
  ) {
    throw new Error("Placeholder credentials detected");
  }

  app =
    getApps().length === 0
      ? initializeApp({
          credential: cert({
            projectId: env.FIREBASE_PROJECT_ID,
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          }),
          databaseURL: env.FIREBASE_DATABASE_URL,
        })
      : getApps()[0]!;
} catch {
  // Graceful fallback for local development before downloading serviceAccountKey.json
  isDevAuth = true;
  app =
    getApps().length === 0
      ? initializeApp({ projectId: env.FIREBASE_PROJECT_ID })
      : getApps()[0]!;
}

export const isFirebaseDevMode = isDevAuth;
export const firebaseAuth = getAuth(app);
export const firebaseDB = (() => {
  try {
    if (env.FIREBASE_DATABASE_URL && !env.FIREBASE_DATABASE_URL.includes("your-firebase-project-id")) {
      return getDatabase(app);
    }
    return {} as any;
  } catch {
    return {} as any;
  }
})();
export default app;
