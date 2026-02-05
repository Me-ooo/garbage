const express = require('express');
const router = express.Router();
const conn = require('../config/db'); 

// ==========================================
// 1. API ดึงภาพรวมระบบ (Dashboard Stats)
// URL: /api/admin/stats
// ==========================================
router.get('/stats', async (req, res) => {
    try {
        // 1. นับจำนวนสมาชิก
        const [users] = await conn.query("SELECT COUNT(*) as count FROM users");
        const totalUsers = users[0].count;

        // 2. นับจำนวนแจ้งปัญหา
        const [reports] = await conn.query("SELECT COUNT(*) as count FROM reports");
        const totalReports = reports[0].count;

        // 3. นับแยกสถานะ
        const [statusCounts] = await conn.query(`
            SELECT 
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
            FROM reports
        `);

        // ส่งข้อมูลกลับ (ใช้ชื่อตัวแปรให้ตรงกับหน้าบ้าน)
        res.json({
            totalUsers: totalUsers,
            totalReports: totalReports,
            pending: parseInt(statusCounts[0].pending || 0),
            inProgress: parseInt(statusCounts[0].inProgress || 0),
            resolved: parseInt(statusCounts[0].resolved || 0)
        });

    } catch (err) {
        console.error("❌ Stats Error:", err.message);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// ==========================================
// 2. API รายการแจ้งปัญหาทั้งหมด
// URL: /api/admin/reports
// ==========================================
router.get('/reports', async (req, res) => {
    try {
        // 🚩 แก้ไขจุดที่พัง: เปลี่ยน u.username เป็น u.email
        // เพราะตาราง users ของโอมมี่ไม่มี username ครับ
        const sql = `
            SELECT 
                r.*, 
                u.email, 
                u.fullname 
            FROM reports r 
            LEFT JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_at DESC
        `;
        const [rows] = await conn.query(sql);
        
        // แปลงข้อมูลนิดหน่อยให้หน้าบ้านใช้ง่าย (Map email ไปใส่ username แทน ถ้าหน้าบ้านเรียกใช้ username)
        const mappedRows = rows.map(row => ({
            ...row,
            username: row.fullname || row.email // ใช้ชื่อจริง หรือ อีเมล แทนชื่อเล่น
        }));

        res.json(mappedRows);

    } catch (err) {
        console.error("❌ Get Reports Error:", err.message);
        res.status(500).json({ message: "Database Error", error: err.message });
    }
});

// ==========================================
// 3. API อัปเดตสถานะ
// URL: /api/admin/reports/:id/status
// ==========================================
router.put('/reports/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await conn.query("UPDATE reports SET status = ? WHERE id = ?", [status, req.params.id]);
        res.json({ message: "Status updated" });
    } catch (err) {
        console.error("❌ Update Status Error:", err.message);
        res.status(500).json({ message: "Update failed", error: err.message });
    }
});

// ==========================================
// 4. API ลบรายงาน
// URL: /api/admin/reports/:id
// ==========================================
router.delete('/reports/:id', async (req, res) => {
    try {
        await conn.query("DELETE FROM reports WHERE id = ?", [req.params.id]);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        console.error("❌ Delete Error:", err.message);
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
});

module.exports = router;