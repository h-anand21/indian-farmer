import { Router } from "express";
import * as notificationController from "../controllers/notificationController";

const router = Router();

// SMS & Multi-Channel Alert Gateway Routes
router.post("/send-sms", notificationController.sendSMS);
router.get("/my-notifications", notificationController.getMyNotifications);

// Admin Broadcast Announcements
router.post("/broadcast", notificationController.postBroadcast);
router.get("/broadcasts", notificationController.getBroadcasts);

export default router;
