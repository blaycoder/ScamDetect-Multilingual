import { Router } from "express";
import { getScamDatabase } from "../controllers/database.controller";

const router = Router();

// GET /api/scam-database
router.get("/scam-database", getScamDatabase);

export default router;
