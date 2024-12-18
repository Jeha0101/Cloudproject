const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

module.exports = (io) => {
    const router = express.Router();
    const gameTimers = new Map();

    /**
     * 게임 시작 API
     * - 방 상태를 'playing'으로 변경
     * - 게임 타이머 시작
     */
    router.post('/rooms/:roomId/game/start', async (req, res) => {
        const { roomId } = req.params;
        
        try {
            // 방 상태를 'playing'으로 변경
            await db.query(
                'UPDATE rooms SET status = ? WHERE id = ?',
                ['playing', roomId]
            );

            // 3분(180초) 타이머 시작
            startGameTimer(roomId, 180);

            io.to(roomId).emit('gameStarted');
            res.json({ success: true });
        } catch (error) {
            console.error('게임 시작 실패:', error);
            res.status(500).json({ error: '게임 시작에 실패했습니다.' });
        }
    });

    /**
     * 게임 종료 API
     * - 방 상태를 'waiting'으로 변경
     * - 게임 타이머 정지
     */
    router.post('/rooms/:roomId/game/end', async (req, res) => {
        const { roomId } = req.params;
        
        try {
            await db.query(
                'UPDATE rooms SET status = ? WHERE id = ?',
                ['waiting', roomId]
            );

            stopGameTimer(roomId);
            io.to(roomId).emit('gameEnded');
            res.json({ success: true });
        } catch (error) {
            console.error('게임 종료 실패:', error);
            res.status(500).json({ error: '게임 종료에 실패했습니다.' });
        }
    });

    /**
     * 게임 상태 조회 API
     */
    router.get('/rooms/:roomId/game/status', async (req, res) => {
        const { roomId } = req.params;

        try {
            const [rows] = await db.query(
                'SELECT status, players FROM rooms WHERE id = ?',
                [roomId]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: '방을 찾을 수 없습니다.' });
            }

            const timeLeft = gameTimers.has(roomId) ? 
                Math.ceil(gameTimers.get(roomId).timeLeft) : 0;

            res.json({
                status: rows[0].status,
                players: JSON.parse(rows[0].players),
                timeLeft
            });
        } catch (error) {
            console.error('게임 상태 조회 실패:', error);
            res.status(500).json({ error: '게임 상태 조회에 실패했습니다.' });
        }
    });
    /**
         * 타이머 정지 함수
         */
        function stopGameTimer(roomId) {
            if (gameTimers.has(roomId)) {
                clearInterval(gameTimers.get(roomId).timer);
                gameTimers.delete(roomId);
            }
        }
    /**
     * 타이머 시작 함수
     */
    function startGameTimer(roomId, duration) {
        if (gameTimers.has(roomId)) {
            clearInterval(gameTimers.get(roomId).timer);
        }

        let timeLeft = duration;
        const timer = setInterval(async () => {
            timeLeft--;
            
            // 남은 시간 브로드캐스트
            io.to(roomId).emit('timerUpdate', { timeLeft });

            // 타이머 종료
            if (timeLeft <= 0) {
                clearInterval(timer);
                gameTimers.delete(roomId);

                try {
                    // 게임 자동 종료
                    await db.query(
                        'UPDATE rooms SET status = ? WHERE id = ?',
                        ['waiting', roomId]
                    );
                    io.to(roomId).emit('gameEnded', { reason: 'timeUp' });
                } catch (error) {
                    console.error('타이머 종료 처리 실패:', error);
                }
            }
        }, 1000);

        gameTimers.set(roomId, { timer, timeLeft });
    }

    

    return router;
}; 