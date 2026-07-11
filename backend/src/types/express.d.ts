// Augment Express Request with optional authenticated user id / admin role
declare global {
  namespace Express {
    interface Request {
      /** Set by optionalAuth / requireAuth / requireAdmin when a valid Bearer token is present */
      userId?: string;
      /** Set by requireAdmin when the user is in admin_users */
      adminRole?: "moderator" | "superadmin";
    }
  }
}

export {};
