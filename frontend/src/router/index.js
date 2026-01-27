import { createRouter, createWebHistory } from 'vue-router';

import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Profile from '../components/Profile.vue';  
import Homepage from '../components/Homepage.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import reportimage from '../components/reportimage.vue';
import Reportpage from '../components/Reportpage.vue';

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
    // ❌ ลบ Route /dashboard ออกแล้ว เพราะเราใช้ AdminDashboard แทน
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
      meta: { requiresAuth: true }
    },
    {
      path: '/reportpage',
      name: 'reportpage',
      component: Reportpage,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    }
  ]
})

// ระบบป้องกัน (Navigation Guard)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // แปลง user string เป็น object อย่างปลอดภัย
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    user = {};
  }

  // 1. ถ้าหน้านั้นต้องการการล็อกอิน (requiresAuth) แต่ไม่มี Token
  if (to.meta.requiresAuth && !token) {
    return next('/login'); // กลับไปหน้า Login
  }

  // 2. ถ้าหน้านั้นต้องการ Admin (requiresAdmin) แต่ Role ไม่ใช่ admin
  if (to.meta.requiresAdmin && user.role !== 'admin') {
    alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (สำหรับผู้ดูแลระบบเท่านั้น)');
    return next('/'); // เด้งกลับหน้า Home
  }

  // 3. (เพิ่มเติม) ถ้าล็อกอินแล้ว แต่อยู่หน้า Login/Register ให้เด้งเข้าข้างในเลย
  if ((to.path === '/login' || to.path === '/register') && token) {
     if (user.role === 'admin') return next('/admin');
     return next('/');
  }

  next(); // อนุญาตให้ไปต่อ
})

export default router;