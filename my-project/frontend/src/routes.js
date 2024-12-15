import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LobbyPage from './pages/LobbyPage';
import RoomPage from './pages/RoomPage';
import GamePage from './pages/GamePage';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/rooms/:roomId" element={<RoomPage />} />
        <Route path="/rooms/:roomId/game" element={<GamePage />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
