const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// --- 1. ตั้งค่าการอัปโหลดรูปภาพ ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // เก็บลงโฟลเดอร์ uploads
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์: report-เวลาปัจจุบัน.นามสกุล
        cb(null, 'report-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- 2. ดึงรายการปัญหาทั้งหมด (รองรับ Filter, Search และ Pagination) ---
router.get('/', (req, res) => {
    // รับค่า page และ limit จากหน้าเว็บ (ถ้าไม่ส่งมา ให้เริ่มหน้า 1, หน้าละ 6 รายการ)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const offset = (page - 1) * limit; // คำนวณจุดเริ่มต้นข้อมูล
    
    const { status, search } = req.query;
    
    // สร้าง SQL พื้นฐานสำหรับเงื่อนไข (WHERE)
    let whereSql = `FROM reports LEFT JOIN users ON reports.user_id = users.id WHERE 1=1`;
    const params = [];

    // เงื่อนไข Filter สถานะ
    if (status && status !== 'all') {
        whereSql += ' AND reports.status = ?';
        params.push(status);
    }

    // เงื่อนไข Search
    if (search) {
        whereSql += ' AND (reports.title LIKE ? OR reports.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    // --- Query 1: นับจำนวนรายการทั้งหมดก่อน (เพื่อเอาไปคำนวณจำนวนหน้า) ---
    const countSql = `SELECT COUNT(*) as total ${whereSql}`;
    
    db.query(countSql, params, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database Error (Count)' });
        }
        
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        // --- Query 2: ดึงข้อมูลจริง ตามหน้า (LIMIT, OFFSET) ---
        // เรียงลำดับล่าสุดก่อน และตัดเฉพาะหน้าที่ต้องการ
        const dataSql = `SELECT reports.*, users.fullname AS username ${whereSql} ORDER BY reports.created_at DESC LIMIT ? OFFSET ?`;
        
        // เพิ่ม params สำหรับ LIMIT และ OFFSET
        const dataParams = [...params, limit, offset];

        db.query(dataSql, dataParams, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database Error (Data)' });
            }
            
            // ส่งข้อมูลกลับไปพร้อมรายละเอียดหน้า
            res.json({
                data: results,      // รายการแจ้งปัญหา
                currentPage: page,  // หน้าปัจจุบัน
                totalPages: totalPages, // จำนวนหน้าทั้งหมด
                totalItems: totalItems  // จำนวนรายการทั้งหมด
            });
        });
    });
});
// --- 3. ดึงรายละเอียดปัญหาตาม ID ---
router.get('/:id', (req, res) => {
    const sql = `
        SELECT reports.*, users.fullname AS username 
        FROM reports 
        LEFT JOIN users ON reports.user_id = users.id 
        WHERE reports.id = ?
    `;
    
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ msg: 'ไม่พบรายงาน' });
        res.json(results[0]);
    });
});

// --- 4. แจ้งปัญหาใหม่ (POST) ---
router.post('/', upload.single('image'), (req, res) => {
    // รับค่าจาก Frontend (ต้องชื่อตรงกับ FormData ใน Vue)
    const { title, category, description, latitude, longitude, contact } = req.body;
    
    // สร้าง URL รูปภาพ
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    // TODO: ถ้ามีระบบ Login จริงจัง สามารถดึง user_id จาก Token ได้
    // ตอนนี้ใส่ NULL หรือ ID สมมติไปก่อนได้ถ้ายังไม่ได้ส่ง user_id มา
    const user_id = req.body.user_id || null; 

    const sql = `
        INSERT INTO reports (user_id, title, category, description, latitude, longitude, contact, image_url, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    db.query(sql, [user_id, title, category, description, latitude, longitude, contact, image_url], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ msg: 'แจ้งปัญหาสำเร็จ', reportId: result.insertId });
    });
});

module.exports = router;