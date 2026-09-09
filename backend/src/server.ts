import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { initSocketServer } from "./socket/socketServer";

// ── Express App ──
const app = express();

// ── Security & Parsing ──
const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

const isOriginAllowed = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  if (!origin) return callback(null, true);
  if (
    allowedOrigins.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1")
  ) {
    return callback(null, true);
  }
  return callback(null, true);
};

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: isOriginAllowed,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logging ──
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Health Check ──
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "KisanQueue API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ── API Routes ──
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import queueRoutes from "./routes/queueRoutes";
import operatorRoutes from "./routes/operatorRoutes";
import procurementRoutes from "./routes/procurementRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import farmerRoutes from "./routes/farmerRoutes";
import adminRoutes from "./routes/adminRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import govtContentRoutes from "./routes/govtContentRoutes";
import govtSyncRoutes from "./routes/govtSyncRoutes";
import geoRoutes from "./routes/geoRoutes";
import kycRoutes from "./routes/kycRoutes";
import { startSyncWorker } from "./workers/syncWorker";

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/operator", operatorRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/govt-content", govtContentRoutes);
app.use("/api/govt-sync", govtSyncRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/kyc", kycRoutes);

// ── Error Handler (must be last middleware) ──
app.use(errorHandler);

// ── HTTP Server + Socket.IO ──
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: isOriginAllowed,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialize Socket.IO rooms & event handlers
initSocketServer(io);

// Export io instance for use in controllers
export { io };

// ── Start Server ──
server.listen(env.PORT, () => {
  console.log(`
  🌾 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌾  KisanQueue API Server
  🌾  Port:        ${env.PORT}
  🌾  Environment: ${env.NODE_ENV}
  🌾  Frontend:    ${env.FRONTEND_URL}
  🌾  Socket.IO:   Ready ⚡
  🌾  Sync Worker: Starting 🔄
  🌾 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  // Boot the government data sync worker
  startSyncWorker();
});

export default app;
