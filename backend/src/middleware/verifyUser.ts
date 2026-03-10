import { Request, Response, NextFunction } from "express";
import { supabase } from "../utils/supabase";

/**
 * Optional auth middleware.
 * If a valid Bearer token is present it attaches req.userId.
 * If the token is missing or invalid, the request continues anonymously.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ") || !supabase) {
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (!error && user) {
      req.userId = user.id;
    }
  } catch {
    // Ignore — scan proceeds anonymously
  }
  next();
}

/**
 * Required auth middleware.
 * Returns 401 if no valid Bearer token is provided.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!supabase) {
    res.status(503).json({ error: "Auth service unavailable" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    req.userId = user.id;
    next();
  } catch {
    res.status(401).json({ error: "Token verification failed" });
  }
}
