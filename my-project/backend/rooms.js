const rooms = {}; // 방 정보를 저장할 객체

// 방 생성
function createRoom(roomId, hostNickname) {
  rooms[roomId] = { host: hostNickname, players: [hostNickname] };
}

// 방 참가
function joinRoom(roomId, nickname) {
  if (!rooms[roomId]) return { success: false, error: "Room not found" };
  if (rooms[roomId].players.includes(nickname)) return { success: false, error: "Nickname already exists" };
  rooms[roomId].players.push(nickname);
  return { success: true };
}

// 특정 방 조회
function getRoom(roomId) {
  return rooms[roomId];
}

// 모든 방 조회
function getRooms() {
  return rooms; // 모든 방을 반환
}

module.exports = { createRoom, joinRoom, getRoom, getRooms };
