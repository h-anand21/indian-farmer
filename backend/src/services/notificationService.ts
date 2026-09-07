import prisma from "../config/database";
import { getSocketIO } from "../socket/socketServer";

export interface SMSPayload {
  to: string; // Farmer Phone Number e.g. "+919876543210"
  message: string;
  type: "SLOT_BOOKED" | "PROXIMITY_ALERT" | "TURN_CALLED" | "PAYMENT_PAID";
  bookingId?: string;
}

/**
 * Sends a real-time Multi-Channel SMS & Push Alert to the Farmer
 */
export async function sendSMSNotification(payload: SMSPayload) {
  const { to, message, type, bookingId } = payload;

  console.log(`[SMS GATEWAY MOCK] Sending ${type} SMS to ${to}: "${message}"`);

  // 1. Save Notification to Database if user exists
  let savedNotification = null;
  try {
    const farmer = await prisma.farmer.findFirst({
      where: { phone: to.replace("+91", "").trim() },
      include: { user: true },
    });

    if (farmer) {
      savedNotification = await prisma.notification.create({
        data: {
          userId: farmer.userId,
          title: getNotificationTitle(type),
          body: message,
          type: type === "PAYMENT_PAID" ? "PAYMENT" : type === "PROXIMITY_ALERT" || type === "TURN_CALLED" ? "QUEUE_CALL" : "SLOT_BOOKED",
          read: false,
        },
      });

      // Broadcast via Socket.IO if connected
      const io = getSocketIO();
      if (io) {
        io.to(`farmer:${farmer.userId}`).emit("notification:new", savedNotification);
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
      farmer: true,
      centre: true,
      crop: true,
    },
  });

  if (!booking) return null;

  const phone = booking.farmer.phone;
  const msg = `KisanQueue: Dear ${booking.farmer.name}, your procurement slot for ${booking.crop.name} (${booking.quantityQuintals} Qtl) at ${booking.centre.name} on ${new Date(booking.bookingDate).toLocaleDateString("en-IN")} is CONFIRMED. Token: ${booking.tokenNumber}. Show QR code at Mandi Gate.`;

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
      farmer: true,
      centre: true,
    },
  });

  if (!booking) return null;

  const phone = booking.farmer.phone;
  const msg = `URGENT KisanQueue Alert: Dear ${booking.farmer.name}, only ${tokensAhead} vehicles ahead of you at ${booking.centre.name}. Token: ${booking.tokenNumber}. Please head to Mandi Weighbridge Gate immediately.`;

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
      farmer: true,
      crop: true,
    },
  });

  if (!booking) return null;

  const phone = booking.farmer.phone;
  const msg = `KisanQueue Payment: ₹${amount.toLocaleString("en-IN")} credited directly to your Bank A/c for ${booking.crop.name} procurement via Govt DBT. Bank UTR: ${utrNumber}. Thank you, Farmers First!`;

  return sendSMSNotification({
    to: phone,
    message: msg,
    type: "PAYMENT_PAID",
    bookingId,
  });
}

/**
 * Get all notifications for a specific user
 */
export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
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
