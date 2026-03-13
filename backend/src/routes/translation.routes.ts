import { Router } from "express";
import {
  translateUi,
  translateUiValidators,
} from "../controllers/translation.controller";

const router = Router();

// POST /api/translate-ui
router.post("/translate-ui", translateUiValidators, translateUi);

export default router;
