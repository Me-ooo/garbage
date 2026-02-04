// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');

const app = express();
const port = 3000;

app.use(cors({
    origin: true, 
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ✅ สำคัญ: ตรวจสอบว่าโฟลเดอร์ uploads อยู่ระดับเดียวกับ server.js ไหม
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.send('Local Backend Server is Running! 🏠');
});

// 🚩 ปรับปรุงจุดนี้: ถ้าหน้าบ้านยิงมาที่ /api/auth/... 
// หลังบ้านต้องรับที่ /api/auth/... ให้ตรงกันครับ
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});