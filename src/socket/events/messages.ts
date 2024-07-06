import { Server, Socket } from 'socket.io';

export const handleHandshake = (
  io: Server,
  socket: Socket,
  roomId: string,
  username: string,
  userId: string,
): void => {
  socket.on('chatMessage', (message: string) => {
    io.to(roomId).emit('chatMessage', {
      username,
      message,
      from: userId,
    });
  });
};
