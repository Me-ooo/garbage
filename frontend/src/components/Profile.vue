<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import 'vue-cropper/dist/index.css'
import { VueCropper }  from "vue-cropper";
// หมายเหตุ: อย่าลืม npm install vue-cropper@next ถ้าจะใช้ Cropper นะครับ
// ถ้ายังไม่ติดตั้ง ให้ปิดส่วน modal ใน template ไปก่อนครับ

const router = useRouter();
const API_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ ประกาศตัวแปร form ให้ตรงกับใน Template (แก้ปัญหาหน้าขาว)
const form = ref({
  id: "",
  fullname: "",
  username: "",
  email: "",
  phone: "",
  image_url: ""
});

const selectedFile = ref(null);
const imagePreview = ref(null);
const isLoading = ref(false);
const showCropper = ref(false);
const tempImage = ref(null);

// ✅ Computed สำหรับแสดงรูปปัจจุบัน (ใช้ใน :src="currentImage")
const currentImage = computed(() => {
  return imagePreview.value || getImageUrl(form.value.image_url);
});

// ✅ จัดการ URL รูปภาพ (ดึงจากพอร์ต 3000 ผ่าน Proxy)
const getImageUrl = (path) => {
  if (!path) return "/admin-profile.png";
  if (path.startsWith("data:") || path.startsWith("http")) return path;

  let cleanBase = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  cleanBase = cleanBase.replace("/api", "");

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

onMounted(async () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  if (storedUser.id) {
    await fetchUserProfile(storedUser.id);
  } else {
    router.push("/login");
  }
});

const fetchUserProfile = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

    const response = await axios.get(`${baseUrl}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data) {
      // ✅ นำข้อมูลมาใส่ใน form
      form.value = { ...response.data };
    }
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    router.push("/login");
  }
};

// ✅ ฟังก์ชันเมื่อเลือกไฟล์รูปภาพ
const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("ผิดพลาด", "ขนาดรูปภาพต้องไม่เกิน 5MB", "error");
      return;
    }
    selectedFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
      // ถ้าจะใช้ Cropper ให้เปิดบรรทัดล่างนี้ครับ
      // tempImage.value = e.target.result;
      // showCropper.value = true;
    };
    reader.readAsDataURL(file);
  }
};

// ✅ ฟังก์ชันบันทึกข้อมูล (ใช้ชื่อ updateProfile ตาม Template)
const updateProfile = async () => {
  if (!form.value.fullname) {
    Swal.fire("แจ้งเตือน", "กรุณากรอกชื่อ-นามสกุล", "warning");
    return;
  }
  
  isLoading.value = true;
  try {
    const token = localStorage.getItem("token");
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;

    const formData = new FormData();
    formData.append("fullname", form.value.fullname);
    formData.append("phone", form.value.phone || "");
    
    if (selectedFile.value) {
      formData.append("image", selectedFile.value);
    }

    // ยิงไปที่ /api/users/update/:id ตามที่แก้ใน users.js
    const response = await axios.put(
      `${baseUrl}/api/users/update/${form.value.id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // อัปเดตข้อมูลใหม่ลง LocalStorage
    localStorage.setItem("user", JSON.stringify(response.data.user));

    Swal.fire({
      icon: "success",
      title: "สำเร็จ",
      text: "อัปเดตโปรไฟล์เรียบร้อยแล้ว",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Update Error:", error);
    Swal.fire("ผิดพลาด", error.response?.data?.message || "ไม่สามารถอัปเดตได้", "error");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="card-header">
        <h2>แก้ไขโปรไฟล์</h2>
        <button class="close-btn" @click="$router.go(-1)">✕</button>
      </div>

      <div class="card-body">
        <div class="avatar-upload">
          <div class="avatar-preview">
            <img
              :src="currentImage"
              alt="Profile Preview"
              @error="$event.target.src = 'https://placehold.co/150x150?text=User'"
            />
          </div>
          <div class="avatar-edit">
            <input
              type="file"
              id="imageUpload"
              accept=".png, .jpg, .jpeg"
              @change="onFileChange"
            />
            <label for="imageUpload"> ✏️ แก้ไขรูป </label>
          </div>
        </div>

        <div class="form-group">
          <label>อีเมล (แก้ไขไม่ได้)</label>
          <input
            type="text"
            v-model="form.email"
            disabled
            class="form-control disabled"
          />
        </div>

        <div class="form-group">
          <label>ชื่อ-นามสกุล</label>
          <input
            type="text"
            v-model="form.fullname"
            class="form-control"
            placeholder="กรอกชื่อ-นามสกุล"
          />
        </div>

        <div class="form-group">
          <label>เบอร์โทรศัพท์</label>
          <input
            type="text"
            v-model="form.phone"
            class="form-control"
            placeholder="กรอกเบอร์โทรศัพท์"
            maxlength="10"
          />
        </div>

        <button class="btn-save" @click="updateProfile" :disabled="isLoading">
          {{ isLoading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง" }}
        </button>
      </div>
    </div>

    <div v-if="showCropper" class="cropper-modal">
      <div class="cropper-content">
        <h3>จัดวางรูปโปรไฟล์</h3>
        <div class="cropper-wrapper">
          <vue-cropper
            ref="cropper"
            :src="tempImage"
            alt="Source Image"
            :aspect-ratio="1"
            :view-mode="1"
            drag-mode="move"
            :background="false"
            :guides="true"
          ></vue-cropper>
        </div>
        <div class="cropper-actions">
          <button @click="showCropper = false" class="btn-cancel">ยกเลิก</button>
          <button @click="cropImage" class="btn-confirm">ยืนยัน</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Style เดิมของคุณ */
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url("/background.png");
  background-size: cover;
  background-position: center;
  font-family: "Kanit", sans-serif;
  padding: 20px;
}

.profile-card {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.card-header {
  background-color: #2e5936;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.card-body {
  padding: 30px;
}

/* Avatar Upload Style */
.avatar-upload {
  position: relative;
  max-width: 150px;
  margin: 0 auto 30px;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid #2e5936;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: #f0f0f0;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit {
  position: absolute;
  right: 0;
  bottom: 0;
}

.avatar-edit input {
  display: none;
}

.avatar-edit label {
  display: inline-block;
  padding: 8px 15px;
  border-radius: 20px;
  background: #e67e22;
  color: white;
  border: 2px solid white;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.avatar-edit label:hover {
  background: #d35400;
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #555;
}
.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-family: "Kanit";
  box-sizing: border-box; /* สำคัญ: ป้องกัน input ล้นกรอบ */
}
.form-control.disabled {
  background-color: #f0f0f0;
  color: #888;
  cursor: not-allowed;
}

.btn-save {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 50px;
  background-color: #2e5936;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  margin-top: 10px;
}
.btn-save:hover {
  background-color: #1b3820;
}
.btn-save:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* CSS สำหรับ Cropper Modal */
.cropper-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cropper-content {
  background: white;
  padding: 20px;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  text-align: center;
}

.cropper-wrapper {
  height: 350px;
  background: #333;
  margin: 15px 0;
  border-radius: 5px;
  overflow: hidden;
}

.cropper-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 8px 20px;
  background-color: #ddd;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-family: "Kanit";
}

.btn-confirm {
  padding: 8px 20px;
  background-color: #2e5936;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-family: "Kanit";
}
::v-deep .cropper-modal {
  background-color: #000 !important;
  opacity: 0.9 !important; /* ยิ่งเลขเยอะ ยิ่งมืด (สูงสุด 1.0) */
}

/* (แถม) ทำให้เส้นกรอบที่เลือกดูชัดขึ้น */
::v-deep .cropper-view-box {
  outline: 2px solid white !important;
}
</style>
