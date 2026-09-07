import { Router } from "express";
import * as notificationController from "../controllers/notificationController";

const router = Router();

// SMS & Multi-Channel Alert Gateway Routes
router.post("/send-sms", notificationController.sendSMS);
router.get("/my-notifications", notificationController.getMyNotifications);

export default router;
