import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { env } from "./env";

// Initialize Firebase Admin SDK with service account credentials from env vars
// This avoids storing a JSON file in the repo (security best practice)
const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        databaseURL: env.FIREBASE_DATABASE_URL,
      })
    : getApps()[0]!;

export const firebaseAuth = getAuth(app);
export const firebaseDB = getDatabase(app);
export default app;
