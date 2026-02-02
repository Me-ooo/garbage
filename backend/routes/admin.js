const express = require('express');
const router = express.Router();
const db = require('../config/db'); // เรียกใช้ Database
const fs = require('fs');
const path = require('path');

// ==========================================
// ✅ 1. ดึงรายการแจ้งปัญหาทั้งหมด (GET /api/admin/reports)
// ==========================================
router.get('/reports', async (req, res) => {
    try {
        // ใช้ JOIN เพื่อดึงชื่อคนแจ้ง (fullname) จากตาราง users มาแสดงด้วย
        // เพิ่ม user_id เผื่อต้องใช้ลิงก์ไปหน้าโปรไฟล์
        const sql = `
            SELECT reports.*, users.fullname AS username, users.email 
            FROM reports 
            LEFT JOIN users ON reports.user_id = users.id 
            ORDER BY reports.created_at DESC
        `;
        
        const [results] = await db.query(sql);
        res.json(results);

    } catch (err) {
        console.error('Admin Fetch Error:', err);
        res.status(500).json({ error: 'Database Error: ' + err.message });
    }
});

// ==========================================
// ✅ 2. อัปเดตสถานะงาน (PUT /api/admin/reports/:id/status)
// ==========================================
router.put('/reports/:id/status', async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body; // รับค่า status ใหม่ (pending, in_progress, resolved)

        const sql = "UPDATE reports SET status = ? WHERE id = ?";
        await db.query(sql, [status, id]);

        res.json({ message: 'อัปเดตสถานะเรียบร้อย' });

    } catch (err) {
        console.error('Update Status Error:', err);
        res.status(500).json({ error: 'อัปเดตสถานะไม่สำเร็จ' });
    }
});

// ==========================================
// ✅ 3. ลบรายการแจ้งปัญหา + ลบรูปภาพจริง (DELETE /api/admin/reports/:id)
// ==========================================
router.delete('/reports/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // 1. ค้นหาชื่อไฟล์รูปภาพก่อนลบ
        const [rows] = await db.query('SELECT image_url FROM reports WHERE id = ?', [id]);
        
        if (rows.length > 0) {
            const imagePath = rows[0].image_url; // เช่น /uploads/report-123.jpg

            // ถ้ามีรูปภาพ ให้ลบไฟล์ออกจากโฟลเดอร์ uploads ด้วย
            if (imagePath) {
                // แปลง Path ให้เป็นที่อยู่จริงในเครื่อง
                // __dirname คือโฟลเดอร์ routes, ต้องถอยออกมา 1 ขั้น (..) เพื่อเจอ uploads
                const fullPath = path.join(__dirname, '..', imagePath);

                // เช็คว่ามีไฟล์อยู่จริงไหม แล้วค่อยลบ
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath); // ลบไฟล์
                    console.log('Deleted file:', fullPath);
                }
            }
        }

        // 2. ลบข้อมูลใน Database
        const sql = "DELETE FROM reports WHERE id = ?";
        await db.query(sql, [id]);

        res.json({ message: 'ลบรายการและไฟล์รูปภาพเรียบร้อย' });

    } catch (err) {
        console.error('Delete Report Error:', err);
        res.status(500).json({ error: 'ลบรายการไม่สำเร็จ' });
    }
});

module.exports = router;