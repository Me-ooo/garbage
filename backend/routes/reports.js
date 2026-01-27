const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ 1. ตั้งค่าการอัปโหลดไฟล์ (Multer)
// เช็คว่ามีโฟลเดอร์ uploads ไหม ถ้าไม่มีให้สร้าง
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // เก็บไฟล์ในโฟลเดอร์ uploads
    },
    filename: function (req, file, cb) {
        // ตั้งชื่อไฟล์ใหม่กันซ้ำ (เช่น report-123456789.jpg)
        cb(null, 'report-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ✅ 2. API รับแจ้งปัญหา (POST)
// ใช้ upload.single('image') เพื่อรับไฟล์รูปภาพ
router.post('/', upload.single('image'), (req, res) => {
    // รับค่าจาก Form Data
    const { category, title, description, latitude, longitude, contact, user_id } = req.body;
    
    // สร้าง URL ของรูปภาพ (ถ้ามีการแนบไฟล์)
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `
        INSERT INTO reports 
        (user_id, category, title, description, latitude, longitude, contact, image_url, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    db.query(sql, [user_id, category, title, description, latitude, longitude, contact, image_url], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database Error' });
        }
        res.status(201).json({ message: 'แจ้งปัญหาสำเร็จ', reportId: result.insertId });
    });
});

// ✅ 3. API ดึงรายการปัญหา (สำหรับหน้า Home ของ User)
// (อันนี้ของเดิมที่คุณมีอยู่แล้ว แปะไว้ให้ครบชุด)
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const offset = (page - 1) * limit;
    const { status, search } = req.query;

    let whereSql = `FROM reports LEFT JOIN users ON reports.user_id = users.id WHERE 1=1`;
    const params = [];

    if (status && status !== 'all') {
        whereSql += ' AND reports.status = ?';
        params.push(status);
    }
    if (search) {
        whereSql += ' AND (reports.title LIKE ? OR reports.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    const countSql = `SELECT COUNT(*) as total ${whereSql}`;
    
    db.query(countSql, params, (err, countResult) => {
        if (err) return res.status(500).json({ error: 'Count Error' });
        
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        const dataSql = `SELECT reports.*, users.fullname AS username ${whereSql} ORDER BY reports.created_at DESC LIMIT ? OFFSET ?`;
        const dataParams = [...params, limit, offset];

        db.query(dataSql, dataParams, (err, results) => {
            if (err) return res.status(500).json({ error: 'Data Error' });
            res.json({
                data: results,
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems
            });
        });
    });
});

module.exports = router;