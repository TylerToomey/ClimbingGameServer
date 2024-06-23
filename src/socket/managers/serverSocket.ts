import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { handleHandshake, handleDisconnect } from "../events/";
import { log } from "../utils/logger";
import { RoomManager } from "./roomManager";

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;

  constructor(server: HTTPServer) {
    ServerSocket.instance = this;
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cors: {
        origin: "*",
      },
    });

    this.io.on("connect", this.startListeners);
    console.info("socket.io is running on http://localhost:1337");

    // sanitize rooms every 5 minutes
    // setInterval(RoomManager.sanitizeRooms, 5 * 60 * 1000);
  }

  private startListeners = (socket: Socket) => {
    log("Client Connected", "success");

    socket.on(
      "handshake",
      (roomId: string, username: string, userId: string, callback: any) => {
        return handleHandshake(this.io, socket, roomId, username, callback);
      }
    );

    socket.on("disconnect", () => handleDisconnect(this.io, socket));
  };

  public async createRoom(): Promise<string> {
    return await RoomManager.createRoom();
  }

  public joinRoom(roomId: string, userId: string): void {
    // RoomManager.joinRoom(roomId, userId);
  }
}
