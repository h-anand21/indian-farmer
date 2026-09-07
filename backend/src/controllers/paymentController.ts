import { Request, Response } from "express";
import * as paymentService from "../services/paymentService";

export async function processPayment(req: Request, res: Response): Promise<void> {
  try {
    const paymentId = req.params.paymentId as string;
    const result = await paymentService.processPayment(paymentId);
    res.json({
      success: true,
      message: `DBT Payment disbursed successfully. UTR: ${result.utrNumber}`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function getPaymentReceipt(req: Request, res: Response): Promise<void> {
  try {
    const paymentId = req.params.paymentId as string;
    const receipt = await paymentService.getPaymentReceipt(paymentId);
    res.json({ success: true, data: receipt });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
}

export async function getFarmerPayments(req: Request, res: Response): Promise<void> {
  try {
    const farmerId = req.params.farmerId as string;
    const payments = await paymentService.getFarmerPayments(farmerId);
    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
