<script setup>
// ไม่ต้อง import Components หน้าอื่นๆ เข้ามาแล้ว
// ไม่ต้องมีตัวแปร currentPage หรือ togglePage แล้ว
</script>

<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<style>
/* Style หลักของ Container */
.app-container {
  /* max-width: 500px;  <-- ถ้าทำเว็บ Desktop แนะนำให้ลบบรรทัดนี้ออกครับ ไม่งั้นหน้าจอจะแคบ */
  margin: 0 auto;
  min-height: 100vh;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  background-color: white; /* เปลี่ยนจาก flex-direction: white (ที่ผิด) เป็น background-color */
}

body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  /* overflow: hidden; <-- ลบออกครับ เพื่อให้หน้ายาวๆ สามารถ Scroll ลงมาได้ */
}
</style>