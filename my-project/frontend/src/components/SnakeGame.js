import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SnakeGame = ({ roomId, nickname }) => {
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [settings, setSettings] = useState({
    tileSize: 24,
    foodValue: 5,
    foodAmount: 3,
    startLength: 5,
    darkMode: false,
  });

  useEffect(() => {
    // Socket.io 연결
    const newSocket = io('http://backend-service:5000', { query: { roomId, nickname } });
    setSocket(newSocket);

    newSocket.on('playerJoined', (data) => {
      console.log(`${data.nickname} joined the game.`);
    });

    return () => newSocket.disconnect();
  }, [roomId, nickname]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const unit = settings.tileSize;

    // 게임 데이터 초기화
    let snake = [{ x: 10, y: 10 }];
    let direction = 'RIGHT';
    let food = { x: 15, y: 15 };
    const startPosition = { x: 10, y: 10 }; // 시작 위치

    // 격자 무늬 그리기 함수
    const drawGrid = () => {
      ctx.strokeStyle = '#ddd';
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

    const drawGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 배경 색상
      ctx.fillStyle = settings.darkMode ? '#222' : '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 격자 무늬
      drawGrid();

      // 뱀 그리기
      snake.forEach((segment) => {
        ctx.fillStyle = 'green';
        ctx.fillRect(segment.x * unit, segment.y * unit, unit, unit);
      });

      // 음식 그리기
      ctx.fillStyle = 'red';
      ctx.fillRect(food.x * unit, food.y * unit, unit, unit);
    };

    const moveSnake = () => {
      let head = { ...snake[0] };
      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
        default: break;
      }

      // 뱀이 격자 영역을 벗어난 경우 처음 시작 지점으로 초기화
      if (
        head.x < 0 || 
        head.y < 0 || 
        head.x >= Math.floor(canvas.width / unit) || 
        head.y >= Math.floor(canvas.height / unit)
      ) {
        snake = [startPosition]; // 뱀을 처음 위치로 재설정
        direction = 'RIGHT'; // 방향 초기화
        return;
      }

      snake.unshift(head);

      // 음식 먹기
      if (head.x === food.x && head.y === food.y) {
        food = {
          x: Math.floor(Math.random() * (canvas.width / unit)),
          y: Math.floor(Math.random() * (canvas.height / unit)),
        };
      } else {
        snake.pop();
      }
    };

    const gameLoop = setInterval(() => {
      moveSnake();
      drawGame();
    }, 100);

    // 키보드 이벤트
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp': direction = 'UP'; break;
        case 'ArrowDown': direction = 'DOWN'; break;
        case 'ArrowLeft': direction = 'LEFT'; break;
        case 'ArrowRight': direction = 'RIGHT'; break;
        default: break;
      }
    });

    return () => clearInterval(gameLoop);
  }, [settings]);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseInt(value),
    }));
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Snake Game</h1>
      <canvas ref={canvasRef} width={500} height={500} className="border border-gray-300" />
      <div className="mt-4">
        <h2>Settings</h2>
        <label>
          Dark Mode
          <input type="checkbox" name="darkMode" checked={settings.darkMode} onChange={handleSettingsChange} />
        </label>
        <label>
          Tile Size
          <input type="range" name="tileSize" min="10" max="50" value={settings.tileSize} onChange={handleSettingsChange} />
        </label>
        <label>
          Food Value
          <input type="number" name="foodValue" value={settings.foodValue} onChange={handleSettingsChange} />
        </label>
      </div>
    </div>
  );
};

export default SnakeGame;
