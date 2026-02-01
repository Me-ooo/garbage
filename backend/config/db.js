const mysql = require('mysql2');
require('dotenv').config();

// สร้าง Connection Pool (รองรับ TiDB Cloud SSL)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Connection (เช็คว่าเชื่อมต่อได้ไหมตอนเริ่มรัน Server)
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database Connection Failed:', err.message);
  } else {
    console.log('✅ Connected to TiDB Cloud successfully!');
    connection.release();
  }
});

// ✅ สำคัญ: export เป็น promise() เพื่อให้ใช้ await db.query() ได้
module.exports = pool.promise();