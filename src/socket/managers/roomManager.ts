import { Room } from "../models";
import { log } from "../utils/logger";

export class RoomManager {
  public static instance: RoomManager;
  public rooms: { [key: string]: Room };

  constructor() {
    RoomManager.instance = this;
    this.rooms = {};
  }

  public getRoom(roomId: string): Room | null {
    if (!this.rooms[roomId]) {
      log(`Room ${roomId} does not exist`, "error");
      return null;
    }
    return this.rooms[roomId];
  }

  public async createRoom(roomId?: string): Promise<Room> {
    if (!roomId) {
      roomId = await this.generateUniqueRoomId();
    }

    const newRoom = new Room(roomId);
    this.rooms[roomId] = newRoom;
    log(`Created new empty room ${roomId}`, "success");
    return newRoom;
  }

  public removeRoom(roomId: string): void {
    if (!this.rooms[roomId]) {
      log(`Room ${roomId} does not exist`, "error");
    }
    delete this.rooms[roomId];
  }

  public getRoomBySocketId(socketId: string): Room | null {
    for (const roomId in this.rooms) {
      const room = this.rooms[roomId];
      const user = room.users.find((u) => u.socketId === socketId);
      if (user) {
        return room;
      }
    }
    return null;
  }

  public getUserBySocketId(socketId: string) {
    for (const roomId in this.rooms) {
      const user = this.rooms[roomId].users.find(
        (u) => u.socketId === socketId
      );
      if (user) {
        return user;
      }
    }
    return null;
  }

  private generateUniqueRoomId = (): Promise<string> => {
    return new Promise<string>((resolve) => {
      const generate = () => {
        const roomId = this._generateRandomRoomId();
        if (!this.rooms[roomId]) {
          clearInterval(interval);
          resolve(roomId);
        }
      };
      const interval = setInterval(generate, 0);
    });
  };

  private _generateRandomRoomId = (): string => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
  };
}
