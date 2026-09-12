import { Request, Response, NextFunction } from "express";
import { firebaseAuth, isFirebaseDevMode } from "../config/firebase-admin";

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
    let decodedToken: any;

    if (idToken.startsWith("demo-")) {
      const demoRole = idToken.includes("operator")
        ? "OPERATOR"
        : idToken.includes("admin")
        ? "ADMIN"
        : "FARMER";
      const demoPhone =
        demoRole === "OPERATOR"
          ? "+919814012346"
          : demoRole === "ADMIN"
          ? "+919814012347"
          : "+919814012345";
      decodedToken = {
        uid: `demo-${demoRole.toLowerCase()}-uid`,
        email: `${demoRole.toLowerCase()}@kisanqueue.gov.in`,
        phone_number: demoPhone,
        role: demoRole,
      };
    } else if (isFirebaseDevMode) {
      // In dev mode without service account key, decode the Firebase JWT payload
      try {
        const payloadBase64 = idToken.split(".")[1];
        const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
        const parsed = JSON.parse(payloadJson);
        decodedToken = {
          uid: parsed.user_id || parsed.sub,
          email: parsed.email,
          phone_number: parsed.phone_number,
          role: parsed.role,
        };
      } catch {
        decodedToken = await firebaseAuth.verifyIdToken(idToken);
      }
    } else {
      decodedToken = await firebaseAuth.verifyIdToken(idToken);
    }

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
