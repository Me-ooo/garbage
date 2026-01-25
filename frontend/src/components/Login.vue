<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
// ❌ ไม่ต้อง import library ภายนอกแล้ว

const router = useRouter()
const form = ref({ email: '', password: '' })
const errorMessage = ref('')
const isLoading = ref(false)

// --- 1. Login ปกติ (อีเมล/รหัสผ่าน) ---
const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await axios.post('http://localhost:3000/api/login', form.value)
    if (response.status === 200) processLogin(response.data)
  } catch (error) {
    handleError(error)
  } finally {
    isLoading.value = false
  }
}

// --- 2. Login Google (แบบจำลอง/Mock) ---
const loginWithGoogle = async () => {
  isLoading.value = true
  
  // สร้างข้อมูลจำลอง (สุ่มเลขหลังชื่อเพื่อไม่ให้ซ้ำ)
  const mockUser = {
    email: `google_${Math.floor(Math.random() * 10000)}@gmail.com`,
    name: 'Google Test User'
  }

  try {
    // ยิงไปที่ Backend Route ง่ายๆ ที่เราสร้างไว้
    const res = await axios.post('http://localhost:3000/api/google-login-simple', mockUser)
    
    // แจ้งเตือนนิดหน่อยให้รู้ว่าจำลองสำเร็จ
    alert(`(Mock) เข้าสู่ระบบ Google สำเร็จ!\nEmail: ${mockUser.email}`)
    
    processLogin(res.data)
  } catch (error) {
    console.error(error)
    errorMessage.value = 'เกิดข้อผิดพลาดในการจำลอง Login Google'
  } finally {
    isLoading.value = false
  }
}

// --- 3. Login Facebook (แบบจำลอง/Mock) ---
const loginWithFacebook = async () => {
  isLoading.value = true
  
  // 1. สร้างข้อมูลจำลอง (เปลี่ยนจาก Google เป็น Facebook)
  const mockUser = {
    // สุ่มเลขข้างหลังเพื่อให้ Email ไม่ซ้ำกัน
    email: `fb_user_${Math.floor(Math.random() * 10000)}@facebook.com`,
    name: 'Facebook Test User' // ชื่อสมมติ
  }

  try {
    // 2. ยิงไปที่ Backend (ใช้ Route เดิมได้เลย เพราะมันรับแค่ Email กับ Name)
    // สาเหตุที่ใช้ google-login-simple ได้ เพราะหลังบ้านเราเขียนไว้แค่รับ email/name แล้วบันทึกเลย ไม่ได้เช็คว่าเป็น Google จริงไหม
    const res = await axios.post('http://localhost:3000/api/google-login-simple', mockUser)
    
    alert(`(Mock) เข้าสู่ระบบ Facebook สำเร็จ!\nชื่อ: ${mockUser.name}`)
    
    // 3. เข้าสู่ระบบ
    processLogin(res.data)

  } catch (error) {
    console.error(error)
    errorMessage.value = 'เกิดข้อผิดพลาดในการจำลอง Login Facebook'
  } finally {
    isLoading.value = false
  }
}

// ฟังก์ชันกลางสำหรับจัดการหลัง Login สำเร็จ
const processLogin = (data) => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  
  if (data.user.role === 'admin') router.push('/admin')
  else router.push('/')
}

const handleError = (error) => {
  if (error.response && error.response.status === 401) {
    errorMessage.value = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
  } else {
    errorMessage.value = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์'
  }
}
</script>

<template>
  <div class="login-page">
    <div class="header-banner">
       <img src="/logo.png" alt="Project Banner" class="banner-img" @error="$event.target.src='https://placehold.co/320x100?text=Logo'">
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

        <div v-if="errorMessage" class="error-text">{{ errorMessage }}</div>

        <button @click="handleLogin" class="btn-submit" :disabled="isLoading">
          {{ isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}
        </button>
        
        <p class="link-text" @click="$router.push('/register')">สมัครสมาชิก</p>

        <div class="social-section">
  <button class="btn-facebook" @click="loginWithFacebook">
    <span class="fb-icon">f</span> Login with Facebook
  </button>
  
  <p class="divider-text">หรือ</p>
  
  <button class="btn-google" @click="loginWithGoogle">
    <img src="/google.png" alt="G" class="google-icon" @error="$event.target.style.display='none'"> 
    Login with Google
  </button>
</div>
      </div>
    </div>
  </div>

  <div class="login-page">
    <div class="header-banner">
       <img src="/logo.png" alt="Project Banner" class="banner-img" @error="$event.target.src='https://placehold.co/320x100?text=Logo'">
    </div>

    <div class="login-card">
      <h2 class="title">เข้าสู่ระบบ</h2>
      
      <div class="form-container">
        <div class="input-box">
          <span class="input-icon">👤</span>
          <input 
            v-model="form.email" 
            type="text" 
            placeholder="ชื่อผู้ใช้ / อีเมล"
            @keyup.enter="handleLogin" 
          >
        </div>
        
        <div class="input-box">
          <span class="input-icon">🔒</span>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="รหัสผ่าน"
            @keyup.enter="handleLogin"
          >
        </div>

        <div v-if="errorMessage" class="error-text">
          {{ errorMessage }}
        </div>

        <button 
          @click="handleLogin" 
          class="btn-submit" 
          :disabled="isLoading"
        >
          {{ isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}
        </button>
        
        <p class="link-text" @click="goToRegister">สมัครสมาชิก</p>

        <div class="social-section">
          <button class="btn-facebook">
            <span class="fb-icon">f</span> Login with Facebook
          </button>
          
          <p class="divider-text">หรือ</p>
          
          <button class="btn-google">
            <img src="/google.png" alt="G" class="google-icon" @error="$event.target.style.display='none'"> 
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
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  font-family: 'Kanit', sans-serif;
  overflow: hidden; /* ป้องกัน Scrollbar */
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
  width: 320px;
  height: auto;
  display: block;
  border-radius: 10px;
}

/* กล่องสีเขียว */
.login-card {
  background-color: #4a7c44;
  padding: 25px 35px;
  border-radius: 30px;
  width: 320px;
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
  color: #333333 !important;
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
  transition: 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background-color: #d35400 !important;
}

.btn-submit:disabled {
  background-color: #ccc !important;
  cursor: not-allowed;
}

.link-text { 
  color: white; 
  font-size: 0.9rem; 
  margin-top: 15px; 
  cursor: pointer; 
  text-decoration: underline; 
}

/* ข้อความ Error (เพิ่มใหม่) */
.error-text {
  color: #ffcccc;
  background-color: rgba(255, 0, 0, 0.2);
  padding: 8px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 0.9rem;
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
  cursor: pointer;
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
  cursor: pointer;
}

.google-icon { width: 18px; height: 18px; object-fit: contain; }
</style>