import { createRouter, createWebHistory } from 'vue-router';

import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Dashboard from '../components/Dashboard.vue';
import Homepage from '../components/Homepage.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import reportimage from '../components/reportimage.vue';
import Reportpage from '../components/Reportpage.vue';

// 1. แก้ชื่อตัวแปรจาก routes เป็น router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'homepage',
      component: Homepage
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true } // ✅ ต้องล็อกอินถึงเข้าได้
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: { requiresAuth: true, requiresAdmin: true } // ✅ ต้องเป็น Admin เท่านั้น
    },
    {
      path: '/reportimage',
      name: 'reportimage',
      component: reportimage,
      meta: { requiresAuth: true } // ✅ ต้องล็อกอินถึงเข้าได้
    },
    {
       path: '/reportpage', // 🔄 แก้เป็นตัวเล็กให้เหมือนกัน
      name: 'reportpage',   // 🔄 แก้เป็นตัวเล็ก
      component: Reportpage,
      meta: { requiresAuth: true } // ✅ ต้องล็อกอินถึงเข้าได้
    }
  ]
})

// 2. ระบบป้องกัน 
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  // แปลง user string เป็น object อย่างปลอดภัย
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    user = {};
  }

  // ถ้าหน้านั้นต้องการการล็อกอิน (requiresAuth) แต่ไม่มี Token
  if (to.meta.requiresAuth && !token) {
    return next('/login'); // กลับไปหน้า Login
  }

  // ถ้าหน้านั้นต้องการ Admin (requiresAdmin) แต่ Role ไม่ใช่ admin
  if (to.meta.requiresAdmin && user.role !== 'admin') {
    alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
    return next('/'); // กลับไปหน้า Home
  }

  next(); // อนุญาตให้ไปต่อ
})

export default router;