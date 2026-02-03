<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2"; // แนะนำให้ใช้ Swal เพื่อความสวยงาม (ถ้าติดตั้งไว้)

const router = useRouter();
const form = ref({ email: "", password: "" });
const errorMessage = ref("");
const isLoading = ref(false);

// ดึงค่า Base URL จาก .env
const API_URL = import.meta.env.VITE_API_BASE_URL;

// ==========================================
// ⚙️ ตั้งค่า Facebook App ID (Mock Mode)
// ==========================================
const FACEBOOK_APP_ID = "YOUR_FB_APP_ID";
const USE_REAL_FACEBOOK = false;

onMounted(() => {
  if (USE_REAL_FACEBOOK) {
    initFacebookSDK();
  }
});

const initFacebookSDK = () => {
  if (window.FB) return;
  window.fbAsyncInit = function () {
    window.FB.init({
      appId: FACEBOOK_APP_ID,
      cookie: true,
      xfbml: true,
      version: "v18.0",
    });
  };
  (function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  })(document, "script", "facebook-jssdk");
};

// --- 1. Login ปกติ ---
const handleLogin = async () => {
  if (!form.value.email || !form.value.password) {
    errorMessage.value = "กรุณากรอกอีเมลและรหัสผ่าน";
    return;
  }
  isLoading.value = true;
  errorMessage.value = "";

  try {
    // ✅ ยิงไปที่ /auth/login (ต้องมี /auth นำหน้าเสมอตาม server.js)
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: form.value.email,
      password: form.value.password,
    });

    if (response.status === 200) {
      processLogin(response.data);
    }
  } catch (error) {
    handleError(error);
  } finally {
    isLoading.value = false;
  }
};

// --- 2. Login Google (Mock) ---
const loginWithGoogle = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  // จำลอง User
  const mockUser = {
    email: `google_${Math.floor(Math.random() * 10000)}@gmail.com`,
    fullname: "Google User (Mock)",
    password: "mockpassword", // Backend อาจต้องรองรับการสร้าง User อัตโนมัติ หรือใช้ Mock API
    provider: "google",
  };

  try {
    // กรณีทดสอบ: ถ้า Backend ยังไม่ทำ Route สำหรับ Google ให้ใช้การ "สมัครสมาชิก+ล็อกอิน" แบบจำลอง
    // หรือถ้ายิงไปที่ /auth/login แล้ว User ไม่มีในระบบอาจจะ Error
    // ดังนั้นในที่นี้จะจำลองว่า "สำเร็จ" เลยถ้าเป็น Mock Mode บน Frontend

    // ⚠️ ถ้า Backend คุณมี route /auth/google ให้ใช้บรรทัดนี้:
    // const res = await axios.post(`${API_URL}/auth/google`, mockUser);
    // processLogin(res.data);

    // ⚠️ แบบ Mock Frontend (เข้าได้เลยไม่ต้องรอ Backend):
    setTimeout(() => {
      const mockToken = "mock-jwt-token-google";
      const mockUserData = {
        id: 999,
        email: mockUser.email,
        fullname: mockUser.fullname,
        role: "user",
        image_url: "",
      };
      processLogin({ token: mockToken, user: mockUserData });
    }, 1000);
  } catch (error) {
    console.error("Google Error:", error);
    errorMessage.value = "Google Login Failed";
    isLoading.value = false;
  }
};

// --- 3. Login Facebook (Mock) ---
const loginWithFacebook = async () => {
  errorMessage.value = "";
  if (!USE_REAL_FACEBOOK) {
    isLoading.value = true;
    setTimeout(() => {
      // Mock Frontend Success
      const mockUser = {
        id: 888,
        email: `fb_${Math.floor(Math.random() * 10000)}@facebook.com`,
        fullname: "Facebook User (Mock)",
        role: "user",
        image_url: "",
      };
      processLogin({ token: "mock-jwt-token-fb", user: mockUser });
      isLoading.value = false;
    }, 800);
  } else {
    alert("Facebook Real Mode not configured for Localhost");
  }
};

// ✅ ฟังก์ชันจัดการหลัง Login สำเร็จ
const processLogin = (data) => {
  // 1. บันทึก Token
  localStorage.setItem("token", data.token);

  // 2. บันทึกข้อมูล User (สำคัญมาก สำหรับหน้า Admin/Profile)
  localStorage.setItem("user", JSON.stringify(data.user));

  // 3. ตรวจสอบ Role เพื่อเปลี่ยนหน้า
  if (data.user.role === "admin") {
    // ถ้าเป็น Admin ไปหน้า Dashboard
    router.push("/system-overview");
  } else {
    // ถ้าเป็น User ธรรมดา ไปหน้าแจ้งปัญหา (หรือหน้า Home)
    router.push("/"); // เปลี่ยนเป็น /reportpage ถ้าต้องการ
  }
};

const handleError = (error) => {
  console.error("Login Error:", error);
  if (error.response) {
    // Error จาก Backend (เช่น 400, 401, 404)
    errorMessage.value = error.response.data.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  } else if (error.request) {
    // ยิงไปแล้วไม่ตอบรับ (Backend ล่ม หรือ Network หลุด)
    errorMessage.value = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
  } else {
    errorMessage.value = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
  }
};

const goToRegister = () => router.push("/register");
</script>

<template>
  <div class="login-page">
    <div class="header-banner">
      <img
        src="/logo.png"
        alt="Project Banner"
        class="banner-img"
        @error="$event.target.src = 'https://placehold.co/320x100?text=Logo'"
      />
    </div>

    <div class="login-card">
      <h2 class="title">เข้าสู่ระบบ</h2>

      <form @submit.prevent="handleLogin" class="form-container">
        <div class="input-box">
          <span class="input-icon">👤</span>
          <input
            v-model="form.email"
            type="text"
            placeholder="ชื่อผู้ใช้ / อีเมล"
            required
          />
        </div>

        <div class="input-box">
          <span class="input-icon">🔒</span>
          <input
            v-model="form.password"
            type="password"
            placeholder="รหัสผ่าน"
            required
          />
        </div>

        <div v-if="errorMessage" class="error-text">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-submit" :disabled="isLoading">
          {{ isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ" }}
        </button>

        <p class="link-text" @click="goToRegister">สมัครสมาชิก</p>

        <div class="social-section">
          <button
            type="button"
            class="btn-facebook"
            @click="loginWithFacebook"
            :disabled="isLoading"
          >
            <span class="fb-icon">f</span> Login with Facebook
          </button>

          <p class="divider-text">หรือ</p>

          <button
            type="button"
            class="btn-google"
            @click="loginWithGoogle"
            :disabled="isLoading"
          >
            <img
              src="/google.png"
              alt="G"
              class="google-icon"
              @error="$event.target.style.display = 'none'"
            />
            Login with Google
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* ใช้ Style เดิมจากรอบที่แล้วได้เลยครับ */
.login-page {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url("/background.png");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  font-family: "Kanit", sans-serif;
  overflow: hidden;
}
.header-banner {
  background-color: white;
  padding: 8px;
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.banner-img {
  width: 320px;
  height: auto;
  display: block;
  border-radius: 10px;
}
.login-card {
  background-color: #4a7c44;
  padding: 25px 35px;
  border-radius: 30px;
  width: 320px;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}
.title {
  color: white !important;
  font-size: 2.2rem;
  margin-bottom: 25px;
  font-weight: bold;
}
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
.error-text {
  color: #ffcccc;
  background-color: rgba(255, 0, 0, 0.555);
  padding: 8px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 0.9rem;
}
.social-section {
  margin-top: 20px;
}
.btn-facebook {
  width: 100%;
  background-color: #1877f2; /* สี Facebook จริง */
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
}
.btn-facebook:hover {
  background-color: #166fe5;
}
.fb-icon {
  font-weight: bold;
  font-size: 1.2rem;
  font-family: serif;
}
.divider-text {
  color: white;
  font-size: 0.8rem;
  margin: 8px 0;
}
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
  font-weight: 500;
}
.google-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
</style>
