<script setup>
import { ref } from 'vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Homepage from './components/Homepage.vue'
import Dashboard from './components/Dashboard.vue'

// สร้างตัวแปรไว้สลับหน้า (ค่าเริ่มต้นคือ login)
const currentPage = ref('login')

// ฟังก์ชันสำหรับเปลี่ยนหน้า
const togglePage = (pageName) => {
  currentPage.value = pageName
}
</script>

<template>
  <div class="app-main">
    <Login v-if="currentPage === 'login'" @change-page="togglePage" />
    <Register v-else-if="currentPage === 'register'" @change-page="togglePage" />
    <Homepage v-else-if="currentPage === 'homepage'" @change-page="togglePage" />
    <Dashboard v-else-if="currentPage === 'dashboard'" />
  </div>
</template>

<style>
/* ลบขอบขาวเริ่มต้นของ Browser */
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.app-main {
  width: 100vw;
  height: 100vh;
}
</style>