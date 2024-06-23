import { Room } from "../models/Room";

export const generateUniqueRoomId = (rooms: {
  [roomId: string]: Room;
}): Promise<string> => {
  return new Promise<string>((resolve) => {
    const generate = () => {
      const roomId = _generateRandomRoomId();
      if (!rooms[roomId]) {
        clearInterval(interval);
        resolve(roomId);
      }
    };
    const interval = setInterval(generate, 0);
  });
};

const _generateRandomRoomId = (): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
};
