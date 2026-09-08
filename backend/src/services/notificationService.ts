import prisma from "../config/database";
import { NotificationType } from "../types/enums";
import { getIO } from "../socket/socketServer";

export interface SMSPayload {
  to: string; // Farmer Phone Number
  message: string;
  type: "SLOT_BOOKED" | "PROXIMITY_ALERT" | "TURN_CALLED" | "PAYMENT_PAID";
  bookingId?: string;
}

/**
 * Sends a real-time Multi-Channel SMS & Push Alert to the Farmer
 */
export async function sendSMSNotification(payload: SMSPayload) {
  const { to, message, type } = payload;

  console.log(`[SMS GATEWAY] Sending ${type} SMS to ${to}: "${message}"`);

  // Save Notification record in database if farmer is found
  let savedNotification = null;
  try {
    const rawPhone = to.replace("+91", "").trim();
    const user = await prisma.user.findFirst({
      where: { phone: { contains: rawPhone } },
      include: { farmer: true },
    });

    if (user && user.farmer) {
      savedNotification = await prisma.notification.create({
        data: {
          farmerId: user.farmer.id,
          title: getNotificationTitle(type),
          message: message,
          type: mapTypeToEnum(type),
          isRead: false,
        },
      });

      // Broadcast via Socket.IO
      try {
        const io = getIO();
        if (io) {
          io.to(`farmer:${user.id}`).emit("notification:new", savedNotification);
        }
      } catch (e) {
        // Socket server broadcast optional
      }
    }
  } catch (err) {
    console.warn("Could not persist notification record:", err);
  }

  return {
    success: true,
    gateway: "Twilio / Fast2SMS Simulator",
    messageId: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    to,
    message,
    status: "DELIVERED",
    timestamp: new Date().toISOString(),
    savedNotification,
  };
}

/**
 * Trigger SMS on Slot Confirmation
 */
export async function notifyBookingConfirmed(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      farmer: { include: { user: true } },
      centre: true,
      crop: true,
    },
  });

  if (!booking) return null;

  const phone = booking.farmer.user.phone || "+919876543210";
  const msg = `KisanQueue: Dear ${booking.farmer.user.name}, your procurement slot for ${booking.crop.name} (${booking.quantity} Qtl) at ${booking.centre.name} on ${new Date(booking.bookedAt).toLocaleDateString("en-IN")} is CONFIRMED. Token: ${booking.token}. Show QR code at Mandi Gate.`;

  return sendSMSNotification({
    to: phone,
    message: msg,
    type: "SLOT_BOOKED",
    bookingId,
  });
}

/**
 * Trigger SMS on Proximity Alert (Tokens Ahead <= 3)
 */
export async function notifyProximityAlert(bookingId: string, tokensAhead: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      farmer: { include: { user: true } },
      centre: true,
    },
  });

  if (!booking) return null;

  const phone = booking.farmer.user.phone || "+919876543210";
  const msg = `URGENT KisanQueue Alert: Dear ${booking.farmer.user.name}, only ${tokensAhead} vehicles ahead of you at ${booking.centre.name}. Token: ${booking.token}. Please head to Mandi Weighbridge Gate immediately.`;

  return sendSMSNotification({
    to: phone,
    message: msg,
    type: "PROXIMITY_ALERT",
    bookingId,
  });
}

/**
 * Trigger SMS on Direct Benefit Transfer (DBT) Payment
 */
export async function notifyPaymentDisbursed(bookingId: string, amount: number, utrNumber: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      farmer: { include: { user: true } },
      crop: true,
    },
  });

  if (!booking) return null;

  const phone = booking.farmer.user.phone || "+919876543210";
  const msg = `KisanQueue Payment: ₹${amount.toLocaleString("en-IN")} credited directly to your Bank A/c for ${booking.crop.name} procurement via Govt DBT. Bank UTR: ${utrNumber}. Thank you, Farmers First!`;

  return sendSMSNotification({
    to: phone,
    message: msg,
    type: "PAYMENT_PAID",
    bookingId,
  });
}

/**
 * Get all notifications for a farmer by farmerId
 */
export async function getUserNotifications(farmerId: string) {
  return prisma.notification.findMany({
    where: { farmerId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

function getNotificationTitle(type: SMSPayload["type"]): string {
  switch (type) {
    case "SLOT_BOOKED":
      return "✅ Slot Confirmed & QR Pass Ready";
    case "PROXIMITY_ALERT":
      return "⚠️ Proximity Alert: Turn Arriving Soon";
    case "TURN_CALLED":
      return "🔔 URGENT: Proceed to Weighbridge Counter";
    case "PAYMENT_PAID":
      return "💳 DBT Payment Disbursed";
    default:
      return "📢 KisanQueue Update";
  }
}

function mapTypeToEnum(type: SMSPayload["type"]): NotificationType {
  switch (type) {
    case "SLOT_BOOKED":
      return NotificationType.BOOKING_CONFIRMATION;
    case "PROXIMITY_ALERT":
      return NotificationType.PROXIMITY_ALERT;
    case "TURN_CALLED":
      return NotificationType.TURN_CALLED;
    case "PAYMENT_PAID":
      return NotificationType.PAYMENT_UPDATE;
    default:
      return NotificationType.SYSTEM;
  }
}

export interface AdminBroadcastPayload {
  title: string;
  message: string;
  priority?: "NORMAL" | "HIGH" | "URGENT";
  targetType?: "ALL" | "CENTRE";
  centreId?: string;
  adminName?: string;
}

/**
 * Broadcast an announcement from Admin to All Farmers or specific Mandi yard
 */
export async function broadcastAdminNotification(payload: AdminBroadcastPayload) {
  const {
    title,
    message,
    priority = "HIGH",
    targetType = "ALL",
    centreId,
    adminName = "APMC Mandi Administration",
  } = payload;

  let centreName = "All APMC Mandis";
  if (centreId && centreId !== "ALL") {
    const centre = await prisma.procurementCentre.findUnique({
      where: { id: centreId },
    });
    if (centre) {
      centreName = centre.name;
    }
  }

  // Find target farmers
  const isAll = !centreId || centreId === "ALL" || targetType === "ALL";
  let targetFarmers = await prisma.farmer.findMany({
    where: !isAll
      ? {
          OR: [
            { preferredCentreId: centreId },
            { bookings: { some: { centreId } } },
          ],
        }
      : {},
    include: { user: true },
  });

  // Fallback to all farmers if none matched specific centre filter
  if (targetFarmers.length === 0) {
    targetFarmers = await prisma.farmer.findMany({ include: { user: true } });
  }

  // Persist notification for all target farmers
  const savedCount = [];
  for (const farmer of targetFarmers) {
    try {
      await prisma.notification.create({
        data: {
          farmerId: farmer.id,
          title: `📢 ${title}`,
          message: message,
          type: NotificationType.SYSTEM,
          isRead: false,
          metadata: {
            broadcastBy: adminName,
            centreId: centreId || "ALL",
            centreName,
            priority,
            sentAt: new Date().toISOString(),
          },
        },
      });
      savedCount.push(farmer.id);
    } catch (err) {
      console.warn("Error creating notification for farmer:", farmer.id, err);
    }
  }

  // Broadcast in real-time over Socket.IO
  const broadcastPacket = {
    id: `broadcast-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: `📢 ${title}`,
    message: message,
    type: "SYSTEM",
    priority,
    timestamp: new Date().toISOString(),
    metadata: {
      broadcastBy: adminName,
      centreId: centreId || "ALL",
      centreName,
      isBroadcast: true,
      targetCount: targetFarmers.length,
    },
  };

  try {
    const io = getIO();
    if (io) {
      // 1. Send to all connected sockets
      io.emit("notification:broadcast", broadcastPacket);
      io.emit("notification:new", broadcastPacket);

      // 2. Also send to centre-specific room if targeted
      if (centreId && centreId !== "ALL") {
        io.to(`centre:${centreId}`).emit("notification:new", broadcastPacket);
      }
    }
  } catch (err) {
    console.warn("Socket broadcast error:", err);
  }

  return {
    success: true,
    message: `Broadcast successfully sent to ${targetFarmers.length} farmers!`,
    broadcast: broadcastPacket,
    farmersCount: targetFarmers.length,
    centreName,
  };
}

/**
 * Fetch recent broadcast announcements
 */
export async function getRecentBroadcasts(limit: number = 10) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        type: NotificationType.SYSTEM,
      },
      orderBy: { createdAt: "desc" },
      take: limit * 5,
    });

    // De-duplicate by title + timestamp (minute level)
    const seen = new Set<string>();
    const uniqueBroadcasts: any[] = [];

    for (const n of notifications) {
      let meta: any = n.metadata;
      if (typeof meta === "string") {
        try {
          meta = JSON.parse(meta);
        } catch {
          meta = {};
        }
      }
      if (!meta || (!meta.isBroadcast && !n.title.startsWith("📢"))) continue;

      const key = `${n.title}-${new Date(n.createdAt).toISOString().slice(0, 16)}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueBroadcasts.push({
          id: n.id,
          title: n.title,
          message: n.message,
          createdAt: n.createdAt,
          metadata: meta,
        });
        if (uniqueBroadcasts.length >= limit) break;
      }
    }

    return uniqueBroadcasts;
  } catch (err) {
    console.error("getRecentBroadcasts error:", err);
    return [];
  }
}
