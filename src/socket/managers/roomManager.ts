import { Room } from "../models/Room";
import { User } from "../models/User";
import { generateUniqueRoomId } from "../utils/generateUniqueId";
import { log } from "../utils/logger";

export class RoomManager {
  private static rooms: { [roomId: string]: Room } = {};
  public static async createRoom(): Promise<string> {
    const roomId = await generateUniqueRoomId(this.rooms);
    this.rooms[roomId] = new Room(roomId);
    log(`Room ${roomId} created`, "info");
    return roomId;
  }

  public static sanitizeRooms(): void {
    // Logic to sanitize rooms
  }

  public static getRoom(roomId: string): Room | undefined {
    return this.rooms[roomId];
  }

  public static getRoomsFlattened = () => {
    return {
      rooms: Object.values(this.rooms).map((room: Room) => {
        return {
          id: room.id,
          users: room.getUsers().map((user) => user.getClean()),
          lastActivity: room.lastActivityAt,
          createdAt: room.createdAt,
        };
      }),
    };
  };
}
