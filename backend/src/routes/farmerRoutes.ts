import { Router } from "express";
import {
  getFarmerDashboard,
  updateFarmerProfile,
  getFarmerProcurements,
} from "../controllers/farmerController";

const router = Router();

// Get farmer full dashboard info (stats, upcoming bookings, recent payments)
router.get("/:farmerId/dashboard", getFarmerDashboard);

// Update farmer profile
router.put("/:farmerId/profile", updateFarmerProfile);

// Get farmer procurement records with timeline status
router.get("/:farmerId/procurements", getFarmerProcurements);

export default router;
