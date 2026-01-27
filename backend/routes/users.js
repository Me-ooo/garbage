const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ 1. ดึงรายชื่อ users ทั้งหมด
router.get('/', (req, res) => {
    // เลือก fullname แทน username ให้ตรงกับ Database
    const sql = 'SELECT id, fullname, email, phone, role, created_at FROM users ORDER BY created_at DESC';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
        }
        res.json(results);
    });
});

// ✅ 2. ดึงข้อมูลผู้ใช้ระบุตาม ID (เผื่อไว้ใช้)
router.get('/me', (req, res) => {
    const { id } = req.query; // รับ id จาก query param
    if(!id) return res.status(400).json({ msg: 'ระบุ ID ผู้ใช้' });

    const sql = 'SELECT id, fullname, email, phone, role FROM users WHERE id = ?';

    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ msg: 'ไม่พบผู้ใช้' });
        
        res.json(results[0]);
    });
});

// ✅ 3. ลบผู้ใช้งาน (เปลี่ยนจาก PUT เป็น DELETE)
router.delete('/:id', (req, res) => {
    const userId = req.params.id;

    // ตรวจสอบก่อนว่ามี User นี้ไหม (Optional)
    const checkSql = 'SELECT * FROM users WHERE id = ?';
    db.query(checkSql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database Error' });
        if (results.length === 0) return res.status(404).json({ msg: 'ไม่พบผู้ใช้' });

        // ถ้ามี ก็สั่งลบเลย
        const deleteSql = 'DELETE FROM users WHERE id = ?';
        db.query(deleteSql, [userId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'ไม่สามารถลบผู้ใช้งานได้' });
            }
            res.json({ msg: `ลบผู้ใช้ ID ${userId} เรียบร้อยแล้ว` });
        });
    });
});

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, 'user-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// --- 2. ดึงข้อมูล User ทั้งหมด (สำหรับ Admin) ---
router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- 3. ลบ User (สำหรับ Admin) ---
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Loe User Success' });
    });
});

// --- 4. ✅ อัปเดตโปรไฟล์ (เปลี่ยนชื่อ, เบอร์, รูป) ---
router.put('/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const { fullname, phone } = req.body;
    
    // ถ้ามีการอัปโหลดรูปใหม่ ให้ใช้ path ใหม่, ถ้าไม่มี ให้เป็น null
    const newImage = req.file ? `/uploads/${req.file.filename}` : null;

    // Logic: ถ้า newImage มีค่า ให้อัปเดตรูปด้วย, ถ้าไม่มี ให้อัปเดตแค่ชื่อ/เบอร์
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
        if (err) return res.status(500).json({ error: err.message });

        // ดึงข้อมูลล่าสุดส่งกลับไป เพื่อให้ Frontend อัปเดต LocalStorage
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Update Profile Success', user: rows[0] });
        });
    });
});

module.exports = router;