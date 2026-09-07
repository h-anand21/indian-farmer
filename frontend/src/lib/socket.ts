import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./constants";

/**
 * Socket.IO Client Singleton
 * Maintains a single WebSocket connection to the backend.
 * Auto-reconnects on disconnect. Lazy initialization.
 *
 * Usage:
 *   import { getSocket } from "@/lib/socket";
 *   const socket = getSocket();
 *   socket.emit("join:centre", centreId);
 *   socket.on("queue:updated", (data) => { ... });
 */

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"], // Prefer WebSocket, fallback to polling
    });

    socket.on("connect", () => {
      console.log("⚡ Socket.IO connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket.IO disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error.message);
    });
  }

  return socket;
}

/**
 * Disconnect and clean up the socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Join a procurement centre's queue room
 */
export function joinCentreRoom(centreId: string): void {
  getSocket().emit("join:centre", centreId);
}

/**
 * Leave a procurement centre's queue room
 */
export function leaveCentreRoom(centreId: string): void {
  getSocket().emit("leave:centre", centreId);
}

/**
 * Join private farmer notification channel
 */
export function joinFarmerRoom(farmerId: string): void {
  getSocket().emit("join:farmer", farmerId);
}

/**
 * Join operator dashboard channel
 */
export function joinOperatorRoom(centreId: string): void {
  getSocket().emit("join:operator", centreId);
}

/**
 * Join admin broadcast channel
 */
export function joinAdminRoom(): void {
  getSocket().emit("join:admin");
}
