const mysql = require('mysql2');
require('dotenv').config();

// ใช้ Connection Pool เพื่อประสิทธิภาพที่ดีบน Vercel (Serverless)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, // เช็คใน Vercel ดีๆ ว่าใส่ชื่อ 'test' หรือ 'garbage_db'
  port: process.env.DB_PORT || 4000,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Connection (จะโชว์ใน Log ของ Vercel)
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connecting error: ' + err.stack);
  } else {
    console.log('✅ Database connected to TiDB Cloud!');
    connection.release();
  }
});

module.exports = db;