import React, { useState, useRef, useEffect } from 'react';
import './SnakeGame.css';


const GamePage = () => {
  const canvasRef = useRef(null);
  const [settings, setSettings] = useState({
    darkMode: false,
    unit: 24,
    foodValue: 5,
    amtOfFood: 3,
    startLength: 5,
    loopEdge: false,
    playersDropFood: true,
  });
  const [paused, setPaused] = useState(true);

  const togglePause = () => setPaused((prev) => !prev);
  const resetOptions = () => setSettings({
    darkMode: false,
    unit: 24,
    foodValue: 5,
    amtOfFood: 3,
    startLength: 5,
    loopEdge: false,
    playersDropFood: true,
  });

  // Canvas 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'gray';
      for (let i = 0; i < canvas.width; i += settings.unit) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += settings.unit) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }
    };

    if (!paused) drawGrid();
  }, [settings, paused]);

  return (
    <div>
      {/* Canvas 영역 */}
      <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />

      {/* 설정 메뉴 */}
      {paused && (
        <div
          id="menu"
          style={{
            background: '#8888',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            borderRadius: '10px',
          }}
        >
          <h1>Settings</h1>
          <label>
            Dark Mode:
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={() =>
                setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))
              }
            />
          </label>
          <p>
            Tile Size: {settings.unit}px
            <input
              type="range"
              value={settings.unit}
              min="10"
              max="64"
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, unit: Number(e.target.value) }))
              }
            />
          </p>
          <p>
            Food Value:
            <input
              type="number"
              value={settings.foodValue}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, foodValue: Number(e.target.value) }))
              }
            />
          </p>
          <p>
            Amount of Food:
            <input
              type="number"
              value={settings.amtOfFood}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, amtOfFood: Number(e.target.value) }))
              }
            />
          </p>
          <p>
            Start Length:
            <input
              type="number"
              value={settings.startLength}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, startLength: Number(e.target.value) }))
              }
            />
          </p>
          <p>
            Loop Edge:
            <input
              type="checkbox"
              checked={settings.loopEdge}
              onChange={() =>
                setSettings((prev) => ({ ...prev, loopEdge: !prev.loopEdge }))
              }
            />
          </p>
          <p>
            Players Drop Food:
            <input
              type="checkbox"
              checked={settings.playersDropFood}
              onChange={() =>
                setSettings((prev) => ({ ...prev, playersDropFood: !prev.playersDropFood }))
              }
            />
          </p>
          <button onClick={togglePause}>Resume</button>
          <button onClick={resetOptions}>Reset Options</button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
