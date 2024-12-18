const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const jwt = require('jsonwebtoken');

// JWT 시크릿 키 (실제 운영에서는 환경변수로 관리)
const JWT_SECRET = 'your-secret-key';

/**
 * 사용자 인증 미들웨어
 * - 모든 보호된 라우트에서 사용
 */
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: '유효하지 않은 토큰입니다 .' });
    }
};

/**
 * 호스트 권한 확인 미들웨어
 * - 호스트만 접근 가능한 기능에 사용
 */
const checkHostPermission = async (req, res, next) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    try {
        const [room] = await db.query(
            'SELECT host_id FROM rooms WHERE id = ?',
            [roomId]
        );

        if (room.length === 0) {
            return res.status(404).json({ error: '방을 찾을 수 없습니다.' });
        }

        if (room[0].host_id !== userId) {
            return res.status(403).json({ error: '호스트 권한이 필요합니다.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: '권한 확인 실패' });
    }
};

/**
 * 사용자 등록 API
 * - 닉네임으로 간단히 등록
 */
router.post('/register', async (req, res) => {
    const { nickname } = req.body;
    const userId = uuidv4();

    try {
        // 닉네임 중복 확인
        const [existing] = await db.query(
            'SELECT * FROM users WHERE nickname = ?',
            [nickname]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: '이미 사용 중인 닉네임입니다.' });
        }

        // 사용자 등록
        await db.query(
            'INSERT INTO users (id, nickname, created_at) VALUES (?, ?, NOW())',
            [userId, nickname]
        );

        // JWT 토큰 생성
        const token = jwt.sign(
            { id: userId, nickname },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, userId, nickname });
    } catch (error) {
        console.error('사용자 등록 실패:', error);
        res.status(500).json({ error: '사용자 등록에 실패했습니다.' });
    }
});

/**
 * 방 생성 시 호스트 권한 부여
 * - 인증된 사용자만 방 생성 가능
 */
router.post('/rooms', authenticateUser, async (req, res) => {
    const roomId = uuidv4();
    const hostId = req.user.id;

    try {
        await db.query(
            'INSERT INTO rooms (id, host_id, status) VALUES (?, ?, ?)',
            [roomId, hostId, 'waiting']
        );

        // 호스트 권한 기록
        await db.query(
            'INSERT INTO room_permissions (room_id, user_id, role) VALUES (?, ?, ?)',
            [roomId, hostId, 'host']
        );

        res.json({ roomId });
    } catch (error) {
        console.error('방 생성 실패:', error);
        res.status(500).json({ error: '방 생성에 실패했습니다.' });
    }
});

/**
 * 방 참가 시 게스트 권한 부여
 */
router.post('/rooms/:roomId/join', authenticateUser, async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    try {
        // 이미 참가한 사용자인지 확인
        const [existing] = await db.query(
            'SELECT * FROM room_permissions WHERE room_id = ? AND user_id = ?',
            [roomId, userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: '이미 참가한 방입니다.' });
        }

        // 게스트 권한 부여
        await db.query(
            'INSERT INTO room_permissions (room_id, user_id, role) VALUES (?, ?, ?)',
            [roomId, userId, 'guest']
        );

        res.json({ success: true });
    } catch (error) {
        console.error('방 참가 실패:', error);
        res.status(500).json({ error: '방 참가에 실패했습니다.' });
    }
});

/**
 * 호스트 전용 API - 게스트 강퇴
 */
router.post('/rooms/:roomId/kick', authenticateUser, checkHostPermission, async (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;

    try {
        await db.query(
            'DELETE FROM room_permissions WHERE room_id = ? AND user_id = ? AND role = ?',
            [roomId, userId, 'guest']
        );

        // 실시간으로 강퇴 알림
        io.to(roomId).emit('userKicked', { userId });
        res.json({ success: true });
    } catch (error) {
        console.error('사용자 강퇴 실패:', error);
        res.status(500).json({ error: '사용자 강퇴에 실패했습니다.' });
    }
});

/**
 * 사용자 권한 조회
 */
router.get('/rooms/:roomId/permissions', authenticateUser, async (req, res) => {
    const { roomId } = req.params;

    try {
        const [permissions] = await db.query(
            `SELECT u.nickname, rp.role 
             FROM room_permissions rp 
             JOIN users u ON rp.user_id = u.id 
             WHERE rp.room_id = ?`,
            [roomId]
        );

        res.json(permissions);
    } catch (error) {
        console.error('권한 조회 실패:', error);
        res.status(500).json({ error: '권한 조회에 실패했습니다.' });
    }
});

module.exports = router;
