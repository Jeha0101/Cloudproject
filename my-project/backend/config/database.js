const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'database',
    user: 'user',
    password: 'userpassword',
    database: 'mydb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 데이터베이스 연결 테스트
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
    }
};

testConnection();

module.exports = pool;
