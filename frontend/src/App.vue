<script setup>
// ไม่ต้อง import อะไรเพิ่มแล้วครับ router-view จะจัดการให้เอง
</script>

<template>
  <router-view />
</template>

<style>
/* ✅ 1. นำเข้าฟอนต์ Kanit จาก Google Fonts ทีเดียวจบ ใช้ได้ทั้งเว็บ */
@import url("https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&display=swap");

/* ✅ 2. ตั้งค่า Global Styles (Reset CSS) */
body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: "Kanit", sans-serif; /* บังคับใช้ฟอนต์ Kanit ทั้งเว็บ */
  background-color: #f5f5f5; /* สีพื้นหลังรองรับ */
  overflow-x: hidden; /* ป้องกันสกรอลแนวนอน */
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* Scrollbar สวยๆ (แถมให้) */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>
