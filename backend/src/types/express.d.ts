import { Request } from "express";

/**
 * Extend Express Request to include authenticated user data
 * This is used by the auth middleware after Firebase token verification
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        phone?: string;
        role?: string;
      };
    }
  }
}

export {};
