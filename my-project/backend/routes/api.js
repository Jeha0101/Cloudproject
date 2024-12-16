const express = require('express');
const { createRoom, joinRoom, getRoom, getRooms } = require('../rooms');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// 방 생성 API: POST /api/rooms
router.post('/rooms', (req, res) => {
  const { nickname } = req.body;

  // 필수 필드 검사
  if (!nickname) {
    return res.status(400).json({ error: 'Nickname is required' });//닉네임 누락락
  }

  // 방 생성 및 응답
  const roomId = uuidv4(); // 고유한 room ID 생성
  createRoom(roomId, nickname);
  console.log(`✅🚪 Room created: ${roomId} by ${nickname}`);//고유 룸id, uuid라이브러리 통해 생성
  res.status(201).json({ roomId, message: 'Room successfully created' });
});

// 방 참가 API: POST /api/rooms/:roomId/join
router.post('/rooms/:roomId/join', (req, res) => {
  const { roomId } = req.params;
  const { nickname } = req.body;

  // 필수 필드 검사 닉네임 중복검사사
  if (!nickname) {
    return res.status(400).json({ error: 'Nickname is required' });
  }

  // 최대 인원 확인 (API 레벨)
  const room = getRoom(roomId);
  if (room) {
    if (room.players.length >= 4) { // 최대 인원 제한 검사
      return res.status(400).json({ error: 'Room is full (4 players max)' });
    }
  }

  // 방 참가 처리
  const result = joinRoom(roomId, nickname);
  if (result.success) {//방 존재 여부
    console.log(`✅ ${nickname} joined room: ${roomId}`);
    res.json({ success: true, message: 'Successfully joined the room' });
  } else {
    console.error(`❌🚪 Failed to join room: ${result.error}`);
    res.status(400).json({ error: result.error });
  }
});

// 특정 방 정보 조회 API: GET /api/rooms/:roomId
router.get('/rooms/:roomId', (req, res) => {//룸 ID반환환
  const { roomId } = req.params;
  const room = getRoom(roomId);

  if (room) {
    res.json(room);
  } else {
    console.error(`❌ Room not found: ${roomId}`);
    res.status(404).json({ error: 'Room not found' });
  }
});

// ✅ 전체 방 목록 조회 API: GET /api/rooms
router.get('/rooms', (req, res) => {
  const rooms = getRooms();
  res.json(rooms); // 모든 방 정보를 JSON으로 반환
});

module.exports = router;
