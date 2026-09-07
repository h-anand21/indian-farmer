import { Request, Response } from "express";
import * as notificationService from "../services/notificationService";

export async function sendSMS(req: Request, res: Response) {
  try {
    const { to, message, type, bookingId } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: "Missing 'to' phone number or 'message' body" });
    }

    const result = await notificationService.sendSMSNotification({
      to,
      message,
      type: type || "SLOT_BOOKED",
      bookingId,
    });

    return res.json(result);
  } catch (err: any) {
    console.error("sendSMS error:", err);
    return res.status(500).json({ error: err.message || "Failed to send SMS" });
  }
}

export async function getMyNotifications(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const list = await notificationService.getUserNotifications(userId);
    return res.json({ notifications: list });
  } catch (err: any) {
    console.error("getMyNotifications error:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch notifications" });
  }
}
