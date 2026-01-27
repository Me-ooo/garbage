const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==========================================
// ✅ 1. ตั้งค่าการอัปโหลดไฟล์ (Multer)
// ==========================================
const uploadDir = path.join(__dirname, '../uploads');
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
// ✅ 2. ดึงรายชื่อ Users ทั้งหมด (สำหรับ Admin Dashboard)
// ==========================================
router.get('/', (req, res) => {
    // เลือกข้อมูลที่จำเป็นรวมถึง image_url
    const sql = 'SELECT id, fullname, email, phone, role, image_url, created_at FROM users ORDER BY created_at DESC';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
        }
        res.json(results);
    });
});

// ==========================================
// ✅ 3. ลบผู้ใช้งาน (DELETE)
// ==========================================
router.delete('/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'DELETE FROM users WHERE id = ?';

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'ไม่สามารถลบผู้ใช้งานได้' });
        }
        res.json({ message: `ลบผู้ใช้ ID ${userId} เรียบร้อยแล้ว` });
    });
});

// ==========================================
// ✅ 4. อัปเดตโปรไฟล์ (เปลี่ยนชื่อ, เบอร์, รูป) (PUT)
// ==========================================
router.put('/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const { fullname, phone } = req.body;
    
    // ตรวจสอบว่ามีการอัปโหลดรูปใหม่มาหรือไม่
    let newImage = null;
    if (req.file) {
        newImage = `/uploads/${req.file.filename}`;
    }

    // Logic: ถ้า newImage มีค่า ให้อัปเดตช่อง image_url ด้วย
    // ถ้าไม่มี (newImage เป็น null) ให้อัปเดตแค่ชื่อกับเบอร์ (ใช้ SQL คนละชุด)
    let sql = "";
    let params = [];

    if (newImage) {
        sql = "UPDATE users SET fullname = ?, phone = ?, image_url = ? WHERE id = ?";
        params = [fullname, phone, newImage, id];
    } else {
        sql = "UPDATE users SET fullname = ?, phone = ? WHERE id = ?";
        params = [fullname, phone, id];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }

        // ดึงข้อมูล User ล่าสุดหลังอัปเดตส่งกลับไปให้ Frontend (สำคัญมากสำหรับ LocalStorage)
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // ส่งข้อมูลกลับไป
            res.json({ 
                message: 'Update Profile Success', 
                user: rows[0] 
            });
        });
    });
});

module.exports = router;