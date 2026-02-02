const express = require('express');
const router = express.Router();
const db = require('../config/db'); // เรียกใช้ Database (Localhost)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // โหลดค่า Config จากไฟล์ .env

// ✅ ดึง Secret Key จาก .env (ถ้าลืมใส่ จะใช้ค่าสำรองเพื่อให้รันผ่าน)
const secretKey = process.env.JWT_SECRET || 'default_secret_key_for_dev';

// ==========================================
// ✅ 1. Register (สมัครสมาชิก)
// ==========================================
router.post('/', async (req, res) => {
    try {
        const { fullname, phone, email, password } = req.body;

        // 1. เช็คว่ามีอีเมลนี้หรือยัง
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
        }

        // 2. เข้ารหัสรหัสผ่าน (Hash)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. เพิ่ม User ใหม่
        const sql = 'INSERT INTO users (fullname, phone, email, password, role) VALUES (?, ?, ?, ?, "user")';
        await db.query(sql, [fullname, phone, email, hashedPassword]);

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ' });

    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ✅ 2. Login (เข้าสู่ระบบ)
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. ค้นหา User
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        const user = users[0];

        // 2. ตรวจสอบรหัสผ่าน (รองรับทั้งแบบ Hash และแบบ Social Login)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        // 3. สร้าง Token (Payload)
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role // 👈 สิทธิ์ admin จะถูกฝังไว้ในนี้
            }, 
            secretKey, 
            { expiresIn: '2h' } // ตั้งเวลาหมดอายุ 2 ชั่วโมง
        );

        res.json({ message: 'เข้าสู่ระบบสำเร็จ', token, user });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ✅ 3. Login Google/Facebook (Mock / Simple)
// ==========================================
router.post('/google-login-simple', async (req, res) => {
    try {
        const { email, name } = req.body;

        // เช็คว่ามี User นี้ไหม
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            // กรณีมีบัญชีอยู่แล้ว -> Login เลย
            const user = users[0];
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role }, 
                secretKey, 
                { expiresIn: '2h' }
            );
            res.json({ message: 'Mock Login OK', token, user });
        } else {
            // กรณีไม่มีบัญชี -> สมัครให้อัตโนมัติ
            // รหัสผ่านจะเป็นคำว่า "SOCIAL_LOGIN" (User ไม่รู้รหัสนี้ แต่เข้าระบบได้ผ่าน Google)
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