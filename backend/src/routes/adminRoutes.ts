import { Router } from "express";
import {
  getMetrics,
  getCentres,
  postCentre,
  putCentre,
  postGenerateSlots,
  getCrops,
  patchCropMsp,
  getUsers,
  patchUserRole,
  getAnalytics,
} from "../controllers/adminController";

const router = Router();

// State-wide metrics & telemetry
router.get("/metrics", getMetrics);

// Strategic analytics
router.get("/analytics", getAnalytics);

// Centre management
router.get("/centres", getCentres);
router.post("/centres", postCentre);
router.put("/centres/:id", putCentre);

// Batch slot generator
router.post("/slots/generate", postGenerateSlots);

// Crop catalog & MSP pricing
router.get("/crops", getCrops);
router.patch("/crops/msp", patchCropMsp);

// Stakeholder directory & RBAC
router.get("/users", getUsers);
router.patch("/users/role", patchUserRole);

export default router;
