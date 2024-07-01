import { Server, Socket } from "socket.io";
import { log } from "../utils/logger";
import { RoomManager } from "../managers";

export const handleGameEvent = (io: Server, socket: Socket): void => {
  log("Client Disconnected", "warn");
  const user = RoomManager.instance.getUserBySocketId(socket.id);
  const room = RoomManager.instance.getRoomBySocketId(socket.id);

  if (!room || !user) {
    log("User or room not found on disconnect event", "error");
    return;
  }
  room.removeUser(user);
  io.to(room.roomId).emit("user_disconnected", {
    userId: user?.userId,
    users: room.getUsersClean(),
  });
};
