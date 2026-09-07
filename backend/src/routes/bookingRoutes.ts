import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  getCentres,
  getCrops,
  getSlots,
  postBooking,
  getMyBookings,
  getBooking,
  deleteBooking,
} from "../controllers/bookingController";

const router = Router();

// Public informational routes (Centres, MSP crop rates, Slot availability)
router.get("/centres", getCentres);
router.get("/crops", getCrops);
router.get("/slots", getSlots);

// Booking actions
router.post("/book", authMiddleware, postBooking);
router.get("/my", authMiddleware, getMyBookings);
router.get("/:id", authMiddleware, getBooking);
router.post("/:id/cancel", authMiddleware, deleteBooking);

export default router;
