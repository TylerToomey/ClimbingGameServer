import { Server, Socket } from "socket.io";
import { User } from "../models/User";
import { log } from "../utils/logger";
import { v4 } from "uuid";
import { ICleanUser } from "../types";
import { RoomManager } from "../managers";

interface IHandshakeCallback {
  (userId: string, users: ICleanUser[], roomId: string, socketId: string): void;
}

export const handleHandshake = (
  io: Server,
  socket: Socket,
  roomId: string,
  username: string,
  userId: string,
  callback: IHandshakeCallback
): void => {
  const returningUser = checkExistingUser(userId, socket, roomId, callback);
  if (returningUser) return;

  log(
    `Client ${socket.id} (username: ${username}) is trying to join room ${roomId}`,
    "info"
  );

  log(`Creating new user ${username}`, "info");
  const room = RoomManager.instance.getRoom(roomId);
  if (!room) {
    log(`Room ${roomId} not found`, "error");
    socket.emit("room_not_found", { roomId });
    return;
  }

  const newUser = new User(socket.id, v4(), username);
  room.addUser(newUser);

  log("Sending callback for new handshake", "info");

  // Send the user their assigned userId, the list of users in the room,
  // and confirm the roomId they're in
  callback(newUser.userId, room.getUsersClean(), roomId, "smell");
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

const checkExistingUser = (
  userId: string,
  socket: Socket,
  roomId: string,
  callback: IHandshakeCallback
): boolean => {
  if (userId) {
    const existingRoom = RoomManager.instance.getRoom(roomId);

    if (existingRoom) {
      const existingUser = existingRoom.disconnectedUsers.find(
        (u) => u.userId === userId
      );

      if (existingUser) {
        log(`User ${userId} has reconnected to room ${roomId}`, "info");
        existingUser.socketId = socket.id;
        existingRoom.addUser(existingUser);

        callback(
          existingUser.userId,
          existingRoom.getUsersClean(),
          roomId,
          socket.id
        );
        socket.join(roomId);
        return true;
      }
    }
  }
  return false;
};
