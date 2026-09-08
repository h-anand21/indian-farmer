import { Router } from "express";
import {
  getMetrics,
  getRoster,
  getBookingDetails,
  postGateCheckIn,
  postWeighment,
  getPayments,
  postDisburseDbt,
} from "../controllers/operatorController";

const router = Router();

// Mandi Operator Metrics
router.get("/metrics/:centreId", getMetrics);

// Queue Roster
router.get("/roster/:centreId", getRoster);

// Single Booking Details for Weighment / Intake
router.get("/booking-details/:bookingId", getBookingDetails);

// Gate Check-in
router.post("/check-in", postGateCheckIn);

// Weighbridge Entry & Quality Grading
router.post("/weighment", postWeighment);

// DBT Payments Ledger
router.get("/payments/:centreId", getPayments);

// Trigger DBT Payout
router.post("/disburse-dbt", postDisburseDbt);

export default router;
