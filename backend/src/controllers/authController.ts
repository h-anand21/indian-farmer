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
import { isWhitelistedAdminEmail, checkIsWhitelistedAdminEmailAsync } from "../config/env";

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
 * Register a new user after Firebase phone/Google auth
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

    // RBAC Security Checks
    const isWhitelistedAdmin = await checkIsWhitelistedAdminEmailAsync(email);
    if (data.role === "ADMIN") {
      if (!isWhitelistedAdmin) {
        res.status(403).json({
          success: false,
          error: "ACCESS_DENIED_ADMIN",
          message: `Access Denied: The account (${email || "unknown"}) is not whitelisted as an Administrator.`,
        });
        return;
      }
    } else if (data.role === "OPERATOR") {
      res.status(403).json({
        success: false,
        error: "ACCESS_DENIED_OPERATOR",
        message: "Mandi Operator accounts cannot be self-registered. Please ask your Mandi Administrator to authorize your email first.",
      });
      return;
    }

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

    // If email is in whitelisted admin list, create with ADMIN role
    const assignedRole = (isWhitelistedAdmin ? "ADMIN" : data.role) as UserRole;

    // Create user + farmer profile
    const user = await createFarmerUser(
      {
        firebaseUid,
        email,
        phone,
        name: data.name,
        role: assignedRole,
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
    await setFirebaseCustomClaims(firebaseUid, assignedRole);

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
 * Verify a Firebase token and return user data with strict RBAC whitelisting
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
    const requestedRole = (req.body?.requestedRole || req.query?.role || "") as string;

    let user = await findUserByFirebaseUid(firebaseUid);

    // Auto-create demo user in DB for dev testing if using demo token
    if (!user && firebaseUid.startsWith("demo-")) {
      const prisma = (await import("../config/database")).default;
      const demoRole = (req.user?.role || "FARMER") as UserRole;
      const isOp = demoRole === "OPERATOR";
      const isAdmin = demoRole === "ADMIN";

      let centre = await prisma.procurementCentre.findFirst();

      const demoPhone = isOp ? "+919814012346" : isAdmin ? "+919814012347" : "+919814012345";
      const demoFarmerId = isOp ? "PMK-OP-01" : isAdmin ? "PMK-ADM-01" : "PMK-984210";
      const demoEmail = email || `${demoRole.toLowerCase()}@kisanqueue.gov.in`;

      user = await prisma.user.create({
        data: {
          firebaseUid,
          email: demoEmail,
          phone: phone || demoPhone,
          name: isOp ? "Khanna Mandi Operator Desk" : isAdmin ? "Punjab State Agriculture Admin" : "Sardar Gurdeep Singh",
          role: demoRole,
          farmer: {
            create: {
              farmerId: demoFarmerId,
              state: "Punjab",
              district: "Ludhiana",
              tehsil: "Khanna",
              village: "Bija",
              pincode: "141412",
              landArea: 4.5,
              ownershipType: "Owner",
            },
          },
          ...(isOp && centre
            ? {
                operator: {
                  create: {
                    centreId: centre.id,
                    employeeId: "EMP-KHN-01",
                  },
                },
              }
            : {}),
        },
        include: {
          farmer: true,
          operator: { include: { centre: true } },
        },
      });
    }

    // ── 🛡️ 1. ADMIN WHITELIST CHECK ──
    const isWhitelisted = email ? await checkIsWhitelistedAdminEmailAsync(email) : false;
    if (email && isWhitelisted) {
      const prisma = (await import("../config/database")).default;
      if (user) {
        if (user.role !== "ADMIN") {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
            include: {
              farmer: true,
              operator: { include: { centre: true } },
            },
          });
        }
      } else {
        // Auto-provision whitelisted administrator
        user = await prisma.user.create({
          data: {
            firebaseUid,
            email,
            name: (req.user as any)?.name || "KisanQueue Administrator",
            phone: phone || "9999999999",
            role: "ADMIN",
            isActive: true,
          },
          include: {
            farmer: true,
            operator: { include: { centre: true } },
          },
        });
      }

      await setFirebaseCustomClaims(firebaseUid, "ADMIN");

      res.json({
        success: true,
        isRegistered: true,
        data: user,
        firebaseUid,
        email: email || null,
        phone: phone || null,
      });
      return;
    }

    // If user specifically requested ADMIN role but is NOT whitelisted
    if (requestedRole === "ADMIN") {
      if (!user || user.role !== "ADMIN") {
        res.status(403).json({
          success: false,
          error: "ACCESS_DENIED_ADMIN",
          message: `Access Denied: The Google account (${email || "unknown"}) is not authorized as an Administrator. Only whitelisted admin emails can access this portal.`,
        });
        return;
      }
    }

    // ── 🏢 2. MANDI OPERATOR AUTHORIZATION CHECK ──
    if (requestedRole === "OPERATOR") {
      // Administrators have automatic Superuser access to Operator desks
      const isAdmin = isWhitelisted || user?.role === "ADMIN";

      if (!isAdmin && (!user || user.role !== "OPERATOR")) {
        res.status(403).json({
          success: false,
          error: "ACCESS_DENIED_OPERATOR",
          message: `Access Denied: The email (${email || "unknown"}) is not registered as an authorized Mandi Operator. Please contact your Mandi Administrator to get authorized.`,
        });
        return;
      }

      if (user && !user.isActive && !isAdmin) {
        res.status(403).json({
          success: false,
          error: "ACCESS_DENIED_DEACTIVATED",
          message: "Access Denied: Your Mandi Operator account has been deactivated. Please contact your Administrator.",
        });
        return;
      }
    }

    // ── 🌾 3. FARMER / OPEN USER SYSTEM ──
    if (!user) {
      // New user authenticated via Firebase (Google/Phone) but has not registered their farmer profile yet
      res.json({
        success: true,
        isRegistered: false,
        data: null,
        firebaseUid,
        email: email || null,
        phone: phone || null,
      });
      return;
    }

    res.json({
      success: true,
      isRegistered: true,
      data: user,
      firebaseUid,
      email: email || null,
      phone: phone || null,
    });
  } catch (error) {
    next(error);
  }
}

