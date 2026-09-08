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
  DIGILOCKER_CLIENT_ID: string;
  DIGILOCKER_CLIENT_SECRET: string;
  DIGILOCKER_REDIRECT_URI: string;
  DIGILOCKER_AUTH_BASE_URL: string;
  ADMIN_EMAILS: string[];
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
  DIGILOCKER_CLIENT_ID: process.env.DIGILOCKER_CLIENT_ID || "KISANQUEUE_MEITY_APP",
  DIGILOCKER_CLIENT_SECRET: process.env.DIGILOCKER_CLIENT_SECRET || "kisanqueue_secret_key",
  DIGILOCKER_REDIRECT_URI: process.env.DIGILOCKER_REDIRECT_URI || "http://localhost:5173/auth/digilocker/callback",
  DIGILOCKER_AUTH_BASE_URL: process.env.DIGILOCKER_AUTH_BASE_URL || "https://digilocker.meripehchan.gov.in/public/oauth2/1",
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || "himanshuanand563@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
};

const dynamicAdminEmails = new Set<string>(env.ADMIN_EMAILS);

/**
 * Checks if the given email is whitelisted as an Administrator
 */
export function isWhitelistedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return dynamicAdminEmails.has(normalized);
}

/**
 * Dynamically add a new Admin email to the whitelist
 */
export function addDynamicAdminEmail(email: string): string[] {
  const normalized = email.trim().toLowerCase();
  if (normalized) {
    dynamicAdminEmails.add(normalized);
  }
  return Array.from(dynamicAdminEmails);
}

/**
 * Get all currently whitelisted Admin emails
 */
export function getDynamicAdminEmails(): string[] {
  return Array.from(dynamicAdminEmails);
}
