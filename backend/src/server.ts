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
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));
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
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

// ── Error Handler (must be last middleware) ──
app.use(errorHandler);

// ── HTTP Server + Socket.IO ──
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_URL,
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
  🌾 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
