<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const router = useRouter();

// ✅ ปรับการดึง API_URL ให้รองรับทั้งแบบมี / และไม่มี / ปิดท้าย
const API_URL = import.meta.env.VITE_API_BASE_URL;

const reg = ref({
  fullname: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  accept: false,
});

const handleRegister = async () => {
  if (!reg.value.fullname || !reg.value.email || !reg.value.password) {
    return Swal.fire("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
  }

  if (reg.value.password !== reg.value.confirmPassword) {
    return Swal.fire(
      "รหัสผ่านไม่ตรงกัน",
      "กรุณากรอกรหัสผ่านให้ตรงกันทั้งสองช่อง",
      "error"
    );
  }

  if (!reg.value.accept) {
    return Swal.fire("เงื่อนไขการใช้งาน", "กรุณายอมรับเงื่อนไขก่อนสมัครสมาชิก", "info");
  }

  try {
    // 🚩 แก้ไขจุดต่อ URL:
    // เราจะใช้การเช็คว่าถ้า API_URL ลงท้ายด้วย / ให้ตัดออกก่อน เพื่อไม่ให้เกิด // ซ้อนกัน
    // และมั่นใจว่ามันจะยิงไปที่ /api/auth/register (ตามที่เราตั้ง Proxy ไว้)
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    // หากใน .env ตั้งไว้แค่ "/" โค้ดนี้จะยิงไปที่ /api/auth/register
    // หากใน .env ตั้งไว้แค่ "/api" โค้ดนี้จะยิงไปที่ /api/auth/register (ซึ่งถูกต้อง!)
    await axios.post(`${baseUrl}/api/auth/register`, {
      fullname: reg.value.fullname,
      phone: reg.value.phone,
      email: reg.value.email,
      password: reg.value.password,
    });

    Swal.fire({
      icon: "success",
      title: "สมัครสมาชิกสำเร็จ!",
      text: "ระบบกำลังพาท่านไปหน้าเข้าสู่ระบบ...",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      router.push("/login");
    });
  } catch (err) {
    console.error("Register Error:", err);
    const msg = err.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก";
    Swal.fire("เกิดข้อผิดพลาด", msg, "error");
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
/* Style เดิมของคุณ */
.register-page {
  width: 100vw;
  height: 100vh;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url("/background.png");
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
