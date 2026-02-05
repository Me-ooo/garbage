const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. ตั้งค่า Multer (เหมือนเดิม)
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        cb(null, 'user-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ✅ 2. ดึงรายชื่อ Users (ปรับให้ส่ง Path สั้นๆ)
router.get('/', async (req, res) => {
    try {
        const sql = 'SELECT id, fullname, email, phone, role, image_url, created_at FROM users ORDER BY created_at DESC';
        const [results] = await db.query(sql);
        // ส่ง results ไปตรงๆ ไม่ต้องบวก Protocol/Host
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
    }
});

// ✅ 3. ดึงโปรไฟล์รายบุคคล (สำหรับหน้า Profile)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT id, fullname, email, phone, role, image_url FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ 4. อัปเดตโปรไฟล์ (แก้ Path ให้ตรงกับที่ Frontend เรียก)
// 🚩 แก้จาก /:id เป็น /update/:id เพื่อให้ตรงกับ axios.put(`${baseUrl}/api/users/update/${user.value.id}`)
router.put('/update/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, phone } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
            // (Optional) โค้ดลบรูปเก่าโอมมี่ใส่เพิ่มตรงนี้ได้ครับ
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

        const [rows] = await db.query('SELECT id, fullname, email, phone, role, image_url FROM users WHERE id = ?', [id]);
        
        res.json({ 
            message: 'Update Profile Success', 
            user: rows[0] // ส่ง Path สั้นๆ กลับไป
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'SELECT id, fullname, username, email, phone, role, image_url FROM users WHERE id = ?';
        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
        }

        // ส่งข้อมูลกลับไปให้หน้าบ้าน (ไม่ต้องใส่ Full URL เพราะหน้าบ้านมี getImageUrl แล้ว)
        res.json(rows[0]);
    } catch (err) {
        console.error('Fetch User Error:', err);
        res.status(500).json({ error: 'Database Error' });
    }
});
module.exports = router;