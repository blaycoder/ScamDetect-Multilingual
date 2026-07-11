import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validate";
import {
  checkApprovedReports,
  insertCommunityReport,
  listAdminReports,
  listPublicApprovedReports,
  normalizeReportedValue,
  updateReportStatus,
  uploadScreenshot,
  validateReportedValue,
  type CommunityReportStatus,
  type CommunityReportType,
} from "../services/communityReportService";

const REPORT_TYPES: CommunityReportType[] = [
  "phone",
  "url",
  "business_name",
  "message",
];

export const createReportValidators = [
  body("reportType")
    .isString()
    .isIn(REPORT_TYPES)
    .withMessage("reportType must be phone, url, business_name, or message"),
  body("reportedValue")
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("reportedValue must be 1–500 characters"),
  body("messageContent")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("messageContent must be at most 5000 characters"),
  body("screenshotBase64").optional().isString(),
  body("description")
    .isString()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage("description must be 20–2000 characters"),
  body("language")
    .isString()
    .trim()
    .isLength({ min: 2, max: 5 })
    .withMessage("language must be 2–5 characters"),
  body("anonId")
    .optional()
    .isString()
    .trim()
    .isUUID()
    .withMessage("anonId must be a valid UUID"),
  validateRequest,
];

export const checkReportValidators = [
  query("value")
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("value is required"),
  validateRequest,
];

export const publicListValidators = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
  validateRequest,
];

export const adminListValidators = [
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

export async function createCommunityReport(
  req: Request,
  res: Response,
): Promise<void> {
  const {
    reportType,
    reportedValue,
    messageContent,
    screenshotBase64,
    description,
    language,
    anonId,
  } = req.body as {
    reportType: CommunityReportType;
    reportedValue: string;
    messageContent?: string;
    screenshotBase64?: string;
    description: string;
    language: string;
    anonId?: string;
  };

  const userId = req.userId;
  if (!userId && !anonId) {
    res.status(400).json({
      status: "error",
      data: { message: "anonId is required for anonymous users" },
    });
    return;
  }

  const formatError = validateReportedValue(
    reportType,
    reportedValue,
    messageContent,
  );
  if (formatError) {
    res.status(400).json({
      status: "error",
      data: { message: formatError },
    });
    return;
  }

  try {
    let screenshotUrl: string | undefined;
    if (screenshotBase64) {
      screenshotUrl = await uploadScreenshot(screenshotBase64);
    }

    const content =
      reportType === "message"
        ? (messageContent ?? reportedValue).trim()
        : messageContent?.trim();

    const normalized =
      reportType === "message"
        ? normalizeReportedValue("message", content ?? reportedValue)
        : normalizeReportedValue(reportType, reportedValue);

    const id = await insertCommunityReport({
      reporterUserId: userId,
      reporterAnonId: anonId,
      reportType,
      reportedValue: normalized,
      messageContent: reportType === "message" ? content : content || undefined,
      screenshotUrl,
      description: description.trim(),
      language,
    });

    res.status(201).json({ status: "ok", data: { id } });
  } catch {
    res.status(500).json({
      status: "error",
      data: { message: "Failed to submit report" },
    });
  }
}

export async function checkCommunityReports(
  req: Request,
  res: Response,
): Promise<void> {
  const value = String(req.query.value ?? "");
  try {
    const normalized = normalizeReportedValue("lookup", value);
    const result = await checkApprovedReports(normalized);
    res.json({ status: "ok", data: result });
  } catch {
    res.status(500).json({
      status: "error",
      data: { message: "Failed to check community reports" },
    });
  }
}

export async function listPublicCommunityReports(
  req: Request,
  res: Response,
): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  try {
    const result = await listPublicApprovedReports(page, limit);
    res.json({ status: "ok", data: result });
  } catch {
    res.status(500).json({
      status: "error",
      data: { message: "Failed to list public reports" },
    });
  }
}

export async function listAdminCommunityReports(
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

export async function moderateCommunityReport(
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
