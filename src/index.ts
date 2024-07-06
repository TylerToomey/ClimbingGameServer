import http from 'http';
import express from 'express';
import { RoomManager, ServerSocket } from './socket/managers';
import { log } from './socket/utils/logger';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const roomManager = new RoomManager();

const socketInstance = new ServerSocket(httpServer);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  next();
});

app.get('/', (_, res) => {
  res.send('Hello World');
});

app.post('/game/create', async (_, res) => {
  const room = await RoomManager.instance.createRoom();
  res.status(201).json({ roomId: room.roomId });
});

app.post('/game/join', (req, res) => {
  const { roomId, userId } = req.body;
  log(`User ${userId} is trying to join room ${roomId}`, 'info');
  const room = RoomManager.instance.getRoom(roomId);
  if (!room) {
    log(`Room ${roomId} not found`, 'error');
    return res.status(404).json({ message: 'Room not found' });
  }

  if (socketInstance) {
    res.status(200).json({ message: 'Joined room' });
  } else {
    res.status(500).json({ message: 'Socket instance not initialized' });
  }
});

app.get('/admin', (req, res) => {
  const socketInstance = ServerSocket.instance;
  if (socketInstance) {
    return res.status(200).json({ rooms: RoomManager.instance.rooms });
  } else {
    return res.status(500).json({ message: 'Socket instance not initialized' });
  }
});

app.get('/api/types', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'api.json'));
});

httpServer.listen(1337, () =>
  console.info('Server is running on http://localhost:1337'),
);
