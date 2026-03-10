import { Router } from "express";
import {
  analyzeMessage,
  analyzeMessageValidators,
} from "../controllers/analyze.controller";
import { optionalAuth } from "../middleware/verifyUser";

const router = Router();

// POST /api/analyze-message — auth optional; attaches userId if Bearer token present
router.post(
  "/analyze-message",
  optionalAuth,
  analyzeMessageValidators,
  analyzeMessage,
);

export default router;
