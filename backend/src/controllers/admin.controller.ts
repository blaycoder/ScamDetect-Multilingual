import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validate";
import { getAdminStats } from "../services/adminStatsService";
import {
  addAdmin,
  listAdmins,
  removeAdmin,
  resolveUserIdFromEmail,
  type AdminRole,
} from "../services/adminTeamService";
import {
  listAdminReports,
  updateReportStatus,
  type CommunityReportStatus,
} from "../services/communityReportService";

export function getAdminMe(req: Request, res: Response): void {
  res.json({
    status: "ok",
    data: { role: req.adminRole },
  });
}

export async function getAdminStatsHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = await getAdminStats();
    res.json({ status: "ok", data });
  } catch {
    res.status(500).json({
      status: "error",
      data: { message: "Failed to load admin stats" },
    });
  }
}

export const adminListReportValidators = [
  query("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("status must be pending, approved, or rejected"),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
  validateRequest,
];

export const moderateReportValidators = [
  param("id").isUUID().withMessage("id must be a valid UUID"),
  body("status")
    .isIn(["approved", "rejected"])
    .withMessage("status must be approved or rejected"),
  body("moderatorNotes").optional().isString().isLength({ max: 2000 }),
  validateRequest,
];

export const addAdminValidators = [
  body("userId")
    .optional()
    .isUUID()
    .withMessage("userId must be a valid UUID"),
  body("email").optional().isEmail().withMessage("email must be valid"),
  body("role")
    .isIn(["moderator", "superadmin"])
    .withMessage("role must be moderator or superadmin"),
  validateRequest,
];

export const removeAdminValidators = [
  param("userId").isUUID().withMessage("userId must be a valid UUID"),
  validateRequest,
];

export async function listAdminReportsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const status = (req.query.status as CommunityReportStatus) || "pending";
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  try {
    const result = await listAdminReports(status, page, limit);
    res.json({ status: "ok", data: result });
  } catch {
    res.status(500).json({
      status: "error",
      data: { message: "Failed to list admin reports" },
    });
  }
}

export async function moderateReportHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;
  const { status, moderatorNotes } = req.body as {
    status: "approved" | "rejected";
    moderatorNotes?: string;
  };

  try {
    const updated = await updateReportStatus(
      id,
      status,
      req.userId!,
      moderatorNotes,
    );
    if (!updated) {
      res.status(404).json({
        status: "error",
        data: { message: "Report not found" },
      });
      return;
    }
    res.json({ status: "ok", data: updated });
  } catch {
    res.status(500).json({
      status: "error",
      data: { message: "Failed to update report" },
    });
  }
}

export async function listAdminsHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = await listAdmins();
    res.json({ status: "ok", data: { items: data } });
  } catch {
    res.status(500).json({
      status: "error",
      data: { message: "Failed to list admins" },
    });
  }
}

export async function addAdminHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId, email, role } = req.body as {
    userId?: string;
    email?: string;
    role: AdminRole;
  };

  try {
    let resolvedUserId = userId;
    if (!resolvedUserId && email) {
      resolvedUserId =
        (await resolveUserIdFromEmail(email)) ?? undefined;
    }
    if (!resolvedUserId) {
      res.status(400).json({
        status: "error",
        data: { message: "userId or a resolvable email is required" },
      });
      return;
    }

    const data = await addAdmin({
      userId: resolvedUserId,
      role,
      addedBy: req.userId!,
    });
    res.status(201).json({ status: "ok", data });
  } catch (err) {
    const statusCode =
      (err as Error & { statusCode?: number }).statusCode ?? 500;
    res.status(statusCode).json({
      status: "error",
      data: {
        message:
          err instanceof Error ? err.message : "Failed to add admin",
      },
    });
  }
}

export async function removeAdminHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = req.params;
  try {
    await removeAdmin(userId, req.userId!);
    res.json({ status: "ok", data: { removed: true } });
  } catch (err) {
    const statusCode =
      (err as Error & { statusCode?: number }).statusCode ?? 500;
    res.status(statusCode).json({
      status: "error",
      data: {
        message:
          err instanceof Error ? err.message : "Failed to remove admin",
      },
    });
  }
}
