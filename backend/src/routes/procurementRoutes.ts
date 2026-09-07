import { Router } from "express";
import * as procurementController from "../controllers/procurementController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Record weighment and quality grading
router.post("/record", authMiddleware, procurementController.recordProcurement);

// Get procurement receipt for a booking
router.get("/booking/:bookingId", authMiddleware, procurementController.getProcurementByBooking);

// Get daily report with aggregated crop totals
router.get("/daily-report/:centreId", authMiddleware, procurementController.getDailyReport);

export default router;
