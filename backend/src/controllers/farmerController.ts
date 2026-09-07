import { Request, Response } from "express";
import prisma from "../config/database";

/**
 * Get comprehensive farmer profile and dashboard data
 */
export async function getFarmerDashboard(req: Request, res: Response): Promise<void> {
  try {
    const farmerId = req.params.farmerId as string;

    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        user: true,
        preferredCentre: true,
        crops: true,
        bookings: {
          include: {
            centre: true,
            crop: true,
            slot: true,
            queueEntry: true,
            procurement: true,
            payment: true,
          },
          orderBy: { bookedAt: "desc" },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!farmer) {
      res.status(404).json({ success: false, error: "Farmer not found" });
      return;
    }

    // Segregate upcoming vs completed vs cancelled bookings
    const upcomingBookings = farmer.bookings.filter((b) =>
      ["BOOKED", "CHECKED_IN", "WAITING", "CALLED", "IN_PROCUREMENT", "WEIGHED"].includes(b.status)
    );
    const completedBookings = farmer.bookings.filter((b) =>
      ["COMPLETED", "PAID", "PAYMENT_PENDING"].includes(b.status)
    );
    const cancelledBookings = farmer.bookings.filter((b) =>
      ["CANCELLED", "REJECTED", "NO_SHOW"].includes(b.status)
    );

    // Compute total earnings and total quintals sold
    const totalEarnings = farmer.bookings
      .filter((b) => b.procurement?.totalAmount)
      .reduce((sum, b) => sum + (b.procurement?.totalAmount || 0), 0);

    const totalQuintalsSold = farmer.bookings
      .filter((b) => b.procurement?.actualWeight)
      .reduce((sum, b) => sum + (b.procurement?.actualWeight || 0), 0);

    res.json({
      success: true,
      data: {
        farmer: {
          id: farmer.id,
          userId: farmer.userId,
          name: farmer.user.name,
          phone: farmer.user.phone,
          email: farmer.user.email,
          farmerId: farmer.farmerId || "PMK-984210",
          village: farmer.village || "Ludhiana Rural",
          district: farmer.district || "Ludhiana",
          state: farmer.state || "Punjab",
          landArea: farmer.landArea || 5.0,
          ownershipType: farmer.ownershipType || "Owner",
          preferredCentre: farmer.preferredCentre,
          crops: farmer.crops,
        },
        stats: {
          totalBookings: farmer.bookings.length,
          activeBookings: upcomingBookings.length,
          completedBookings: completedBookings.length,
          totalQuintalsSold: Math.round(totalQuintalsSold * 10) / 10,
          totalEarnings: Math.round(totalEarnings),
        },
        upcomingBookings,
        completedBookings,
        cancelledBookings,
        recentPayments: farmer.payments,
        recentNotifications: farmer.notifications,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Update Farmer Profile
 */
export async function updateFarmerProfile(req: Request, res: Response): Promise<void> {
  try {
    const farmerId = req.params.farmerId as string;
    const { name, phone, village, district, state, landArea, ownershipType, preferredCentreId } = req.body;

    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: { user: true },
    });

    if (!farmer) {
      res.status(404).json({ success: false, error: "Farmer not found" });
      return;
    }

    // Update user and farmer tables in transaction
    const [updatedUser, updatedFarmer] = await prisma.$transaction([
      prisma.user.update({
        where: { id: farmer.userId },
        data: {
          name: name || farmer.user.name,
          phone: phone || farmer.user.phone,
        },
      }),
      prisma.farmer.update({
        where: { id: farmerId },
        data: {
          village: village !== undefined ? village : farmer.village,
          district: district !== undefined ? district : farmer.district,
          state: state !== undefined ? state : farmer.state,
          landArea: landArea !== undefined ? Number(landArea) : farmer.landArea,
          ownershipType: ownershipType !== undefined ? ownershipType : farmer.ownershipType,
          preferredCentreId: preferredCentreId !== undefined ? preferredCentreId : farmer.preferredCentreId,
        },
        include: {
          user: true,
          preferredCentre: true,
        },
      }),
    ]);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        ...updatedFarmer,
        user: updatedUser,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}

/**
 * Get all procurements for a farmer with step timeline
 */
export async function getFarmerProcurements(req: Request, res: Response): Promise<void> {
  try {
    const farmerId = req.params.farmerId as string;

    const bookings = await prisma.booking.findMany({
      where: { farmerId },
      include: {
        centre: true,
        crop: true,
        slot: true,
        queueEntry: true,
        procurement: true,
        payment: true,
      },
      orderBy: { bookedAt: "desc" },
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
