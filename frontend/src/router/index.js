import { createRouter, createWebHistory } from 'vue-router';

// Import Components
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Profile from '../components/Profile.vue';
import Homepage from '../components/Homepage.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import ReportPage from '../components/Reportpage.vue';
import SystemOverview from '../components/SystemOverview.vue';

// (Optional) ถ้ายังมีไฟล์นี้อยู่ก็ import เข้ามา
// import ReportImage from '../components/reportimage.vue'; 

const routes = [
  {
    path: '/',
    name: 'homepage',
    component: Homepage,
    meta: { title: 'หน้าหลัก' }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: 'เข้าสู่ระบบ' }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { title: 'สมัครสมาชิก' }
  },
  {
    path: '/reportpage',
    name: 'reportpage',
    component: ReportPage,
    meta: { requiresAuth: true, title: 'แจ้งปัญหา' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true, title: 'แก้ไขโปรไฟล์' }
  },
  // --- Admin Zone ---
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Admin Dashboard' }
  },
  {
    path: '/system-overview',
    name: 'SystemOverview',
    component: SystemOverview,
    meta: { requiresAuth: true, requiresAdmin: true, title: 'ภาพรวมระบบ' }
  },
];

const router = createRouter({
  // ✅ แก้ตรงนี้: เอา '/garbage/' ออก เพื่อให้ใช้บน Vercel ได้ถูกต้อง
  history: createWebHistory(),
  routes
});

// --- Navigation Guard (ระบบป้องกัน) ---
router.beforeEach((to, from, next) => {
  // 1. ตั้งชื่อ Title บน Browser Tab
  document.title = to.meta.title ? `${to.meta.title} - Garbage System` : 'Garbage System';

  const token = localStorage.getItem('token');
  
  // แปลง user string เป็น object อย่างปลอดภัย
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    user = {};
  }

  // 2. ถ้าหน้านั้นต้องการ Login (requiresAuth) แต่ไม่มี Token
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  // 3. ถ้าหน้านั้นต้องการ Admin (requiresAdmin) แต่ Role ไม่ใช่ admin
  if (to.meta.requiresAdmin && user.role !== 'admin') {
    alert('⛔ คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (สำหรับผู้ดูแลระบบเท่านั้น)');
    return next('/');
  }

  // 4. ถ้าล็อกอินอยู่แล้ว แต่อยากกลับไปหน้า Login/Register ให้เด้งเข้าข้างในเลย
  if ((to.path === '/login' || to.path === '/register') && token) {
     if (user.role === 'admin') return next('/system-overview'); // Admin ไปหน้าภาพรวม
     return next('/'); // User ทั่วไปไปหน้าแรก
  }

  next(); // อนุญาตให้ไปต่อ
});

export default router;