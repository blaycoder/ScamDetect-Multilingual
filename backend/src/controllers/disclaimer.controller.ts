import { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validate";
import {
  insertAcknowledgment,
  mergeAnonToUser,
} from "../services/disclaimerService";

function resolveClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip ?? "unknown";
}

export const acknowledgeValidators = [
  body("language")
    .isString()
    .trim()
    .isLength({ min: 2, max: 5 })
    .withMessage("language must be 2–5 characters"),
  body("disclaimerVersion")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("disclaimerVersion is required"),
  body("anonId")
    .optional()
    .isString()
    .trim()
    .isUUID()
    .withMessage("anonId must be a valid UUID"),
  validateRequest,
];

export const mergeValidators = [
  body("anonId")
    .isString()
    .trim()
    .isUUID()
    .withMessage("anonId must be a valid UUID"),
  validateRequest,
];

export async function acknowledgeDisclaimer(
  req: Request,
  res: Response,
): Promise<void> {
  const { language, disclaimerVersion, anonId } = req.body as {
    language: string;
    disclaimerVersion: string;
    anonId?: string;
  };

  const userId = req.userId;
  const resolvedAnonId = userId ? (anonId ?? undefined) : anonId;

  if (!userId && !resolvedAnonId) {
    res.status(400).json({
      status: "error",
      data: { message: "anonId is required for anonymous users" },
    });
    return;
  }

  try {
    const id = await insertAcknowledgment({
      userId,
      anonId: resolvedAnonId,
      ipAddress: resolveClientIp(req),
      userAgent: req.headers["user-agent"] ?? "unknown",
      language,
      disclaimerVersion,
    });

    res.status(201).json({ status: "ok", data: { id } });
  } catch {
    res.status(500).json({
      status: "error",
      data: { message: "Failed to record disclaimer acknowledgment" },
    });
  }
}

export async function mergeDisclaimerAcknowledgment(
  req: Request,
  res: Response,
): Promise<void> {
  const { anonId } = req.body as { anonId: string };
  const userId = req.userId!;

  try {
    const updatedCount = await mergeAnonToUser(anonId, userId);
    res.json({
      status: "ok",
      data: { merged: updatedCount > 0 },
    });
  } catch {
    res.status(500).json({
      status: "error",
      data: { message: "Failed to merge disclaimer acknowledgment" },
    });
  }
}
