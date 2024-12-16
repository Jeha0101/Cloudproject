// express 및 Socket.IO 초기화 코드
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const apiRoutes = require('./routes/api'); // API 라우터 가져오기
const socketHandler = require('./socket'); // 소켓 핸들러 가져오기

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// API 라우터 등록
app.use('/api', apiRoutes);

// HTML 페이지 반환
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Backend Server</title>
        <script src="/socket.io/socket.io.js"></script>
        <script>
          const socket = io();
          socket.on('roomUpdate', (rooms) => {
            const roomList = document.getElementById('rooms');
            roomList.innerHTML = ''; // 기존 목록 초기화
            for (const [roomId, room] of Object.entries(rooms)) {
              const players = room.players.join(', ');
              const listItem = document.createElement('li');
              listItem.innerText = \`Room ID: \${roomId}, Host: \${room.host}, Players: [\${players}]\`;
              roomList.appendChild(listItem);
            }
          });
        </script>
      </head>
      <body>
        <h1>Backend Server Dashboard</h1>
        <h2>Active Rooms:</h2>
        <ul id="rooms"></ul>
      </body>
    </html>
  `);
});

// 서버 및 소켓 설정
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

// 소켓 핸들러 초기화
socketHandler(io);

// 방 목록을 브로드캐스트하기 위한 예시 (디버깅용)
io.on('connection', (socket) => {
  console.log('✅ A client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ A client disconnected:', socket.id);
  });

  // 테스트용 이벤트: 방 목록 업데이트
  socket.emit('roomUpdate', {}); // 초기 방 목록 전달 (빈 객체로 시작)
});

// 서버 시작
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
