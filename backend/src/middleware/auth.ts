import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase-admin";

// Extend Express Request type to include authenticated user
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

/**
 * Firebase Authentication Middleware
 * Verifies the Firebase ID token from the Authorization header.
 * Attaches decoded user info to req.user for downstream use.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Unauthorized: No token provided",
        message: "Please include a valid Bearer token in the Authorization header.",
      });
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      phone: decodedToken.phone_number,
      role: decodedToken.role as string | undefined,
    };

    next();
  } catch (error) {
    console.error("🔒 Auth Error:", error);
    res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid or expired token",
      message: "Your session has expired. Please log in again.",
    });
  }
}
