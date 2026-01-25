<template>
  <div class="reportimage-container">
    <!-- Header -->
    <header class="header">
      <div class="user-profile">
        <img src="https://placehold.co/40x40/orange/white?text=User" alt="User Avatar">
        <span>สวัสดีคุณ {{ userName }}</span>
      </div>
      <button class="logout-btn" @click="handleLogout">
        ออกจากระบบ
      </button>
    </header>

    <!-- Banner Section -->
    <div class="banners-section">
      <div class="banner-small">
        <img src="https://placehold.co/180x100/81c784/ffffff?text=Garbage+Project" alt="Small Banner">
      </div>
      <div class="banner-large">
        <img src="https://placehold.co/600x150/4caf50/ffffff?text=Community+Cleanliness+Campaign" alt="Large Banner">
      </div>
    </div>

    <!-- Main Layout -->
    <div class="container">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <div class="nav-menu">
          <button 
            v-for="menu in menuItems" 
            :key="menu.id"
            class="menu-btn"
            :class="{ 'admin-btn': menu.id === 'admin' }"
            @click="handleMenuClick(menu.id)"
          >
            {{ menu.label }}
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <div class="content-title">
          <h2>อัพโหลดรูปภาพ</h2>
        </div>

        <!-- Image Upload Container -->
        <div class="upload-container">
          <!-- Large Upload Area -->
          <div class="upload-area" @click="$refs.fileInput.click()" :class="{ 'has-images': uploadedImages.length > 0 }">
            <div v-if="uploadedImages.length === 0" class="upload-placeholder">
              <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>ลากรูปภาพมาวางที่นี่หรือกดเพื่อเลือก</p>
              <small>รองรับไฟล์ PNG, JPG, GIF (สูงสุด 5 MB ต่อไฟล์)</small>
            </div>

            <!-- Uploaded Images Grid -->
            <div v-else class="uploaded-images-grid">
              <div 
                v-for="(image, index) in uploadedImages" 
                :key="index"
                class="uploaded-image-item"
              >
                <img :src="image.preview" :alt="`upload-${index}`">
                <button type="button" class="remove-btn" @click.stop="removeImage(index)">✕</button>
              </div>
              
              <!-- Add More Button -->
              <div class="add-more-btn" @click.stop="$refs.fileInput.click()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <p>เพิ่มรูปเพิ่มเติม</p>
              </div>
            </div>
          </div>

          <!-- File Input -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            style="display: none"
            @change="handleImagesUpload"
          >

          <!-- Alert Messages -->
          <div v-if="successMessage" class="alert alert-success mt-3">
            <i class="bi bi-check-circle"></i>
            {{ successMessage }}
          </div>

          <div v-if="errorMessage" class="alert alert-danger mt-3">
            <i class="bi bi-exclamation-circle"></i>
            {{ errorMessage }}
          </div>

          <!-- Image Info -->
          <div v-if="uploadedImages.length > 0" class="image-info">
            <p>จำนวนรูปภาพที่อัพโหลด: <strong>{{ uploadedImages.length }}</strong> รูป</p>
          </div>

          <!-- Action Buttons -->
          <div class="button-group">
            <button
              @click="handleSubmitImages"
              :disabled="isLoading || uploadedImages.length === 0"
              class="btn btn-submit"
            >
              <span v-if="!isLoading">ส่งรูปภาพ</span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2"></span>
                กำลังส่ง...
              </span>
            </button>
            <button
              @click="handleBack"
              class="btn btn-cancel"
            >
              กลับไป
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
// ...
const openNewReport = () => {
  router.push('/reportpage') // แบบใหม่ (ต้องตรงกับ path ใน router/index.js)
}


const userName = ref('โจโจ้')
const fileInput = ref(null)
const uploadedImages = ref([])
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const menuItems = [
  { id: 'home', label: 'หน้าหลัก' },
  { id: 'report', label: 'แจ้งปัญหา' },
  { id: 'status', label: 'ติดตามสถานะ' },
  { id: 'admin', label: 'Admin Dashboard' }
]

const handleImagesUpload = (event) => {
  const files = event.target.files
  if (files) {
    for (let file of files) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errorMessage.value = 'ขนาดไฟล์ต้องไม่เกิน 5 MB'
        setTimeout(() => { errorMessage.value = '' }, 3000)
        continue
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        errorMessage.value = 'โปรดเลือกไฟล์รูปภาพ'
        setTimeout(() => { errorMessage.value = '' }, 3000)
        continue
      }

      // Add image
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadedImages.value.push({
          name: file.name,
          file: file,
          preview: e.target.result
        })
      }
      reader.readAsDataURL(file)
    }

    errorMessage.value = ''
    successMessage.value = `เพิ่มรูปภาพ ${files.length} รูป`
    setTimeout(() => { successMessage.value = '' }, 2000)
  }
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

const handleSubmitImages = async () => {
  if (uploadedImages.value.length === 0) {
    errorMessage.value = 'กรุณาเลือกรูปภาพอย่างน้อย 1 รูป'
    return
  }

  isLoading.value = true

  try {
    // Create FormData for multipart upload
    const formData = new FormData()
    
    uploadedImages.value.forEach((image, index) => {
      formData.append(`images`, image.file)
    })

    // Send to backend
    const response = await fetch('http://localhost:3001/api/report-images', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('ส่งรูปภาพล้มเหลว')
    }

    // Show success message
    successMessage.value = '✓ ส่งรูปภาพสำเร็จแล้ว'
    
    // Reset and go back
    setTimeout(() => {
      uploadedImages.value = []
      emit('change-page', 'reportpage')
    }, 2000)

  } catch (error) {
    errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการส่งรูปภาพ'
    isLoading.value = false
  }
}

const handleBack = () => {
  if (uploadedImages.value.length > 0) {
    if (confirm('คุณมีรูปภาพที่ยังไม่ได้ส่ง คุณต้องการกลับใช่หรือไม่?')) {
      uploadedImages.value = []
      emit('change-page', 'reportpage')
    }
  } else {
    emit('change-page', 'reportpage')
  }
}

const handleMenuClick = (menuId) => {
  if (menuId === 'home') {
    emit('change-page', 'homepage')
  } else if (menuId === 'report') {
    emit('change-page', 'reportpage')
  } else if (menuId === 'status') {
    console.log('Navigate to status page')
  } else if (menuId === 'admin') {
    emit('change-page', 'dashboard')
  }
}

const handleLogout = () => {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    // ล้างข้อมูลการล็อกอิน (ถ้ามี)
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // สั่งย้ายหน้าไป Login
    router.push('/login'); 
  }
}
</script>

<style scoped>
:root {
  --primary-green: #2e5936;
  --secondary-green: #5c9454;
  --bg-light: #e8f5e9;
  --text-dark: #333;
  --success-color: #66bb6a;
  --error-color: #f44336;
}

* {
  box-sizing: border-box;
}

.reportimage-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  font-family: 'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
}

/* Header */
.header {
  background-color: var(--primary-green);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-profile img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid white;
}

.logout-btn {
  background-color: #ddd;
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  font-family: 'Kanit', sans-serif;
}

.logout-btn:hover {
  background-color: #ccc;
}

/* Banners Section */
.banners-section {
  display: flex;
  gap: 15px;
  padding: 15px 20px;
  background: transparent;
  align-items: center;
}

.banner-small {
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.banner-small img {
  width: 180px;
  height: 100px;
  object-fit: cover;
  display: block;
}

.banner-large {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.banner-large img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  display: block;
}

/* Main Container */
.container {
  display: flex;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  gap: 20px;
  padding: 0 20px 20px;
  overflow-y: auto;
}

/* Sidebar */
.sidebar {
  width: 200px;
  flex-shrink: 0;
}

.nav-menu {
  background-color: white;
  border-radius: 15px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.menu-btn {
  background-color: #eee;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 25px;
  cursor: pointer;
  text-align: center;
  font-weight: 600;
  transition: 0.2s;
  font-family: 'Kanit', sans-serif;
  font-size: 14px;
}

.menu-btn:hover {
  background-color: #e0e0e0;
}

.admin-btn {
  background-color: var(--primary-green);
  color: white;
  border: none;
  margin-top: auto;
}

.admin-btn:hover {
  background-color: #1b3820;
}

/* Main Content */
.main-content {
  flex: 1;
  background-color: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.content-title {
  margin-bottom: 30px;
  text-align: center;
}

.content-title h2 {
  color: var(--text-dark);
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

/* Upload Container */
.upload-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-area {
  border: 3px dashed #ccc;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.upload-area:hover {
  border-color: var(--primary-green);
  background-color: #f0f8f0;
}

.upload-area.has-images {
  border-color: var(--success-color);
  background-color: #f0f8f0;
  padding: 20px;
  min-height: auto;
}

.upload-placeholder {
  padding: 20px;
}

.upload-icon {
  width: 80px;
  height: 80px;
  color: var(--primary-green);
  margin-bottom: 20px;
}

.upload-placeholder p {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-dark);
  margin: 15px 0;
}

.upload-placeholder small {
  color: #999;
  font-size: 13px;
}

/* Uploaded Images Grid */
.uploaded-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  width: 100%;
}

.uploaded-image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: #eee;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: 0.2s;
}

.uploaded-image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.uploaded-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.remove-btn:hover {
  background-color: #d32f2f;
}

.add-more-btn {
  border: 2px dashed #ccc;
  border-radius: 8px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--primary-green);
}

.add-more-btn:hover {
  border-color: var(--primary-green);
  background-color: #f0f8f0;
}

.add-more-btn svg {
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
  stroke-width: 2;
}

.add-more-btn p {
  font-size: 12px;
  font-weight: 600;
  margin: 0;
}

/* Alert Messages */
.alert {
  padding: 12px 15px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Image Info */
.image-info {
  background-color: #f0f8f0;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  color: var(--primary-green);
  font-weight: 600;
}

/* Button Group */
.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.btn {
  padding: 12px 40px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Kanit', sans-serif;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-submit {
  background-color: var(--primary-green);
  color: white;
  flex: 0 1 auto;
  min-width: 150px;
}

.btn-submit:hover:not(:disabled) {
  background-color: #1b3820;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  min-width: 150px;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

/* Responsive */
@media (max-width: 1024px) {
  .container {
    gap: 15px;
  }

  .sidebar {
    width: 150px;
  }

  .menu-btn {
    padding: 8px;
    font-size: 12px;
  }

  .main-content {
    padding: 20px;
  }

  .uploaded-images-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

@media (max-width: 768px) {
  .banners-section {
    flex-direction: column;
    padding: 10px;
  }

  .banner-small {
    width: 100%;
  }

  .banner-small img {
    width: 100%;
    height: 80px;
  }

  .banner-large img {
    height: 80px;
  }

  .container {
    flex-direction: column;
    padding: 0 10px 10px;
  }

  .sidebar {
    width: 100%;
  }

  .nav-menu {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .menu-btn {
    flex: 1;
    min-width: 40%;
  }

  .upload-area {
    padding: 40px 20px;
    min-height: 200px;
  }

  .uploaded-images-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
