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
              @error="$event.target.src='https://placehold.co/150x150?text=User'"
            >
          </div>
          <div class="avatar-edit">
            <input type='file' id="imageUpload" accept=".png, .jpg, .jpeg" @change="onFileChange" />
            <label for="imageUpload">
              <i class="bi bi-camera-fill"></i> แก้ไขรูป
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>อีเมล (แก้ไขไม่ได้)</label>
          <input type="text" v-model="form.email" disabled class="form-control disabled" />
        </div>

        <div class="form-group">
          <label>ชื่อ-นามสกุล</label>
          <input type="text" v-model="form.fullname" class="form-control" placeholder="กรอกชื่อ-นามสกุล" />
        </div>

        <div class="form-group">
          <label>เบอร์โทรศัพท์</label>
          <input type="text" v-model="form.phone" class="form-control" placeholder="กรอกเบอร์โทรศัพท์" maxlength="10" />
        </div>

        <button class="btn-save" @click="updateProfile" :disabled="isLoading">
          {{ isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง' }}
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

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import VueCropper from 'vue-cropperjs';


const router = useRouter();
const isLoading = ref(false);

// ตัวแปรสำหรับ Cropper
const showCropper = ref(false);
const tempImage = ref(null);    // รูปต้นฉบับที่เลือกมา
const croppedBlob = ref(null);  // รูปที่ตัดเสร็จแล้ว (เป็นไฟล์ Blob)
const cropper = ref(null);      // อ้างอิง component cropper
const timestamp = ref(Date.now()); // ตัวช่วยแก้ Cache รูป

const form = ref({
  id: '',
  fullname: '',
  phone: '',
  email: '',
  image_url: ''
});

// ✅ Computed Property: จัดการการแสดงผลรูปภาพ
const currentImage = computed(() => {
  // 1. ถ้ามีการตัดรูปใหม่ ให้โชว์รูปที่ตัดทันที
  if (croppedBlob.value) {
    return URL.createObjectURL(croppedBlob.value);
  }
  // 2. ถ้ามีรูปเดิมในระบบ ให้โชว์พร้อม timestamp (แก้ปัญหา Browser จำรูปเก่า)
  if (form.value.image_url) {
    return `http://localhost:3000${form.value.image_url}?t=${timestamp.value}`;
  }
  // 3. ถ้าไม่มีอะไรเลย ใช้รูป Default
  return '/admin-profile.png';
});

onMounted(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    form.value = { ...user };
  }
});

// ✅ เมื่อเลือกไฟล์ -> เปิด Modal ตัดรูป
const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      tempImage.value = e.target.result; // เก็บไฟล์ต้นฉบับ
      showCropper.value = true;          // เปิด Modal
    };
    reader.readAsDataURL(file);
  }
  event.target.value = ''; // Reset input ให้เลือกรูปเดิมซ้ำได้
};

// ✅ ฟังก์ชันยืนยันการตัดรูป
const cropImage = () => {
  // สั่งให้ Cropper แปลงรูปเป็น Blob (ไฟล์ภาพ)
  cropper.value.getCroppedCanvas().toBlob((blob) => {
    croppedBlob.value = blob; // เก็บไฟล์ที่ตัดแล้วไว้เตรียมส่ง
    showCropper.value = false; // ปิด Modal
  });
};

const updateProfile = async () => {
  if (!form.value.fullname) {
    return Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อ-นามสกุล', 'warning');
  }

  isLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('fullname', form.value.fullname);
    formData.append('phone', form.value.phone || '');
    
    // ✅ ส่งไฟล์ที่ Crop แล้ว (ถ้ามี)
    if (croppedBlob.value) {
      formData.append('image', croppedBlob.value, 'profile.jpg');
    }

    const token = localStorage.getItem('token');
    
    const res = await axios.put(`http://localhost:3000/api/users/${form.value.id}`, formData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    // อัปเดตข้อมูลใน LocalStorage
    localStorage.setItem('user', JSON.stringify(res.data.user));
    
    // ✅ อัปเดต timestamp เพื่อให้รูปทุกจุดในเว็บเปลี่ยนทันที
    form.value = res.data.user;
    timestamp.value = Date.now();
    croppedBlob.value = null; // เคลียร์รูปชั่วคราว

    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      text: 'ข้อมูลโปรไฟล์ของคุณถูกอัปเดตแล้ว',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
       // ไม่ต้อง reload หน้าก็ได้เพราะเราจัดการ state รูปแล้ว
       // หรือถ้าอยากกลับไปหน้าก่อนหน้าให้ uncomment บรรทัดล่าง
       // router.go(-1); 
    });

  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  font-family: 'Kanit', sans-serif;
  padding: 20px;
}

.profile-card {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
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

.card-header h2 { margin: 0; font-size: 1.5rem; }

.close-btn {
  background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;
}

.card-body { padding: 30px; }

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
  box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.1);
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

.avatar-edit input { display: none; }

.avatar-edit label {
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e67e22;
  color: white;
  border: 2px solid white;
  box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.12);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .2s;
}

.avatar-edit label:hover { background: #d35400; }

/* Form Styles */
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-weight: bold; margin-bottom: 8px; color: #555; }
.form-control {
  width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 10px; font-family: 'Kanit';
}
.form-control.disabled { background-color: #f0f0f0; color: #888; }

.btn-save {
  width: 100%; padding: 12px; border: none; border-radius: 50px;
  background-color: #2e5936; color: white; font-size: 1.1rem; font-weight: bold;
  cursor: pointer; transition: 0.3s; margin-top: 10px;
}
.btn-save:hover { background-color: #1b3820; }

/* ✅ CSS สำหรับ Cropper Modal (ส่วนใหม่) */
.cropper-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85); /* พื้นหลังดำโปร่งแสง */
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
  height: 350px; /* ความสูงพื้นที่ตัดรูป */
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
  font-family: 'Kanit';
}

.btn-confirm {
  padding: 8px 20px;
  background-color: #2e5936;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'Kanit';
}
</style>