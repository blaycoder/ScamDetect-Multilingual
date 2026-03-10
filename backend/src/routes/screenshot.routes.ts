import { Router } from "express";
import {
  scanScreenshot,
  scanScreenshotValidators,
} from "../controllers/screenshot.controller";
import { optionalAuth } from "../middleware/verifyUser";

const router = Router();

// POST /api/scan-screenshot — auth optional
router.post(
  "/scan-screenshot",
  optionalAuth,
  scanScreenshotValidators,
  scanScreenshot,
);

export default router;
