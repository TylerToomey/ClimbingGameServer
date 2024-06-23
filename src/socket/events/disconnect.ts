import { Server, Socket } from "socket.io";
import { RoomManager } from "../managers/";
import { log } from "../utils/logger";

export const handleDisconnect = (io: Server, socket: Socket): void => {
  log("Client Disconnected", "warn");
  const roomId = RoomManager.getRoomIdBySocket(socket.id);

  if (!roomId) {
    log(`No roomId found for socket ID ${socket.id}`, "warn");
    return;
  }

  const room = RoomManager.getRoom(roomId);
  if (!room) {
    log(`Room ${roomId} not found`, "error");
    return;
  }

  const user = room.getUsers().find((u) => u.socketId === socket.id);
  if (!user) {
    log(
      `User with socket ID ${socket.id} not found in room ${roomId}`,
      "error"
    );
    return;
  }

  io.to(roomId).emit("user_disconnected", { userId: user.userId });

  // maybe handle removing the user if they sent a direct "im leaving" message instead of just disconnecting
  // room.removeUser(user);
};
