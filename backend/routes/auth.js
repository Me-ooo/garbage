const express = require('express');
const router = express.Router();
const db = require('../config/db'); // เรียกใช้ Database (Localhost)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // โหลดค่า Config จากไฟล์ .env

// ✅ 1. ตั้งค่า Secret Key (ใช้ Logic เดียวกับ Middleware เป๊ะๆ)
const secretKey = process.env.JWT_SECRET || 'default_secret_key_for_dev';

// 🛑 Debug: ปริ้นท์ค่า Key ออกมาดูว่าตรงกับ Middleware ไหม (ลบออกได้เมื่อใช้งานจริง)
console.log('🔑 Auth Route using Secret Key:', secretKey);

// ==========================================
// ✅ 2. Register (สมัครสมาชิก)
// ==========================================
router.post('/register', async (req, res) => { 
    try {
        const { fullname, phone, email, password } = req.body;
        // เช็คว่ามีอีเมลนี้หรือยัง
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
        }

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // เพิ่ม User ใหม่ (Default Role = user)
        const sql = 'INSERT INTO users (fullname, phone, email, password, role) VALUES (?, ?, ?, ?, "user")';
        await db.query(sql, [fullname, phone, email, hashedPassword]);

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ' });

    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ✅ 3. Login (เข้าสู่ระบบ)
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // ค้นหา User
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        const user = users[0];

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        // สร้าง Token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role // 👈 สำคัญ! สิทธิ์ admin ต้องอยู่ในนี้
            }, 
            secretKey, 
            { expiresIn: '2h' }
        );

        console.log(`✅ User ${user.email} logged in successfully.`);
        res.json({ message: 'เข้าสู่ระบบสำเร็จ', token, user });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ✅ 4. Login Google/Facebook (Mock / Simple)
// ==========================================
router.post('/google-login-simple', async (req, res) => {
    try {
        const { email, name } = req.body;

        // เช็คว่ามี User นี้ไหม
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            // Login
            const user = users[0];
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role }, 
                secretKey, 
                { expiresIn: '2h' }
            );
            res.json({ message: 'Mock Login OK', token, user });
        } else {
            // Register อัตโนมัติ
            const hashedPassword = await bcrypt.hash("SOCIAL_LOGIN", 10);
            
            const sqlInsert = 'INSERT INTO users (fullname, email, role, password) VALUES (?, ?, ?, ?)';
            const [result] = await db.query(sqlInsert, [name, email, 'user', hashedPassword]);
            
            const newUser = { id: result.insertId, email, role: 'user', fullname: name };
            const token = jwt.sign(
                { id: newUser.id, email: newUser.email, role: 'user' }, 
                secretKey, 
                { expiresIn: '2h' }
            );
            
            res.json({ message: 'Mock Register OK', token, user: newUser });
        }
    } catch (err) {
        console.error('Google Login Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;