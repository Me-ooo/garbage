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
const port = 3000;

// Middleware
// 🚩 แก้ไขจุดที่ 1: ปรับ CORS ให้รับได้ทุกเว็บและรับการล็อกอินได้
app.use(cors({
    origin: true,       // อนุญาตให้เว็บไหนก็ได้ที่เรียกเข้ามา (โดยเฉพาะลิงก์สุ่มของ ngrok)
    credentials: true   // อนุญาตให้ส่ง Cookies หรือ Token ล็อกอินข้ามมาได้
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ✅ เปิดให้เข้าถึงรูปภาพในเครื่อง
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.send('Local Backend Server is Running! 🏠');
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

// ✅ Start Server
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});