import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listCentres,
  listMasterCrops,
  getSlotsForCentreAndDate,
  createBooking,
  getFarmerBookings,
  getBookingById,
  cancelBooking,
} from "../services/bookingService";

const createBookingSchema = z.object({
  centreId: z.string().min(1, "Centre is required"),
  slotId: z.string().min(1, "Slot is required"),
  cropName: z.string().min(1, "Crop name is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  vehicleType: z.string().default("Tractor Trolley"),
  vehicleNumber: z.string().min(4, "Valid vehicle registration required"),
  driverPhone: z.string().optional(),
});

export async function getCentres(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { state, district } = req.query;
    const centres = await listCentres({
      state: state as string | undefined,
      district: district as string | undefined,
    });
    res.json({ success: true, data: centres });
  } catch (error) {
    next(error);
  }
}

export async function getCrops(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const crops = listMasterCrops();
    res.json({ success: true, data: crops });
  } catch (error) {
    next(error);
  }
}

export async function getSlots(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { centreId, date } = req.query;
    if (!centreId || !date) {
      res.status(400).json({
        success: false,
        error: "Missing required query parameters: centreId and date (YYYY-MM-DD)",
      });
      return;
    }

    const slots = await getSlotsForCentreAndDate(
      centreId as string,
      date as string
    );
    res.json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
}

export async function postBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createBookingSchema.parse(req.body);
    const firebaseUid = req.user!.uid;

    const booking = await createBooking(firebaseUid, data);
    res.status(201).json({
      success: true,
      message: "Procurement slot booked successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyBookings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const firebaseUid = req.user!.uid;
    const bookings = await getFarmerBookings(firebaseUid);
    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
}

export async function getBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const firebaseUid = req.user!.uid;
    const booking = await getBookingById(id, firebaseUid);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

export async function deleteBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const firebaseUid = req.user!.uid;
    const cancelled = await cancelBooking(id, firebaseUid);
    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: cancelled,
    });
  } catch (error) {
    next(error);
  }
}
