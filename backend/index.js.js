const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import Routes 
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin'); 
const usersRoutes = require('./routes/users'); // ✅ 1. เพิ่มบรรทัดนี้ (นำเข้าไฟล์ users)

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ เปิดให้เข้าถึงโฟลเดอร์ uploads ได้แบบ Static (สำคัญมากสำหรับโชว์รูป)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use Routes (เรียกใช้เส้นทางต่างๆ)
app.use('/api', authRoutes);         // สำหรับ Login/Register
app.use('/api/reports', reportRoutes); // สำหรับแจ้งปัญหา (User)
app.use('/api/admin', adminRoutes);  // สำหรับ Admin Dashboard
app.use('/api/users', usersRoutes);  // ✅ 2. เพิ่มบรรทัดนี้ (สำหรับแก้ไขโปรไฟล์ & ดูรายชื่อผู้ใช้)

// Start Server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});