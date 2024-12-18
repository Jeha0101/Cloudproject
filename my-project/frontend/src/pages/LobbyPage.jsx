import React, { useState, useEffect } from "react";
import { createRoom, fetchRooms } from "../services/api";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

function LobbyPage() {
  const [nickname, setNickname] = useState("");
  const [rooms, setRooms] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  // 방 목록 불러오기
  async function loadRooms() {
    try {
      // 방 목록 데이터 요청
      const data = await fetchRooms();
      console.log("Fetched rooms data:", data); // 전체 데이터 로그

      if (data) {
        // 데이터를 배열로 변환
        const roomsArray = Object.entries(data).map(([roomId, roomData]) => ({
          roomId, // 방 ID
          host: roomData.host, // 호스트
          players: roomData.players || [], // 참가자 목록
          scores: roomData.scores || {}, // 점수
        }));
        console.log("Parsed rooms array:", roomsArray); // 변환된 데이터 로그
        setRooms(roomsArray);
      } else {
        console.warn("No rooms found or invalid data structure.");
        setRooms([]); // 빈 배열로 상태 초기화
      }
    } catch (error) {
      console.error("Failed to load rooms:", error); // 에러 로그
      setErrorMessage("방 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false); // 로딩 상태 해제
    }
  }

  // 페이지 로드 시 방 목록 불러오기 및 소켓 설정
  useEffect(() => {
    loadRooms(); // 방 목록 초기 로드

    const s = io(SOCKET_URL);
    s.on("roomListUpdate", () => {
      console.log("Room list update received"); // 디버깅 로그
      loadRooms(); // 방 목록 갱신
    });
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // 방 생성 핸들러
  async function handleCreateRoom() {
    if (!nickname.trim()) {
      alert("닉네임을 입력하세요.");
      return;
    }
    try {
      const { roomId } = await createRoom(nickname);
      localStorage.setItem("hostToken", roomId); // 호스트 인증 토큰 저장
      navigate(`/rooms/${roomId}`);
    } catch (error) {
      const { roomId } = await createRoom(nickname);
      localStorage.setItem("hostToken", roomId); // 호스트 인증 토큰 저장
      navigate(`/rooms/${roomId}`);
      console.error("Failed to create room:", error);
      setErrorMessage(error.message || "방 생성에 실패했습니다.");
    }
  }

  // 방 참가 핸들러
  function handleJoinRoom(roomId) {
    navigate(`/rooms/${roomId}`, { state: { nickname } });
  }

  return (
    <div className='min-h-screen p-6 bg-gray-100'>
      <div className='max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-md'>
        <h1 className='mb-6 text-3xl font-bold text-center text-indigo-600'>
          GAME WORLD 로비
        </h1>

        {/* 닉네임 입력 및 방 만들기 */}
        <div className='flex items-center justify-center mb-6'>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder='닉네임을 입력하세요'
            className='w-1/2 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-400'
          />
          <button
            onClick={handleCreateRoom}
            className='px-4 py-2 text-white transition duration-200 bg-indigo-600 hover:bg-indigo-700 rounded-r-md'
          >
            방 만들기
          </button>
        </div>

        {/* 에러 메시지 */}
        {errorMessage && (
          <p className='mb-4 text-center text-red-500'>{errorMessage}</p>
        )}

        {/* 로딩 표시 */}
        {loading ? (
          <p className='text-center text-gray-500'>로딩 중...</p>
        ) : (
          <>
            {/* 챌린지 목록 */}
            <h2 className='mb-4 text-2xl font-semibold'>챌린지 목록</h2>
            {rooms.length > 0 ? (
              <ul className='space-y-4'>
                {rooms.map((room) => (
                  <li
                    key={room.roomId}
                    className='flex items-center justify-between p-4 border border-gray-200 rounded-md shadow-sm bg-gray-50'
                  >
                    <div>
                      <p className='text-lg font-medium'>
                        <span className='text-indigo-500'>방 ID:</span>{" "}
                        {room.roomId}
                      </p>
                      <p className='text-sm text-gray-600'>
                        <span className='font-medium'>호스트:</span> {room.host}
                      </p>
                      <p className='text-sm text-gray-600'>
                        <span className='font-medium'>참가자:</span>{" "}
                        {room.players.length}명
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room.roomId)}
                      className='px-4 py-2 text-white transition duration-200 bg-green-500 rounded-md hover:bg-green-600'
                    >
                      참가하기
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-center text-gray-500'>
                현재 생성된 방이 없습니다.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LobbyPage;
