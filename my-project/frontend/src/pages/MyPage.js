import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { User, Settings } from 'lucide-react';

function MyPage({ nickname }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{nickname}</h3>
              <p className="text-sm text-gray-500">가입일: 2024.03.20</p>
            </div>
            <Button variant="outline" className="ml-auto">
              <Settings className="w-4 h-4 mr-2" />
              설정
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">32</p>
              <p className="text-sm text-gray-500">총 게임</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">18</p>
              <p className="text-sm text-gray-500">승리</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">56%</p>
              <p className="text-sm text-gray-500">승률</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">최근 게임 기록</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((game) => (
              <div
                key={game}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">퍼즐 챌린지 #{game}</p>
                  <p className="text-sm text-gray-500">2024.03.{20 - game}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">승리</p>
                  <p className="text-sm text-gray-500">950점</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MyPage;
