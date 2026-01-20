const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ดึรายการ users ทั้งหมด
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
    }
});

router.get('/me', async (req, res) => {
    const { id } = req.query; // รับ id 
    if(!id) return res.status(400).json({ msg: 'ระบุ ID ผู้ใช้' });

    try {
        const [users] = await db.query('SELECT id, username, email, role FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ msg: 'ไม่พบผู้ใช้' });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ msg: 'ไม่พบผู้ใช้' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ msg: `ลบผู้ใช้ ID ${userId} เรียบร้อยแล้ว` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ไม่สามารถลบผู้ใช้งานได้' });
    }
});

module.exports = router;