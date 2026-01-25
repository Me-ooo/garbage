const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const adminRoutes = require('./routes/admin');

const app = express();
const port = 3000;

// --- 1. Middleware ---
app.use(cors());
app.use(bodyParser.json());

// ✅ เปิดให้หน้าเว็บเข้าถึงรูปภาพในโฟลเดอร์ uploads ได้
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 2. Import Routes (เรียกไฟล์ลูก) ---
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// --- 3. Use Routes (สร้างประตูทางเข้า) ---
app.use('/api', authRoutes);          // สำหรับ Login / Register
app.use('/api/reports', reportRoutes); // สำหรับ แจ้งปัญหา / ดูรายการ
app.use('/api/users', userRoutes);    // สำหรับ จัดการสมาชิก (Admin)
app.use('/api/admin', adminRoutes);   // สำหรับ จัดการงาน (Admin)

// Test Route (เผื่อเปิดเช็คว่า Server ดับไหม)
app.get('/', (req, res) => {
  res.send('Backend Server is running properly!');
});

// --- 4. Start Server ---
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});