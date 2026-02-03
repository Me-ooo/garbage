import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true,
    // 👇 เพิ่มบรรทัดนี้เข้าไปครับ (สำคัญมาก!)
    allowedHosts: true
  }
})