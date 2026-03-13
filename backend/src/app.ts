import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import analyzeRoutes from "./routes/analyze.routes";
import urlRoutes from "./routes/url.routes";
import screenshotRoutes from "./routes/screenshot.routes";
import reportRoutes from "./routes/report.routes";
import databaseRoutes from "./routes/database.routes";
import userScansRoutes from "./routes/userScans.routes";
import translationRoutes from "./routes/translation.routes";

const app = express();

// ── Security middleware ───────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Rate limiting (100 req / 15 min per IP) ───────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

// ── General middleware ────────────────────────────────────────
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Health check ──────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ScamDetect API", version: "1.0.0" });
});

// ── API Routes ────────────────────────────────────────────────
app.use("/api", analyzeRoutes);
app.use("/api", urlRoutes);
app.use("/api", screenshotRoutes);
app.use("/api", reportRoutes);
app.use("/api", databaseRoutes);
app.use("/api", userScansRoutes); // GET /api/user/scans — requires auth
app.use("/api", translationRoutes);

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
