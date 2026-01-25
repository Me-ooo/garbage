const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ 1. ดึงรายการแจ้งปัญหาทั้งหมด (สำหรับ Admin)
// ต้อง JOIN ตาราง users เพื่อเอาชื่อคนแจ้ง (fullname)
router.get('/reports', (req, res) => {
    const sql = `
        SELECT reports.*, users.fullname AS username 
        FROM reports 
        LEFT JOIN users ON reports.user_id = users.id 
        ORDER BY reports.created_at DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database Error' });
        }
        res.json(results);
    });
});

// ✅ 2. อัปเดตสถานะงาน (PUT)
router.put('/reports/:id/status', (req, res) => {
    const id = req.params.id;
    const { status } = req.body; // รับค่า status ใหม่

    const sql = "UPDATE reports SET status = ? WHERE id = ?";

    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'อัปเดตสถานะไม่สำเร็จ' });
        }
        res.json({ message: 'อัปเดตสถานะเรียบร้อย' });
    });
});

// ✅ 3. ลบรายการแจ้งปัญหา (DELETE)
router.delete('/reports/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM reports WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'ลบรายการไม่สำเร็จ' });
        }
        res.json({ message: 'ลบรายการเรียบร้อย' });
    });
});

module.exports = router;