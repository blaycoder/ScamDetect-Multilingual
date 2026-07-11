import { Request, Response, NextFunction } from "express";
import { supabase } from "../utils/supabase";

type AdminRole = "moderator" | "superadmin";

async function resolveAdmin(
  req: Request,
  res: Response,
): Promise<AdminRole | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      status: "error",
      data: { message: "Authentication required" },
    });
    return null;
  }

  if (!supabase) {
    res.status(503).json({
      status: "error",
      data: { message: "Auth service unavailable" },
    });
    return null;
  }

  const token = authHeader.slice(7);
  let userId: string;
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
      return null;
    }
    userId = user.id;
  } catch {
    res.status(401).json({
      status: "error",
      data: { message: "Token verification failed" },
    });
    return null;
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    res.status(403).json({
      status: "error",
      data: { message: "Forbidden" },
    });
    return null;
  }

  const role = data.role as AdminRole;
  if (role !== "moderator" && role !== "superadmin") {
    res.status(403).json({
      status: "error",
      data: { message: "Forbidden" },
    });
    return null;
  }

  req.userId = userId;
  req.adminRole = role;
  return role;
}

/**
 * Requires a valid JWT and a row in admin_users.
 * Sets req.userId and req.adminRole.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const role = await resolveAdmin(req, res);
  if (!role) return;
  next();
}

/**
 * Requires superadmin. Reuses req.adminRole when requireAdmin already ran.
 */
export async function requireSuperadmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.adminRole) {
    const role = await resolveAdmin(req, res);
    if (!role) return;
  }
  if (req.adminRole !== "superadmin") {
    res.status(403).json({
      status: "error",
      data: { message: "Forbidden" },
    });
    return;
  }
  next();
}
