// Augment Express Request with optional authenticated user id
declare global {
  namespace Express {
    interface Request {
      /** Set by optionalAuth / requireAuth middleware when a valid Bearer token is present */
      userId?: string;
    }
  }
}

export {};
