const express = require('express');
const router = express.Router(); // ✅ ต้องมีบรรทัดนี้
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // ถ้าไม่ได้ใช้ bcrypt ให้ลบบรรทัดนี้ออก แต่แนะนำให้มี

const secretKey = 'secret_key'; // ควรเก็บใน .env แต่ใส่ตรงนี้เพื่อความง่าย

// ==========================================
// ✅ 1. Register (สมัครสมาชิกปกติ)
// ==========================================
router.post('/register', (req, res) => {
    const { fullname, phone, email, password } = req.body;

    // เช็คว่ามีอีเมลนี้หรือยัง
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });

        // เพิ่ม User ใหม่
        // หมายเหตุ: ในการใช้งานจริงควร Hash Password ด้วย bcrypt
        const sql = 'INSERT INTO users (fullname, phone, email, password, role) VALUES (?, ?, ?, ?, "user")';
        db.query(sql, [fullname, phone, email, password], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ' });
        });
    });
});

// ==========================================
// ✅ 2. Login (เข้าสู่ระบบปกติ)
// ==========================================
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // ถ้าไม่เจอ User หรือ รหัสผ่านไม่ตรง
        if (results.length === 0 || results[0].password !== password) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        const user = results[0];
        // สร้าง Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            secretKey, 
            { expiresIn: '1h' }
        );

        res.json({ message: 'เข้าสู่ระบบสำเร็จ', token, user });
    });
});

// ==========================================
// ✅ 3. Login Google/Facebook (แบบจำลอง/Mock)
// ==========================================
router.post('/google-login-simple', (req, res) => {
    const { email, name } = req.body;

    // เช็คว่ามี User นี้ในระบบไหม
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            // A. มีแล้ว -> Login เลย
            const user = results[0];
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secretKey, { expiresIn: '1h' });
            res.json({ message: 'Mock Login OK', token, user });
        } else {
            // B. ยังไม่มี -> สมัครใหม่ให้อัตโนมัติ
            // Password ให้เป็น NULL หรือค่าว่างไว้ เพราะล็อกอินผ่าน Social
            const sqlInsert = 'INSERT INTO users (fullname, email, role, password) VALUES (?, ?, ?, NULL)';
            db.query(sqlInsert, [name, email, 'user'], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                
                const newUser = { id: result.insertId, email, role: 'user', fullname: name };
                const token = jwt.sign({ id: newUser.id, email: newUser.email, role: 'user' }, secretKey, { expiresIn: '1h' });
                res.json({ message: 'Mock Register OK', token, user: newUser });
            });
        }
    });
});

module.exports = router; // ✅ สำคัญมาก! ต้องส่งออก router เพื่อให้ server.js เอาไปใช้