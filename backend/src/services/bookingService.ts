import prisma from "../config/database";
import { BookingStatus, CongestionLevel } from "../types/enums";
import { getIO } from "../socket/socketServer";

// ── Master Crop Data with Government MSP Rates (2026-27) ──
export const MSP_CROPS = [
  {
    name: "Wheat (Kanak)",
    variety: "HD-3086 / PBW-725",
    mspPrice: 2275,
    unit: "Quintal",
    season: "Rabi 2026-27",
    maxMoisture: 12.0,
    quotaPerAcre: 22.0, // Max 22 quintals per acre
    icon: "🌾",
  },
  {
    name: "Paddy (Dhan - Common)",
    variety: "PR-126 / Pusa-44",
    mspPrice: 2183,
    unit: "Quintal",
    season: "Kharif 2026-27",
    maxMoisture: 17.0,
    quotaPerAcre: 28.0,
    icon: "🌾",
  },
  {
    name: "Mustard (Sarson)",
    variety: "Pusa Bold / Giriraj",
    mspPrice: 5650,
    unit: "Quintal",
    season: "Rabi 2026-27",
    maxMoisture: 8.0,
    quotaPerAcre: 8.5,
    icon: "🌱",
  },
  {
    name: "Cotton (Kapas - Medium Staple)",
    variety: "Bt Cotton Hybrid",
    mspPrice: 7020,
    unit: "Quintal",
    season: "Kharif 2026-27",
    maxMoisture: 10.0,
    quotaPerAcre: 10.0,
    icon: "☁️",
  },
  {
    name: "Maize (Makka)",
    variety: "PMH-1 / Ganga-5",
    mspPrice: 2090,
    unit: "Quintal",
    season: "Kharif 2026-27",
    maxMoisture: 14.0,
    quotaPerAcre: 24.0,
    icon: "🌽",
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
 * Get available slots for a centre on a given date (Auto-generates if unseeded)
 */
export async function getSlotsForCentreAndDate(centreId: string, dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const targetDate = new Date(Date.UTC(year, (month || 1) - 1, day || 1));

  let slots = await prisma.slot.findMany({
    where: {
      centreId,
      date: targetDate,
      isActive: true,
    },
    orderBy: { startTime: "asc" },
  });

  // If no slots exist for this centre and date yet, auto-provision standard slots
  if (slots.length === 0) {
    const defaultSlots = [
      { startTime: "08:00", endTime: "10:00", capacity: 35, booked: 0 },
      { startTime: "10:00", endTime: "12:00", capacity: 35, booked: 0 },
      { startTime: "12:30", endTime: "14:30", capacity: 35, booked: 0 },
      { startTime: "14:30", endTime: "16:30", capacity: 35, booked: 0 },
    ];

    await prisma.slot.createMany({
      data: defaultSlots.map((ds) => ({
        centreId,
        date: targetDate,
        startTime: ds.startTime,
        endTime: ds.endTime,
        capacity: ds.capacity,
        booked: ds.booked,
        isActive: true,
      })),
      skipDuplicates: true,
    });

    slots = await prisma.slot.findMany({
      where: {
        centreId,
        date: targetDate,
        isActive: true,
      },
      orderBy: { startTime: "asc" },
    });
  }

  return slots.map((s) => ({
    ...s,
    availableCapacity: Math.max(0, s.capacity - s.booked),
    isFull: s.booked >= s.capacity,
  }));
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

    // 3. Resolve Slot (Find existing or auto-create for today)
    let slot = await tx.slot.findFirst({
      where: {
        OR: [
          { id: input.slotId },
          { centreId: centre.id },
        ],
      },
      include: { centre: true },
    });

    if (!slot) {
      const today = new Date();
      slot = await tx.slot.create({
        data: {
          centreId: centre.id,
          date: today,
          startTime: "09:00",
          endTime: "11:00",
          capacity: 50,
          booked: 0,
        },
        include: { centre: true },
      });
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

  if (!user) return [];

  let bookings: any[] = [];

  if (user.farmer) {
    bookings = await prisma.booking.findMany({
      where: { farmerId: user.farmer.id },
      include: {
        centre: true,
        slot: true,
        crop: true,
        queueEntry: true,
      },
      orderBy: { bookedAt: "desc" },
    });
  } else if (user.role === "ADMIN") {
    // If admin is testing/viewing, return recent bookings so admin can see real data
    bookings = await prisma.booking.findMany({
      take: 20,
      include: {
        centre: true,
        slot: true,
        crop: true,
        queueEntry: true,
      },
      orderBy: { bookedAt: "desc" },
    });
  }

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

  if (!user || !user.farmer) throw new Error("Farmer not found");

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

  if (!booking) throw new Error("Booking not found");
  if (booking.farmerId !== user.farmer.id && user.role !== "ADMIN") {
    throw new Error("Unauthorized to view this booking");
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

    return updated;
  });
}
