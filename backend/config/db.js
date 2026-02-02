// backend/config/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',      // เชื่อมต่อเครื่องตัวเอง
    user: 'root',           // User มาตรฐานของ XAMPP
    password: '',           // รหัสผ่านมาตรฐาน XAMPP (ปกติจะว่างไว้)
    database: 'garbage_db', // ชื่อ Database ใน phpMyAdmin ของคุณ
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ส่งออกเป็น Promise Pool เพื่อให้ใช้ await ได้
module.exports = pool.promise();