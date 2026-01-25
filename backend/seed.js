const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: 'localhost',
    user: 'root',      
    password: '', // ⚠️ ใช้รหัสผ่านที่คุณทดสอบแล้วผ่าน (น่าจะเป็นค่าว่าง '' ตามที่ error บอกว่า YES)
    database: 'garbage_db'
};

const seed = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database...');

        const adminEmail = 'admin@gmail.com';
        const adminPass = 'admin1234';
        let adminId = null; // 1. ประกาศตัวแปร adminId รอไว้ก่อนเลย

        // --- ส่วนจัดการ Admin ---
        const [existingAdmin] = await connection.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
        
        if (existingAdmin.length === 0) {
            // กรณีไม่มี: สร้างใหม่
            const hashedPassword = await bcrypt.hash(adminPass, 10);
            const [result] = await connection.query(
                `INSERT INTO users (username, email, password, role, provider) VALUES (?, ?, ?, 'admin', 'local')`,
                ['Super Admin', adminEmail, hashedPassword]
            );
            adminId = result.insertId; // เก็บ ID จากการสร้าง
            console.log(`✅ Admin created! (ID: ${adminId})`);
        } else {
            // กรณีมีแล้ว: ดึง ID มาใช้
            adminId = existingAdmin[0].id;
            console.log(`ℹ️ Admin user already exists. (ID: ${adminId})`);
        }

        // --- ส่วนจัดการ Reports (Dummy Data) ---
        // ตอนนี้ adminId มีค่าแน่นอนแล้ว ไม่ error แน่นอน
        const [reports] = await connection.query('SELECT * FROM reports');
        
        if (reports.length === 0) {
            const sql = `INSERT INTO reports (user_id, title, type, description, location_name, status) VALUES ?`;
            const values = [
                [adminId, 'ถังขยะล้นหน้าปากซอย 5', 'ขยะทั่วไป', 'ส่งกลิ่นเหม็นมาก รบกวนมาเก็บด้วยครับ', 'ปากซอยลาดพร้าว 5', 'pending'],
                [adminId, 'ท่อระบายน้ำตัน', 'น้ำเสีย', 'ฝนตกแล้วน้ำท่วมขัง ระบายไม่ทัน', 'ตลาดสดเทศบาล', 'in_progress'],
                [adminId, 'กิ่งไม้หักขวางถนน', 'ขยะชิ้นใหญ่', 'ต้นไม้ใหญ่ล้มทับทางเดิน', 'สวนสาธารณะกลางเมือง', 'resolved']
            ];
            await connection.query(sql, [values]);
            console.log('✅ Dummy reports created!');
        } else {
            console.log('ℹ️ Reports already exist.');
        }

        await connection.end();
        process.exit();
        
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seed();