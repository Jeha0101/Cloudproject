const { joinRoom, getRoom, getRooms, createRoom } = require('./rooms');

module.exports = (io) => {
    io.on('connection', (socket) => {
    const { roomId, nickname } = socket.handshake.query;//소켓으로 이름 ID와 닉네임이 잘 들어오는것을 확인할수 있음
    // 유효하지 않은 연결 시 차단
    if (!roomId || !nickname || roomId === 'undefined' || nickname === 'undefined') {
        console.error('❌ Invalid connection attempt: Missing or invalid roomId or nickname', { roomId, nickname });
        socket.disconnect();
        return;
    }

  console.log(`✅ ${nickname} attempting to join room: ${roomId}`);
  // 방 생성 또는 참가 로직
      
        let room = getRoom(roomId);
      
        if (room) {
          if (room.players.includes(nickname)) {
            console.error(`❌ Nickname already exists in this room: ${nickname}`);
            socket.emit('error', 'Nickname already exists in this room');
            socket.disconnect();
            return;
          }
      
          room.players.push(nickname);
        } else {
          createRoom(roomId, nickname);
          console.log(`🆕🚪 Room created: ${roomId} by ${nickname}`);
        }
      
        socket.join(roomId);
        console.log(`✅ ${nickname} joined room: ${roomId}`);
      
      
    // 전체 방 상태 출력 (디버깅용)
    console.log('🔥🚪 Current Rooms:', getRooms());

    // 연결 해제 처리
    socket.on('disconnect', () => {
      console.log(`❌🚪 ${nickname} disconnected from room: ${roomId}`);

      const room = getRoom(roomId);
      if (room) {
        // 플레이어 제거
        room.players = room.players.filter((player) => player !== nickname);

        // 삭제 조건 (방이 비어있다면 삭제)
        if (room.players.length === 0) {
          delete getRooms()[roomId];
          console.log(`🗑️🚪 Room ${roomId} deleted`);
        }
      }

      // 남은 사용자에게 방 상태 업데이트
      io.to(roomId).emit('playerLeft', getRoom(roomId));
      console.log('🔥 Current Rooms:', getRooms());
    });
  });
};
