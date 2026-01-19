<script setup>
import { ref } from 'vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'

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
    <Register v-else @change-page="togglePage" />
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