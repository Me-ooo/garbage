import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'leaflet/dist/leaflet.css'
import './style.css'
import App from './App.vue'
import router from './router' // หรือ './router/index.js'

const app = createApp(App)

app.use(router) // 1. ใส่ Router ให้ App ตัวนี้
app.mount('#app') // 2. สั่งให้ App ตัวเดิมนี้แสดงผล