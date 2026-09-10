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
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
};

const dynamicAdminEmails = new Set<string>(env.ADMIN_EMAILS);

/**
 * Checks if the given email is whitelisted as an Administrator (in-memory cache)
 */
export function isWhitelistedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return dynamicAdminEmails.has(normalized);
}

/**
 * Async check against DB if not already present in memory cache
 */
export async function checkIsWhitelistedAdminEmailAsync(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (dynamicAdminEmails.has(normalized)) return true;

  try {
    const { prisma } = await import("./database");
    const found = await prisma.adminWhitelist.findUnique({
      where: { email: normalized },
    });
    if (found) {
      dynamicAdminEmails.add(normalized);
      return true;
    }
  } catch {
    // Fail silently on DB disconnect
  }
  return false;
}

/**
 * Loads all whitelisted emails directly from PostgreSQL database into active cache
 */
export async function initAdminWhitelist(): Promise<string[]> {
  try {
    const { prisma } = await import("./database");

    // Optional: seed any emails defined in .env if present
    for (const email of env.ADMIN_EMAILS) {
      try {
        await prisma.adminWhitelist.upsert({
          where: { email },
          update: {},
          create: {
            email,
            addedBy: "env-config",
          },
        });
      } catch {
        // Ignore duplicate error
      }
    }

    // Fetch all whitelisted emails from database
    const dbRecords = await prisma.adminWhitelist.findMany({
      select: { email: true },
    });

    dynamicAdminEmails.clear();
    for (const rec of dbRecords) {
      if (rec.email) {
        dynamicAdminEmails.add(rec.email.trim().toLowerCase());
      }
    }

    console.log(`🛡️ Admin Whitelist loaded from PostgreSQL: ${dynamicAdminEmails.size} active admin(s)`);
    return Array.from(dynamicAdminEmails);
  } catch (error) {
    console.warn("⚠️ Could not load Admin Whitelist from DB:", error);
    return Array.from(dynamicAdminEmails);
  }
}

/**
 * Dynamically add a new Admin email to both PostgreSQL and in-memory cache
 */
export async function addDynamicAdminEmail(email: string, addedBy?: string): Promise<string[]> {
  const normalized = email.trim().toLowerCase();
  if (normalized) {
    dynamicAdminEmails.add(normalized);
    try {
      const { prisma } = await import("./database");
      await prisma.adminWhitelist.upsert({
        where: { email: normalized },
        update: {},
        create: {
          email: normalized,
          addedBy: addedBy || "admin",
        },
      });

      // Also ensure any existing user with this email gets ADMIN role
      await prisma.user.updateMany({
        where: { email: normalized },
        data: { role: "ADMIN" },
      });
    } catch (dbErr) {
      console.error("Failed to persist admin email to DB:", dbErr);
    }
  }
  return Array.from(dynamicAdminEmails);
}

/**
 * Remove an Admin email from whitelist (cannot remove primary superadmin)
 */
export async function removeDynamicAdminEmail(email: string): Promise<string[]> {
  const normalized = email.trim().toLowerCase();
  if (normalized === "himanshuanand563@gmail.com") {
    throw new Error("Cannot remove primary Superadmin.");
  }
  dynamicAdminEmails.delete(normalized);
  try {
    const { prisma } = await import("./database");
    await prisma.adminWhitelist.deleteMany({
      where: { email: normalized },
    });
  } catch (dbErr) {
    console.error("Failed to delete admin email from DB:", dbErr);
  }
  return Array.from(dynamicAdminEmails);
}

/**
 * Get all currently whitelisted Admin emails directly from DB + cache
 */
export async function getDynamicAdminEmails(): Promise<string[]> {
  try {
    const { prisma } = await import("./database");
    const dbRecords = await prisma.adminWhitelist.findMany({
      select: { email: true },
      orderBy: { createdAt: "asc" },
    });
    for (const rec of dbRecords) {
      if (rec.email) {
        dynamicAdminEmails.add(rec.email.trim().toLowerCase());
      }
    }
  } catch {
    // Return current cache if DB query fails
  }
  return Array.from(dynamicAdminEmails);
}
