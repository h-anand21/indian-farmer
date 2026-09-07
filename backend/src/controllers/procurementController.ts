import { Request, Response } from "express";
import * as operatorService from "../services/operatorService";
import prisma from "../config/database";

export async function recordProcurement(req: Request, res: Response): Promise<void> {
  try {
    const { bookingId, actualWeight, qualityGrade, moisturePercent, foreignMatter, remarks } = req.body;

    if (!bookingId || !actualWeight) {
      res.status(400).json({ success: false, error: "bookingId and actualWeight are required" });
      return;
    }

    const result = await operatorService.recordProcurementWeighment({
      bookingId,
      actualWeight: Number(actualWeight),
      qualityGrade: qualityGrade || "GRADE_A",
      moisturePercent: moisturePercent ? Number(moisturePercent) : 11.5,
      foreignMatter: foreignMatter ? Number(foreignMatter) : 0.5,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: "Procurement recorded and receipt generated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function getProcurementByBooking(req: Request, res: Response): Promise<void> {
  try {
    const bookingId = req.params.bookingId as string;
    const record = await prisma.procurementRecord.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            farmer: { include: { user: true } },
            crop: true,
            centre: true,
            payment: true,
          },
        },
        operator: { include: { user: true } },
      },
    });

    if (!record) {
      res.status(404).json({ success: false, error: "Procurement record not found" });
      return;
    }

    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getDailyReport(req: Request, res: Response): Promise<void> {
  try {
    const centreId = req.params.centreId as string;
    const dateStr = req.query.date as string;

    const queryDate = dateStr ? new Date(dateStr) : new Date();
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const procurements = await prisma.procurementRecord.findMany({
      where: {
        booking: { centreId },
        completedAt: {
          gte: queryDate,
          lt: nextDay,
        },
      },
      include: {
        booking: {
          include: {
            farmer: { include: { user: true } },
            crop: true,
            payment: true,
          },
        },
      },
      orderBy: { completedAt: "asc" },
    });

    // Compute aggregated crop totals
    const cropTotals: { [key: string]: { quintals: number; amount: number; count: number } } = {};
    let grandTotalWeight = 0;
    let grandTotalAmount = 0;

    procurements.forEach((p) => {
      const cropName = p.booking.crop.name;
      if (!cropTotals[cropName]) {
        cropTotals[cropName] = { quintals: 0, amount: 0, count: 0 };
      }
      cropTotals[cropName].quintals += p.actualWeight;
      cropTotals[cropName].amount += p.totalAmount || 0;
      cropTotals[cropName].count += 1;
      grandTotalWeight += p.actualWeight;
      grandTotalAmount += p.totalAmount || 0;
    });

    res.json({
      success: true,
      data: {
        centreId,
        date: queryDate.toISOString().split("T")[0],
        totalProcurements: procurements.length,
        grandTotalWeight: Math.round(grandTotalWeight * 10) / 10,
        grandTotalAmount: Math.round(grandTotalAmount),
        cropTotals,
        records: procurements.map((p) => ({
          receiptNumber: p.receiptNumber,
          token: p.booking.token,
          farmerName: p.booking.farmer.user.name,
          phone: p.booking.farmer.user.phone || "—",
          crop: p.booking.crop.name,
          actualWeight: p.actualWeight,
          qualityGrade: p.qualityGrade,
          moisturePercent: p.moisturePercent,
          mspRate: p.mspRate,
          totalAmount: p.totalAmount,
          completedAt: p.completedAt.toISOString(),
          paymentStatus: p.booking.payment?.status || "PENDING",
          utrNumber: p.booking.payment?.utrNumber || "—",
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
