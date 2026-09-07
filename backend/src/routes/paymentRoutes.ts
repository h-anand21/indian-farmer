import { Router } from "express";
import {
  processPayment,
  getPaymentReceipt,
  getFarmerPayments,
} from "../controllers/paymentController";

const router = Router();

// Process DBT payment (Operator / Admin / Mock trigger)
router.post("/:paymentId/process", processPayment);

// Get receipt / J-Form details for a payment
router.get("/:paymentId/receipt", getPaymentReceipt);

// Get farmer payments
router.get("/farmer/:farmerId", getFarmerPayments);

export default router;
