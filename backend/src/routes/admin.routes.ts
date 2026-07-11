import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  addAdminHandler,
  addAdminValidators,
  adminListReportValidators,
  getAdminMe,
  getAdminStatsHandler,
  listAdminReportsHandler,
  listAdminsHandler,
  moderateReportHandler,
  moderateReportValidators,
  removeAdminHandler,
  removeAdminValidators,
} from "../controllers/admin.controller";
import {
  requireAdmin,
  requireSuperadmin,
} from "../middleware/requireAdmin";

const adminRouter = Router();

/** Stricter IP limit for all admin API traffic. */
const adminProbeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    data: { message: "Too many admin requests. Please try again later." },
  },
});

/** Burn budget on failed /me probes (401/403). */
const adminMeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    status: "error",
    data: { message: "Too many admin probe attempts. Please try again later." },
  },
});

adminRouter.use(adminProbeLimiter);

// /me: rate-limit before auth so failed probes consume budget
adminRouter.get("/me", adminMeLimiter, requireAdmin, getAdminMe);

// All remaining /api/admin/* routes require admin
adminRouter.use(requireAdmin);

adminRouter.get("/stats", getAdminStatsHandler);

adminRouter.get(
  "/reports",
  adminListReportValidators,
  listAdminReportsHandler,
);
adminRouter.patch(
  "/reports/:id",
  moderateReportValidators,
  moderateReportHandler,
);

adminRouter.get("/admins", requireSuperadmin, listAdminsHandler);
adminRouter.post(
  "/admins",
  requireSuperadmin,
  addAdminValidators,
  addAdminHandler,
);
adminRouter.delete(
  "/admins/:userId",
  requireSuperadmin,
  removeAdminValidators,
  removeAdminHandler,
);

export default adminRouter;
