import React, { useState, useEffect } from 'react';
import { createRoom, fetchRooms } from '../services/api';
import { useNavigate } from 'react-router-dom';

function LobbyPage() {
  const [nickname, setNickname] = useState('호스트닉네임');
  const [rooms, setRooms] = useState([]); // 전체 방 목록 상태 관리
  const navigate = useNavigate();

  // 방 목록 불러오기
  async function loadRooms() {
    try {
      const data = await fetchRooms();
      // 객체를 배열로 변환
      const roomsArray = Object.entries(data.rooms).map(([roomId, roomData]) => ({
        roomId,
        ...roomData,
      }));
      setRooms(roomsArray);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  }

  // 페이지 로드 시 방 목록 불러오기
  useEffect(() => {
    loadRooms();
  }, []);

  // 방 생성 핸들러
  async function handleCreateRoom() {
    try {
      const data = await createRoom(nickname);
      if (data.roomId) {
        loadRooms(); // 방 생성 후 다시 방 목록 불러오기
        navigate(`/rooms/${data.roomId}`);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
          Puzzle Challenge 로비
        </h1>

        {/* 닉네임 입력 및 방 만들기 */}
        <div className="flex items-center justify-center mb-6">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className="border border-gray-300 rounded-l-md p-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleCreateRoom}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-md transition duration-200"
          >
            방 만들기
          </button>
        </div>

        {/* 챌린지 목록 */}
        <h2 className="text-2xl font-semibold mb-4">챌린지 목록</h2>
        {rooms.length > 0 ? (
          <ul className="space-y-4">
            {rooms.map((room) => (
              <li
                key={room.roomId}
                className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md p-4 shadow-sm"
              >
                <div>
                  <p className="text-lg font-medium">
                    <span className="text-indigo-500">방 ID:</span> {room.roomId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">호스트:</span> {room.host}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/rooms/${room.roomId}`)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  참가하기
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">현재 생성된 방이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default LobbyPage;
