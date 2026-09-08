import { Router } from "express";
import {
  getDigiLockerAuthUrl,
  exchangeDigiLockerToken,
  verifyEKisanId,
} from "../controllers/kycController";

const router = Router();

// DigiLocker Official OAuth2 Web Portal endpoints
router.get("/digilocker/auth-url", getDigiLockerAuthUrl);
router.post("/digilocker/callback", exchangeDigiLockerToken);

// e-Kisan / PM-KISAN Registry Verification route
router.post("/ekisan/verify", verifyEKisanId);

export default router;
