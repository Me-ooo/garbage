const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ควรเก็บใน .env แต่ใส่ตรงนี้เพื่อความง่ายในการทดสอบ
const secretKey = 'secret_key'; 

// ==========================================
// ✅ 1. Register (สมัครสมาชิก)
// ==========================================
router.post('/', async (req, res) => {
    try {
        const { fullname, phone, email, password } = req.body;

        // 1. เช็คว่ามีอีเมลนี้หรือยัง (ตัด .promise() ออกแล้ว)
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
        }

        // 2. เข้ารหัสรหัสผ่าน (Hash)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. เพิ่ม User ใหม่ (ตัด .promise() ออกแล้ว)
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

        // 1. ค้นหา User (ตัด .promise() ออกแล้ว)
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        const user = users[0];

        // 2. ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        // 3. สร้าง Token
      const token = jwt.sign(
    { 
        id: user.id, 
        email: user.email, 
        role: user.role // 👈 ต้องมีบรรทัดนี้ เพื่อให้สิทธิ์ admin ติดไปกับ Token
    }, 
    secretKey, 
    { expiresIn: '1h' }
);

        res.json({ message: 'เข้าสู่ระบบสำเร็จ', token, user });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ✅ 3. Login Google/Facebook (Mock)
// ==========================================
router.post('/google-login-simple', async (req, res) => {
    try {
        const { email, name } = req.body;

        // เช็คว่ามี User นี้ไหม (ตัด .promise() ออกแล้ว)
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            const user = users[0];
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secretKey, { expiresIn: '1h' });
            res.json({ message: 'Mock Login OK', token, user });
        } else {
            // สมัครใหม่ให้อัตโนมัติ (ตัด .promise() ออกแล้ว)
            const sqlInsert = 'INSERT INTO users (fullname, email, role, password) VALUES (?, ?, ?, "SOCIAL_LOGIN")';
            const [result] = await db.query(sqlInsert, [name, email, 'user']);
            
            const newUser = { id: result.insertId, email, role: 'user', fullname: name };
            const token = jwt.sign({ id: newUser.id, email: newUser.email, role: 'user' }, secretKey, { expiresIn: '1h' });
            
            res.json({ message: 'Mock Register OK', token, user: newUser });
        }
    } catch (err) {
        console.error('Google Login Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;