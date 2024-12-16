import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(""); // 닉네임 상태
  const [participants, setParticipants] = useState([]); // 참가자 목록
  const [errorMessage, setErrorMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [hostNickname, setHostNickname] = useState(""); // 호스트 닉네임

  const isHost = localStorage.getItem("hostToken") === roomId; // 호스트 여부 확인

  // 방 정보를 로드하는 useEffect
  useEffect(() => {
    const s = io(SOCKET_URL, { query: { roomId } });

    s.on("connect", () => {
      console.log("Connected to socket server.");
    });

    s.on("participantsUpdated", (updatedParticipants) => {
      setParticipants(updatedParticipants);
    });

    s.on("hostUpdated", (host) => {
      setHostNickname(host); // 호스트 닉네임 업데이트
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

  // 참가자 추가 함수
  const handleAddParticipant = () => {
    if (!nickname.trim()) {
      setErrorMessage("닉네임을 입력하세요.");
      return;
    }

    // 이미 사용 중인 닉네임 체크
    if (participants.find((p) => p.nickname === nickname)) {
      setErrorMessage("이미 사용 중인 닉네임입니다.");
      return;
    }

    // 최대 4명 참가자 제한
    if (participants.length >= 3) {
      setErrorMessage("참가자 수가 초과되었습니다.");
      return;
    }

    // 참가자 목록 업데이트
    const newParticipant = { nickname };
    setParticipants((prevParticipants) => [
      ...prevParticipants,
      newParticipant,
    ]);

    setNickname(""); // 닉네임 초기화
    setErrorMessage(""); // 에러 메시지 초기화

    // 서버로 참가자 추가 요청
    if (socket) {
      socket.emit("addParticipant", { nickname, roomId }, (response) => {
        if (response.success) {
          setErrorMessage("");
          console.log(`${nickname} 참가 성공`);
        } else {
          console.error("Failed to add participant:", response.error);
          setErrorMessage(response.error || "참가 중 오류가 발생했습니다.");
        }
      });
    }
  };

  // 게임 시작
  const handleStartGame = () => {
    console.log("Starting game for room:", roomId, "Is Host:", isHost);

    if (isHost) {
      console.log("Navigating to game page...");
      navigate(`/game/${roomId}`, { state: { roomId } });
    } else {
      setErrorMessage("호스트만 게임을 시작할 수 있습니다.");
    }
  };

  return (
    <div className='min-h-screen p-6 bg-gray-100'>
      <div className='max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-md'>
        {/* 나가기 버튼 */}
        <button
          onClick={() => navigate("/")}
          className='px-4 py-2 mb-4 text-white bg-indigo-600 rounded-md hover:bg-indigo-700'
        >
          나가기
        </button>

        <h1 className='mb-6 text-3xl font-bold text-center text-indigo-600'>
          대기실: {roomId}
        </h1>

        <div className='mb-6 space-y-4'>
          <div>
            <p className='text-lg font-medium'>
              <span className='text-indigo-500'>호스트:</span>{" "}
              {hostNickname || "눈송이"}
            </p>
          </div>
          <div>
            <p className='text-lg font-medium'>
              <span className='text-indigo-500'>참가자:</span> <span></span>
              {participants.map((p, index) => (
                <span key={index}>
                  {p.nickname}
                  {index < participants.length - 1 ? "   " : ""}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* 에러 메시지 */}
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
