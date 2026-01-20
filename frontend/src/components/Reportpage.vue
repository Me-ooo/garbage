<template>
  <div class="reportpage-container">
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
          <h2>แจ้งเรื่อง</h2>
          <button class="upload-image-link" @click="handleNavigateToImage">
            <i class="bi bi-cloud-arrow-up"></i>
            อัพโหลดไฟล์ภาพ
          </button>
        </div>

        <!-- Form Container -->
        <div class="form-container">
          <!-- Image Upload Section -->
          <div class="upload-section">
            <div class="upload-box" @click="$refs.fileInput.click()" :class="{ 'has-image': uploadedImage }">
              <div v-if="uploadedImage" class="uploaded-image">
                <img :src="uploadedImage" :alt="fileName">
                <button type="button" class="remove-btn" @click.stop="removeImage">✕</button>
              </div>
              <div v-else class="upload-placeholder">
                <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>อัพโหลดรูปภาพ</p>
                <small>กดที่นี่เพื่ออัพโหลดรูป</small>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleImageUpload"
            >
          </div>

          <!-- Form Fields -->
          <div class="form-fields">
            <!-- Category -->
            <div class="form-group">
              <label for="category">ประเภทปัญหา:</label>
              <select v-model="formData.category" id="category" class="form-control">
                <option value="">-- เลือกประเภทปัญหา --</option>
                <option value="ถังขยะไม่เพียงพอ">ถังขยะไม่เพียงพอ</option>
                <option value="เจ้าหน้าที่ไม่มาเก็บขยะ">เจ้าหน้าที่ไม่มาเก็บขยะ</option>
                <option value="ขยะเน่าเสีย">ขยะเน่าเสีย</option>
                <option value="ขยะอันตราย">ขยะอันตราย</option>
              </select>
            </div>

            <!-- Title -->
            <div class="form-group">
              <label for="title">หัวข้อ:</label>
              <input
                v-model="formData.title"
                type="text"
                id="title"
                class="form-control"
                placeholder="กรอกหัวข้อการแจ้งปัญหา"
              >
            </div>

            <!-- GPS Location -->
            <div class="form-group">
              <label for="map">📍 สถานที่ (ปักหมุด GPS):</label>
              <div id="map" ref="mapContainer" class="map-container"></div>
              <div class="location-info">
                <p>ละติจูด: <strong>{{ formData.latitude }}</strong></p>
                <p>ลองจิจูด: <strong>{{ formData.longitude }}</strong></p>
              </div>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="description">รายละเอียด:</label>
              <textarea
                v-model="formData.description"
                id="description"
                class="form-control"
                placeholder="กรอกรายละเอียดการแจ้งปัญหา"
                rows="5"
              ></textarea>
            </div>

            <!-- Contact -->
            <div class="form-group">
              <label for="contact">เบอร์โทรศัพท์:</label>
              <input
                v-model="formData.contact"
                type="tel"
                id="contact"
                class="form-control"
                placeholder="กรอกเบอร์โทรศัพท์"
              >
            </div>
          </div>

          <!-- Alert Messages -->
          <div v-if="successMessage" class="alert alert-success mt-3">
            <i class="bi bi-check-circle"></i>
            {{ successMessage }}
          </div>

          <div v-if="errorMessage" class="alert alert-danger mt-3">
            <i class="bi bi-exclamation-circle"></i>
            {{ errorMessage }}
          </div>

          <!-- Action Buttons -->
          <div class="button-group">
            <button
              @click="handleSubmit"
              :disabled="isLoading"
              class="btn btn-submit"
            >
              <span v-if="!isLoading">บันทึกข้อมูล</span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2"></span>
                กำลังบันทึก...
              </span>
            </button>
            <button
              @click="handleCancel"
              class="btn btn-cancel"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { defineEmits } from 'vue'
import L from 'leaflet'

const emit = defineEmits(['change-page'])

const userName = ref('โจโจ้')
const fileInput = ref(null)
const mapContainer = ref(null)
const map = ref(null)
const marker = ref(null)
const uploadedImage = ref(null)
const fileName = ref('')
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const menuItems = [
  { id: 'home', label: 'หน้าหลัก' },
  { id: 'report', label: 'แจ้งปัญหา' },
  { id: 'status', label: 'ติดตามสถานะ' },
  { id: 'admin', label: 'Admin Dashboard' }
]

const formData = ref({
  category: '',
  title: '',
  latitude: 13.7563,
  longitude: 100.5018,
  description: '',
  contact: '',
  image: null
})

onMounted(() => {
  initializeMap()
})

const initializeMap = () => {
  if (!mapContainer.value) return

  // Initialize map with Bangkok as default
  map.value = L.map(mapContainer.value).setView([formData.value.latitude, formData.value.longitude], 13)

  // Add tile layer from OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map.value)

  // Add initial marker
  addMarker(formData.value.latitude, formData.value.longitude)

  // Add click event to map
  map.value.on('click', (e) => {
    const { lat, lng } = e.latlng
    addMarker(lat, lng)
    formData.value.latitude = lat.toFixed(6)
    formData.value.longitude = lng.toFixed(6)
  })
}

const addMarker = (lat, lng) => {
  if (marker.value) {
    map.value.removeLayer(marker.value)
  }
  
  marker.value = L.marker([lat, lng], {
    icon: L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    })
  }).addTo(map.value)

  marker.value.bindPopup(`<b>ตำแหน่ง GPS</b><br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}`)
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errorMessage.value = 'ขนาดไฟล์ต้องไม่เกิน 5 MB'
      setTimeout(() => { errorMessage.value = '' }, 3000)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      errorMessage.value = 'โปรดเลือกไฟล์รูปภาพ'
      setTimeout(() => { errorMessage.value = '' }, 3000)
      return
    }

    fileName.value = file.name
    formData.value.image = file

    // Preview image
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target.result
    }
    reader.readAsDataURL(file)
    errorMessage.value = ''
  }
}

const removeImage = () => {
  uploadedImage.value = null
  fileName.value = ''
  formData.value.image = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleSubmit = async () => {
  // Validate form
  if (!formData.value.category) {
    errorMessage.value = 'กรุณาเลือกประเภทปัญหา'
    return
  }
  if (!formData.value.title) {
    errorMessage.value = 'กรุณากรอกหัวข้อ'
    return
  }
  if (!formData.value.latitude || !formData.value.longitude) {
    errorMessage.value = 'กรุณาปักหมุด GPS ที่สถานที่'
    return
  }
  if (!formData.value.description) {
    errorMessage.value = 'กรุณากรอกรายละเอียด'
    return
  }
  if (!formData.value.contact) {
    errorMessage.value = 'กรุณากรอกเบอร์โทรศัพท์'
    return
  }
  if (!uploadedImage.value) {
    errorMessage.value = 'กรุณาอัพโหลดรูปภาพ'
    return
  }

  errorMessage.value = ''
  isLoading.value = true

  try {
    // Create FormData for multipart upload
    const formDataToSend = new FormData()
    formDataToSend.append('category', formData.value.category)
    formDataToSend.append('title', formData.value.title)
    formDataToSend.append('latitude', formData.value.latitude)
    formDataToSend.append('longitude', formData.value.longitude)
    formDataToSend.append('description', formData.value.description)
    formDataToSend.append('contact', formData.value.contact)
    formDataToSend.append('image', formData.value.image)

    // Send to backend
    const response = await fetch('http://localhost:3001/api/reports', {
      method: 'POST',
      body: formDataToSend
    })

    if (!response.ok) {
      throw new Error('ส่งข้อมูลล้มเหลว')
    }

    // Show success message
    successMessage.value = '✓ อัพโหลดข้อมูลสำเร็จแล้ว'
    
    // Reset form
    setTimeout(() => {
      resetForm()
      emit('change-page', 'homepage')
    }, 2000)

  } catch (error) {
    errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล'
    isLoading.value = false
  }
}

const handleCancel = () => {
  if (confirm('คุณต้องการยกเลิกการแจ้งเรื่องใช่หรือไม่?')) {
    resetForm()
    emit('change-page', 'homepage')
  }
}

const handleNavigateToImage = () => {
  emit('change-page', 'reportimage')
}

const resetForm = () => {
  formData.value = {
    category: '',
    title: '',
    latitude: 13.7563,
    longitude: 100.5018,
    description: '',
    contact: '',
    image: null
  }
  uploadedImage.value = null
  fileName.value = ''
  successMessage.value = ''
  errorMessage.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleMenuClick = (menuId) => {
  if (menuId === 'home') {
    emit('change-page', 'homepage')
  } else if (menuId === 'report') {
    // Stay on report page
  } else if (menuId === 'status') {
    console.log('Navigate to status page')
  } else if (menuId === 'admin') {
    emit('change-page', 'dashboard')
  }
}

const handleLogout = () => {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    emit('change-page', 'login')
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

.reportpage-container {
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.content-title h2 {
  color: var(--text-dark);
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.upload-image-link {
  background-color: var(--secondary-green);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  align-self: center;
}

.upload-image-link:hover {
  background-color: #4a8044;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.upload-image-link i {
  font-size: 16px;
}

/* Form Container */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

/* Upload Section */
.upload-section {
  display: flex;
  justify-content: center;
}

.upload-box {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 400px;
  background-color: #f9f9f9;
}

.upload-box:hover {
  border-color: var(--primary-green);
  background-color: #f0f8f0;
}

.upload-box.has-image {
  border: 2px solid var(--success-color);
  background-color: #f0f8f0;
  padding: 0;
}

.uploaded-image {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  height: 300px;
  background-color: #f9f9f9;
}

.uploaded-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.remove-btn:hover {
  background-color: #d32f2f;
}

.upload-placeholder {
  padding: 20px;
}

.upload-icon {
  width: 60px;
  height: 60px;
  color: var(--primary-green);
  margin-bottom: 15px;
}

.upload-placeholder p {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-dark);
  margin: 10px 0;
}

.upload-placeholder small {
  color: #999;
  font-size: 13px;
}

/* Form Fields */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 14px;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Kanit', sans-serif;
  font-size: 14px;
  transition: 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(46, 89, 54, 0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

/* Map Container */
.map-container {
  width: 100%;
  height: 300px;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
  z-index: 1;
}

.location-info {
  background-color: #f0f8f0;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d4e8d4;
}

.location-info p {
  margin: 5px 0;
  font-size: 13px;
  color: var(--primary-green);
  font-weight: 600;
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
  color: rgb(0, 0, 0);
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

  .upload-box {
    max-width: 100%;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
