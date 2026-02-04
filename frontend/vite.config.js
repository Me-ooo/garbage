import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true,
    host: true, // 👈 เพิ่มเพื่อให้เข้าถึงผ่าน IP หรือ ngrok ได้ดีขึ้น
    allowedHosts: [
      'retroussa-intrauterine-garret.ngrok-free.dev',
      '.ngrok-free.dev'
    ],
    // ✅ เพิ่มส่วนนี้เพื่อแก้ปัญหา WebSocket connection failed
    hmr: {
      protocol: 'wss',
      clientPort: 443,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})