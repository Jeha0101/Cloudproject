import React from "react";
import { Button } from "../components/ui/button.js";
import { Trophy } from "lucide-react";

function RankingPage() {
  // 눈송이와 눈결이 순위를 하드코딩
  const ranks = [
    { rank: 1, name: "눈송이", score: 2 },
    { rank: 2, name: "눈결이", score: 1 },
  ];

  return (
    <div className='bg-white rounded-lg shadow'>
      <div className='p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-bold'>전체 랭킹</h2>
          <div className='flex space-x-2'>
            <Button variant='outline'>일간</Button>
            <Button variant='outline'>주간</Button>
            <Button variant='outline'>전체</Button>
          </div>
        </div>
        <div className='space-y-4'>
          {ranks.map(({ rank, name, score }) => (
            <div
              key={rank}
              className='flex items-center justify-between p-4 rounded-lg hover:bg-gray-50'
            >
              <div className='flex items-center space-x-4'>
                <span className='text-2xl font-bold text-gray-400'>{rank}</span>
                <div>
                  <p className='font-medium'>{name}</p>
                  <p className='text-sm text-gray-500'>최고점수: {score}점</p>
                </div>
              </div>
              <Trophy
                className={`w-6 h-6 ${
                  rank === 1
                    ? "text-yellow-400"
                    : rank === 2
                    ? "text-gray-400"
                    : rank === 3
                    ? "text-orange-400"
                    : "text-gray-300"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RankingPage;
