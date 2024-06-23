import { Server, Socket } from "socket.io";
import { RoomManager } from "../managers/";
import { User } from "../models/User";
import { log } from "../utils/logger";
import { v4 } from "uuid";

export const handleHandshake = (
  io: Server,
  socket: Socket,
  roomId: string,
  username: string,
  callback: (
    userId: string,
    users: Pick<User, "userId" | "name">[],
    roomId: string
  ) => void
): void => {
  log(
    `Client ${socket.id} (username: ${username}) is trying to join room ${roomId}`,
    "info"
  );
  const room = RoomManager.getRoom(roomId);
  if (!room) {
    log(
      `client ${socket.id} tried to join non-existent room ${roomId}`,
      "error"
    );
    socket.emit("err_room_not_found", roomId);
    return;
  }
  log("Creating new user", "info");
  const newUser = new User(socket.id, v4(), username, room);
  room.addUser(newUser);

  log("Sending callback for new handshake", "info");
  callback(newUser.userId, room.getUsersClean(), roomId);

  room.getUsers().forEach((u) => {
    if (u.socketId !== socket.id) {
      log(`Sending user_connected to ${u.socketId}`, "info");
      io.to(u.socketId).emit(
        "user_connected",
        newUser.getClean(),
        room.getUsersClean()
      );
    }
  });
  log("Handshake completed", "info");
};
