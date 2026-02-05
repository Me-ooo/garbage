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
    // 🚩 ระบุชัดเจนว่าหน้านี้ไม่ต้องใช้ Admin (requiresAdmin: false)
    meta: { requiresAuth: true, requiresAdmin: false, title: 'โปรไฟล์ของฉัน' }
  },

  // --- Admin Zone (ต้อง Login + Role Admin) ---
  {
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
  // 1. ตั้งชื่อ Title บน Browser Tab
  document.title = to.meta.title ? `${to.meta.title} - Garbage System` : 'Garbage System';

  const token = localStorage.getItem('token');
  
  // ✅ 2. ดึง User แบบปลอดภัย (กัน Error เวลาข้อมูลไม่ครบ)
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") {
        user = JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Error parsing user data:", e);
    user = null;
  }

  const userRole = user ? user.role : null;

  // ✅ 3. เช็ค Login (ถ้าไม่มี Token ดีดไป Login)
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  // ✅ 4. เช็ค Admin (เฉพาะหน้าที่ระบุ requiresAdmin: true เท่านั้น)
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    // ถ้าไม่ใช่ Admin แต่พยายามเข้าหน้า Admin ให้ดีดกลับ Home
    return next('/'); 
  }

  // ✅ 5. ถ้า Login อยู่แล้ว แต่อยากกลับไปหน้า Login/Register
  if ((to.path === '/login' || to.path === '/register') && token) {
     if (userRole === 'admin') return next('/system-overview');
     return next('/'); 
  }

  // ผ่านทุกเงื่อนไข ไปต่อได้
  next(); 
});

export default router;