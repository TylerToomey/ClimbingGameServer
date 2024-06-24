import { Server, Socket } from "socket.io";
import { User } from "../models/User";
import { log } from "../utils/logger";
import { v4 } from "uuid";
import { ICleanUser } from "../types";
import { RoomManager } from "../managers";

interface IHandshakeCallback {
  (userId: string, users: ICleanUser[], roomId: string): void;
}

export const handleHandshake = (
  io: Server,
  socket: Socket,
  roomId: string,
  username: string,
  callback: IHandshakeCallback
): void => {
  log(
    `Client ${socket.id} (username: ${username}) is trying to join room ${roomId}`,
    "info"
  );

  log(`Creating new user ${username}`, "info");
  const room = RoomManager.instance.getRoom(roomId);
  if (!room) {
    log(`Room ${roomId} not found`, "error");
    return;
  }

  const newUser = new User(socket.id, v4(), username);
  room.addUser(newUser);

  log("Sending callback for new handshake", "info");

  // Send the user their assigned userId, the list of users in the room,
  // and confirm the roomId they're in
  callback(newUser.userId, room.getUsersClean(), roomId);
  socket.join(roomId);

  for (const user of room.users) {
    if (user.userId !== newUser.userId) {
      log(`Sending user ${newUser.username} to ${room.roomId}`, "info");
      io.to(user.socketId).emit("user_connected", {
        newUser: newUser.getClean(),
        users: room.getUsersClean(),
      });
    }
  }
  log("Handshake completed", "info");
};
