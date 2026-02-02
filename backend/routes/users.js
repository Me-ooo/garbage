const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ใช้ pool.promise()
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==========================================
// ✅ 1. ตั้งค่าการอัปโหลดไฟล์ (Multer)
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
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
    }
});

// ==========================================
// ✅ 3. ลบผู้ใช้งาน (DELETE)
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // ลบรูปภาพโปรไฟล์ทิ้งด้วย (ถ้ามี)
        const [user] = await db.query('SELECT image_url FROM users WHERE id = ?', [userId]);
        if (user.length > 0 && user[0].image_url) {
            const filePath = path.join(process.cwd(), user[0].image_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: `ลบผู้ใช้ ID ${userId} เรียบร้อยแล้ว` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ไม่สามารถลบผู้ใช้งานได้' });
    }
});

// ==========================================
// ✅ 4. อัปเดตโปรไฟล์ (เปลี่ยนชื่อ, เบอร์, รูป) (PUT)
// ==========================================
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        const { fullname, phone } = req.body;
        let newImage = req.file ? `/uploads/${req.file.filename}` : null;

        let sql, params;
        if (newImage) {
            sql = "UPDATE users SET fullname = ?, phone = ?, image_url = ? WHERE id = ?";
            params = [fullname, phone, newImage, id];
        } else {
            sql = "UPDATE users SET fullname = ?, phone = ? WHERE id = ?";
            params = [fullname, phone, id];
        }

        await db.query(sql, params);
        
        // ดึงข้อมูลใหม่ส่งกลับไป
        const [rows] = await db.query('SELECT id, fullname, email, phone, role, image_url FROM users WHERE id = ?', [id]);
        res.json({ 
            message: 'Update Profile Success', 
            user: rows[0] 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ✅ 5. เปลี่ยนสิทธิ์ผู้ใช้ (PUT /api/users/:id/role)
// 🔥 เพิ่มใหม่สำหรับให้ Admin จัดการกันเอง
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