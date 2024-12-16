//createRoom: 방을 생성하고 방장을 설정합니다.
//joinRoom: 방에 플레이어를 추가하고 점수를 초기화합니다.
//leaveRoom: 방에서 플레이어를 제거하고 방이 비면 삭제합니다.
//getRoom: 특정 방 정보를 조회합니다.
//getRooms: 모든 방 정보를 반환합니다.
//printRooms: 디버깅용으로 전체 방 상태를 출력합니다.

const rooms = {}; // 방 정보를 저장하는 객체

// 방 생성
function createRoom(roomId, hostNickname) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      host: hostNickname,       // 방장 설정
      players: [hostNickname],  // 플레이어 목록에 방장 추가
      scores: { [hostNickname]: 0 }, // 점수 관리 초기화
    };
    console.log(`🆕🚪 Room created: ${roomId} by ${hostNickname}`);
    return { success: true };
  }
  return { success: false, error: "Room already exists" };
}

// 방 참가
function joinRoom(roomId, nickname) {
  if (!rooms[roomId]) {
    return { success: false, error: "Room not found" };
  }
  if (rooms[roomId].players.length >= 4) { // 최대 4명 제한
    return { success: false, error: "Room is full (4 players max)" };
  }
  if (rooms[roomId].players.includes(nickname)) {
    return { success: false, error: "Nickname already exists in this room" };
  }

  // 플레이어 추가 및 점수 초기화
  rooms[roomId].players.push(nickname);
  rooms[roomId].scores[nickname] = 0;

  console.log(`✅👤 ${nickname} joined room: ${roomId}`);
  return { success: true };
}

// 방 떠나기
function leaveRoom(roomId, nickname) {
  if (!rooms[roomId]) return;

  // 플레이어 제거
  rooms[roomId].players = rooms[roomId].players.filter((player) => player !== nickname);
  delete rooms[roomId].scores[nickname]; // 해당 플레이어 점수 제거

  // 방이 비었으면 삭제
  if (rooms[roomId].players.length === 0) {
    delete rooms[roomId];
    console.log(`🗑️ Room deleted: ${roomId}`);
  } else {
    console.log(`❌👤 ${nickname} left room: ${roomId}`);
  }
}

// 특정 방 조회
function getRoom(roomId) {
  return rooms[roomId];
}

// 모든 방 조회
function getRooms() {
  return rooms;
}

// 방 정보와 상태 출력 (디버깅용)
function printRooms() {
  console.log("🔥 Current Rooms:", JSON.stringify(rooms, null, 2));
}

module.exports = { createRoom, joinRoom, leaveRoom, getRoom, getRooms, printRooms };
