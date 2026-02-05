const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==========================================
// 1. ตั้งค่า Multer (อัปโหลดรูปโปรไฟล์)
// ==========================================
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์ให้ไม่ซ้ำกัน
        cb(null, 'user-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ==========================================
// 2. ดึงรายชื่อ Users ทั้งหมด (สำหรับหน้า Admin)
// URL: /api/users
// ==========================================
router.get('/', async (req, res) => {
    try {
        // เลือกเฉพาะข้อมูลที่จำเป็น
        const sql = 'SELECT id, fullname, email, phone, role, image_url, created_at FROM users ORDER BY created_at DESC';
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
    }
});

// ==========================================
// 3. ดึงโปรไฟล์รายบุคคล (สำหรับหน้า Profile)
// URL: /api/users/:id
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // ⚠️ ลบ username ออก เพราะใน DB โอมมี่ไม่มีคอลัมน์นี้ (ใช้ fullname แทน)
        const sql = 'SELECT id, fullname, email, phone, role, image_url FROM users WHERE id = ?';
        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Fetch User Error:', err);
        res.status(500).json({ error: 'Database Error' });
    }
});

// ==========================================
// 4. อัปเดตโปรไฟล์ (สำหรับ User แก้ไขตัวเอง)
// URL: /api/users/update/:id
// ==========================================
router.put('/update/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, phone } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        let sql = 'UPDATE users SET fullname = ?, phone = ?';
        let params = [fullname, phone];

        if (imageUrl) {
            sql += ', image_url = ?';
            params.push(imageUrl);
        }
        sql += ' WHERE id = ?';
        params.push(id);

        await db.query(sql, params);

        // ดึงข้อมูลล่าสุดส่งกลับไปให้หน้าบ้านอัปเดต LocalStorage
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
// 5. เปลี่ยนสิทธิ์ผู้ใช้ (สำหรับ Admin Dashboard)
// URL: /api/users/:id/role
// ==========================================
router.put('/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // รับค่า role ที่ส่งมา (เช่น 'admin' หรือ 'user')

        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

        res.json({ message: `เปลี่ยนสิทธิ์เป็น ${role} เรียบร้อยแล้ว` });
    } catch (err) {
        console.error('Change Role Error:', err);
        res.status(500).json({ error: 'ไม่สามารถเปลี่ยนสิทธิ์ได้' });
    }
});

module.exports = router;