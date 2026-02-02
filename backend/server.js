const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import Routes 
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin'); 
const usersRoutes = require('./途/users'); 

const app = express();

// ✅ ปรับ PORT ให้รองรับ Vercel
const port = process.env.PORT || 3000;

// ✅ 1. ปรับปรุง CORS ให้ยืดหยุ่น (สำคัญมากตอน Deploy)
app.use(cors({
    origin: '*', // ในช่วงส่งงานอาจารย์ใช้ '*' เพื่อให้เข้าถึงได้จากทุกที่
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 2. ปรับการเข้าถึงรูปภาพให้รองรับโครงสร้าง Vercel
// ใช้ process.cwd() เพื่อให้ Path แม่นยำเวลาอยู่บน Cloud
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('Backend Server is Running for Garbage System! 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

// ✅ 3. Error Handling กรณีหา Route ไม่เจอ (ป้องกันหน้าขาวบน Vercel)
app.use((req, res, next) => {
    res.status(404).json({ message: "API Path Not Found" });
});

// ✅ 4. Start Server (สำหรับการรันในเครื่อง)
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Backend server running on http://localhost:${port}`);
    });
}

// ⭐ บรรทัดนี้คือหัวใจสำคัญของ Serverless Function ใน Vercel
module.exports = app;