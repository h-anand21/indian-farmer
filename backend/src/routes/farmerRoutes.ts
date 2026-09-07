import { Router } from "express";
import * as farmerController from "../controllers/farmerController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Get farmer full dashboard info (stats, upcoming bookings, recent payments)
router.get("/:farmerId/dashboard", authMiddleware, farmerController.getFarmerDashboard);

// Update farmer profile
router.put("/:farmerId/profile", authMiddleware, farmerController.updateFarmerProfile);

// Get farmer procurement records with timeline status
router.get("/:farmerId/procurements", authMiddleware, farmerController.getFarmerProcurements);

export default router;
