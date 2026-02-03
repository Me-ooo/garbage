<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
// ตรวจสอบว่าได้ติดตั้ง: npm install vue-cropperjs cropperjs แล้วหรือยัง
import VueCropper from "vue-cropperjs";
import "cropperjs/dist/cropper.css";

const router = useRouter();
const isLoading = ref(false);

const API_URL = import.meta.env.VITE_API_BASE_URL;

// ตัวแปรสำหรับ Cropper
const showCropper = ref(false);
const tempImage = ref(null); // รูปต้นฉบับที่เลือกมา
const croppedBlob = ref(null); // รูปที่ตัดเสร็จแล้ว (เป็นไฟล์ Blob)
const cropper = ref(null); // อ้างอิง component cropper
const timestamp = ref(Date.now()); // ตัวช่วยแก้ Cache รูป

const form = ref({
  id: "",
  fullname: "",
  phone: "",
  email: "",
  image_url: "",
});

// ✅ Computed Property: จัดการการแสดงผลรูปภาพ (ปรับปรุงให้ Robust ขึ้น)
const currentImage = computed(() => {
  // 1. ถ้ามีการตัดรูปใหม่ ให้โชว์รูปที่ตัดทันที (Preview)
  if (croppedBlob.value) {
    return URL.createObjectURL(croppedBlob.value);
  }

  // 2. ถ้ามีรูปเดิมในระบบ
  if (form.value.image_url) {
    // กรณีเป็นรูปจาก Google/Facebook (มี http นำหน้า) ให้ใช้เลย
    if (form.value.image_url.startsWith("http")) {
      return form.value.image_url;
    }

    // กรณีเป็นรูปจาก Server ของเรา
    // ตัด /api ออกเพื่อให้ชี้ไปที่ Root domain (เช่น localhost:3000)
    const baseUrl = API_URL.replace("/api", "");

    // เช็คว่า path มี / นำหน้าหรือไม่ ถ้าไม่มีให้เติม
    const path = form.value.image_url;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    // เติม ?t=... เพื่อบังคับให้โหลดรูปใหม่เสมอ (แก้ปัญหา Cache)
    return `${baseUrl}${cleanPath}?t=${timestamp.value}`;
  }

  // 3. ถ้าไม่มีอะไรเลย ใช้รูป Default
  return "/admin-profile.png";
});

onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    form.value = { ...user };
  }
});

// ✅ เมื่อเลือกไฟล์ -> เปิด Modal ตัดรูป
const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (!file.type.match("image.*")) {
      return Swal.fire("แจ้งเตือน", "กรุณาเลือกไฟล์รูปภาพเท่านั้น", "warning");
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      tempImage.value = e.target.result;
      showCropper.value = true;
    };
    reader.readAsDataURL(file);
  }
  // Reset input value เพื่อให้เลือกไฟล์เดิมซ้ำได้ถ้าต้องการ
  event.target.value = "";
};

// ✅ ฟังก์ชันยืนยันการตัดรูป
const cropImage = () => {
  if (cropper.value) {
    cropper.value.getCroppedCanvas().toBlob((blob) => {
      croppedBlob.value = blob;
      showCropper.value = false;
    });
  }
};

const updateProfile = async () => {
  if (!form.value.fullname) {
    return Swal.fire("แจ้งเตือน", "กรุณากรอกชื่อ-นามสกุล", "warning");
  }

  // เช็ค ID ก่อน
  if (!form.value.id) {
    return Swal.fire("Error", "ไม่พบข้อมูลผู้ใช้งาน (กรุณา Login ใหม่)", "error");
  }

  isLoading.value = true;
  try {
    const formData = new FormData();
    formData.append("fullname", form.value.fullname);
    formData.append("phone", form.value.phone || "");

    // ✅ ส่งไฟล์ที่ Crop แล้ว (ถ้ามี)
    if (croppedBlob.value) {
      formData.append("image", croppedBlob.value, "profile.jpg");
    }

    const token = localStorage.getItem("token");

    // ✅ ใช้ API_URL จาก .env และยิงไปที่ /users/:id
    const res = await axios.put(`${API_URL}/users/${form.value.id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    // อัปเดตข้อมูลใน LocalStorage
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // ✅ อัปเดต timestamp เพื่อให้รูปเปลี่ยนทันที
    form.value = res.data.user;
    timestamp.value = Date.now();
    croppedBlob.value = null;

    Swal.fire({
      icon: "success",
      title: "บันทึกสำเร็จ",
      text: "ข้อมูลโปรไฟล์ของคุณถูกอัปเดตแล้ว",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "ไม่สามารถบันทึกข้อมูลได้", "error");
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
