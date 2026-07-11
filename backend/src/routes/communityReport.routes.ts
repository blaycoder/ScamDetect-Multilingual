import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  adminListValidators,
  checkCommunityReports,
  checkReportValidators,
  createCommunityReport,
  createReportValidators,
  listAdminCommunityReports,
  listPublicCommunityReports,
  moderateCommunityReport,
  moderateReportValidators,
  publicListValidators,
} from "../controllers/communityReport.controller";
import { optionalAuth } from "../middleware/verifyUser";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

/** Max 5 community reports per hour per anonId or IP. */
const reportSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const anonId =
      typeof req.body?.anonId === "string" ? req.body.anonId.trim() : "";
    return anonId || req.ip || "unknown";
  },
  message: {
    status: "error",
    data: { message: "Too many reports. Please try again later." },
  },
});

router.post(
  "/reports",
  optionalAuth,
  reportSubmitLimiter,
  createReportValidators,
  createCommunityReport,
);

router.get(
  "/reports/check",
  checkReportValidators,
  checkCommunityReports,
);

router.get(
  "/reports/public",
  publicListValidators,
  listPublicCommunityReports,
);

router.get(
  "/admin/reports",
  requireAdmin,
  adminListValidators,
  listAdminCommunityReports,
);

router.patch(
  "/admin/reports/:id",
  requireAdmin,
  moderateReportValidators,
  moderateCommunityReport,
);

export default router;
