const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// ✅ 1. ตั้งค่า Connection สำหรับ Localhost (XAMPP)
const dbConfig = {
    host: 'localhost',
    user: 'root',      // User มาตรฐานของ XAMPP
    password: '',      // Password มาตรฐานของ XAMPP
    database: 'garbage_db', 
    port: 3306         
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
        const adminPass = '123456'; 
        let adminId = null;

        const [existingAdmin] = await connection.query('SELECT id FROM users WHERE email = ?', [adminEmail]);

        if (existingAdmin.length === 0) {
            const hashedPassword = await bcrypt.hash(adminPass, 10);
            
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
            const sql = `INSERT INTO reports (user_id, title, description, latitude, longitude, contact, status, image_url, created_at) VALUES ?`;
            
            const now = new Date();
            // 🚩 เพิ่มลิงก์รูปภาพตัวอย่างจากอินเทอร์เน็ตเพื่อให้หน้าเว็บดูสมบูรณ์
            const placeholderImg = 'https://via.placeholder.com/600x400?text=Garbage+Report';
            
            const values = [
                [adminId, '[ถังขยะไม่เพียงพอ] ขยะล้นหน้าปากซอย 5', 'ขยะตกค้างมาหลายวัน ส่งกลิ่นเหม็นมากครับ', 13.805, 100.555, '0812345678', 'pending', placeholderImg, now],
                [adminId, '[เจ้าหน้าที่ไม่มาเก็บขยะ] หมู่บ้านสิริกร', 'ปกติเข้าทุกวันจันทร์ แต่สัปดาห์นี้ยังไม่เห็นเลยครับ', 13.806, 100.556, '0899999999', 'in_progress', placeholderImg, now],
                [adminId, '[ขยะอันตราย] พบหลอดไฟแตกจำนวนมาก', 'มีคนเอามาทิ้งไว้ข้างกำแพงวัด กลัวเด็กเดินเหยียบครับ', 13.807, 100.557, '0811111111', 'resolved', placeholderImg, now]
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
        // 🚩 แจ้งเตือนกรณีลืมเปิด MySQL ใน XAMPP
        if (err.code === 'ECONNREFUSED') {
            console.error('❌ Error: ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาเปิด MySQL ใน XAMPP Control Panel');
        } else {
            console.error('❌ Error seeding data:', err);
        }
        process.exit(1);
    }
};

seed();