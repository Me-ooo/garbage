import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/garbage/',  // 👈 เพิ่มบรรทัดนี้ครับ (ใส่ชื่อ Repository ของคุณ)
})