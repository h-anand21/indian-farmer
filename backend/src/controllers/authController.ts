import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  findUserByFirebaseUid,
  findUserByEmail,
  findUserByPhone,
  createFarmerUser,
  updateUser,
  updateFarmerProfile,
  setFirebaseCustomClaims,
} from "../services/authService";
import { UserRole } from "../types/enums";

// ── Validation Schemas ──

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: z.enum(["FARMER", "OPERATOR", "ADMIN"]).default("FARMER"),
  // Farmer profile (optional during registration)
  farmerId: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  tehsil: z.string().optional(),
  village: z.string().optional(),
  pincode: z.string().optional(),
  landArea: z.number().optional(),
  ownershipType: z.string().optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional(),
  // Farmer details
  farmerId: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  tehsil: z.string().optional(),
  village: z.string().optional(),
  pincode: z.string().optional(),
  landArea: z.number().optional(),
  ownershipType: z.string().optional(),
});

/**
 * POST /api/auth/register
 * Register a new user after Firebase phone auth
 * Requires: Bearer token (Firebase ID token)
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);
    const firebaseUid = req.user!.uid;
    const email = req.user?.email || data.email;
    const phone = req.user?.phone || data.phone;

    // Check if user already exists by firebaseUid, email, or phone
    let existing = await findUserByFirebaseUid(firebaseUid);
    if (!existing && email) {
      existing = await findUserByEmail(email);
    }
    if (!existing && phone) {
      existing = await findUserByPhone(phone);
    }

    if (existing) {
      // If found by email/phone, sync/update the firebaseUid so future logins are instant
      if (existing.firebaseUid !== firebaseUid) {
        const prisma = (await import("../config/database")).default;
        existing = await prisma.user.update({
          where: { id: existing.id },
          data: { firebaseUid },
          include: {
            farmer: true,
            operator: { include: { centre: true } },
          },
        });
      }

      await setFirebaseCustomClaims(firebaseUid, existing.role);

      res.status(200).json({
        success: true,
        message: "Welcome back! Logged in directly.",
        data: existing,
      });
      return;
    }

    // Create user + farmer profile
    const user = await createFarmerUser(
      {
        firebaseUid,
        email,
        phone,
        name: data.name,
        role: data.role as UserRole,
        avatarUrl: data.avatarUrl,
      },
      {
        farmerId: data.farmerId,
        state: data.state,
        district: data.district,
        tehsil: data.tehsil,
        village: data.village,
        pincode: data.pincode,
        landArea: data.landArea,
        ownershipType: data.ownershipType,
      }
    );

    // Set Firebase custom claims for role
    await setFirebaseCustomClaims(firebaseUid, data.role);

    res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to KisanQueue.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * GET /api/auth/me
 * Get current user profile from Firebase token
 * Requires: Bearer token
 */
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const firebaseUid = req.user!.uid;
    const user = await findUserByFirebaseUid(firebaseUid);

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
        message: "No account found. Please register first.",
        needsRegistration: true,
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/profile
 * Update user profile
 * Requires: Bearer token
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = updateProfileSchema.parse(req.body);
    const firebaseUid = req.user!.uid;

    const user = await findUserByFirebaseUid(firebaseUid);
    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Update user basic info
    const updatedUser = await updateUser(user.id, {
      name: data.name,
      avatarUrl: data.avatarUrl,
    });

    // Update farmer profile if exists
    if (user.farmer && (data.state || data.district || data.village)) {
      await updateFarmerProfile(user.farmer.id, {
        farmerId: data.farmerId,
        state: data.state,
        district: data.district,
        tehsil: data.tehsil,
        village: data.village,
        pincode: data.pincode,
        landArea: data.landArea,
        ownershipType: data.ownershipType,
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/verify-token
 * Verify a Firebase token and return user data
 * Used by frontend to check if user exists after Firebase auth
 */
export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const firebaseUid = req.user!.uid;
    const email = req.user?.email;
    const phone = req.user?.phone;

    let user = await findUserByFirebaseUid(firebaseUid);

    // If not found by Firebase UID, check by Email (since user may have registered with Gmail)
    if (!user && email) {
      user = await findUserByEmail(email);
      if (user) {
        // Link the Firebase UID to this existing user record
        const prisma = (await import("../config/database")).default;
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid },
          include: {
            farmer: true,
            operator: { include: { centre: true } },
          },
        });
      }
    }

    // If still not found, check by Phone
    if (!user && phone) {
      user = await findUserByPhone(phone);
      if (user) {
        const prisma = (await import("../config/database")).default;
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid },
          include: {
            farmer: true,
            operator: { include: { centre: true } },
          },
        });
      }
    }

    res.json({
      success: true,
      isRegistered: !!user,
      data: user || null,
      firebaseUid,
      email: email || null,
      phone: phone || null,
    });
  } catch (error) {
    next(error);
  }
}

