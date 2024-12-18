import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GameResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { players = [] } = location.state || {};

  return (
    <div className='flex flex-col items-center min-h-screen py-8 bg-gray-100'>
      <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg'>
        <h1 className='mb-6 text-3xl font-semibold text-center text-indigo-600'>
          게임 종료
        </h1>
        <h2 className='mb-4 text-xl text-center text-gray-700'>순위</h2>

        <ul className='space-y-4'>
          {players.map((player, index) => (
            <li
              key={index}
              className='flex items-center justify-between text-lg font-medium text-gray-800'
            >
              <span>
                {index + 1}. {player.name}
              </span>
              <span className='text-indigo-600'>점수: {player.score}</span>
            </li>
          ))}
        </ul>

        <div className='flex justify-center mt-6'>
          <button
            onClick={() => navigate("/")}
            className='px-8 py-3 text-lg font-semibold text-white transition duration-300 bg-orange-600 rounded-lg hover:bg-orange-700'
          >
            로비로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResultsPage;
