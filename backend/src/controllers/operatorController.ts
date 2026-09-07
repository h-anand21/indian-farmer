import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getOperatorDashboardMetrics,
  getTodayRoster,
  verifyAndCheckInToken,
  recordProcurementWeighment,
  listCentrePayments,
  disburseDbtPayment,
} from "../services/operatorService";

const checkInSchema = z.object({
  centreId: z.string().min(1, "Centre ID is required"),
  tokenOrCode: z.string().min(1, "Token or QR code is required"),
  vehiclePlate: z.string().optional(),
});

const weighmentSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  actualWeight: z.number().positive("Actual weight must be greater than 0"),
  qualityGrade: z.enum(["GRADE_A", "GRADE_B", "GRADE_C", "FAQ_STANDARD"]).default("GRADE_A"),
  moisturePercent: z.number().min(0).max(35).default(11.5),
  foreignMatter: z.number().min(0).max(10).default(0.5),
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
 * POST /api/operator/check-in
 */
export async function postGateCheckIn(req: Request, res: Response, next: NextFunction) {
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
  } catch (error) {
    next(error);
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
