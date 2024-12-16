import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomInfo } from "../services/api";
import io from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [nickname, setNickname] = useState(""); // 닉네임 상태
  const [participants, setParticipants] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [socket, setSocket] = useState(null);

  const isHost = localStorage.getItem("hostToken") === roomId; // 호스트 여부 확인

  // 방 정보를 로드하는 useEffect
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getRoomInfo(roomId);
        setRoom(data);
        setParticipants(data.players || []);

        // 호스트인 경우 닉네임 자동 설정
        if (isHost) {
          setNickname(data.host);
        }
      } catch (error) {
        console.error("Failed to fetch room info:", error);
        setErrorMessage("방이 삭제되었습니다.");
        navigate("/lobby"); // 로비로 리다이렉트
      }
    }
    fetchData();
  }, [roomId, isHost, navigate]);

  // 소켓 초기화 및 이벤트 처리
  useEffect(() => {
    const s = io(SOCKET_URL, { query: { roomId } });

    s.on("connect", () => {
      console.log("Connected to socket server.");
    });

    s.on("playerJoined", (data) => {
      console.log("Player joined:", data);
      setParticipants((prev) => [...prev, data]);
    });

    s.on("playerLeft", (data) => {
      console.log("Player left:", data);
      setParticipants((prev) =>
        prev.filter((p) => p.nickname !== data.nickname)
      );
    });

    s.on("errorMessage", (msg) => {
      console.error("Socket error:", msg);
      setErrorMessage(msg);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [roomId]);

  // 디버깅용 useEffect
  useEffect(() => {
    console.log("Room state updated:", room);
  }, [room]);

  useEffect(() => {
    console.log("Participants updated:", participants);
  }, [participants]);

  function handleAddParticipant() {
    if (!nickname.trim()) {
      setErrorMessage("닉네임을 입력하세요.");
      return;
    }

    if (participants.find((p) => p.nickname === nickname)) {
      setErrorMessage("이미 사용 중인 닉네임입니다.");
      return;
    }

    if (participants.length >= 4) {
      setErrorMessage("참가자 수가 초과되었습니다.");
      return;
    }

    if (!socket) {
      console.error("Socket is not connected");
      setErrorMessage("소켓 연결이 끊어졌습니다.");
      return;
    }

    console.log("Emitting addParticipant event...", { nickname, roomId });
    socket.emit("addParticipant", { nickname, roomId }, (response) => {
      console.log("addParticipant response:", response);
      if (response.success) {
        setErrorMessage("");
        console.log(`${nickname} 참가 성공`);
      } else {
        console.error("Failed to add participant:", response.error);
        setErrorMessage(response.error || "참가 중 오류가 발생했습니다.");
      }
    });
  }

  function handleStartGame() {
    if (isHost) {
      navigate(`/game/${roomId}`);
    }
  }

  return (
    <div className='min-h-screen p-6 bg-gray-100'>
      <div className='max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-md'>
        {/* 나가기 버튼 */}
        <button
          onClick={() => navigate("/lobby")}
          className='px-4 py-2 mb-4 text-white bg-indigo-600 rounded-md hover:bg-indigo-700'
        >
          나가기
        </button>

        <h1 className='mb-6 text-3xl font-bold text-center text-indigo-600'>
          대기실: {roomId}
        </h1>

        {room ? (
          <div className='mb-6 space-y-4'>
            <div>
              <p className='text-lg font-medium'>
                <span className='text-indigo-500'>호스트:</span> {room.host}
              </p>
            </div>
            <div>
              <p className='text-lg font-medium'>
                <span className='text-indigo-500'>참가자:</span>{" "}
                {participants.map((p, index) => (
                  <span key={index}>
                    {p.nickname}
                    {index < participants.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            </div>
          </div>
        ) : (
          <p className='text-center text-gray-500'>방 정보를 불러오는 중...</p>
        )}

        {/* 참가자 수 초과 또는 기타 에러 메시지 */}
        {errorMessage && (
          <p className='mt-4 text-center text-red-500'>{errorMessage}</p>
        )}

        {/* 참가자만 닉네임 입력 가능 */}
        {!isHost && (
          <div className='flex items-center justify-between mb-6'>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder='닉네임을 입력하세요'
              className='w-3/4 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-400'
            />
            <button
              onClick={handleAddParticipant}
              className='w-1/4 px-4 py-2 text-white transition duration-200 bg-indigo-600 hover:bg-indigo-700 rounded-r-md'
            >
              확인
            </button>
          </div>
        )}

        {/* 호스트만 게임 시작 버튼 표시 */}
        {isHost && (
          <div className='flex justify-center'>
            <button
              onClick={handleStartGame}
              className='px-6 py-3 mt-6 text-white bg-indigo-600 rounded-md hover:bg-indigo-700'
            >
              게임 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomPage;
