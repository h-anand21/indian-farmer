import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../config/database";
import {
  getOperatorDashboardMetrics,
  getTodayRoster,
  verifyAndCheckInToken,
  recordProcurementWeighment,
  listCentrePayments,
  disburseDbtPayment,
} from "../services/operatorService";

const checkInSchema = z.object({
  centreId: z.string().optional(),
  tokenOrCode: z.string().min(1, "Token or QR code is required"),
  vehiclePlate: z.string().optional(),
});

const weighmentSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  actualWeight: z.coerce.number().positive("Actual weight must be greater than 0"),
  qualityGrade: z.preprocess((val) => {
    if (typeof val === "string") {
      const upper = val.toUpperCase();
      if (upper.includes("GRADE A") || upper.includes("PREMIUM")) return "GRADE_A";
      if (upper.includes("GRADE B")) return "GRADE_B";
      if (upper.includes("GRADE C")) return "GRADE_C";
      if (upper.includes("FAQ")) return "FAQ_STANDARD";
    }
    return val || "GRADE_A";
  }, z.enum(["GRADE_A", "GRADE_B", "GRADE_C", "FAQ_STANDARD"]).default("GRADE_A")),
  moisturePercent: z.coerce.number().min(0).max(35).default(11.2),
  foreignMatter: z.coerce.number().min(0).max(10).default(0.4),
  remarks: z.string().optional(),
});

const dbtSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
});

/**
 * GET /api/operator/metrics/:centreId
 */
export async function getMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    const rawCentreId = req.params.centreId;
    const centreId = Array.isArray(rawCentreId) ? rawCentreId[0] : rawCentreId;
    if (!centreId) {
      res.status(400).json({ success: false, message: "Centre ID is required" });
      return;
    }

    const metrics = await getOperatorDashboardMetrics(centreId);
    res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/operator/roster/:centreId
 */
export async function getRoster(req: Request, res: Response, next: NextFunction) {
  try {
    const rawCentreId = req.params.centreId;
    const centreId = Array.isArray(rawCentreId) ? rawCentreId[0] : rawCentreId;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    if (!centreId) {
      res.status(400).json({ success: false, message: "Centre ID is required" });
      return;
    }

    const roster = await getTodayRoster(centreId, status);
    res.json({ success: true, data: roster });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/operator/booking-details/:bookingId
 */
export async function getBookingDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.bookingId;
    const bookingId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!bookingId) {
      res.status(400).json({ success: false, message: "Booking ID is required" });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        centre: true,
        crop: true,
        slot: true,
        queueEntry: true,
        farmer: {
          include: {
            user: true,
          },
        },
        procurement: true,
        payment: true,
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/operator/check-in
 */
export async function postGateCheckIn(req: Request, res: Response, _next: NextFunction) {
  try {
    const parsed = checkInSchema.parse(req.body);
    const result = await verifyAndCheckInToken(
      parsed.tokenOrCode,
      parsed.centreId,
      parsed.vehiclePlate
    );

    res.json({
      success: true,
      message: result.message,
      data: result.booking,
      alreadyCheckedIn: result.alreadyCheckedIn,
    });
  } catch (error: any) {
    const message = error?.message || "⚠️ QR Code Mismatch! Please scan a valid QR code.";
    res.status(400).json({
      success: false,
      message,
      error: message,
    });
  }
}

/**
 * POST /api/operator/weighment
 */
export async function postWeighment(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = weighmentSchema.parse(req.body);
    const result = await recordProcurementWeighment({
      ...parsed,
      operatorUserId: req.user?.uid,
    });

    res.json({
      success: true,
      message: `Procurement recorded successfully! Receipt #${result.procurement.receiptNumber}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/operator/payments/:centreId
 */
export async function getPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const rawCentreId = req.params.centreId;
    const centreId = Array.isArray(rawCentreId) ? rawCentreId[0] : rawCentreId;

    if (!centreId) {
      res.status(400).json({ success: false, message: "Centre ID is required" });
      return;
    }

    const payments = await listCentrePayments(centreId);
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/operator/disburse-dbt
 */
export async function postDisburseDbt(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = dbtSchema.parse(req.body);
    const updatedPayment = await disburseDbtPayment(parsed.paymentId);

    res.json({
      success: true,
      message: `DBT Payout of ₹${updatedPayment.amount.toLocaleString("en-IN")} Disbursed! Bank UTR: ${updatedPayment.utrNumber}`,
      data: updatedPayment,
    });
  } catch (error) {
    next(error);
  }
}
