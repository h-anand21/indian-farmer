import prisma from "../config/database";
import { PaymentStatus } from "@prisma/client";
import { io } from "../server";
import { notifyPaymentDisbursed } from "./notificationService";

export interface CreatePaymentPayload {
  farmerId: string;
  bookingId: string;
  amount: number;
  bankAccount?: string;
}

/**
 * Creates or retrieves payment record for a completed procurement
 */
export async function createPayment(payload: CreatePaymentPayload) {
  const { farmerId, bookingId, amount, bankAccount = "••••4821" } = payload;

  const existing = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (existing) {
    return existing;
  }

  return prisma.payment.create({
    data: {
      farmerId,
      bookingId,
      amount,
      status: "PENDING",
      bankAccount,
    },
    include: {
      farmer: { include: { user: true } },
      booking: { include: { crop: true, centre: true } },
    },
  });
}

/**
 * Process DBT payment: Transitions PENDING -> PROCESSING -> DISBURSED
 */
export async function processPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      farmer: { include: { user: true } },
      booking: { include: { crop: true, centre: true } },
    },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  // Generate realistic DBT UTR number e.g. "SBIN2026849201"
  const utrNumber = `DBT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Step 1: Update to PROCESSING
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "PROCESSING" },
  });

  // Emit real-time status update to farmer
  if (io) {
    io.to(`farmer:${payment.farmerId}`).emit("payment:status", {
      paymentId: payment.id,
      status: "PROCESSING",
      amount: payment.amount,
      timestamp: new Date().toISOString(),
    });
  }

  // Step 2: Finalize to DISBURSED
  const disbursedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "DISBURSED",
      disbursedAt: new Date(),
      utrNumber,
    },
    include: {
      farmer: { include: { user: true } },
      booking: { include: { crop: true, centre: true } },
    },
  });

  // Broadcast real-time final event
  if (io) {
    io.to(`farmer:${payment.farmerId}`).emit("payment:status", {
      paymentId: payment.id,
      status: "DISBURSED",
      amount: payment.amount,
      utrNumber,
      timestamp: new Date().toISOString(),
    });
  }

  // Dispatch SMS notification & in-app alert
  await notifyPaymentDisbursed(payment.bookingId, payment.amount, utrNumber);

  return disbursedPayment;
}

/**
 * Get single payment status & J-Form receipt details
 */
export async function getPaymentReceipt(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      farmer: {
        include: {
          user: true,
        },
      },
      booking: {
        include: {
          crop: true,
          centre: true,
          procurement: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return {
    paymentId: payment.id,
    utrNumber: payment.utrNumber || "PENDING",
    status: payment.status,
    amount: payment.amount,
    bankAccount: payment.bankAccount || "••••4821",
    disbursedAt: payment.disbursedAt,
    createdAt: payment.createdAt,
    farmer: {
      name: payment.farmer.user.name,
      phone: payment.farmer.user.phone,
      farmerId: payment.farmer.farmerId,
      village: payment.farmer.village,
      district: payment.farmer.district,
    },
    crop: {
      name: payment.booking.crop.name,
      quantity: payment.booking.procurement?.actualWeight || payment.booking.quantity,
      mspRate: payment.booking.procurement?.mspRate || 2275,
      qualityGrade: payment.booking.procurement?.qualityGrade || "GRADE_A",
      moisturePercent: payment.booking.procurement?.moisturePercent || 11.2,
      receiptNumber: payment.booking.procurement?.receiptNumber || "PR-LOCAL",
    },
    centre: {
      name: payment.booking.centre.name,
      code: payment.booking.centre.code,
      district: payment.booking.centre.district,
    },
  };
}

/**
 * List all payments for a given farmer
 */
export async function getFarmerPayments(farmerId: string) {
  return prisma.payment.findMany({
    where: { farmerId },
    include: {
      booking: {
        include: {
          crop: true,
          centre: true,
          procurement: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
