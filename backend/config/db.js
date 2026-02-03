// backend/config/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',      // เชื่อมต่อเครื่องตัวเอง (XAMPP)
    user: 'root',           // User มาตรฐานของ XAMPP
    password: '',           // รหัสผ่านมาตรฐาน XAMPP
    database: 'garbage_db', // ชื่อ Database ใน phpMyAdmin
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ✅ เพิ่มส่วนตรวจสอบการเชื่อมต่อเบื้องต้น
// เพื่อแจ้งเตือนใน Console หากลืมเปิด MySQL ใน XAMPP
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('❌ Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('❌ Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('❌ Connection refused: กรุณาเปิด MySQL ใน XAMPP Control Panel ด้วยครับโอมมี่!');
        }
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('❌ Database not found: ไม่พบฐานข้อมูลชื่อ garbage_db ครับ');
        }
    }
    if (connection) {
        console.log('✅ Database Connected Successfully (XAMPP MySQL)');
        connection.release();
    }
    return;
});

// ส่งออกเป็น Promise Pool เพื่อให้ใช้ await ได้ตามที่โอมมี่เขียนไว้
module.exports = pool.promise();