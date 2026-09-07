import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  FRONTEND_URL: string;
  DATABASE_URL: string;
  DIRECT_URL: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_DATABASE_URL: string;
  JWT_SECRET: string;
}

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  PORT: parseInt(getEnvVar("PORT", "3001"), 10),
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  FRONTEND_URL: getEnvVar("FRONTEND_URL", "http://localhost:5173"),
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  DIRECT_URL: getEnvVar("DIRECT_URL", ""),
  FIREBASE_PROJECT_ID: getEnvVar("FIREBASE_PROJECT_ID"),
  FIREBASE_CLIENT_EMAIL: getEnvVar("FIREBASE_CLIENT_EMAIL"),
  FIREBASE_PRIVATE_KEY: getEnvVar("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
  FIREBASE_DATABASE_URL: getEnvVar("FIREBASE_DATABASE_URL"),
  JWT_SECRET: getEnvVar("JWT_SECRET", "kisanqueue_dev_secret_2026"),
};
