import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// ==============================
// ⚙️ AXIOS CONFIG (ตั้งค่าการเชื่อมต่อ)
// ==============================
// 1. ตั้ง Base URL (ตัวเดิมของคุณ ถูกแล้ว)
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL

// 2. ✅ [เพิ่ม] สำคัญมาก! เพื่อให้จำ Session/Cookies ได้เวลากด Refresh
axios.defaults.withCredentials = true 

// 3. ✅ [เพิ่ม] เช็คให้ชัวร์ว่าอ่านค่า .env เจอไหม (ดูใน F12 > Console)
console.log('🔗 Connecting to API:', axios.defaults.baseURL)


// ==============================
// 🎨 1. Import CSS Frameworks & Icons
// ==============================
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js' 
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'leaflet/dist/leaflet.css' 
import './style.css' 

// ==============================
// 🗺️ 2. Fix Leaflet Marker Icon
// ==============================
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

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
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock_client_id'

app.use(vue3GoogleLogin, {
  clientId: googleClientId
})

// 6. เริ่มทำงาน
app.mount('#app')