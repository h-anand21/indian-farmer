import prisma from "../config/database";
import { BookingStatus, CongestionLevel } from "../types/enums";
import { getIO } from "../socket/socketServer";
import { recordAuditLog } from "./adminService";

// ── Master Crop Data with Government MSP Rates (2026-27 Marketing Season) ──
export const MSP_CROPS = [
  {
    name: "Wheat (Kanak)",
    variety: "HD-3086 / PBW-725",
    mspPrice: 2425,
    prevPrice: 2275,
    unit: "Quintal",
    season: "Rabi 2026-27",
    effectiveDate: "13 Sep 2026",
    gazetteNo: "GOI-CCEA-2026/RABI-01",
    maxMoisture: 12.0,
    quotaPerAcre: 22.0, // Max 22 quintals per acre
    icon: "🌾",
  },
  {
    name: "Paddy (Dhan - Common)",
    variety: "PR-126 / Pusa-44",
    mspPrice: 2300,
    prevPrice: 2183,
    unit: "Quintal",
    season: "Kharif 2026-27",
    effectiveDate: "13 Sep 2026",
    gazetteNo: "GOI-CCEA-2026/KHARIF-04",
    maxMoisture: 17.0,
    quotaPerAcre: 28.0,
    icon: "🌾",
  },
  {
    name: "Paddy (Grade A)",
    variety: "Pusa Basmati 1121",
    mspPrice: 2320,
    prevPrice: 2203,
    unit: "Quintal",
    season: "Kharif 2026-27",
    effectiveDate: "13 Sep 2026",
    gazetteNo: "GOI-CCEA-2026/KHARIF-05",
    maxMoisture: 16.5,
    quotaPerAcre: 26.0,
    icon: "🌾",
  },
  {
    name: "Mustard (Sarson)",
    variety: "Pusa Bold / Giriraj",
    mspPrice: 5950,
    prevPrice: 5650,
    unit: "Quintal",
    season: "Rabi 2026-27",
    effectiveDate: "13 Sep 2026",
    gazetteNo: "GOI-CCEA-2026/RABI-02",
    maxMoisture: 8.0,
    quotaPerAcre: 8.5,
    icon: "🌱",
  },
  {
    name: "Gram (Chana)",
    variety: "JG-11 / Vishal",
    mspPrice: 5650,
    prevPrice: 5440,
    unit: "Quintal",
    season: "Rabi 2026-27",
    effectiveDate: "13 Sep 2026",
    gazetteNo: "GOI-CCEA-2026/RABI-03",
    maxMoisture: 9.0,
    quotaPerAcre: 10.0,
    icon: "🫘",
  },
  {
    name: "Cotton (Kapas - Long Staple)",
    variety: "Bt Cotton Hybrid",
    mspPrice: 7521,
    prevPrice: 7020,
    unit: "Quintal",
    season: "Kharif 2026-27",
    effectiveDate: "13 Sep 2026",
    gazetteNo: "GOI-CCEA-2026/KHARIF-08",
    maxMoisture: 10.0,
    quotaPerAcre: 10.0,
    icon: "☁️",
  },
  {
    name: "Maize (Makka)",
    variety: "PMH-1 / Ganga-5",
    mspPrice: 2225,
    prevPrice: 2090,
    unit: "Quintal",
    season: "Kharif 2026-27",
    effectiveDate: "13 Sep 2026",
    gazetteNo: "GOI-CCEA-2026/KHARIF-06",
    maxMoisture: 14.0,
    quotaPerAcre: 24.0,
    icon: "🌽",
  },
  {
    name: "Soybean (Yellow)",
    variety: "JS-335 / JS-9560",
    mspPrice: 4892,
    prevPrice: 4600,
    unit: "Quintal",
    season: "Kharif 2026-27",
    effectiveDate: "13 Sep 2026",
    gazetteNo: "GOI-CCEA-2026/KHARIF-09",
    maxMoisture: 10.0,
    quotaPerAcre: 12.0,
    icon: "🫛",
  },
];

/**
 * List all active procurement centres
 */
export async function listCentres(query?: { state?: string; district?: string }) {
  const where: any = { isActive: true };
  if (query?.state) where.state = query.state;
  if (query?.district) where.district = query.district;

  const centres = await prisma.procurementCentre.findMany({
    where,
    orderBy: { name: "asc" },
  });

  // Calculate dynamic congestion level for each centre based on today's bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const centreIds = centres.map((c) => c.id);
  const todaySlots = await prisma.slot.findMany({
    where: {
      centreId: { in: centreIds },
      date: today,
    },
  });

  const slotsByCentre = new Map<string, typeof todaySlots>();
  for (const s of todaySlots) {
    const list = slotsByCentre.get(s.centreId) || [];
    list.push(s);
    slotsByCentre.set(s.centreId, list);
  }

  const enrichedCentres = centres.map((c) => {
    const cSlots = slotsByCentre.get(c.id) || [];
    const totalCap = cSlots.reduce((sum, s) => sum + s.capacity, 0);
    const totalBooked = cSlots.reduce((sum, s) => sum + s.booked, 0);
    const ratio = totalCap > 0 ? totalBooked / totalCap : 0;

    let congestion: CongestionLevel = CongestionLevel.LOW;
    if (ratio > 0.75) congestion = CongestionLevel.HIGH;
    else if (ratio > 0.45) congestion = CongestionLevel.MODERATE;

    return {
      ...c,
      congestion,
      todayBookedRatio: Math.round(ratio * 100),
    };
  });

  return enrichedCentres;
}

/**
 * List master crops
 */
export function listMasterCrops() {
  return MSP_CROPS;
}

/**
 * Get available slots for a centre on a given date (Auto-generates 7-day window if unseeded)
 */
export async function getSlotsForCentreAndDate(centreId: string, dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const targetDate = new Date(Date.UTC(year, (month || 1) - 1, day || 1));

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const max7DayLimit = new Date(today);
  max7DayLimit.setUTCDate(max7DayLimit.getUTCDate() + 7);

  let slots = await prisma.slot.findMany({
    where: {
      centreId,
      date: targetDate,
      isActive: true,
    },
    orderBy: { startTime: "asc" },
  });

  // Auto-provision 7-day slots ONLY if date is within next 7 days and unseeded
  if (slots.length === 0 && targetDate >= today && targetDate < max7DayLimit) {
    const sampleSlot = await prisma.slot.findFirst({
      where: { centreId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    let windowsToUse = [
      { startTime: "08:00", endTime: "10:00", capacity: 35 },
      { startTime: "10:00", endTime: "12:00", capacity: 35 },
      { startTime: "12:30", endTime: "14:30", capacity: 35 },
      { startTime: "14:30", endTime: "16:30", capacity: 35 },
    ];

    if (sampleSlot) {
      const existingCentreSlots = await prisma.slot.findMany({
        where: { centreId, date: sampleSlot.date, isActive: true },
        orderBy: { startTime: "asc" },
      });
      if (existingCentreSlots.length > 0) {
        windowsToUse = existingCentreSlots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
          capacity: s.capacity,
        }));
      }
    }

    for (const ds of windowsToUse) {
      await prisma.slot.upsert({
        where: {
          centreId_date_startTime: {
            centreId,
            date: targetDate,
            startTime: ds.startTime,
          },
        },
        create: {
          centreId,
          date: targetDate,
          startTime: ds.startTime,
          endTime: ds.endTime,
          capacity: ds.capacity,
          booked: 0,
          isActive: true,
        },
        update: {
          capacity: ds.capacity,
          endTime: ds.endTime,
        },
      });
    }

    slots = await prisma.slot.findMany({
      where: {
        centreId,
        date: targetDate,
        isActive: true,
      },
      orderBy: { startTime: "asc" },
    });
  }

  // Calculate real active booking count from database for each slot
  const slotsWithRealCounts = await Promise.all(
    slots.map(async (s) => {
      const realBookedCount = await prisma.booking.count({
        where: {
          slotId: s.id,
          status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED] },
        },
      });

      if (s.booked !== realBookedCount) {
        await prisma.slot.update({
          where: { id: s.id },
          data: { booked: realBookedCount },
        }).catch(() => {});
      }

      const availableCapacity = Math.max(0, s.capacity - realBookedCount);

      return {
        ...s,
        booked: realBookedCount,
        bookedCount: realBookedCount,
        availableCapacity,
        isFull: realBookedCount >= s.capacity,
      };
    })
  );

  return slotsWithRealCounts;
}

/**
 * Get all available dates for a centre (includes 7-day rolling window + any Admin generated future dates)
 */
export async function getAvailableDatesForCentre(centreId: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // 1. Fetch all distinct active slot dates in DB for this centre starting from Today
  const dbSlots = await prisma.slot.findMany({
    where: {
      centreId,
      date: { gte: today },
      isActive: true,
    },
    select: { date: true },
    distinct: ["date"],
    orderBy: { date: "asc" },
  });

  const datesMap = new Map<string, boolean>();

  // Mark existing DB dates
  for (const s of dbSlots) {
    const dStr = s.date.toISOString().split("T")[0];
    datesMap.set(dStr, true);
  }

  // 2. Ensure standard 7 days (Today + 6 days) are present
  const standard7DaysEnd = new Date(today);
  standard7DaysEnd.setUTCDate(standard7DaysEnd.getUTCDate() + 7);

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() + i);
    const dStr = d.toISOString().split("T")[0];
    if (!datesMap.has(dStr)) {
      datesMap.set(dStr, false);
    }
  }

  // Convert to sorted array of date objects
  const sortedDateStrs = Array.from(datesMap.keys()).sort();

  return sortedDateStrs.map((dStr, index) => {
    const [y, m, d] = dStr.split("-").map(Number);
    const dateObj = new Date(Date.UTC(y, (m || 1) - 1, d || 1));

    const todayStr = today.toISOString().split("T")[0];
    const isToday = dStr === todayStr;

    const dayName = isToday
      ? "Today"
      : dateObj.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" });
    const dayNum = dateObj.getUTCDate().toString().padStart(2, "0");
    const monthStr = dateObj.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" });

    // Is Admin Created: date is beyond standard 7-day window OR exists in DB
    const isBeyond7Days = dateObj >= standard7DaysEnd;
    const existsInDb = datesMap.get(dStr) === true;
    const isNew = isBeyond7Days || (index >= 7 && existsInDb);

    return {
      dateStr: dStr,
      dayName,
      dayNum,
      monthStr,
      isNew,
      badgeLabel: isNew ? "NEW ✨" : isToday ? "TODAY" : undefined,
    };
  });
}

/**
 * Create a new slot booking for a farmer
 */
export interface CreateBookingInput {
  centreId: string;
  slotId: string;
  cropName: string;
  quantity: number;
  vehicleType: string;
  vehicleNumber: string;
  driverPhone?: string;
}

export async function createBooking(
  firebaseUid: string,
  input: CreateBookingInput
) {
  const booking = await prisma.$transaction(async (tx) => {
    // 1. Find user & farmer profile (or auto-provision if missing)
    let user = await tx.user.findUnique({
      where: { firebaseUid },
      include: { farmer: true },
    });

    if (!user) {
      user = await tx.user.create({
        data: {
          firebaseUid,
          name: "Kisan Farmer",
          role: "FARMER",
          farmer: {
            create: {
              state: "Punjab",
              district: "Ludhiana",
              tehsil: "Khanna",
              village: "Bija",
              pincode: "141412",
              landArea: 6.5,
              ownershipType: "Owner",
            },
          },
        },
        include: { farmer: true },
      });
    } else if (!user.farmer) {
      const farmer = await tx.farmer.create({
        data: {
          userId: user.id,
          state: "Punjab",
          district: "Ludhiana",
          tehsil: "Khanna",
          village: "Bija",
          pincode: "141412",
          landArea: 6.5,
          ownershipType: "Owner",
        },
      });
      user = { ...user, farmer };
    }

    // 2. Resolve Centre
    let centre = await tx.procurementCentre.findFirst({
      where: {
        OR: [
          { id: input.centreId },
          { code: input.centreId },
        ],
      },
    });

    if (!centre) {
      centre = await tx.procurementCentre.findFirst({
        where: { isActive: true },
      });
      if (!centre) {
        centre = await tx.procurementCentre.create({
          data: {
            name: "Khanna APMC Main Grain Yard",
            code: "PB-KHN-01",
            address: "Main Mandi Complex, GT Road, Khanna",
            district: "Ludhiana",
            state: "Punjab",
            totalCounters: 8,
          },
        });
      }
    }

    // 3. Resolve Exact Slot by slotId
    let slot: any = null;
    if (input.slotId) {
      slot = await tx.slot.findUnique({
        where: { id: input.slotId },
        include: { centre: true },
      });
      if (!slot) {
        slot = await tx.slot.findFirst({
          where: {
            centreId: centre.id,
            OR: [
              { startTime: { contains: input.slotId } },
              { id: { contains: input.slotId } },
            ],
          },
          orderBy: { date: "asc" },
          include: { centre: true },
        });
      }
    }

    if (!slot) {
      slot = await tx.slot.findFirst({
        where: { centreId: centre.id },
        orderBy: { date: "asc" },
        include: { centre: true },
      });
    }

    if (!slot) {
      const today = new Date();
      slot = await tx.slot.create({
        data: {
          centreId: centre.id,
          date: today,
          startTime: "09:00",
          endTime: "11:00",
          capacity: 35,
          booked: 0,
        },
        include: { centre: true },
      });
    }

    // Check capacity
    if (slot.booked >= slot.capacity) {
      throw new Error("⚠️ Selected time slot is fully booked. Please select another slot or date.");
    }

    // 4. Create Crop lot record
    const cropRecord = await tx.crop.create({
      data: {
        farmerId: user.farmer!.id,
        name: input.cropName,
        quantity: input.quantity,
        year: new Date().getFullYear(),
      },
    });

    // 5. Generate human-readable Token Number: e.g. "KQ-KHN-1048"
    const totalTodayBookings = await tx.booking.count({
      where: { centreId: centre.id },
    });
    const centreCodeParts = (centre.code || "MND-01").split("-");
    const centrePrefix = centreCodeParts.length > 1 ? centreCodeParts[1] : "MND";
    const tokenNumber = `KQ-${centrePrefix}-${1001 + totalTodayBookings}`;

    // 6. Create Booking
    const newBooking = await tx.booking.create({
      data: {
        farmerId: user.farmer!.id,
        centreId: centre.id,
        slotId: slot.id,
        cropId: cropRecord.id,
        token: tokenNumber,
        quantity: input.quantity,
        status: BookingStatus.BOOKED,
      },
      include: {
        centre: true,
        slot: true,
        crop: true,
      },
    });

    // 7. Create QueueEntry for live tracking
    await tx.queueEntry.create({
      data: {
        bookingId: newBooking.id,
        centreId: centre.id,
        position: totalTodayBookings + 1,
        counterNo: 1 + (totalTodayBookings % (centre.totalCounters || 4)),
        estimatedWaitMins: (totalTodayBookings + 1) * 15,
      },
    });

    // 8. Increment slot booked count
    await tx.slot.update({
      where: { id: slot.id },
      data: { booked: { increment: 1 } },
    });

    return newBooking;
  });

  // Broadcast real-time event to connected clients
  try {
    const io = getIO();
    if (io) {
      io.to(`centre:${booking.centreId}`).emit("booking:confirmed", {
        bookingId: booking.id,
        token: booking.token,
        centreId: booking.centreId,
        slotId: booking.slotId,
      });
      io.to("admin").emit("booking:new", {
        bookingId: booking.id,
        token: booking.token,
        centreName: booking.centre.name,
      });
    }
  } catch (err) {
    console.error("Socket broadcast error:", err);
  }

  try {
    await recordAuditLog(
      booking.farmerId,
      "SLOT_BOOKED",
      "Booking",
      booking.token || booking.id,
      undefined,
      { crop: input.cropName, quantity: input.quantity, centreName: booking.centre.name }
    );
  } catch (auditErr) {
    console.warn("Audit log for booking failed:", auditErr);
  }

  return {
    ...booking,
    slotDate: booking.slot?.date ? new Date(booking.slot.date).toISOString().split("T")[0] : undefined,
    slotWindow: booking.slot ? `${booking.slot.startTime} - ${booking.slot.endTime}` : undefined,
    queueNumber: 1,
  };
}

/**
 * List all bookings for a farmer
 */
export async function getFarmerBookings(firebaseUid: string) {
  const user = await prisma.user.findUnique({
    where: { firebaseUid },
    include: { farmer: true },
  });

  // If user doesn't exist or has no farmer profile → return empty
  // (new users, admin-only accounts, etc. should NOT see other farmers' bookings)
  if (!user || !user.farmer) return [];

  const bookings = await prisma.booking.findMany({
    where: { farmerId: user.farmer.id },
    include: {
      centre: true,
      slot: true,
      crop: true,
      queueEntry: true,
    },
    orderBy: { bookedAt: "desc" },
  });

  return bookings.map((b) => ({
    ...b,
    slotDate: b.slot?.date
      ? new Date(b.slot.date).toISOString().split("T")[0]
      : (b.bookedAt ? new Date(b.bookedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]),
    slotWindow: b.slot ? `${b.slot.startTime} - ${b.slot.endTime}` : "09:00 - 11:00",
    queueNumber: b.queueEntry?.position || 1,
  }));
}


/**
 * Get single booking details with token pass
 */
export async function getBookingById(bookingId: string, firebaseUid: string) {
  const user = await prisma.user.findUnique({
    where: { firebaseUid },
    include: { farmer: true },
  });

  if (!user || !user.farmer) {
    const err: any = new Error("Farmer not found");
    err.statusCode = 404;
    throw err;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      centre: true,
      slot: true,
      crop: true,
      queueEntry: true,
      farmer: {
        include: { user: true },
      },
    },
  });

  if (!booking) {
    const err: any = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }
  if (booking.farmerId !== user.farmer.id && user.role !== "ADMIN") {
    const err: any = new Error("Unauthorized to view this booking");
    err.statusCode = 403;
    throw err;
  }

  return booking;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string, firebaseUid: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { firebaseUid },
      include: { farmer: true },
    });

    if (!user || !user.farmer) throw new Error("Farmer not found");

    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Booking not found");
    if (booking.farmerId !== user.farmer.id && user.role !== "ADMIN") {
      throw new Error("Unauthorized to cancel this booking");
    }

    if (booking.status !== BookingStatus.BOOKED) {
      throw new Error(`Cannot cancel booking with status '${booking.status}'`);
    }

    // Update booking status
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    // Decrement slot booked count
    await tx.slot.update({
      where: { id: booking.slotId },
      data: { booked: { decrement: 1 } },
    });

    try {
      await recordAuditLog(
        user.id,
        "BOOKING_CANCELLED",
        "Booking",
        booking.token || booking.id,
        { status: booking.status },
        { status: BookingStatus.CANCELLED }
      );
    } catch (auditErr) {
      console.warn("Audit log for booking cancellation failed:", auditErr);
    }

    return updated;
  });
}
