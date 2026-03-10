import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Middleware that checks for express-validator errors and returns
 * a 400 response if any are found.
 */
export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
}
