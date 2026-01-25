import { createRouter, createWebHistory } from 'vue-router';

import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Dashboard from '../components/Dashboard.vue';        
import Homepage from '../components/Homepage.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import reportimage from '../component/reportimage.vue';
import Reportpage from '../components/Reportpage.vue';


const routes = createRouter({
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
      component: Dashboard
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard
    },
    {
      path: '/reportimage',
      name: 'reportimage',
      component: reportimage
    },
    {
       path: '/Reportpage',
      name: 'Reportpage',
      component: Reportpage
    }
  ]
})

    // 2. ระบบป้องกัน 
// เช็คก่อนเข้าหน้าต่างๆ 
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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