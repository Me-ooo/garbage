import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// ==============================
// 🎨 1. Import CSS Frameworks & Icons
// ==============================
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js' // 👈 สำคัญ! ต้องมี JS ด้วย ไม่งั้น Dropdown ไม่ทำงาน
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'leaflet/dist/leaflet.css' 
import './style.css' // CSS ของเรา (อยู่ล่างสุดเพื่อทับตัวอื่น)

// ==============================
// 🗺️ 2. Fix Leaflet Marker Icon (แก้บั๊กรูปหมุดไม่ขึ้น)
// ==============================
import L from 'leaflet';

// ลบค่า Default เดิมที่มักจะพังใน Vue/Vite
delete L.Icon.Default.prototype._getIconUrl;

// ตั้งค่า Path รูปหมุดใหม่ให้ดึงจาก CDN (เพื่อให้ชัวร์ว่าขึ้นแน่นอน)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ==============================
// 🔑 3. Google Login Plugin
// ==============================
import vue3GoogleLogin from 'vue3-google-login'

const app = createApp(App)

// 4. ใช้งาน Router
app.use(router)

// 5. ตั้งค่า Google Login
// ดึงค่าจาก .env ถ้าไม่มีให้ใช้ 'mock_client_id' เพื่อกัน App พัง
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock_client_id'

app.use(vue3GoogleLogin, {
  clientId: googleClientId
})

// 6. เริ่มทำงาน
app.mount('#app')