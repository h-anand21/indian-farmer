import { Server, Socket } from "socket.io";

/**
 * Socket.IO Real-Time Engine
 *
 * Room Architecture:
 * - `centre:<centreId>` → All farmers watching a specific centre's queue
 * - `farmer:<farmerId>` → Private channel for individual farmer alerts
 * - `operator:<centreId>` → Operator dashboard for a centre
 * - `admin` → Admin-wide broadcast channel
 *
 * Events Emitted (Server → Client):
 * - `queue:updated` → Queue position changes, new token serving
 * - `queue:called` → Farmer's turn has been called
 * - `queue:eta-update` → ETA recalculation
 * - `booking:confirmed` → Booking confirmation
 * - `payment:status` → Payment status change
 * - `notification` → General notification
 *
 * Events Received (Client → Server):
 * - `join:centre` → Join a centre's queue room
 * - `leave:centre` → Leave a centre's queue room
 * - `join:farmer` → Join private farmer room
 */
export function initSocketServer(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // ── Room Management ──

    socket.on("join:centre", (centreId: string) => {
      socket.join(`centre:${centreId}`);
      console.log(`📡 ${socket.id} joined centre:${centreId}`);
    });

    socket.on("leave:centre", (centreId: string) => {
      socket.leave(`centre:${centreId}`);
      console.log(`📡 ${socket.id} left centre:${centreId}`);
    });

    socket.on("join:farmer", (farmerId: string) => {
      socket.join(`farmer:${farmerId}`);
      console.log(`👨‍🌾 ${socket.id} joined farmer:${farmerId}`);
    });

    socket.on("join:operator", (centreId: string) => {
      socket.join(`operator:${centreId}`);
      console.log(`👷 ${socket.id} joined operator:${centreId}`);
    });

    socket.on("join:admin", () => {
      socket.join("admin");
      console.log(`🛡️ ${socket.id} joined admin room`);
    });

    // ── Heartbeat ──

    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() });
    });

    // ── Disconnect ──

    socket.on("disconnect", (reason: string) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log("⚡ Socket.IO server initialized");
}

/**
 * Utility: Broadcast queue update to all clients in a centre room
 */
export function broadcastQueueUpdate(
  io: Server,
  centreId: string,
  data: {
    nowServing: string;
    nextToken: string;
    totalWaiting: number;
    completedToday: number;
  }
): void {
  io.to(`centre:${centreId}`).emit("queue:updated", {
    centreId,
    ...data,
    timestamp: Date.now(),
  });
}

/**
 * Utility: Send turn-call alert to a specific farmer
 */
export function sendTurnCallAlert(
  io: Server,
  farmerId: string,
  data: {
    token: string;
    counterNumber: number;
    centreName: string;
  }
): void {
  io.to(`farmer:${farmerId}`).emit("queue:called", {
    ...data,
    timestamp: Date.now(),
  });
}

/**
 * Utility: Broadcast ETA updates to all clients in a centre
 */
export function broadcastETAUpdate(
  io: Server,
  centreId: string,
  etaData: Record<string, number> // token -> estimated minutes
): void {
  io.to(`centre:${centreId}`).emit("queue:eta-update", {
    centreId,
    etas: etaData,
    timestamp: Date.now(),
  });
}

/**
 * Utility: Send proximity alert to a specific farmer when turn is near (<= 3 tokens ahead)
 */
export function sendProximityAlert(
  io: Server,
  farmerId: string,
  data: {
    token: string;
    tokensAhead: number;
    estimatedMinutes: number;
    centreName: string;
  }
): void {
  io.to(`farmer:${farmerId}`).emit("queue:proximity_alert", {
    ...data,
    timestamp: Date.now(),
  });
}

