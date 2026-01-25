const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import Routes (ประกาศแค่ตรงนี้ครั้งเดียวพอ)
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin'); // ✅

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use Routes (เรียกใช้ตรงนี้)
app.use('/api', authRoutes);         // สำหรับ Login/Register
app.use('/api/reports', reportRoutes); // สำหรับแจ้งปัญหา (User)
app.use('/api/admin', adminRoutes);  // ✅ สำหรับ Admin Dashboard

// Start Server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});