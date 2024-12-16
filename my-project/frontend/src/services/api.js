const BASE_URL = 'http://localhost:5000/api'; // 백엔드 URL

// 방 생성
export async function createRoom(nickname) {
  const res = await fetch(`${BASE_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname }),
  });
  return res.json();
}

// 방 참가
export async function joinRoom(roomId, nickname) {
  const res = await fetch(`${BASE_URL}/rooms/${roomId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname }),
  });
  return res.json();
}

// 방 정보 조회
export async function getRoomInfo(roomId) {
  const res = await fetch(`${BASE_URL}/rooms/${roomId}`);
  return res.json();
}

//전체 방 목록
export async function fetchRooms() {
  try {
    const res = await fetch(`${BASE_URL}/rooms`);
    if (!res.ok) {
      throw new Error(`Failed to fetch rooms: ${res.status}`);
    }
    const data = await res.json();
    console.log('API Response:', data); // 응답 확인
    return data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
}
