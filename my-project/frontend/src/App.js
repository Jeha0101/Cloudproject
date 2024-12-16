import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import LobbyPage from "./pages/LobbyPage";
import RankingPage from "./pages/RankingPage";
import SnakeGame from "./components/SnakeGame";
import RoomPage from "./pages/RoomPage";
import GamePage from "./pages/GamePage";
import GameResultsPage from "./pages/GameResultPage";

function App() {
  return (
    <div className='min-h-screen bg-gray-100'>
      <Header />
      <Navigation />
      <main className='px-4 py-6 mx-auto max-w-7xl'>
        <Routes>
          <Route
            path='/'
            element={<LobbyPage />}
          />
          <Route
            path='/ranking'
            element={<RankingPage />}
          />
          <Route
            path='/rooms/:roomId'
            element={<RoomPage />}
          />
          <Route
            path='/game/:roomId'
            element={<SnakeGame />}
          />
          <Route
            path='/game-results'
            element={<GameResultsPage />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
