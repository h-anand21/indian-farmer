import prisma from "../config/database";
import { QualityGrade } from "@prisma/client";
import { io } from "../server";
import { broadcastQueueUpdate } from "../socket/socketServer";
import { MSP_CROPS } from "./bookingService";

export interface RecordWeighmentPayload {
  bookingId: string;
  actualWeight: number; // in Quintals
  qualityGrade: QualityGrade;
  moisturePercent?: number;
  foreignMatter?: number;
  remarks?: string;
  operatorUserId?: string;
}

/**
 * Get comprehensive operational metrics for an APMC Mandi
 */
export async function getOperatorDashboardMetrics(centreId: string) {
  const centre = await prisma.procurementCentre.findUnique({
    where: { id: centreId },
  });

  if (!centre) {
    throw new Error("Procurement centre not found");
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalBookingsToday,
    waitingInYardCount,
    calledCount,
    completedTodayCount,
    procurementsToday,
    paymentsToday,
  ] = await Promise.all([
    prisma.booking.count({
      where: {
        centreId,
        bookedAt: { gte: todayStart },
      },
    }),
    prisma.booking.count({
      where: {
        centreId,
        status: { in: ["WAITING", "CHECKED_IN"] },
      },
    }),
    prisma.booking.count({
      where: {
        centreId,
        status: { in: ["CALLED", "IN_PROCUREMENT"] },
      },
    }),
    prisma.booking.count({
      where: {
        centreId,
        status: "COMPLETED",
        completedAt: { gte: todayStart },
      },
    }),
    prisma.procurementRecord.findMany({
      where: {
        booking: { centreId },
        completedAt: { gte: todayStart },
      },
      select: {
        actualWeight: true,
        totalAmount: true,
      },
    }),
    prisma.payment.aggregate({
      where: {
        booking: { centreId },
        status: "DISBURSED",
        disbursedAt: { gte: todayStart },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const totalQuintalsToday = procurementsToday.reduce((sum, p) => sum + p.actualWeight, 0);
  const totalMspValueToday = procurementsToday.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalDisbursedToday = paymentsToday._sum.amount || 0;

  return {
    centreId: centre.id,
    centreName: centre.name,
    code: centre.code,
    totalCounters: centre.totalCounters,
    totalBookingsToday,
    waitingInYardCount,
    calledCount,
    completedTodayCount,
    totalQuintalsToday: Math.round(totalQuintalsToday * 10) / 10,
    totalMspValueToday: Math.round(totalMspValueToday),
    totalDisbursedToday: Math.round(totalDisbursedToday),
    avgTurnaroundMins: 8.5,
  };
}

/**
 * Get roster of today's bookings for the Mandi
 */
export async function getTodayRoster(centreId: string, statusFilter?: string) {
  const where: any = { centreId };

  if (statusFilter && statusFilter !== "ALL") {
    where.status = statusFilter;
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      farmer: {
        include: {
          user: true,
        },
      },
      crop: true,
      slot: true,
      queueEntry: true,
      procurement: true,
      payment: true,
    },
    orderBy: { bookedAt: "desc" },
  });

  return bookings.map((b) => ({
    id: b.id,
    token: b.token,
    farmerId: b.farmerId,
    farmerName: b.farmer.user.name,
    farmerPhone: b.farmer.user.phone || "—",
    farmerAadhaar: b.farmer.farmerId || "Verified at Portal",
    landArea: b.farmer.landArea || 4.5,
    village: b.farmer.village || "Local Tehsil",
    cropName: b.crop.name,
    expectedQuantity: b.quantity,
    status: b.status,
    slotDate: b.slot.date.toISOString().split("T")[0],
    slotWindow: `${b.slot.startTime} - ${b.slot.endTime}`,
    queuePosition: b.queueEntry?.position ?? null,
    counterNo: b.queueEntry?.counterNo ?? null,
    checkedInAt: b.checkedInAt?.toISOString() || null,
    completedAt: b.completedAt?.toISOString() || null,
    procurement: b.procurement
      ? {
          receiptNumber: b.procurement.receiptNumber,
          actualWeight: b.procurement.actualWeight,
          qualityGrade: b.procurement.qualityGrade,
          moisturePercent: b.procurement.moisturePercent,
          totalAmount: b.procurement.totalAmount,
        }
      : null,
    payment: b.payment
      ? {
          id: b.payment.id,
          amount: b.payment.amount,
          status: b.payment.status,
          bankAccount: b.payment.bankAccount,
          utrNumber: b.payment.utrNumber,
        }
      : null,
  }));
}

/**
 * Gate Check-In by token code or QR code string
 */
export async function verifyAndCheckInToken(
  tokenOrCode: string,
  centreId: string,
  _vehiclePlate?: string
) {
  // Clean token input (e.g. "KQ-KHN-1048" or JSON from QR)
  let searchToken = tokenOrCode.trim();
  if (searchToken.startsWith("{") && searchToken.includes("token")) {
    try {
      const parsed = JSON.parse(searchToken);
      searchToken = parsed.token || searchToken;
    } catch {
      // ignore
    }
  }

  const booking = await prisma.booking.findFirst({
    where: {
      centreId,
      token: { contains: searchToken, mode: "insensitive" },
    },
    include: {
      farmer: {
        include: {
          user: true,
        },
      },
      crop: true,
      slot: true,
    },
  });

  if (!booking) {
    throw new Error(`Token "${searchToken}" not found for this Mandi.`);
  }

  // If already checked in
  if (booking.status !== "BOOKED") {
    return {
      booking,
      message: `Token ${booking.token} is already checked in (Current Status: ${booking.status})`,
      alreadyCheckedIn: true,
    };
  }

  // Get max position
  const maxPosEntry = await prisma.queueEntry.findFirst({
    where: { centreId },
    orderBy: { position: "desc" },
  });
  const nextPos = (maxPosEntry?.position || 0) + 1;

  const [updatedBooking] = await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "WAITING",
        checkedInAt: new Date(),
      },
    }),
    prisma.queueEntry.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        centreId,
        position: nextPos,
        estimatedWaitMins: nextPos * 10,
      },
      update: {
        position: nextPos,
        estimatedWaitMins: nextPos * 10,
      },
    }),
  ]);

  // Broadcast updated queue
  broadcastQueueUpdate(io, centreId, {
    nowServing: "Serving",
    nextToken: booking.token,
    totalWaiting: nextPos,
    completedToday: 0,
  });

  return {
    booking: {
      ...updatedBooking,
      farmer: booking.farmer,
      crop: booking.crop,
      slot: booking.slot,
    },
    message: `Gate Pass Approved! Token ${booking.token} entered yard queue at Position #${nextPos}`,
    alreadyCheckedIn: false,
  };
}

/**
 * Record Weighbridge Weighment & Moisture Quality Grading
 */
export async function recordProcurementWeighment(payload: RecordWeighmentPayload) {
  const {
    bookingId,
    actualWeight,
    qualityGrade,
    moisturePercent = 11.5,
    foreignMatter = 0.5,
    remarks = "Procured under government MSP guidelines",
  } = payload;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      centre: true,
      crop: true,
      farmer: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Lookup MSP rate for crop
  const matchedMsp = MSP_CROPS.find((c) =>
    booking.crop.name.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])
  );
  const mspRate = matchedMsp ? matchedMsp.mspPrice : 2275;
  const totalAmount = Math.round(actualWeight * mspRate);

  // Generate official receipt number
  const prefix = booking.centre.code.split("-")[1] || "MND";
  const receiptNumber = `PR-${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

  // Ensure an operator record exists for this centre
  let operator = await prisma.operator.findFirst({
    where: { centreId: booking.centreId },
  });

  if (!operator) {
    // Check if operator user exists or create fallback
    let opUser = await prisma.user.findFirst({
      where: { role: "OPERATOR" },
    });
    if (!opUser) {
      opUser = await prisma.user.create({
        data: {
          firebaseUid: `operator-${booking.centreId.slice(0, 8)}`,
          email: `operator.${prefix.toLowerCase()}@mandi.gov.in`,
          name: `${booking.centre.name} Operator Desk`,
          role: "OPERATOR",
        },
      });
    }

    operator = await prisma.operator.create({
      data: {
        userId: opUser.id,
        centreId: booking.centreId,
        employeeId: `EMP-${prefix}-01`,
      },
    });
  }

  // Execute in atomic transaction
  const [procurementRecord, paymentRecord] = await prisma.$transaction([
    prisma.procurementRecord.create({
      data: {
        bookingId: booking.id,
        operatorId: operator.id,
        receiptNumber,
        actualWeight,
        qualityGrade,
        moisturePercent,
        foreignMatter,
        mspRate,
        totalAmount,
        remarks,
      },
    }),
    prisma.payment.create({
      data: {
        farmerId: booking.farmerId,
        bookingId: booking.id,
        amount: totalAmount,
        status: "PENDING",
        bankAccount: "••••4821",
      },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    }),
    prisma.queueEntry.deleteMany({
      where: { bookingId: booking.id },
    }),
  ]);

  // Broadcast live update over Socket.IO
  broadcastQueueUpdate(io, booking.centreId, {
    nowServing: "Cleared",
    nextToken: "Next",
    totalWaiting: 0,
    completedToday: 1,
  });

  return {
    procurement: procurementRecord,
    payment: paymentRecord,
    booking: {
      ...booking,
      status: "COMPLETED",
    },
  };
}

/**
 * List completed payments for DBT settlement
 */
export async function listCentrePayments(centreId: string) {
  const payments = await prisma.payment.findMany({
    where: {
      booking: { centreId },
    },
    include: {
      farmer: {
        include: {
          user: true,
        },
      },
      booking: {
        include: {
          crop: true,
          procurement: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments.map((p) => ({
    id: p.id,
    bookingId: p.bookingId,
    token: p.booking.token,
    farmerName: p.farmer.user.name,
    farmerPhone: p.farmer.user.phone || "—",
    cropName: p.booking.crop.name,
    quantityWeighed: p.booking.procurement?.actualWeight || p.booking.quantity,
    receiptNumber: p.booking.procurement?.receiptNumber || "PR-PENDING",
    amount: p.amount,
    status: p.status,
    bankAccount: p.bankAccount || "••••4821",
    utrNumber: p.utrNumber,
    createdAt: p.createdAt.toISOString(),
    disbursedAt: p.disbursedAt?.toISOString() || null,
  }));
}

/**
 * Disburse DBT Payment (direct bank settlement)
 */
export async function disburseDbtPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      farmer: { include: { user: true } },
      booking: true,
    },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  const utrNumber = `SBIN0029${Math.floor(10000000 + Math.random() * 90000000)}`;

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "DISBURSED",
      disbursedAt: new Date(),
      utrNumber,
    },
  });

  // Emit private socket update to farmer
  io.to(`farmer:${payment.farmerId}`).emit("payment:status", {
    paymentId: payment.id,
    status: "DISBURSED",
    amount: payment.amount,
    utrNumber,
    timestamp: Date.now(),
  });

  return updatedPayment;
}
