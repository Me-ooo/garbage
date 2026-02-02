const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// ✅ 1. ตั้งค่า Connection สำหรับ Localhost (XAMPP)
// ไม่ต้องใช้ .env ก็ได้ถ้าเป็น Localhost เพื่อความง่าย
const dbConfig = {
    host: 'localhost',
    user: 'root',      // User มาตรฐานของ XAMPP
    password: '',      // Password มาตรฐานของ XAMPP (ว่างไว้)
    database: 'garbage_db', // ตรวจสอบชื่อ DB ให้ถูกต้อง
    port: 3306         // Port มาตรฐานของ MySQL
};

const seed = async () => {
    try {
        console.log('⏳ Connecting to Localhost Database...');
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database!');

        // ==========================================
        // 1. สร้าง Admin (ถ้ายังไม่มี)
        // ==========================================
        const adminEmail = 'admin@gmail.com';
        const adminPass = '123456'; // รหัสผ่านง่ายๆ สำหรับทดสอบ
        let adminId = null;

        const [existingAdmin] = await connection.query('SELECT id FROM users WHERE email = ?', [adminEmail]);

        if (existingAdmin.length === 0) {
            const hashedPassword = await bcrypt.hash(adminPass, 10);
            
            // เพิ่ม column 'phone' เพื่อให้ตรงกับโครงสร้างตาราง users
            const [result] = await connection.query(
                `INSERT INTO users (fullname, email, password, phone, role) VALUES (?, ?, ?, ?, 'admin')`,
                ['Super Admin', adminEmail, hashedPassword, '0999999999']
            );
            adminId = result.insertId;
            console.log(`✅ Admin created! (Email: ${adminEmail}, Pass: ${adminPass})`);
        } else {
            adminId = existingAdmin[0].id;
            console.log(`ℹ️ Admin user already exists. (ID: ${adminId})`);
        }

        // ==========================================
        // 2. สร้าง Reports จำลอง (Dummy Data)
        // ==========================================
        const [reports] = await connection.query('SELECT * FROM reports');

        if (reports.length === 0) {
            // ✅ ปรับชื่อคอลัมน์ให้ตรงกับ reports.js (ตัด category ออก, เพิ่ม image_url)
            const sql = `INSERT INTO reports (user_id, title, description, latitude, longitude, contact, status, image_url) VALUES ?`;
            
            const values = [
                [adminId, 'ถังขยะล้นหน้าปากซอย 5', 'ส่งกลิ่นเหม็นมาก รบกวนมาเก็บด้วยครับ', 13.805, 100.555, '0812345678', 'pending', null],
                [adminId, 'ท่อระบายน้ำตัน', 'ฝนตกแล้วน้ำท่วมขัง ระบายไม่ทัน', 13.806, 100.556, '0899999999', 'in_progress', null],
                [adminId, 'กิ่งไม้หักขวางถนน', 'ต้นไม้ใหญ่ล้มทับทางเดินสัญจรลำบาก', 13.807, 100.557, '0811111111', 'resolved', null]
            ];

            await connection.query(sql, [values]);
            console.log('✅ Dummy reports created!');
        } else {
            console.log('ℹ️ Reports already exist.');
        }

        await connection.end();
        console.log('🎉 Seeding completed successfully!');
        process.exit();

    } catch (err) {
        console.error('❌ Error seeding data:', err);
        process.exit(1);
    }
};

seed();