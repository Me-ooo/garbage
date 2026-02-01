import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// ==============================
// 🎨 Import CSS Frameworks & Icons
// ==============================
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'leaflet/dist/leaflet.css' // สำหรับแผนที่
import './style.css' // CSS ของเราเอง (ต้องอยู่ล่างสุดเพื่อทับตัวอื่น)

// ==============================
// 🔑 Google Login Plugin
// ==============================
import vue3GoogleLogin from 'vue3-google-login'

const app = createApp(App)

// 1. ใช้งาน Router
app.use(router)

// 2. ตั้งค่า Google Login
// ดึงค่าจาก .env ถ้าไม่มีให้ใช้ 'mock_client_id' เพื่อกัน App พัง
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock_client_id'

// (Optional) แสดงค่าใน Console เพื่อเช็คว่าอ่าน .env เจอไหม
console.log('Current Google Client ID:', googleClientId);

app.use(vue3GoogleLogin, {
  clientId: googleClientId
})

// 3. เริ่มทำงาน
app.mount('#app')