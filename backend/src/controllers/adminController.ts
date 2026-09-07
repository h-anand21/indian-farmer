import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getAdminMetrics,
  listCentresWithAnalytics,
  createCentre,
  updateCentre,
  generateSlotsForCentre,
  listCropsMaster,
  updateCropMspRate,
  listAllUsers,
  createUserByAdmin,
  updateUserStatus,
  updateUserRole,
  getStrategicAnalytics,
  listAuditLogs,
} from "../services/adminService";
import { UserRole } from "@prisma/client";

const createCentreSchema = z.object({
  name: z.string().min(3, "Centre name must be at least 3 characters"),
  code: z.string().min(3, "Centre code must be at least 3 characters"),
  address: z.string().min(5, "Address must be provided"),
  district: z.string().min(2, "District is required"),
  state: z.string().min(2, "State is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  totalCounters: z.number().int().min(1).max(20).default(4),
  operatingHoursStart: z.string().default("08:00"),
  operatingHoursEnd: z.string().default("18:00"),
});

const updateCentreSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  totalCounters: z.number().int().min(1).max(20).optional(),
  operatingHoursStart: z.string().optional(),
  operatingHoursEnd: z.string().optional(),
  isActive: z.boolean().optional(),
});

const generateSlotsSchema = z.object({
  centreId: z.string().min(1, "Centre ID is required"),
  startDate: z.string().min(1, "Start date is required"),
  daysCount: z.number().int().min(1).max(30).default(7),
  capacityPerSlot: z.number().int().min(5).max(200).default(35),
});

const updateMspSchema = z.object({
  code: z.string().min(1, "Crop code is required"),
  mspRate: z.number().positive("MSP rate must be positive"),
  perAcreLimit: z.number().positive().optional(),
});

const updateRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["FARMER", "OPERATOR", "ADMIN"]),
  centreId: z.string().optional(),
});

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(8, "Phone number is required"),
  role: z.enum(["FARMER", "OPERATOR", "ADMIN"]),
  centreId: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  landArea: z.number().optional(),
});

/**
 * GET /api/admin/metrics
 */
export async function getMetrics(_req: Request, res: Response, next: NextFunction) {
  try {
    const metrics = await getAdminMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/centres
 */
export async function getCentres(_req: Request, res: Response, next: NextFunction) {
  try {
    const centres = await listCentresWithAnalytics();
    res.json({ success: true, data: centres });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/centres
 */
export async function postCentre(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createCentreSchema.parse(req.body);
    const centre = await createCentre(parsed);
    res.status(201).json({
      success: true,
      message: `Centre ${centre.name} (${centre.code}) created successfully`,
      data: centre,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/centres/:id
 */
export async function putCentre(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) {
      res.status(400).json({ success: false, message: "Centre ID is required" });
      return;
    }
    const parsed = updateCentreSchema.parse(req.body);
    const updated = await updateCentre(id, parsed);
    res.json({
      success: true,
      message: `Centre ${updated.name} updated successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/slots/generate
 */
export async function postGenerateSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = generateSlotsSchema.parse(req.body);
    const result = await generateSlotsForCentre(
      parsed.centreId,
      parsed.startDate,
      parsed.daysCount,
      parsed.capacityPerSlot
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/crops
 */
export async function getCrops(_req: Request, res: Response, next: NextFunction) {
  try {
    const crops = await listCropsMaster();
    res.json({ success: true, data: crops });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/crops/msp
 */
export async function patchCropMsp(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateMspSchema.parse(req.body);
    const adminUserId = (req as any).user?.uid;
    const result = await updateCropMspRate(parsed.code, parsed.mspRate, parsed.perAcreLimit, adminUserId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/users
 */
export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const role = typeof req.query.role === "string" ? (req.query.role as UserRole) : undefined;

    const users = await listAllUsers(search, role);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/users
 */
export async function postUser(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createUserSchema.parse(req.body);
    const user = await createUserByAdmin({
      ...parsed,
      email: parsed.email || undefined,
    });
    res.status(201).json({
      success: true,
      message: `User ${user.name} created successfully as ${user.role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/users/role
 */
export async function patchUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateRoleSchema.parse(req.body);
    const result = await updateUserRole(parsed.userId, parsed.role as UserRole, parsed.centreId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/users/:id/status
 */
export async function patchUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      res.status(400).json({ success: false, message: "isActive boolean is required" });
      return;
    }

    const updated = await updateUserStatus(id, isActive);
    res.json({
      success: true,
      message: `User account status updated to ${isActive ? "Active" : "Inactive"}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/audit-logs
 */
export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const take = typeof req.query.take === "string" ? parseInt(req.query.take, 10) : 50;
    const logs = await listAuditLogs(take);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/analytics
 */
export async function getAnalytics(_req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await getStrategicAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
}
