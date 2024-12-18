// Promise와 async/await 방식
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

module.exports = (io) => {
    const router = express.Router();

    // 방 생성
    router.post('/rooms', async (req, res) => {
        const { nickname } = req.body;
        const roomId = uuidv4();
        const players = JSON.stringify([nickname]); // 배열을 JSON 문자열로 변환

        try {
            await db.query(
                'INSERT INTO rooms (id, host, players) VALUES (?, ?, ?)',
                [roomId, nickname, players]
            );
            
            io.emit('roomCreated', { roomId, host: nickname });
            res.json({ roomId, host: nickname });
        } catch (error) {
            console.error('방 생성 실패:', error);
            res.status(500).json({ error: '방 생성에 실패했습니다.' });
        }
    });

    // 방 목록 조회
    router.get('/rooms', async (req, res) => {
        try {
            const [rooms] = await db.query('SELECT * FROM rooms');
            const roomsWithParsedPlayers = rooms.map(room => {
                try {
                    // players가 이미 JSON 문자열인 경우 파싱
                    const players = typeof room.players === 'string' 
                        ? JSON.parse(room.players) 
                        : room.players;
                    
                    return {
                        ...room,
                        players: players
                    };
                } catch (error) {
                    console.error('Player parsing error:', error);
                    return {
                        ...room,
                        players: [] // 파싱 실패시 빈 배열 반환
                    };
                }
            });
            res.json(roomsWithParsedPlayers);
        } catch (error) {
            console.error('방 목록 조회 실패:', error);
            res.status(500).json({ error: '방 목록 조회에 실패했습니다.' });
        }
    });

    // 특정 방 조회
    router.get('/rooms/:roomId', async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [req.params.roomId]);
            if (rows.length > 0) {
                const room = {
                    ...rows[0],
                    players: JSON.parse(rows[0].players)
                };
                res.json(room);
            } else {
                res.status(404).json({ error: '방을 찾을 수 없습니다.' });
            }
        } catch (error) {
            console.error('방 조회 실패:', error);
            res.status(500).json({ error: '방 조회에 실패했습니다.' });
        }
    });

    // 방 참가
    router.post('/rooms/:roomId/join', async (req, res) => {
        const { roomId } = req.params;
        const { nickname } = req.body;

        try {
            const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
            if (rows.length === 0) {
                return res.status(404).json({ error: '방을 찾을 수 없습니다.' });
            }

            const room = rows[0];
            const players = JSON.parse(room.players);

            if (players.length >= 4) {//최대 4명참가 가능
                return res.status(400).json({ error: '방이 가득 찼습니다.' });
            }

            if (players.includes(nickname)) {
                return res.status(400).json({ error: '이미 참가한 닉네임입니다.' });
            }

            players.push(nickname);
            await db.query('UPDATE rooms SET players = ? WHERE id = ?', 
                [JSON.stringify(players), roomId]
            );

            io.emit('roomsUpdated'); // 방 목록 업데이트 알림
            res.json({ success: true, players });
        } catch (error) {
            console.error('방 참가 실패:', error);
            res.status(500).json({ error: '방 참가에 실패했습니다.' });
        }
    });

    // 방 나가기
    router.post('/rooms/:roomId/leave', async (req, res) => {
        const { roomId } = req.params;
        const { nickname } = req.body;

        try {
            const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
            if (rows.length === 0) {
                return res.status(404).json({ error: '방을 찾을 수 없습니다.' });
            }

            const room = rows[0];
            let players = JSON.parse(room.players);
            players = players.filter(player => player !== nickname);

            if (players.length === 0) {
                await db.query('DELETE FROM rooms WHERE id = ?', [roomId]);
            } else {
                await db.query('UPDATE rooms SET players = ? WHERE id = ?', 
                    [JSON.stringify(players), roomId]
                );
            }

            io.emit('roomsUpdated'); // 방 목록 업데이트 알림
            res.json({ success: true });
        } catch (error) {
            console.error('방 나가기 실패:', error);
            res.status(500).json({ error: '방 나가기에 실패했습니다.' });
        }
    });

    return router;
};
