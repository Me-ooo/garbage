const express = require('express');
const router = express.Router();
const db = require('../config/db');


// ดึงรายการ users ทั้งหมด
router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ลบผู้ใช้
router.delete('/users/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'ลบผู้ใช้สำเร็จ', affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    };
}); 

// อัปเดตสถานะงาน
router.put('/reports/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE reports SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'อัปเดตสถานะงานสำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
       

// ลบงาน
router.delete('/reports/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
        res.json({ message: 'ลบงานสำเร็จ', affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;