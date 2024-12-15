import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

function RoomCard({ room }) {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">챌린지 #{room.id}</h3>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            진행중
          </span>
        </div>
        <div className="space-y-1 text-sm text-gray-600">
          <p>참가자: {room.players}/6</p>
          <p>난이도: {room.difficulty}</p>
          <p>제한시간: {room.time}분</p>
        </div>
        <Button className="w-full mt-4 bg-gray-900 text-white hover:bg-black">
          참가하기
        </Button>
      </CardContent>
    </Card>
  );
}

export default RoomCard;
