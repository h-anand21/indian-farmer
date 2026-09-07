import { Router } from "express";
import {
  recordProcurement,
  getProcurementByBooking,
  getDailyReport,
} from "../controllers/procurementController";

const router = Router();

// Record weighment and quality grading
router.post("/record", recordProcurement);

// Get procurement receipt for a booking
router.get("/booking/:bookingId", getProcurementByBooking);

// Get daily report with aggregated crop totals
router.get("/daily-report/:centreId", getDailyReport);

export default router;
