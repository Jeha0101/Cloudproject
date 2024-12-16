import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomInfo } from '../services/api';
import io from 'socket.io-client';

function RoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [nickname, setNickname] = useState('게스트닉네임');
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getRoomInfo(roomId);
      setRoom(data);
    }
    fetchData();
  }, [roomId]);

  useEffect(() => {
    // 대기실 입장 시 소켓 연결
    const s = io('http://localhost:5000', {
      query: { roomId, nickname }
    });
    s.on('gameStart', () => {
      navigate(`/rooms/${roomId}/game`);
    });
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [roomId, nickname, navigate]);

  function handleStartGame() {
    if (socket && room && room.host === nickname) {
      socket.emit('startGame');
    }
  }

  return (
    <div className="p-4">
      <h1>대기실: {roomId}</h1>
      {room && (
        <div>
          <p>호스트: {room.host}</p>
          <p>참가자: {room.players.map(p => p.nickname).join(', ')}</p>
        </div>
      )}
      <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="닉네임" />
      <button onClick={handleStartGame}>게임 시작</button>
    </div>
  );
}

export default RoomPage;
