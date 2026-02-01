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

// ✅ ใช้ PORT จากระบบ (Vercel) หรือใช้ 3000 ถ้าทดสอบในเครื่อง
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ เปิดให้เข้าถึงโฟลเดอร์ uploads (หมายเหตุ: บน Vercel รูปที่อัปโหลดจะหายไปเมื่อ Server รีเซ็ต)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use Routes
app.use('/api', authRoutes); 
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/users', usersRoutes); 

// ✅ Start Server (แบบรองรับ Vercel)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
}

// ⭐ บรรทัดนี้สำคัญที่สุดสำหรับ Vercel!
module.exports = app;