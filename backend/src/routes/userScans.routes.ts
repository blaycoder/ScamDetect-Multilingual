import { Router } from "express";
import { requireAuth } from "../middleware/verifyUser";
import { getUserScans } from "../controllers/userScans.controller";

const router = Router();

// GET /api/user/scans — requires a valid Bearer token
router.get("/user/scans", requireAuth, getUserScans);

export default router;
