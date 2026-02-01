const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ไฟล์ db.js ที่เป็น pool.promise() แล้ว
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==========================================
// ✅ 1. ตั้งค่าการอัปโหลดไฟล์รูปภาพขยะ
// ==========================================
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'report-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ==========================================
// ✅ 2. แจ้งปัญหาใหม่ (POST /api/reports)
// ==========================================
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, description, latitude, longitude, contact, user_id } = req.body;
        
        // จัดการเรื่องรูปภาพ
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const sql = `
            INSERT INTO reports (user_id, title, description, latitude, longitude, contact, image_url, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `;
        
        const [result] = await db.query(sql, [
            user_id || null, 
            title, 
            description, 
            latitude, 
            longitude, 
            contact, 
            imageUrl
        ]);

        res.status(201).json({ 
            message: 'ส่งรายงานสำเร็จ!', 
            reportId: result.insertId 
        });

    } catch (err) {
        console.error('Report Error:', err);
        res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลได้: ' + err.message });
    }
});

// ==========================================
// ✅ 3. ดึงรายการแจ้งปัญหาทั้งหมด (GET /api/reports)
// ==========================================
// ✅ ส่วนสำหรับดึงข้อมูลมาโชว์หน้า Home
router.get('/', async (req, res) => {
    try {
        // ใช้ LEFT JOIN เพื่อเอาชื่อคนแจ้งมาโชว์ด้วย
        const sql = `
            SELECT r.*, u.fullname as username 
            FROM reports r 
            LEFT JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_at DESC
        `;
        const [results] = await db.query(sql); //
        res.json(results);
    } catch (err) {
        console.error('Fetch Reports Error:', err);
        res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
    }
});

module.exports = router;