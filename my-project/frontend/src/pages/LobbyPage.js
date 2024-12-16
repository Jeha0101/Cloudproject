import React, { useState, useEffect, useRef } from 'react';
import { createRoom } from '../services/api';
import { useNavigate } from 'react-router-dom';

function LobbyPage() {
  const [nickname, setNickname] = useState('호스트닉네임');
  const [rooms, setRooms] = useState([]); // 배열로 초기화
  const navigate = useNavigate();
  const intervalRef = useRef(null); // interval을 ref로 관리

  // MySQL의 방 목록 불러오기
  const loadRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      console.log('서버에서 받은 방 목록:', data); // 데이터 확인용
      
      if (Array.isArray(data)) {
        // 방 목록을 상태에 저장
        setRooms(data);
        console.log('방 목록이 성공적으로 로드됨:', data.length, '개의 방');
      } else {
        console.error('서버에서 받은 데이터가 배열이 아님:', data);
        setRooms([]);
      }
    } catch (error) {
      console.error('방 목록 로드 실패:', error);
      setRooms([]);
    }
  };

  // 5초마다 방 목록 새로고침
  useEffect(() => {
    loadRooms();
    //const interval = setInterval(loadRooms, 5000); // 5초마다 새로고침
    //intervalRef.current = setInterval(loadRooms, 5000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 방 생성 핸들러
  async function handleCreateRoom() {
    try {
      const data = await createRoom(nickname);
      if (data.roomId) {
        loadRooms(); // 방 생성 후 목록 새로고침
        navigate(`/rooms/${data.roomId}`);
      }
    } catch (error) {
      console.error('방 생성 실패:', error);
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

        {/* 방 목록 표시 */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">챌린지 목록</h2>
          {rooms && rooms.length > 0 ? (
            <ul className="space-y-4">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-lg font-medium">
                      <span className="text-indigo-500">방 ID:</span> {room.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">호스트:</span> {room.host}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">참가자:</span> {room.players.join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200"
                  >
                    참가하기
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center p-4 bg-gray-50 rounded-md">
              현재 생성된 방이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LobbyPage;