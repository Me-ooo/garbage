const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'garbage_db',
};

const seed = async () => {
    try {
        const connection =await mysql.createConnection(dbConfig);
        console.log('Connected to the database.');

        // 1.Create admin user
        const adminEmail = 'admin@gmail,com'; // อีเมลสำหรับเข้าสู่ระบบแอดมิน
        const adminPassword = 'admin1234'; // รหัสผ่านแอดมิน

        const [existingAdmin] = await connection.query('SELECT * FROM users WHERE email = ?', [adminEmail]);

        if (existingAdmin.length === 0) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await connection.query(
                `INSERT INTO users (username, email, password, role, provider) VALUES (?, ?, ?, 'admin', 'local')`,
                ['Super Admin', adminEmail, hashedPassword]
            );
            console.log(`✅ Admin created! Email: ${adminEmail} | Pass: ${adminPassword}`);
        } else {
            console.log('ℹ️ Admin user already exists.');
        }
        // 2. หา ID ของ Admin เพื่อเอามาใส่ในโพสต์ตัวอย่าง
        // 3. สร้างข้อมูลปัญหาตัวอย่าง (Dummy Data)
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