import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // ไม่ต้องใส่ base: '/garbage/' แล้ว เพื่อให้รันที่ Root (/) ได้ทั้ง Local และ Vercel
  server: {
    port: 5173,
    open: true // สั่งให้เปิด Browser อัตโนมัติเวลารัน
  }
})