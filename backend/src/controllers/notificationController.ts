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

/**
 * POST /api/notifications/broadcast
 * Send live Mandi announcement / notification from Admin to All Farmers or specific Mandi
 */
export async function postBroadcast(req: Request, res: Response) {
  try {
    const { title, message, priority, targetType, centreId, adminName } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: "Both 'title' and 'message' are required to broadcast an announcement.",
      });
    }

    const result = await notificationService.broadcastAdminNotification({
      title,
      message,
      priority,
      targetType,
      centreId,
      adminName,
    });

    return res.json(result);
  } catch (err: any) {
    console.error("postBroadcast error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to broadcast notification",
    });
  }
}

/**
 * GET /api/notifications/broadcasts
 * Get list of recent broadcasts sent by Admin
 */
export async function getBroadcasts(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const list = await notificationService.getRecentBroadcasts(limit);
    return res.json({ success: true, broadcasts: list });
  } catch (err: any) {
    console.error("getBroadcasts error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch broadcast history",
    });
  }
}

