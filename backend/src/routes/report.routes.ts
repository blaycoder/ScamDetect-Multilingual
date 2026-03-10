import { Router } from "express";
import {
  reportScam,
  reportScamValidators,
} from "../controllers/report.controller";

const router = Router();

// POST /api/report-scam
router.post("/report-scam", reportScamValidators, reportScam);

export default router;
