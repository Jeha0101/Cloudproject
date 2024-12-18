import SettingsModal from "../pages/SettingsModal";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SnakeGame = ({ roomId }) => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState({
    tileSize: 20,
    darkMode: false,
  });
  const [gameState, setGameState] = useState({
    snakes: {
      눈송이: { snake: [{ x: 5, y: 5 }], direction: "RIGHT", score: 0 },
      눈결: { snake: [{ x: 15, y: 15 }], direction: "LEFT", score: 0 },
    },
    food: { x: 10, y: 10 },
  });
  const animationRef = useRef(null);

  // 게임 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const unit = settings.tileSize;
    let lastTime = 0;
    const speed = 100;

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

    const drawFood = () => {
      ctx.fillStyle = "red";
      ctx.fillRect(
        gameState.food.x * unit,
        gameState.food.y * unit,
        unit,
        unit
      );
    };

    const drawSnakes = () => {
      Object.entries(gameState.snakes).forEach(([name, snakeData]) => {
        const color = name === "눈송이" ? "blue" : "purple";
        ctx.fillStyle = color;

        // 뱀 그리기
        snakeData.snake.forEach((segment) => {
          ctx.fillRect(segment.x * unit, segment.y * unit, unit, unit);
        });

        // 닉네임 표시
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        const head = snakeData.snake[0];
        ctx.fillText(name, head.x * unit + 2, head.y * unit + unit - 2);
      });
    };

    const moveSnakes = () => {
      setGameState((prev) => {
        const newSnakes = { ...prev.snakes };
        let newFood = { ...prev.food };

        Object.entries(newSnakes).forEach(([name, snakeData]) => {
          const head = { ...snakeData.snake[0] };

          // 이동
          switch (snakeData.direction) {
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

          // 화면 경계 루프 처리
          head.x =
            (head.x + Math.floor(canvas.width / unit)) %
            Math.floor(canvas.width / unit);
          head.y =
            (head.y + Math.floor(canvas.height / unit)) %
            Math.floor(canvas.height / unit);

          // 음식 먹기
          if (head.x === prev.food.x && head.y === prev.food.y) {
            snakeData.snake = [head, ...snakeData.snake];
            snakeData.score += 1;

            // 새 음식 생성
            newFood = {
              x: Math.floor(Math.random() * (canvas.width / unit)),
              y: Math.floor(Math.random() * (canvas.height / unit)),
            };
          } else {
            snakeData.snake = [head, ...snakeData.snake.slice(0, -1)];
          }
        });

        return { ...prev, snakes: newSnakes, food: newFood };
      });
    };

    const drawGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = settings.darkMode ? "#222" : "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid();
      drawFood();
      drawSnakes();
    };

    const gameLoop = (currentTime) => {
      if (!lastTime) lastTime = currentTime;

      const deltaTime = currentTime - lastTime;
      if (deltaTime > speed) {
        lastTime = currentTime;
        moveSnakes();
        drawGame();
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    const handleKeyDown = (e) => {
      setGameState((prev) => {
        const newSnakes = { ...prev.snakes };
        if (e.key === "ArrowUp" && newSnakes.눈송이.direction !== "DOWN") {
          newSnakes.눈송이.direction = "UP";
        } else if (
          e.key === "ArrowDown" &&
          newSnakes.눈송이.direction !== "UP"
        ) {
          newSnakes.눈송이.direction = "DOWN";
        } else if (
          e.key === "ArrowLeft" &&
          newSnakes.눈송이.direction !== "RIGHT"
        ) {
          newSnakes.눈송이.direction = "LEFT";
        } else if (
          e.key === "ArrowRight" &&
          newSnakes.눈송이.direction !== "LEFT"
        ) {
          newSnakes.눈송이.direction = "RIGHT";
        } else if (e.key === "w" && newSnakes.눈결.direction !== "DOWN") {
          newSnakes.눈결.direction = "UP";
        } else if (e.key === "s" && newSnakes.눈결.direction !== "UP") {
          newSnakes.눈결.direction = "DOWN";
        } else if (e.key === "a" && newSnakes.눈결.direction !== "RIGHT") {
          newSnakes.눈결.direction = "LEFT";
        } else if (e.key === "d" && newSnakes.눈결.direction !== "LEFT") {
          newSnakes.눈결.direction = "RIGHT";
        }
        return { ...prev, snakes: newSnakes };
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState, settings]);

  const handleExit = () => {
    navigate("/");
  };

  const handleGameEnd = () => {
    navigate("/game-results", {
      state: {
        players: Object.keys(gameState.snakes).map((name) => ({
          name,
          score: gameState.snakes[name].score,
        })),
      },
    });
  };

  return (
    <div className='relative flex justify-center bg-gray-100'>
      {/* 왼쪽 버튼 그룹 */}
      <div className='absolute flex flex-col space-y-4 top-6 left-6'>
        <button
          onClick={handleExit}
          className='px-6 py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700'
        >
          나가기
        </button>
        <button
          onClick={handleGameEnd}
          className='px-6 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700'
        >
          게임 종료
        </button>
        <button
          onClick={() => setSettingsVisible(!settingsVisible)}
          className='px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700'
        >
          설정
        </button>
      </div>

      {/* 오른쪽 점수판 */}
      <div className='absolute flex flex-col space-y-4 text-lg font-bold top-6 right-6'>
        <div className='text-blue-600'>
          눈송이 점수: {gameState.snakes.눈송이.score}
        </div>
        <div className='text-purple-600'>
          눈결 점수: {gameState.snakes.눈결.score}
        </div>
      </div>

      {/* 게임 화면 */}
      <div className='flex flex-col items-center'>
        <h1 className='mb-4 text-2xl font-bold'>Snake Game</h1>
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className='border border-gray-300'
        />
      </div>

      {/* 설정 화면 보이기 */}
      {settingsVisible && <SettingsModal settings={settings} />}
    </div>
  );
};

export default SnakeGame;
