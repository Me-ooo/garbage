import { createRouter, createWebHistory } from 'vue-router';

// ==========================================
// 📂 Import Components 
// ==========================================
import Homepage from '../components/Homepage.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Profile from '../components/Profile.vue';
import ReportPage from '../components/Reportpage.vue'; 

// Admin Zone
import AdminDashboard from '../components/AdminDashboard.vue';
import SystemOverview from '../components/SystemOverview.vue';

const routes = [
  // --- Public Routes ---
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

  // --- User Routes (ต้อง Login) ---
  {
    path: '/reportpage', 
    name: 'reportpage',
    component: ReportPage,
    meta: { requiresAuth: true, title: 'แจ้งปัญหาขยะ' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true, title: 'โปรไฟล์ของฉัน' }
  },

  // --- Admin Zone (ต้อง Login + Role Admin) ---
  {
    // 🚩 แก้ไข: เปลี่ยนจาก /admin เป็น /admin-dashboard ให้ตรงกับ SystemOverview
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard, 
    meta: { requiresAuth: true, requiresAdmin: true, title: 'จัดการระบบ' }
  },
  {
    path: '/system-overview',
    name: 'SystemOverview',
    component: SystemOverview, 
    meta: { requiresAuth: true, requiresAdmin: true, title: 'ภาพรวมระบบ' }
  },
  
  // Catch-all (ถ้าพิมพ์มั่วให้กลับหน้าแรก)
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// ==========================================
// 🔒 Navigation Guards (ระบบป้องกันการเข้าถึง)
// ==========================================
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - Garbage System` : 'Garbage System';

  const token = localStorage.getItem('token');
  
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    user = {};
  }

  // 2. เช็คว่าหน้านี้ต้องการ Login หรือไม่?
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  // 3. เช็คว่าหน้านี้ต้องการ Admin หรือไม่?
  if (to.meta.requiresAdmin && user.role !== 'admin') {
    // alert('⛔ ขออภัย! หน้านี้สำหรับผู้ดูแลระบบเท่านั้น'); // เอา alert ออกก็ได้ถ้ารำคาญ
    return next('/'); 
  }

  // 4. ถ้า Login อยู่แล้ว แต่อยากกลับไปหน้า Login/Register
  if ((to.path === '/login' || to.path === '/register') && token) {
     if (user.role === 'admin') return next('/system-overview');
     return next('/'); 
  }

  next(); 
});

export default router;