import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true,
    host: true, 
    allowedHosts: [
      'retroussa-intrauterine-garret.ngrok-free.dev',
      '.ngrok-free.dev'
    ],
    // ✅ HMR สำหรับ ngrok (คงไว้ตามเดิม ดีแล้วครับ)
    hmr: {
      protocol: 'wss',
      clientPort: 443,
    },
    // ✅ Proxy: หัวใจสำคัญของการเชื่อมต่อ
    proxy: {
      // 1. ส่งคำสั่ง API ไป Backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // 2. 🚩 เพิ่มส่วนนี้! ส่งคำขอรูปภาพ (/uploads) ไป Backend
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})