const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// ✅ 1. ดึงรายการแจ้งปัญหาทั้งหมด (สำหรับ Admin)
// ==========================================
router.get('/reports', async (req, res) => {
    try {
        // ใช้ JOIN เพื่อดึงชื่อคนแจ้ง (fullname) จากตาราง users มาแสดงด้วย
        const sql = `
            SELECT reports.*, users.fullname AS username 
            FROM reports 
            LEFT JOIN users ON reports.user_id = users.id 
            ORDER BY reports.created_at DESC
        `;
        
        // ใช้ .promise() เพื่อรอข้อมูลจาก TiDB Cloud
        const [results] = await db.promise().query(sql);
        res.json(results);

    } catch (err) {
        console.error('Admin Fetch Error:', err);
        res.status(500).json({ error: 'Database Error' });
    }
});

// ==========================================
// ✅ 2. อัปเดตสถานะงาน (PUT)
// ==========================================
router.put('/reports/:id/status', async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body; // รับค่า status ใหม่ (pending, in_progress, resolved)

        const sql = "UPDATE reports SET status = ? WHERE id = ?";

        await db.promise().query(sql, [status, id]);

        res.json({ message: 'อัปเดตสถานะเรียบร้อย' });

    } catch (err) {
        console.error('Update Status Error:', err);
        res.status(500).json({ error: 'อัปเดตสถานะไม่สำเร็จ' });
    }
});

// ==========================================
// ✅ 3. ลบรายการแจ้งปัญหา (DELETE)
// ==========================================
router.delete('/reports/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const sql = "DELETE FROM reports WHERE id = ?";

        await db.promise().query(sql, [id]);

        res.json({ message: 'ลบรายการเรียบร้อย' });

    } catch (err) {
        console.error('Delete Report Error:', err);
        res.status(500).json({ error: 'ลบรายการไม่สำเร็จ' });
    }
});

module.exports = router;