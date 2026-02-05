// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');

const app = express();
const port = 3000;

// ✅ Config CORS ให้รองรับ Cookie/Session
app.use(cors({
    origin: true, 
    credentials: true
}));

// ✅ ใช้ express.json() แทน body-parser (ทันสมัยกว่า)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ เปิดให้เข้าถึงรูปภาพในโฟลเดอร์ uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔍 Debug Logger: ช่วยดูว่ามี Request อะไรเข้ามาบ้าง
app.use((req, res, next) => {
    console.log(`📥 [${req.method}] ${req.url}`); // เช่น: [GET] /api/admin/stats
    next();
});

// Test Route
app.get('/', (req, res) => {
    res.send('Local Backend Server is Running! 🏠');
});

// ✅ เชื่อมต่อ Routes (สำคัญมาก!)
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes); // ถ้าบรรทัดนี้หาย หน้า AdminStats จะพัง
app.use('/api/users', usersRoutes);

app.listen(port, () => {
    console.log(`🚀 Backend server is running on http://localhost:${port}`);
});