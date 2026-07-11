import { Router } from "express";
import {
  reportScam,
  reportScamValidators,
} from "../controllers/report.controller";

const router = Router();

// DEPRECATED: use POST /api/reports (community_scam_reports). Kept for backward compatibility.
router.post("/report-scam", reportScamValidators, reportScam);

export default router;
