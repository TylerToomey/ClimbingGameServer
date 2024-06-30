import { Server, Socket } from "socket.io";

export const handleHandshake = (
  io: Server,
  socket: Socket,
  roomId: string,
  username: string,
  userId: string
): void => {
  socket.on("chatMessage", (message: string) => {
    // Handle the chat message here
    // You can access the roomId, username, and userId variables here
    // You can also use the io object to emit events to other sockets in the room
    io.to(roomId).emit("chatMessage", {
      username,
      message,
      from: userId,
    });
  });
};
