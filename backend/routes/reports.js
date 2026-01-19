const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// ตั้งค่า Upload รูป
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'report-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// แจ้งปัญหาใหม่
router.post('/', upload.single('image'), async (req, res) => {
    const { user_id, title, type, location_name, lat, lng, description } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        await db.query(
            `INSERT INTO reports (user_id, title, type, location_name, latitude, longitude, description, image_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, title, type, location_name, lat, lng, description, image_url]
        );
        res.status(201).json({ msg: 'แจ้งปัญหาสำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ดึงรายการปัญหา (รองรับ Filter)
router.get('/', async (req, res) => {
    const { status, search } = req.query;
    let sql = 'SELECT r.*, u.username FROM reports r JOIN users u ON r.user_id = u.id WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
        sql += ' AND r.status = ?';
        params.push(status);
    }
    if (search) {
        sql += ' AND (r.title LIKE ? OR r.location_name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY created_at DESC';

    try {
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;