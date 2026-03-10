import { Router } from "express";
import { checkUrl, checkUrlValidators } from "../controllers/url.controller";
import { optionalAuth } from "../middleware/verifyUser";

const router = Router();

// POST /api/check-url — auth optional
router.post("/check-url", optionalAuth, checkUrlValidators, checkUrl);

export default router;
