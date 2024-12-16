import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000'); // 백엔드 주소

function LobbyPage() {
  const [rooms, setRooms] = useState([]); // 방 목록 상태
  const navigate = useNavigate();

  useEffect(() => {
    // 서버로부터 'roomUpdate' 이벤트 수신
    socket.on('roomUpdate', (updatedRooms) => {
      console.log(' 방 목록 업데이트:', updatedRooms);
      setRooms(Object.entries(updatedRooms).map(([roomId, roomData]) => ({
        roomId,
        ...roomData,
      })));
    });

    //중복 소켓 연결
    if (!getSocket()) {
      initSocket(roomId, nickname);
    } else {
      console.log('🔌 Socket already connected.');
    }

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      socket.off('roomUpdate');
    };
  }, []);

  function handleJoinRoom(roomId) {
    navigate(`/rooms/${roomId}`); // 선택한 방으로 이동
  }

  return (
    <div>
      <h1>방 목록</h1>
      <ul>
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <li key={room.roomId}>
              <strong>Room ID:</strong> {room.roomId} | 
              <strong> Host:</strong> {room.host} | 
              <strong> Players:</strong> {room.players.join(', ')}
              <button onClick={() => handleJoinRoom(room.roomId)}>참가하기</button>
            </li>
          ))
        ) : (
          <p>아직 생성된 방이 없습니다.</p>
        )}
      </ul>
    </div>
  );
}

export default LobbyPage;
