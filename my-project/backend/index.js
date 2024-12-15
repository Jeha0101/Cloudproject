const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createRoom, joinRoom, getRoom, getRooms } = require('./rooms');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors({ origin: "http://localhost:3000" })); // 프론트엔드 URL (개발 시)
app.use(express.json());

// ======= API 엔드포인트 ======= //

// 방 생성 API
app.post('/api/rooms', (req, res) => {
  const { nickname } = req.body;
  if (!nickname) {
    return res.status(400).json({ error: "Nickname is required" });
  }

  const roomId = uuidv4();
  createRoom(roomId, nickname);
  console.log(`Room created: ${roomId} by ${nickname}`);
  res.status(201).json({ roomId });
});

// 방 참가 API
app.post('/api/rooms/:roomId/join', (req, res) => {
  const { roomId } = req.params;
  const { nickname } = req.body;

  if (!nickname) {
    return res.status(400).json({ error: "Nickname is required" });
  }

  const result = joinRoom(roomId, nickname);
  if (result.success) {
    console.log(`${nickname} joined room: ${roomId}`);
    res.json({ success: true });
  } else {
    console.error(`Failed to join room: ${result.error}`);
    res.status(400).json({ error: result.error });
  }
});

// 방 정보 조회 API
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = getRoom(roomId);
  if (!room) {
    console.error(`Room not found: ${roomId}`);
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

// 전체 방 목록 조회 API
app.get('/api/rooms', (req, res) => {
  const allRooms = getRooms();
  const roomsArray = Object.entries(allRooms).map(([roomId, roomData]) => ({
    roomId,
    ...roomData,
  }));
  res.json({ rooms: roomsArray });
});


// ======= 소켓 설정 ======= //
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // 프론트엔드 주소
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  const { roomId, nickname } = socket.handshake.query;

  if (!roomId || !nickname) {
    console.error("Connection attempt failed: Missing roomId or nickname.");
    socket.disconnect();
    return;
  }

  console.log(`${nickname} connected to room: ${roomId}`);
  socket.join(roomId);
  io.to(roomId).emit('playerJoined', { nickname });

  // 게임 시작 이벤트
  socket.on('startGame', () => {
    console.log(`Game started in room: ${roomId}`);
    io.to(roomId).emit('gameStart');
  });

  // 플레이어 이동 이벤트
  socket.on('playerMove', (data) => {
    console.log(`Player ${nickname} moved in room: ${roomId}`);
    socket.to(roomId).emit('playerMove', data);
  });

  // 연결 종료 이벤트
  socket.on('disconnect', () => {
    console.log(`${nickname} disconnected from room: ${roomId}`);
  });
});

// ======= 서버 실행 ======= //
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
