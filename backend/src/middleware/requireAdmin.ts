import { Request, Response, NextFunction } from "express";
import { supabase } from "../utils/supabase";

/**
 * TODO: replace with real admin auth (role claim / admin allowlist).
 * Until then: verify Bearer token, then always reject with 403 so
 * moderation cannot run without an explicit admin gate.
 * Do not invent a role system here.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      status: "error",
      data: { message: "Authentication required" },
    });
    return;
  }

  if (!supabase) {
    res.status(503).json({
      status: "error",
      data: { message: "Auth service unavailable" },
    });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({
        status: "error",
        data: { message: "Invalid or expired token" },
      });
      return;
    }
    req.userId = user.id;
  } catch {
    res.status(401).json({
      status: "error",
      data: { message: "Token verification failed" },
    });
    return;
  }

  res.status(403).json({
    status: "error",
    data: {
      message:
        "Admin access not configured. TODO: wire real admin auth before enabling moderation.",
    },
  });
}
