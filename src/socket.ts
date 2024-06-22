import { Server as HTTPServer } from "http";
import { Socket, Server } from "socket.io";
import { User, Room } from "./classes";
import { v4 } from "uuid";
import { DateTime as dt } from "luxon";
import chalk from "chalk";

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;

  public rooms: { [roomId: string]: Room };

  // Aggregate list of all users in all rooms to better manage disconnects
  private socketRoomMap: { [socketId: string]: string };

  constructor(server: HTTPServer) {
    ServerSocket.instance = this;
    this.rooms = {};
    this.socketRoomMap = {};
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cors: {
        origin: "*",
      },
    });
    this.io.on("connect", this.StartListeners);
    console.info("socket.io is running on http://localhost:1337");

    // timer to sanitize rooms every 5 minutes
    setInterval(this.SanitizeRooms, 5 * 60 * 1000);
  }

  StartListeners = (socket: Socket) => {
    log(chalk.bold("Client Connected"), "success");

    socket.on(
      "handshake",
      (
        roomId: string,
        username: string,
        callback: (uid: string, users: User[], roomId: string) => void
      ) => {
        log("Handshake request received", "info");
        let room = this.rooms[roomId];
        if (!room) {
          log(
            `client ${socket.id} tried to join non-existent room ${roomId}`,
            "error"
          );
          this.io.to(socket.id).emit("err_room_not_found", roomId);
          return;
        }

        let newUser = new User(socket.id, v4(), username, room);
        room.addUser(newUser);
        this.socketRoomMap[socket.id] = roomId;

        const userSockets = room.getUsers();

        log("Sending callback for new handshake", "info");
        callback(newUser.userId, userSockets, roomId);

        this.SendMessageToRoom("user_connected", roomId, {
          users: room.getUsers(),
          new_user: newUser.getClean(),
        });
      }
    );

    socket.on("disconnect", () => {
      log("Client Disconnected", "warn");
      const roomId = this.socketRoomMap[socket.id];

      if (!roomId) {
        log(`No roomId found for socket ID ${socket.id}`, "warn");
        return;
      }

      const room = this.rooms[roomId];
      if (!room) {
        log(`Room ${roomId} not found`, "error");
        return;
      }

      const user = room.getUsers().find((u) => u.socketId === socket.id);
      if (!user) {
        log(
          `User with socket ID ${socket.id} not found in room ${roomId}`,
          "error"
        );
        return;
      }

      this.SendMessageToRoom("user_disconnected", roomId, {
        userId: user.userId,
      });

      room.removeUser(user);
      delete this.socketRoomMap[socket.id];
    });
  };

  // async to handle house-keeping tasks in the future
  CreateRoom = async (roomId: string) => {
    return new Promise<void>((resolve) => {
      if (!this.rooms[roomId]) {
        this.rooms[roomId] = new Room(roomId);
        log(`Room ${roomId} created`, "info");
        resolve();
      } else {
        log(`Room ${roomId} already exists`, "warn");
        resolve();
      }
    });
  };

  SanitizeRooms = () => {
    const now = dt.now();
    const fiveMinutes = now.minus({ minutes: 5 });
    const threeHours = now.minus({ hours: 3 });

    Object.keys(this.rooms).forEach((roomId) => {
      const room = this.rooms[roomId];
      const lastActivityAt = dt.fromISO(room.lastActivityAt);
      const createdAt = dt.fromISO(room.createdAt);

      if (
        lastActivityAt.diffNow("minutes").minutes > 5 ||
        createdAt.diffNow("hours").hours > 3
      ) {
        log(`Closing room ${roomId} due to inactivity or age`, "info");
        this.rooms[roomId].getUsers().forEach((user) => {
          this.io.to(user.socketId).emit("room_closed");
        });
        delete this.rooms[roomId];
      }
    });
  };

  SendMessageToUser = (
    name: string,
    roomId: string,
    userId: string,
    payload?: Object
  ) => {
    log(`Sending message ${name} to user ${userId} in room ${roomId}`, "info");
    const room = this.rooms[roomId];
    const user = room?.getUsers().find((u) => u.userId === userId);
    if (user) {
      this.io.to(user.socketId).emit(name, payload);
    } else {
      log(`User ${userId} not found in room ${roomId}`, "error");
    }
  };

  SendMessageToAllUsers = (message: string) => {
    log(`Sending message to all users in all rooms`, "info");
    for (const socketId in this.socketRoomMap) {
      this.io.to(socketId).emit("global_message", message);
    }
  };

  SendMessageToRoom = (name: string, roomId: string, payload?: Object) => {
    log(`Sending message ${name} to all users in room ${roomId}`, "info");
    const room = this.rooms[roomId];
    const users = room?.getUsers();
    if (users) {
      users.forEach((user) => {
        const socketId = user?.socketId;
        if (socketId) {
          payload
            ? this.io.to(socketId).emit(name, payload)
            : this.io.to(socketId).emit(name);
        }
      });
    } else {
      log(
        `Room ${roomId} not found when trying to send message ${name}`,
        "error"
      );
    }
  };

  GetRooms = () => {
    return Object.values(this.rooms);
  };

  GetRoomsFlattened = () => {
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

type TLogLevel = "info" | "warn" | "error" | "success" | "debug";
const log = (message: string, level: TLogLevel = "info") => {
  const colors = {
    info: "blue",
    warn: "yellow",
    error: "red",
    success: "green",
    debug: "gray",
  };
  const svMsg = chalk.bold("[ SERVER ]: ") + message;
  switch (level) {
    case "info":
      console.info(chalk.blue(svMsg));
      break;
    case "warn":
      console.warn(chalk.yellow(svMsg));
      break;
    case "error":
      console.error(chalk.bold.red("ERROR! ") + chalk.red(svMsg));
      break;
    case "success":
      console.info(chalk.green(svMsg));
      break;
    case "debug":
      console.info(chalk.gray(svMsg));
      break;
    default:
      console.info(chalk.blue(svMsg));
      break;
  }
};
