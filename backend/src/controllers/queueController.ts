import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getCentreQueueState,
  getFarmerQueuePosition,
  checkInBooking,
  advanceCentreQueue,
  seedQueueIfEmpty,
} from "../services/queueService";

const checkInSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

const advanceQueueSchema = z.object({
  centreId: z.string().min(1, "Centre ID is required"),
  counterNumber: z.number().int().positive().default(1),
  action: z.enum(["CALL_NEXT", "START_PROCUREMENT", "COMPLETE", "SKIP"]).default("CALL_NEXT"),
});

/**
 * GET /api/queue/centre/:centreId
 * Get live queue board for a centre
 */
export async function getCentreQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const rawCentreId = req.params.centreId;
    const centreId = Array.isArray(rawCentreId) ? rawCentreId[0] : rawCentreId;
    if (!centreId) {
      res.status(400).json({ success: false, message: "Centre ID is required" });
      return;
    }

    // Seed realistic sample queue entries if currently empty for demo
    await seedQueueIfEmpty(centreId);

    const queueState = await getCentreQueueState(centreId);
    res.json({
      success: true,
      data: queueState,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/queue/my-token/:bookingId
 * Get farmer's live position, ETA, and stage timeline
 */
export async function getMyQueuePosition(req: Request, res: Response, next: NextFunction) {
  try {
    const rawBookingId = req.params.bookingId;
    const bookingId = Array.isArray(rawBookingId) ? rawBookingId[0] : rawBookingId;
    if (!bookingId) {
      res.status(400).json({ success: false, message: "Booking ID is required" });
      return;
    }

    const position = await getFarmerQueuePosition(bookingId, req.user?.uid);
    res.json({
      success: true,
      data: position,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/queue/check-in
 * Gate arrival check-in
 */
export async function postCheckIn(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = checkInSchema.parse(req.body);
    const updated = await checkInBooking(parsed.bookingId);

    res.json({
      success: true,
      message: "Successfully checked in to procurement gate queue",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/queue/advance
 * Advance queue (call next, start weighing, complete, skip)
 */
export async function postAdvanceQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = advanceQueueSchema.parse(req.body);
    const updatedState = await advanceCentreQueue(
      parsed.centreId,
      parsed.counterNumber,
      parsed.action
    );

    res.json({
      success: true,
      message: `Queue advanced: ${parsed.action} on Counter #${parsed.counterNumber}`,
      data: updatedState,
    });
  } catch (error) {
    next(error);
  }
}
