const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ 1. ดึงรายชื่อ users ทั้งหมด
router.get('/', (req, res) => {
    // เลือก fullname แทน username ให้ตรงกับ Database
    const sql = 'SELECT id, fullname, email, phone, role, created_at FROM users ORDER BY created_at DESC';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
        }
        res.json(results);
    });
});

// ✅ 2. ดึงข้อมูลผู้ใช้ระบุตาม ID (เผื่อไว้ใช้)
router.get('/me', (req, res) => {
    const { id } = req.query; // รับ id จาก query param
    if(!id) return res.status(400).json({ msg: 'ระบุ ID ผู้ใช้' });

    const sql = 'SELECT id, fullname, email, phone, role FROM users WHERE id = ?';

    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ msg: 'ไม่พบผู้ใช้' });
        
        res.json(results[0]);
    });
});

// ✅ 3. ลบผู้ใช้งาน (เปลี่ยนจาก PUT เป็น DELETE)
router.delete('/:id', (req, res) => {
    const userId = req.params.id;

    // ตรวจสอบก่อนว่ามี User นี้ไหม (Optional)
    const checkSql = 'SELECT * FROM users WHERE id = ?';
    db.query(checkSql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database Error' });
        if (results.length === 0) return res.status(404).json({ msg: 'ไม่พบผู้ใช้' });

        // ถ้ามี ก็สั่งลบเลย
        const deleteSql = 'DELETE FROM users WHERE id = ?';
        db.query(deleteSql, [userId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'ไม่สามารถลบผู้ใช้งานได้' });
            }
            res.json({ msg: `ลบผู้ใช้ ID ${userId} เรียบร้อยแล้ว` });
        });
    });
});

module.exports = router;