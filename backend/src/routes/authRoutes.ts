import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  register,
  getMe,
  updateProfile,
  verifyToken,
} from "../controllers/authController";

const router = Router();

/**
 * Auth Routes
 * All routes require Firebase Bearer token (authMiddleware)
 *
 * POST   /api/auth/verify-token  → Check if user exists after Firebase auth
 * POST   /api/auth/register      → Register new user + farmer profile
 * GET    /api/auth/me            → Get current user profile
 * PUT    /api/auth/profile       → Update user profile
 */

router.post("/verify-token", authMiddleware, verifyToken);
router.post("/register", authMiddleware, register);
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);

export default router;
