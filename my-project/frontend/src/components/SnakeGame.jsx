// SnakeGame.jsx
import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import SettingsModal from "../pages/SettingsModal";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const SnakeGame = ({ roomId, nickname }) => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [settings, setSettings] = useState({
    tileSize: 20,
    foodValue: 5,
    foodAmount: 3,
    startLength: 5,
    darkMode: false,
  });
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [snakeData, setSnakeData] = useState({});
  const animationRef = useRef(null);

  // 소켓 연결 및 초기 설정
  useEffect(() => {
    const token = localStorage.getItem("token"); // JWT 토큰 저장 방식에 따라 수정
    if (!token) {
      navigate("/login");
      return;
    }

    const s = io(SOCKET_URL, {
      auth: { token },
      query: { roomId },
    });

    s.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      navigate("/lobby");
    });

    s.on("playerJoined", (data) => {
      setParticipants((prev) => [...prev, data]);
      setSnakeData((prev) => ({
        ...prev,
        [data.nickname]: {
          snake: [{ x: 10, y: 10 }],
          direction: "RIGHT",
        },
      }));
    });

    s.on("playerLeft", (data) => {
      setParticipants((prev) =>
        prev.filter((p) => p.nickname !== data.nickname)
      );
      setSnakeData((prev) => {
        const updated = { ...prev };
        delete updated[data.nickname];
        return updated;
      });
    });

    s.on("gameStart", () => {
      // 게임 시작 시 필요한 로직 추가
    });

    setSocket(s);

    // 초기 자신의 뱀 상태 설정
    setSnakeData((prev) => ({
      ...prev,
      [nickname]: {
        snake: [{ x: 10, y: 10 }],
        direction: "RIGHT",
      },
    }));

    return () => {
      if (s) s.disconnect();
    };
  }, [roomId, nickname, navigate]);

  // 게임 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const unit = settings.tileSize;

    // 격자 그리기
    const drawGrid = () => {
      ctx.strokeStyle = "#ddd";
      for (let x = 0; x <= canvas.width / unit; x++) {
        ctx.beginPath();
        ctx.moveTo(x * unit, 0);
        ctx.lineTo(x * unit, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height / unit; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * unit);
        ctx.lineTo(canvas.width, y * unit);
        ctx.stroke();
      }
    };

    // 참가자 그리기
    const drawParticipants = () => {
      participants.forEach((player, index) => {
        const color = index % 2 === 0 ? "blue" : "purple";
        ctx.fillStyle = color;
        player.snake.forEach((segment, idx) => {
          ctx.fillRect(segment.x * unit, segment.y * unit, unit, unit);
        });
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText(
          player.nickname,
          player.snake[0].x * unit + unit / 4,
          player.snake[0].y * unit + unit / 1.5
        );
      });
    };

    // 음식 그리기
    const drawFood = () => {
      ctx.fillStyle = "red";
      ctx.fillRect(food.x * unit, food.y * unit, unit, unit);
    };

    // 게임 그리기
    const drawGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = settings.darkMode ? "#222" : "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      drawFood();
      drawParticipants();
    };

    // 뱀 이동
    const moveSnakes = () => {
      setSnakeData((prevData) => {
        const newData = { ...prevData };
        Object.keys(newData).forEach((player) => {
          const { snake, direction } = newData[player];
          const head = { ...snake[0] };

          switch (direction) {
            case "UP":
              head.y -= 1;
              break;
            case "DOWN":
              head.y += 1;
              break;
            case "LEFT":
              head.x -= 1;
              break;
            case "RIGHT":
              head.x += 1;
              break;
            default:
              break;
          }

          // 벗어나면 초기화
          if (
            head.x < 0 ||
            head.y < 0 ||
            head.x >= Math.floor(canvas.width / unit) ||
            head.y >= Math.floor(canvas.height / unit)
          ) {
            newData[player] = {
              snake: [{ x: 10, y: 10 }],
              direction: "RIGHT",
            };
            return;
          }

          // 음식 먹기
          if (head.x === food.x && head.y === food.y) {
            newData[player] = {
              ...newData[player],
              snake: [head, ...snake],
            };
            setFood({
              x: Math.floor(Math.random() * (canvas.width / unit)),
              y: Math.floor(Math.random() * (canvas.height / unit)),
            });
          } else {
            newData[player] = {
              ...newData[player],
              snake: [head, ...snake.slice(0, -1)],
            };
          }
        });
        return newData;
      });
    };

    // 애니메이션 루프
    const gameLoop = () => {
      moveSnakes();
      drawGame();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    // 게임 시작
    animationRef.current = requestAnimationFrame(gameLoop);

    // 키보드 이벤트 핸들러
    const handleKeyDown = (e) => {
      let newDirection;
      switch (e.key) {
        case "ArrowUp":
          newDirection = "UP";
          break;
        case "ArrowDown":
          newDirection = "DOWN";
          break;
        case "ArrowLeft":
          newDirection = "LEFT";
          break;
        case "ArrowRight":
          newDirection = "RIGHT";
          break;
        default:
          return;
      }

      // 현재 방향과 반대 방향으로는 변경 불가
      setSnakeData((prevData) => {
        const currentDirection = prevData[nickname].direction;
        if (
          (currentDirection === "UP" && newDirection === "DOWN") ||
          (currentDirection === "DOWN" && newDirection === "UP") ||
          (currentDirection === "LEFT" && newDirection === "RIGHT") ||
          (currentDirection === "RIGHT" && newDirection === "LEFT")
        ) {
          return prevData;
        }
        // 소켓을 통해 방향 변경 전송
        if (socket) {
          socket.emit("playerMove", { direction: newDirection });
        }
        return {
          ...prevData,
          [nickname]: { ...prevData[nickname], direction: newDirection },
        };
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [settings, food, participants, nickname, socket]);

  // 소켓으로부터 방향 변경 수신
  useEffect(() => {
    if (!socket) return;

    socket.on("playerMove", ({ nickname: playerNickname, direction }) => {
      setSnakeData((prevData) => ({
        ...prevData,
        [playerNickname]: {
          ...prevData[playerNickname],
          direction,
        },
      }));
    });

    return () => {
      socket.off("playerMove");
    };
  }, [socket]);

  // 설정 변경 함수
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseInt(value),
    }));
  };

  // 나가기 함수
  const handleExit = () => {
    navigate("/lobby");
  };

  // 게임 종료 함수
  const handleGameEnd = () => {
    navigate("/game-results", {
      state: {
        players: Object.keys(snakeData).map((name) => ({ name, score: 0 })),
      },
    });
  };

  return (
    <div className='relative flex flex-col items-center min-h-screen p-6 bg-gray-100'>
      {/* 나가기 버튼 */}
      <div className='absolute top-6 left-6'>
        <button
          onClick={handleExit}
          className='px-6 py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700'
        >
          나가기
        </button>
      </div>

      {/* 게임 종료 버튼 */}
      <div className='absolute top-6 right-6'>
        <button
          onClick={handleGameEnd}
          className='px-6 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700'
        >
          게임 종료
        </button>
      </div>

      {/* 게임 화면 */}
      <h1 className='mb-4 text-2xl font-bold'>Snake Game</h1>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className='border border-gray-300'
      />
      <div className='mt-4'>
        {/* 설정 버튼 */}
        <button
          onClick={() => setSettingsVisible(!settingsVisible)}
          className='px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700'
        >
          설정
        </button>
      </div>

      {/* 설정 화면 보이기 */}
      {settingsVisible && (
        <SettingsModal
          settings={settings}
          handleSettingsChange={handleSettingsChange}
        />
      )}
    </div>
  );
};

export default SnakeGame;
