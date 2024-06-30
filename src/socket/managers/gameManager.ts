import { Server } from "socket.io";
import { ServerSocket } from "./serverSocket";
import { log } from "../utils/logger";
import { RoomManager } from "./roomManager";

export enum GAME_STATE {
  LOBBY = "LOBBY",
  IN_GAME = "IN_GAME",
  GAME_OVER = "GAME_OVER",
}

export class GameManager {
  public gameState: GAME_STATE;
  public roomId: string;

  private io: Server;

  constructor(roomId: string) {
    this.roomId = roomId;

    this.gameState = GAME_STATE.LOBBY;
    this.io = ServerSocket.instance.io;
  }

  public startGame(): void {
    this.gameState = GAME_STATE.IN_GAME;
    log(
      `Room ${this.roomId} has started a game with ${
        RoomManager.instance.getRoom(this?.roomId)?.users.length
      } players`,
      "info"
    );
  }

  public endGame(): void {
    this.gameState = GAME_STATE.GAME_OVER;
    this.io.to(this.roomId).emit("game_ended");
  }
}
