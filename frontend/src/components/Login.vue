<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' // 1. import
const router = useRouter()          
// ...
const openNewReport = () => {
  router.push('/reportpage') // แบบใหม่ (ต้องตรงกับ path ใน router/index.js)
}
const form = ref({ email: '', password: '' })
const handleLogin = () => {
  // ... ล็อกอินสำเร็จ ...
  router.push('/') // 3. สั่งเปลี่ยนหน้าไปที่ Home (path '/')
}
  console.log('Login attempt:', form.value)
  if (form.value.email && form.value.password) {
    emit('change-page', 'homepage')
  } else {
    alert('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
  }
</script>

<template>
  <div class="login-page">
    <div class="header-banner">
       <img src="/logo.png" alt="Project Banner" class="banner-img">
    </div>

    <div class="login-card">
      <h2 class="title">เข้าสู่ระบบ</h2>
      
      <div class="form-container">
        <div class="input-box">
          <span class="input-icon">👤</span>
          <input v-model="form.email" type="text" placeholder="ชื่อผู้ใช้ / อีเมล">
        </div>
        
        <div class="input-box">
          <span class="input-icon">🔒</span>
          <input v-model="form.password" type="password" placeholder="รหัสผ่าน">
        </div>

        <button @click="handleLogin" class="btn-submit">เข้าสู่ระบบ</button>
        
        <p class="link-text" @click="emit('change-page', 'register')">สมัครสมาชิก</p>

        <div class="social-section">
          <button class="btn-facebook">
            <span class="fb-icon">f</span> Login with Facebook
          </button>
          
          <p class="divider-text">หรือ</p>
          
          <button class="btn-google">
            <img src="/google.png" alt="G" class="google-icon"> 
            Login with Google
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* จัดการหน้าจอให้เต็มกว้างและสูงแบบไม่มีขอบดำ */
.login-page {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url('/background.png');
  background-size: 100% 100%; /* บังคับให้รูปขยายเต็มพื้นที่จอ */
  background-position: center;
  background-repeat: no-repeat;
  font-family: 'Kanit', sans-serif;
}

/* ส่วน Banner สีขาวด้านบน */
.header-banner {
  background-color: white;
  padding: 8px;
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.banner-img {
  width: 320px; /* ปรับขนาดให้สัมพันธ์กับกล่องเขียว */
  height: auto;
  display: block;
  border-radius: 10px;
}

/* กล่องสีเขียว */
.login-card {
  background-color: #4a7c44;
  padding: 25px 35px;
  border-radius: 30px;
  width: 320px; /* บังคับความกว้างให้เท่ากับ Banner */
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.title { 
  color: white !important; 
  font-size: 2.2rem; 
  margin-bottom: 25px; 
  font-weight: bold; 
}

/* ช่อง Input */
.input-box {
  background: white !important;
  border-radius: 50px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  padding: 5px 15px;
}

.input-box input {
  border: none !important;
  background: transparent !important;
  width: 100%;
  padding: 10px;
  outline: none;
  color: #333333 !important; /* ตัวหนังสือสีดำ */
  font-size: 1rem;
}

/* ปุ่มสีส้ม */
.btn-submit {
  width: 100%;
  background-color: #e67e22 !important;
  color: white !important;
  border: none;
  padding: 12px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
}

.link-text { 
  color: white; 
  font-size: 0.9rem; 
  margin-top: 15px; 
  cursor: pointer; 
  text-decoration: underline; 
}

/* Social Buttons */
.social-section { margin-top: 20px; }

.btn-facebook {
  width: 100%;
  background-color: #3b5998;
  color: white;
  border: 1px solid white;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.divider-text { color: white; font-size: 0.8rem; margin: 8px 0; }

.btn-google {
  width: 100%;
  background-color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #555;
}

.google-icon { width: 18px; height: 18px; object-fit: contain; }
</style>