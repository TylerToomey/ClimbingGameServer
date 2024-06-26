import http from "http";
import express from "express";
import { RoomManager, ServerSocket } from "./managers";
import { log } from "./utils/logger";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const roomManager = new RoomManager();

const socketInstance = new ServerSocket(httpServer);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }
  next();
});

app.post("/game/create", async (_, res) => {
  const room = await RoomManager.instance.createRoom();
  res.status(201).json({ roomId: room.roomId });
});

app.post("/game/join", (req, res) => {
  const { roomId, userId } = req.body;
  log(`User ${userId} is trying to join room ${roomId}`, "info");
  const room = RoomManager.instance.getRoom(roomId);
  if (!room) {
    log(`Room ${roomId} not found`, "error");
    return res.status(404).json({ message: "Room not found" });
  }

  if (socketInstance) {
    res.status(200).json({ message: "Joined room" });
  } else {
    res.status(500).json({ message: "Socket instance not initialized" });
  }
});

app.get("/admin", (req, res) => {
  const socketInstance = ServerSocket.instance;
  if (socketInstance) {
    return res.status(200).json({ rooms: RoomManager.instance.rooms });
  } else {
    return res.status(500).json({ message: "Socket instance not initialized" });
  }
});

httpServer.listen(1337, () =>
  console.info("Server is running on http://localhost:1337")
);
