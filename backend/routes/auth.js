const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // เช็คอีเมลซ้ำ
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ msg: 'อีเมลนี้ถูกใช้งานแล้ว' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
            [username, email, hashedPassword]);
        res.status(201).json({ msg: 'สมัครสมาชิกสำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ msg: 'ไม่พบผู้ใช้งาน' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'รหัสผ่านไม่ถูกต้อง' });

        const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// หมายเหตุ: Login Google/FB ต้องใช้ Library 'passport' เพิ่มเติม แต่โครงสร้าง API จะคล้ายกัน
module.exports = router;