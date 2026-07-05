import { Router } from "express";
import {
  acknowledgeDisclaimer,
  acknowledgeValidators,
  mergeDisclaimerAcknowledgment,
  mergeValidators,
} from "../controllers/disclaimer.controller";
import { optionalAuth, requireAuth } from "../middleware/verifyUser";

const router = Router();

router.post(
  "/disclaimer/acknowledge",
  optionalAuth,
  acknowledgeValidators,
  acknowledgeDisclaimer,
);

router.patch(
  "/disclaimer/acknowledge/merge",
  requireAuth,
  mergeValidators,
  mergeDisclaimerAcknowledgment,
);

export default router;
