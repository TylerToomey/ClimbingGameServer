import http from "http";
import express, { Request, Response, NextFunction } from "express";
import { ServerSocket } from "./socket";
import { v4 } from "uuid";

const app = express();

const httpServer = http.createServer(app);

new ServerSocket(httpServer);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.info(
    `Request: ${req.method} ${req.url} from ${req.socket.remoteAddress}`
  );
  res.on("finish", () => {
    console.info(
      `Response: ${res.statusCode} ${res.statusMessage} for ${req.method} ${req.url}`
    );
  });
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
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

app.post("/game/create", (req: Request, res: Response) => {
  const roomId = v4();
  const socketInstance = ServerSocket.instance;

  if (socketInstance) {
    socketInstance.CreateRoom(roomId);
    console.log(`Created a room with ID: ${roomId}`);
    return res.status(201).json({ roomId });
  } else {
    return res.status(500).json({ message: "Socket instance not initialized" });
  }
});

app.post("/game/join", (req: Request, res: Response) => {
  const { roomId, username } = req.body;
  const socketInstance = ServerSocket.instance;

  if (socketInstance) {
    //socketInstance.joinRoom(roomId, userId);
    return res
      .status(200)
      .json({ message: "Joined room", roomId, username: "Gleepglorp" });
  } else {
    return res.status(500).json({ message: "Socket instance not initialized" });
  }
});

app.get("/admin", (req: Request, res: Response) => {
  const socketInstance = ServerSocket.instance;

  if (socketInstance) {
    return res.status(200).json({ rooms: socketInstance.GetRoomsFlattened() });
  } else {
    return res.status(500).json({ message: "Socket instance not initialized" });
  }
});

/** Error handling */
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error("Not found");
  res.status(404).json({
    message: error.message,
  });
});

httpServer.listen(1337, () =>
  console.info("Server is running on http://localhost:1337")
);
