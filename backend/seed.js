const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // ✅ 1. เรียกใช้ไฟล์ .env เพื่อดึงรหัส Cloud

// ✅ 2. ตั้งค่า Connection ให้ไปที่ TiDB Cloud (ตามไฟล์ .env)
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    ssl: {
        rejectUnauthorized: true // TiDB บังคับใช้ SSL
    }
};

const seed = async () => {
    try {
        console.log('⏳ Connecting to TiDB Cloud...');
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database!');

        const adminEmail = 'admin@gmail.com';
        const adminPass = 'admin1234';
        let adminId = null;

        // --- ส่วนจัดการ Admin ---
        const [existingAdmin] = await connection.query('SELECT id FROM users WHERE email = ?', [adminEmail]);

        if (existingAdmin.length === 0) {
            // ✅ 3. แก้ชื่อคอลัมน์ให้ตรงกับตารางจริง (fullname, ตัด provider ทิ้ง)
            const hashedPassword = await bcrypt.hash(adminPass, 10);
            const [result] = await connection.query(
                `INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, 'admin')`,
                ['Super Admin', adminEmail, hashedPassword]
            );
            adminId = result.insertId;
            console.log(`✅ Admin created! (ID: ${adminId})`);
        } else {
            adminId = existingAdmin[0].id;
            console.log(`ℹ️ Admin user already exists. (ID: ${adminId})`);
        }

        // --- ส่วนจัดการ Reports (Dummy Data) ---
        const [reports] = await connection.query('SELECT * FROM reports');

        if (reports.length === 0) {
            // ✅ 4. แก้ชื่อคอลัมน์ให้ตรงเป๊ะ (user_id, title, category, description, latitude, longitude, contact, status)
            const sql = `INSERT INTO reports (user_id, title, category, description, latitude, longitude, contact, status) VALUES ?`;
            const values = [
                [adminId, 'ถังขยะล้นหน้าปากซอย 5', 'ถังขยะไม่เพียงพอ', 'ส่งกลิ่นเหม็นมาก รบกวนมาเก็บด้วยครับ', 13.805, 100.555, '0812345678', 'pending'],
                [adminId, 'ท่อระบายน้ำตัน', 'น้ำเสีย', 'ฝนตกแล้วน้ำท่วมขัง ระบายไม่ทัน', 13.806, 100.556, '0899999999', 'in_progress'],
                [adminId, 'กิ่งไม้หักขวางถนน', 'ขยะชิ้นใหญ่', 'ต้นไม้ใหญ่ล้มทับทางเดิน', 13.807, 100.557, '0811111111', 'resolved']
            ];
            await connection.query(sql, [values]);
            console.log('✅ Dummy reports created!');
        } else {
            console.log('ℹ️ Reports already exist.');
        }

        await connection.end();
        process.exit();

    } catch (err) {
        console.error('❌ Error seeding data:', err);
        process.exit(1);
    }
};

seed();