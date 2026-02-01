const mysql = require('mysql2');
require('dotenv').config(); // โหลดค่าจาก .env

// เปลี่ยนจาก createConnection เป็น createPool เพื่อรองรับการทำงานบน Vercel ได้ดีขึ้น
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000, // TiDB ใช้ Port 4000
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true // TiDB บังคับเปิด SSL
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// เช็คการเชื่อมต่อ (Optional: เอาไว้ดู Log ว่าต่อติดไหม)
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connecting error: ' + err.stack);
  } else {
    console.log('✅ Database connected to TiDB Cloud!');
    connection.release(); // คืน Connection กลับเข้า Pool
  }
});

module.exports = db;