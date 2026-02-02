const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==========================================
// ✅ 1. ตั้งค่าการอัปโหลดไฟล์ (Multer)
// ==========================================
// ใช้ process.cwd() เพื่ออ้างอิงจาก Root ของโปรเจกต์ (backend/)
const uploadDir = path.join(process.cwd(), 'uploads');

// ถ้ายังไม่มีโฟลเดอร์ uploads ให้สร้างใหม่ทันที
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์เป็น report-เวลา-ชื่อเดิม
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
        
        let imageUrl = null;
        if (req.file) {
            // เก็บ Path เป็น /uploads/ชื่อไฟล์.jpg
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
router.get('/', async (req, res) => {
    try {
        // JOIN กับตาราง users เพื่อเอาชื่อคนแจ้งมาแสดง
        const sql = `
            SELECT r.*, u.fullname as username 
            FROM reports r 
            LEFT JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_at DESC
        `;
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error('Fetch Reports Error:', err);
        res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
    }
});

// ==========================================
// ✅ 4. อัปเดตสถานะขยะ (PUT /api/reports/:id/status)
// ==========================================
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // รับค่า 'pending', 'in_progress', 'resolved'

        const sql = 'UPDATE reports SET status = ? WHERE id = ?';
        await db.query(sql, [status, id]);

        res.json({ message: 'อัปเดตสถานะเรียบร้อยแล้ว', status });
    } catch (err) {
        console.error('Update Status Error:', err);
        res.status(500).json({ error: 'ไม่สามารถอัปเดตสถานะได้' });
    }
});

// ==========================================
// ✅ 5. ลบรายงาน + ลบรูปภาพจริง (DELETE /api/reports/:id)
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. หาชื่อไฟล์รูปภาพก่อนลบ
        const [report] = await db.query('SELECT image_url FROM reports WHERE id = ?', [id]);
        
        if (report.length > 0 && report[0].image_url) {
            const imageUrl = report[0].image_url; // เช่น /uploads/file.jpg
            
            // แก้ไข Path ให้ถูกต้องสำหรับ Localhost
            // ตัด '/' ตัวหน้าออก เพื่อให้ path.join ทำงานถูกต้องกับ process.cwd()
            const relativePath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
            const filePath = path.join(process.cwd(), relativePath);

            // ตรวจสอบว่ามีไฟล์จริงไหม แล้วค่อยลบ
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Deleted Image: ${filePath}`);
            }
        }

        // 2. ลบข้อมูลใน Database
        await db.query('DELETE FROM reports WHERE id = ?', [id]);
        
        res.json({ message: 'ลบรายงานเรียบร้อยแล้ว' });

    } catch (err) {
        console.error('Delete Report Error:', err);
        res.status(500).json({ error: 'ไม่สามารถลบข้อมูลได้' });
    }
});

module.exports = router;