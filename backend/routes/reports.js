const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==========================================
// ✅ 1. ตั้งค่าการอัปโหลดไฟล์ (Multer)
// ==========================================
// ใช้ process.cwd() เพื่อให้หา path เจอแน่นอนเวลาอยู่บน Server
const uploadDir = path.join(process.cwd(), 'uploads');

// ตรวจสอบว่ามีโฟลเดอร์ uploads หรือไม่ ถ้าไม่มีให้สร้าง
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์: user-{timestamp}.นามสกุลเดิม
        cb(null, 'user-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ==========================================
// ✅ 2. ดึงรายชื่อ Users ทั้งหมด (GET)
// ==========================================
router.get('/', async (req, res) => {
    try {
        // ใช้ .promise() เพื่อให้ใช้ await ได้
        const sql = 'SELECT id, fullname, email, phone, role, image_url, created_at FROM users ORDER BY created_at DESC';
        const [results] = await db.promise().query(sql);
        res.json(results);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
    }
});

// ==========================================
// ✅ 3. ลบผู้ใช้งาน (DELETE)
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const sql = 'DELETE FROM users WHERE id = ?';
        
        await db.promise().query(sql, [userId]);
        
        res.json({ message: `ลบผู้ใช้ ID ${userId} เรียบร้อยแล้ว` });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'ไม่สามารถลบผู้ใช้งานได้' });
    }
});

// ==========================================
// ✅ 4. อัปเดตโปรไฟล์ (PUT)
// ==========================================
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        const { fullname, phone } = req.body;
        
        // ตรวจสอบว่ามีการอัปโหลดรูปใหม่มาหรือไม่
        let newImage = null;
        if (req.file) {
            newImage = `/uploads/${req.file.filename}`;
        }

        let sql = "";
        let params = [];

        if (newImage) {
            sql = "UPDATE users SET fullname = ?, phone = ?, image_url = ? WHERE id = ?";
            params = [fullname, phone, newImage, id];
        } else {
            sql = "UPDATE users SET fullname = ?, phone = ? WHERE id = ?";
            params = [fullname, phone, id];
        }

        // 1. อัปเดตข้อมูล
        await db.promise().query(sql, params);

        // 2. ดึงข้อมูลล่าสุดส่งกลับไป (เพื่อให้หน้าเว็บอัปเดตทันที)
        const [rows] = await db.promise().query('SELECT * FROM users WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
        }

        res.json({ 
            message: 'Update Profile Success', 
            user: rows[0] 
        });

    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;