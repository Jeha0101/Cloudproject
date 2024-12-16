const express = require('express');
const router = express.Router();
const db = require('../config/database');
const winston = require('winston');

// Winston 로거 설정
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // 에러 로그
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
        }),
        // 액세스 로그
        new winston.transports.File({ 
            filename: 'logs/access.log', 
            level: 'info' 
        }),
        // 게임 진행 로그
        new winston.transports.File({ 
            filename: 'logs/game.log', 
            level: 'info' 
        })
    ]
});

/**
 * 클성 방 통계 API
 * - 현재 활성화된 방 수
 * - 총 사용자 수
 * - 진행 중인 게임 수
 */
router.get('/stats', async (req, res) => {
    try {
        const [roomStats] = await db.query(`
            SELECT 
                COUNT(*) as total_rooms,
                SUM(CASE WHEN status = 'playing' THEN 1 ELSE 0 END) as active_games,
                COUNT(DISTINCT JSON_UNQUOTE(JSON_EXTRACT(players, '$[*]'))) as total_players
            FROM rooms
        `);

        logger.info('방 통계 조회', { stats: roomStats[0] });
        res.json(roomStats[0]);
    } catch (error) {
        logger.error('방 통계 조회 실패', { error });
        res.status(500).json({ error: '방 통계 조회 실패' });
    }
});

/**
 * 에러 로그 조회 API
 */
router.get('/logs/errors', async (req, res) => {
    try {
        // 최근 에러 로그 조회 (예: 최근 100개)
        const errors = await new Promise((resolve, reject) => {
            const logs = [];
            const stream = winston.stream({ filename: 'logs/error.log' })
                .on('data', data => logs.push(JSON.parse(data)))
                .on('end', () => resolve(logs.slice(-100)));
        });

        res.json({ errors });
    } catch (error) {
        logger.error('에러 로그 조회 실패', { error });
        res.status(500).json({ error: '에러 로그 조회 실패' });
    }
});

/**
 * 게임 진행 로그 조회 API
 */
router.get('/logs/games', async (req, res) => {
    try {
        const [gameLogs] = await db.query(`
            SELECT 
                r.id as room_id,
                r.host,
                r.status,
                r.created_at,
                r.players
            FROM rooms r
            WHERE r.status = 'playing'
            ORDER BY r.created_at DESC
            LIMIT 100
        `);

        logger.info('게임 로그 조회', { count: gameLogs.length });
        res.json({ games: gameLogs });
    } catch (error) {
        logger.error('게임 로그 조회 실패', { error });
        res.status(500).json({ error: '게임 로그 조회 실패' });
    }
});

// 액세스 로깅 미들웨어
const accessLogger = (req, res, next) => {
    logger.info('API 접근', {
        method: req.method,
        path: req.path,
        ip: req.ip
    });
    next();
};

// 모든 라우트에 액세스 로깅 적용
router.use(accessLogger);

module.exports = router; 