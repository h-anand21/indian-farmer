import prisma from "../config/database";
import { BookingStatus } from "@prisma/client";
import { io } from "../server";
import {
  broadcastQueueUpdate,
  sendTurnCallAlert,
  sendProximityAlert,
} from "../socket/socketServer";

export interface CounterBay {
  counterNumber: number;
  status: "SERVING" | "IDLE";
  token?: string;
  cropName?: string;
  farmerName?: string;
  calledAt?: string;
}

export interface CentreQueueState {
  centreId: string;
  centreName: string;
  code: string;
  totalCounters: number;
  counters: CounterBay[];
  nowServingToken: string | null;
  nextUpToken: string | null;
  waitingCount: number;
  completedTodayCount: number;
  avgTurnaroundMins: number;
  recentWaitingTokens: Array<{
    token: string;
    position: number;
    cropName: string;
    vehicleType?: string;
  }>;
}

export interface FarmerQueuePosition {
  bookingId: string;
  token: string;
  status: BookingStatus;
  centreId: string;
  centreName: string;
  cropName: string;
  quantity: number;
  slotDate: string;
  slotWindow: string;
  position: number | null;
  tokensAhead: number;
  estimatedMinutes: number;
  counterNumber: number | null;
  isProximityAlert: boolean;
  checkedInAt: string | null;
  calledAt: string | null;
  stageTimeline: {
    booked: boolean;
    checkedIn: boolean;
    inQueue: boolean;
    called: boolean;
    inProcurement: boolean;
    completed: boolean;
  };
}

/**
 * Get comprehensive real-time queue state for a procurement centre
 */
export async function getCentreQueueState(centreId: string): Promise<CentreQueueState> {
  const centre = await prisma.procurementCentre.findUnique({
    where: { id: centreId },
  });

  if (!centre) {
    throw new Error("Procurement Centre not found");
  }

  // Get active queue entries for this centre
  const activeEntries = await prisma.queueEntry.findMany({
    where: { centreId },
    include: {
      booking: {
        include: {
          crop: true,
          farmer: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: { position: "asc" },
  });

  // Today start date for completed count
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const completedTodayCount = await prisma.booking.count({
    where: {
      centreId,
      status: "COMPLETED",
      completedAt: { gte: todayStart },
    },
  });

  // Calculate counters state (1 to totalCounters)
  const counters: CounterBay[] = [];
  const servingEntries = activeEntries.filter((e) =>
    ["CALLED", "IN_PROCUREMENT"].includes(e.booking.status)
  );

  for (let c = 1; c <= centre.totalCounters; c++) {
    const entryAtCounter = servingEntries.find((e) => e.counterNo === c);
    if (entryAtCounter) {
      counters.push({
        counterNumber: c,
        status: "SERVING",
        token: entryAtCounter.booking.token,
        cropName: entryAtCounter.booking.crop.name,
        farmerName: entryAtCounter.booking.farmer.user.name,
        calledAt: entryAtCounter.calledAt?.toISOString(),
      });
    } else {
      counters.push({
        counterNumber: c,
        status: "IDLE",
      });
    }
  }

  const waitingEntries = activeEntries.filter((e) =>
    ["WAITING", "CHECKED_IN"].includes(e.booking.status)
  );

  const nowServingToken = servingEntries.length > 0 ? servingEntries[0].booking.token : null;
  const nextUpToken = waitingEntries.length > 0 ? waitingEntries[0].booking.token : null;

  return {
    centreId: centre.id,
    centreName: centre.name,
    code: centre.code,
    totalCounters: centre.totalCounters,
    counters,
    nowServingToken,
    nextUpToken,
    waitingCount: waitingEntries.length,
    completedTodayCount,
    avgTurnaroundMins: 10,
    recentWaitingTokens: waitingEntries.slice(0, 6).map((w, idx) => ({
      token: w.booking.token,
      position: idx + 1,
      cropName: w.booking.crop.name,
    })),
  };
}

/**
 * Get individual farmer queue position & dynamic ETA
 */
export async function getFarmerQueuePosition(
  bookingId: string,
  userId?: string
): Promise<FarmerQueuePosition> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      centre: true,
      slot: true,
      crop: true,
      queueEntry: true,
      farmer: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking record not found");
  }

  const centre = booking.centre;
  let tokensAhead = 0;
  let estimatedMinutes = 0;
  let isProximityAlert = false;

  if (["CHECKED_IN", "WAITING"].includes(booking.status)) {
    const farmerPosition = booking.queueEntry?.position || 999;

    // Count waiting entries with position lower than this farmer
    tokensAhead = await prisma.queueEntry.count({
      where: {
        centreId: centre.id,
        position: { lt: farmerPosition },
        booking: {
          status: { in: ["CHECKED_IN", "WAITING"] },
        },
      },
    });

    const activeCounters = Math.max(1, centre.totalCounters);
    const avgTurnaround = 10; // 10 mins average per tractor weighing & moisture check
    estimatedMinutes = Math.max(3, Math.round((tokensAhead * avgTurnaround) / activeCounters));
    isProximityAlert = tokensAhead <= 3;
  } else if (booking.status === "CALLED" || booking.status === "IN_PROCUREMENT") {
    tokensAhead = 0;
    estimatedMinutes = 0;
    isProximityAlert = true;
  }

  return {
    bookingId: booking.id,
    token: booking.token,
    status: booking.status,
    centreId: centre.id,
    centreName: centre.name,
    cropName: booking.crop.name,
    quantity: booking.quantity,
    slotDate: booking.slot.date.toISOString().split("T")[0],
    slotWindow: `${booking.slot.startTime} - ${booking.slot.endTime}`,
    position: booking.queueEntry?.position ?? null,
    tokensAhead,
    estimatedMinutes,
    counterNumber: booking.queueEntry?.counterNo ?? null,
    isProximityAlert,
    checkedInAt: booking.checkedInAt?.toISOString() || null,
    calledAt: booking.queueEntry?.calledAt?.toISOString() || null,
    stageTimeline: {
      booked: true,
      checkedIn: ["CHECKED_IN", "WAITING", "CALLED", "IN_PROCUREMENT", "WEIGHED", "COMPLETED"].includes(
        booking.status
      ),
      inQueue: ["WAITING", "CALLED", "IN_PROCUREMENT", "WEIGHED", "COMPLETED"].includes(
        booking.status
      ),
      called: ["CALLED", "IN_PROCUREMENT", "WEIGHED", "COMPLETED"].includes(booking.status),
      inProcurement: ["IN_PROCUREMENT", "WEIGHED", "COMPLETED"].includes(booking.status),
      completed: booking.status === "COMPLETED",
    },
  };
}

/**
 * Gate Check-in: marks booking as checked-in and inserts into QueueEntry
 */
export async function checkInBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { centre: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "BOOKED") {
    return booking; // already checked in or further along
  }

  // Get next sequential position for this centre
  const maxPosEntry = await prisma.queueEntry.findFirst({
    where: { centreId: booking.centreId },
    orderBy: { position: "desc" },
  });

  const nextPos = (maxPosEntry?.position || 0) + 1;

  const [updatedBooking] = await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "WAITING",
        checkedInAt: new Date(),
      },
    }),
    prisma.queueEntry.upsert({
      where: { bookingId },
      create: {
        bookingId,
        centreId: booking.centreId,
        position: nextPos,
        estimatedWaitMins: nextPos * 10,
      },
      update: {
        position: nextPos,
        estimatedWaitMins: nextPos * 10,
      },
    }),
  ]);

  // Broadcast updated queue state to Mandi room
  const queueState = await getCentreQueueState(booking.centreId);
  broadcastQueueUpdate(io, booking.centreId, {
    nowServing: queueState.nowServingToken || "None",
    nextToken: queueState.nextUpToken || "None",
    totalWaiting: queueState.waitingCount,
    completedToday: queueState.completedTodayCount,
  });

  return updatedBooking;
}

/**
 * Advance Mandi Queue: call next token, start procurement, or complete weighing
 */
export async function advanceCentreQueue(
  centreId: string,
  counterNumber: number,
  action: "CALL_NEXT" | "START_PROCUREMENT" | "COMPLETE" | "SKIP" | "RESET",
  bookingId?: string
) {
  const centre = await prisma.procurementCentre.findUnique({
    where: { id: centreId },
  });

  if (!centre) {
    throw new Error("Procurement centre not found");
  }

  // Current entry at this counter
  const currentAtCounter = await prisma.queueEntry.findFirst({
    where: {
      centreId,
      counterNo: counterNumber,
      booking: {
        status: { in: ["CALLED", "IN_PROCUREMENT"] },
      },
    },
    include: { booking: true },
  });

  if (action === "START_PROCUREMENT" && currentAtCounter) {
    await prisma.booking.update({
      where: { id: currentAtCounter.bookingId },
      data: { status: "IN_PROCUREMENT" },
    });
  } else if (action === "COMPLETE" && currentAtCounter) {
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: currentAtCounter.bookingId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      }),
      prisma.queueEntry.delete({
        where: { id: currentAtCounter.id },
      }),
    ]);
  } else if (action === "RESET") {
    // Reset bookings at this centre so user can test arrival check-in from beginning
    const centreBookings = await prisma.booking.findMany({
      where: { centreId },
      take: 10,
    });
    for (let i = 0; i < centreBookings.length; i++) {
      const b = centreBookings[i];
      const newStatus = i === 0 ? "BOOKED" : "WAITING";
      await prisma.booking.update({
        where: { id: b.id },
        data: {
          status: newStatus,
          checkedInAt: newStatus === "WAITING" ? new Date() : null,
          completedAt: null,
        },
      });
      if (newStatus === "WAITING") {
        await prisma.queueEntry.upsert({
          where: { bookingId: b.id },
          create: {
            bookingId: b.id,
            centreId,
            position: i,
            estimatedWaitMins: i * 8,
          },
          update: {
            position: i,
            counterNo: null,
            calledAt: null,
            estimatedWaitMins: i * 8,
          },
        });
      } else {
        await prisma.queueEntry.deleteMany({ where: { bookingId: b.id } });
      }
    }
  } else if (action === "CALL_NEXT") {
    // If an existing token was at this counter, complete it first
    if (currentAtCounter && (!bookingId || currentAtCounter.bookingId !== bookingId)) {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: currentAtCounter.bookingId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        }),
        prisma.queueEntry.delete({
          where: { id: currentAtCounter.id },
        }),
      ]);
    }

    // Find target waiting entry in queue (either specific bookingId or next in line)
    let nextWaiting: any = null;
    if (bookingId) {
      nextWaiting = await prisma.queueEntry.findFirst({
        where: {
          centreId,
          bookingId,
        },
        include: {
          booking: {
            include: {
              farmer: true,
            },
          },
        },
      });

      if (!nextWaiting) {
        const b = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { farmer: true },
        });
        if (b) {
          nextWaiting = await prisma.queueEntry.create({
            data: {
              bookingId: b.id,
              centreId,
              position: 1,
              counterNo: counterNumber,
              calledAt: new Date(),
              estimatedWaitMins: 0,
            },
            include: {
              booking: {
                include: { farmer: true },
              },
            },
          });
        }
      }
    } else {
      nextWaiting = await prisma.queueEntry.findFirst({
        where: {
          centreId,
          booking: {
            status: { in: ["WAITING", "CHECKED_IN"] },
          },
        },
        orderBy: { position: "asc" },
        include: {
          booking: {
            include: {
              farmer: true,
            },
          },
        },
      });
    }

    if (nextWaiting) {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: nextWaiting.bookingId },
          data: { status: "CALLED" },
        }),
        prisma.queueEntry.update({
          where: { id: nextWaiting.id },
          data: {
            counterNo: counterNumber,
            calledAt: new Date(),
          },
        }),
      ]);

      // Emit private turn-call alert with chime
      sendTurnCallAlert(io, nextWaiting.booking.farmerId, {
        token: nextWaiting.booking.token,
        counterNumber,
        centreName: centre.name,
      });
    }

    // Check next 3 waiting farmers for proximity alert
    const upcomingWaiting = await prisma.queueEntry.findMany({
      where: {
        centreId,
        booking: {
          status: { in: ["WAITING", "CHECKED_IN"] },
        },
      },
      orderBy: { position: "asc" },
      take: 3,
      include: {
        booking: {
          include: {
            farmer: true,
          },
        },
      },
    });

    upcomingWaiting.forEach((entry, idx) => {
      sendProximityAlert(io, entry.booking.farmerId, {
        token: entry.booking.token,
        tokensAhead: idx + 1,
        estimatedMinutes: (idx + 1) * 8,
        centreName: centre.name,
      });
    });
  }

  // Broadcast overall queue update to room
  const updatedState = await getCentreQueueState(centreId);
  broadcastQueueUpdate(io, centreId, {
    nowServing: updatedState.nowServingToken || "None",
    nextToken: updatedState.nextUpToken || "None",
    totalWaiting: updatedState.waitingCount,
    completedToday: updatedState.completedTodayCount,
  });

  return updatedState;
}

/**
 * Seed realistic sample waiting entries for testing queue advancement
 */
export async function seedQueueIfEmpty(_centreId: string) {
  // Disabled: Only real farmer bookings should appear in the physical mandi queue
  return;
}

