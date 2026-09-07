import { Router } from "express";
import * as paymentController from "../controllers/paymentController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Process DBT payment (Operator / Admin / Mock trigger)
router.post("/:paymentId/process", authMiddleware, paymentController.processPayment);

// Get receipt / J-Form details for a payment
router.get("/:paymentId/receipt", authMiddleware, paymentController.getPaymentReceipt);

// Get farmer payments
router.get("/farmer/:farmerId", authMiddleware, paymentController.getFarmerPayments);

export default router;
