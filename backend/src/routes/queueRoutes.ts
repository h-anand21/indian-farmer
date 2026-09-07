import { Router } from "express";
import {
  getCentreQueue,
  getMyQueuePosition,
  postCheckIn,
  postAdvanceQueue,
} from "../controllers/queueController";

const router = Router();

// Public Live Queue Board for Mandi Centres
router.get("/centre/:centreId", getCentreQueue);

// Farmer Live Queue Position & ETA
router.get("/my-token/:bookingId", getMyQueuePosition);

// Gate Check-in
router.post("/check-in", postCheckIn);

// Advance Queue (Operator bay action & simulation)
router.post("/advance", postAdvanceQueue);

export default router;
