<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router"; 

const router = useRouter();
const API_URL = import.meta.env.VITE_API_BASE_URL;

// ข้อมูลสำหรับสมัครสมาชิก
const reg = ref({
  fullname: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  accept: false,
});

const handleRegister = async () => {
  // 1. ตรวจสอบความถูกต้อง
  if (reg.value.password !== reg.value.confirmPassword) {
    return alert("รหัสผ่านไม่ตรงกัน");
  }
  if (!reg.value.accept) {
    return alert("กรุณายอมรับเงื่อนไข");
  }
  
  try {
    // 2. ส่งข้อมูลไป Backend
    // แก้ไข URL จาก /api/register เป็น /api/auth
    // และแนะนำให้ใช้ตัวแปร API_URL จาก .env แทนการพิมพ์ localhost ตรงๆ
    await axios.post(`${API_URL}/auth`, {
      fullname: reg.value.fullname,
      phone: reg.value.phone,
      email: reg.value.email,
      password: reg.value.password
    });

    // 3. ถ้าสำเร็จ ให้แจ้งเตือนและเด้งไปหน้า Login
    alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
    router.push("/login");

  } catch (err) {
    console.error(err);
    const msg = err.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก";
    alert(msg);
  }
};
</script>

<template>
  <div class="register-page">
    <h1 class="page-title">สมัครสมาชิก</h1>

    <div class="register-card">
      <div class="form-container">
        <div class="input-wrapper">
          <span class="icon">👤</span>
          <input v-model="reg.fullname" type="text" placeholder="ชื่อ-นามสกุล" />
        </div>

        <div class="input-wrapper">
          <span class="icon">📞</span>
          <input
            v-model="reg.phone"
            type="tel"
            placeholder="เบอร์โทรศัพท์"
            maxlength="10"
            @input="reg.phone = $event.target.value.replace(/\D/g, '')"
          />
        </div>

        <div class="input-wrapper">
          <span class="icon">📧</span>
          <input v-model="reg.email" type="email" placeholder="อีเมล" />
        </div>

        <div class="input-wrapper">
          <span class="icon">🔒</span>
          <input v-model="reg.password" type="password" placeholder="รหัสผ่าน" />
        </div>

        <div class="input-wrapper">
          <span class="icon">🔒</span>
          <input
            v-model="reg.confirmPassword"
            type="password"
            placeholder="ยืนยันรหัสผ่าน"
          />
        </div>

        <div class="checkbox-group">
          <input type="checkbox" v-model="reg.accept" id="accept-terms" />
          <label for="accept-terms">ยอมรับข้อกำหนดและเงื่อนไข</label>
        </div>

        <button @click="handleRegister" class="btn-register">ยืนยันการสมัคร</button>

        <p class="login-link" @click="router.push('/login')">
          มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* พื้นหลังเต็มจอและจัดกึ่งกลาง */
.register-page {
  width: 100vw;
  height: 100vh;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url("/background.png"); /* ใช้รูปเดียวกับหน้า Login */
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  font-family: "Kanit", sans-serif;
}

.page-title {
  color: #2d5a27;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
}

/* กล่องขาว */
.register-card {
  background-color: white;
  padding: 40px;
  border-radius: 40px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* กรอบ Input */
.input-wrapper {
  border: 2px solid #e2e8f0;
  border-radius: 50px;
  display: flex;
  align-items: center;
  padding: 5px 20px;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: #4a7c44;
}

.icon {
  margin-right: 10px;
  font-size: 1.2rem;
}

.input-wrapper input {
  border: none;
  outline: none;
  width: 100%;
  padding: 10px 0;
  font-size: 1rem;
  color: #333;
  background: transparent;
}

/* Checkbox */
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 15px;
  font-size: 0.9rem;
  color: #666;
}

.checkbox-group input {
  cursor: pointer;
}

/* ปุ่มเขียว */
.btn-register {
  background-color: #4a7c44;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.2s;
}

.btn-register:hover {
  background-color: #386133;
}

.login-link {
  text-align: center;
  color: #718096;
  font-size: 0.9rem;
  margin-top: 15px;
  cursor: pointer;
}

.login-link:hover {
  text-decoration: underline;
}
</style>