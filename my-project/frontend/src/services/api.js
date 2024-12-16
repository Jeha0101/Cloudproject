const BASE_URL = "http://localhost:5000/api"; // 백엔드 URL

// 방 생성
export async function createRoom(nickname) {
  const res = await fetch(`${BASE_URL}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ nickname }),
  });

  if (!res.ok) {
    const errorText = await res.text(); // 에러 본문 확인
    console.error("Error response:", errorText);
    throw new Error(`HTTP error! Status: ${res.status}`);
  }

  return await res.json();
}

// 방 참가
export async function joinRoom(roomId, nickname) {
  const res = await fetch(`${BASE_URL}/rooms/${roomId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error joining room:", errorText);
    throw new Error(`HTTP error! Status: ${res.status}`);
  }

  return res.json();
}

// 방 정보 조회
export async function getRoomInfo(roomId) {
  const res = await fetch(`${BASE_URL}/rooms/${roomId}`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error fetching room info:", errorText);
    throw new Error(`HTTP error! Status: ${res.status}`);
  }

  return res.json();
}

// 전체 방 목록
export async function fetchRooms() {
  const res = await fetch(`${BASE_URL}/rooms`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error fetching rooms:", errorText);
    throw new Error(`HTTP error! Status: ${res.status}`);
  }

  const data = await res.json();
  console.log("API Response:", data); // 응답 확인
  return data;
}
