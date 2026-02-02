// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');

const app = express();
const port = 3000; // ล็อก Port 3000 ไว้เหมือนเดิม

// Middleware
app.use(cors()); // เปิดให้ Frontend เข้าถึงได้ง่ายๆ
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ✅ เปิดให้เข้าถึงรูปภาพในเครื่อง (สำคัญมากสำหรับ Localhost)
// เวลามีคนขอไฟล์ไปที่ http://localhost:3000/uploads/รูป.jpg มันจะมาหาในโฟลเดอร์นี้
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.send('Local Backend Server is Running! 🏠');
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

// ✅ Start Server แบบปกติ (ไม่ต้องมี if check ของ Vercel)
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});