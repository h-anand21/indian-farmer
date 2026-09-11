import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./constants";

/**
 * Socket.IO Client Singleton for KisanQueue Mobile App
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
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("⚡ Mobile Socket.IO connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Mobile Socket.IO disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Mobile Socket.IO error:", error.message);
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinCentreRoom(centreId: string): void {
  getSocket().emit("join:centre", centreId);
}

export function leaveCentreRoom(centreId: string): void {
  getSocket().emit("leave:centre", centreId);
}

export function joinFarmerRoom(farmerId: string): void {
  getSocket().emit("join:farmer", farmerId);
}

export function joinOperatorRoom(centreId: string): void {
  getSocket().emit("join:operator", centreId);
}

export function joinAdminRoom(): void {
  getSocket().emit("join:admin");
}
