const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ใช้ pool.promise()
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==========================================
// ✅ 1. ตั้งค่าการอัปโหลดไฟล์ (Multer)
// ==========================================
// ใช้ process.cwd() เพื่อให้ชัวร์ว่าอ้างอิงจาก Root Project
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'user-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ==========================================
// ✅ 2. ดึงรายชื่อ Users ทั้งหมด (สำหรับ Admin Dashboard)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const sql = 'SELECT id, fullname, email, phone, role, image_url, created_at FROM users ORDER BY created_at DESC';
        const [results] = await db.query(sql);

        // 🚩 ปรับให้ส่ง Full URL กลับไป (รองรับ ngrok)
        const updatedResults = results.map(user => ({
            ...user,
            image_url: user.image_url 
                ? `${req.protocol}://${req.get('host')}${user.image_url}` 
                : null
        }));

        res.json(updatedResults);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
    }
});

// ==========================================
// ✅ 4. อัปเดตโปรไฟล์ (ในส่วนการส่งข้อมูลกลับ)
// ==========================================
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        // ... โค้ดส่วน Update เดิมของโอมมี่ (ถูกต้องแล้ว) ...

        // 🚩 ตอนดึงข้อมูลใหม่ส่งกลับไป ให้แก้ตรงนี้ด้วยครับ
        const [rows] = await db.query('SELECT id, fullname, email, phone, role, image_url FROM users WHERE id = ?', [id]);
        const updatedUser = {
            ...rows[0],
            image_url: rows[0].image_url 
                ? `${req.protocol}://${req.get('host')}${rows[0].image_url}` 
                : null
        };
        
        res.json({ 
            message: 'Update Profile Success', 
            user: updatedUser 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ✅ 5. เปลี่ยนสิทธิ์ผู้ใช้ (PUT /api/users/:id/role)
// ==========================================
router.put('/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // รับค่า 'user' หรือ 'admin'

        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ message: 'เปลี่ยนสิทธิ์ผู้ใช้งานเรียบร้อยแล้ว' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ไม่สามารถเปลี่ยนสิทธิ์ได้' });
    }
});

module.exports = router;