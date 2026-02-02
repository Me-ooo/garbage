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
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
    }
});

// ==========================================
// ✅ 3. ลบผู้ใช้งาน + ลบรูปโปรไฟล์ (DELETE)
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // 1. หาไฟล์รูปก่อนลบ
        const [user] = await db.query('SELECT image_url FROM users WHERE id = ?', [userId]);
        
        if (user.length > 0 && user[0].image_url) {
            const imageUrl = user[0].image_url;
            // แก้ Path ให้ถูกต้องสำหรับ Localhost (ตัด / ตัวหน้าออก)
            const relativePath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
            const filePath = path.join(process.cwd(), relativePath);

            // ลบไฟล์ถ้ามีอยู่จริง
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // 2. ลบข้อมูลใน DB
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: `ลบผู้ใช้ ID ${userId} เรียบร้อยแล้ว` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ไม่สามารถลบผู้ใช้งานได้' });
    }
});

// ==========================================
// ✅ 4. อัปเดตโปรไฟล์ (เปลี่ยนชื่อ, เบอร์, รูป) (PUT)
// 🔥 เพิ่มฟังก์ชันลบรูปเก่าทิ้งให้ด้วย
// ==========================================
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        const { fullname, phone } = req.body;
        
        // ถ้ามีการอัปโหลดรูปใหม่
        let newImage = req.file ? `/uploads/${req.file.filename}` : null;

        if (newImage) {
            // 🔥 หาและลบรูปเก่าทิ้งก่อน (เพื่อไม่ให้หนักเครื่อง)
            const [oldUser] = await db.query('SELECT image_url FROM users WHERE id = ?', [id]);
            if (oldUser.length > 0 && oldUser[0].image_url) {
                const oldUrl = oldUser[0].image_url;
                const oldPath = path.join(process.cwd(), oldUrl.startsWith('/') ? oldUrl.substring(1) : oldUrl);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath); // ลบรูปเก่า
                }
            }

            // อัปเดตข้อมูลพร้อมรูปใหม่
            const sql = "UPDATE users SET fullname = ?, phone = ?, image_url = ? WHERE id = ?";
            await db.query(sql, [fullname, phone, newImage, id]);
        } else {
            // อัปเดตแค่ข้อมูล (รูปเดิม)
            const sql = "UPDATE users SET fullname = ?, phone = ? WHERE id = ?";
            await db.query(sql, [fullname, phone, id]);
        }

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