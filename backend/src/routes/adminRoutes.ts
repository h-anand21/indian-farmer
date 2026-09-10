import { Router } from "express";
import {
  getMetrics,
  getCentres,
  postCentre,
  putCentre,
  postGenerateSlots,
  getCrops,
  postCrop,
  patchCropMsp,
  getUsers,
  postUser,
  patchUserRole,
  patchUserStatus,
  getAuditLogs,
  getAnalytics,
  getWhitelistedAdmins,
  postWhitelistedAdmin,
  deleteWhitelistedAdmin,
} from "../controllers/adminController";

const router = Router();

// State-wide metrics & telemetry
router.get("/metrics", getMetrics);

// Strategic analytics
router.get("/analytics", getAnalytics);

// Admin Whitelist Management
router.get("/admins", getWhitelistedAdmins);
router.post("/admins", postWhitelistedAdmin);
router.delete("/admins/:email", deleteWhitelistedAdmin);

// Centre management
router.get("/centres", getCentres);
router.post("/centres", postCentre);
router.put("/centres/:id", putCentre);

// Batch slot generator
router.post("/slots/generate", postGenerateSlots);

// Crop catalog & MSP pricing
router.get("/crops", getCrops);
router.post("/crops", postCrop);
router.patch("/crops/msp", patchCropMsp);

// Stakeholder directory & RBAC
router.get("/users", getUsers);
router.post("/users", postUser);
router.patch("/users/role", patchUserRole);
router.patch("/users/:id/status", patchUserStatus);

// Immutable Audit Logs
router.get("/audit-logs", getAuditLogs);

export default router;
