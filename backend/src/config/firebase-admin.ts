import admin from "firebase-admin";
import { env } from "./env";

// Initialize Firebase Admin SDK with service account credentials from env vars
// This avoids storing a JSON file in the repo (security best practice)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    }),
    databaseURL: env.FIREBASE_DATABASE_URL,
  });
}

export const firebaseAuth = admin.auth();
export const firebaseDB = admin.database();
export default admin;
