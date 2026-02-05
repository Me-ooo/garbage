<template>
  <div class="reportpage-container">
    <header class="header">
      <div
        class="user-profile"
        @click="$router.push('/profile')"
        style="cursor: pointer"
        title="แก้ไขโปรไฟล์"
      >
        <img
          :src="userImage"
          alt="User Avatar"
          @error="$event.target.src = 'https://placehold.co/40x40?text=User'"
        />
        <span>สวัสดีคุณ {{ userName }}</span>
      </div>
      <button class="logout-btn" @click="handleLogout">ออกจากระบบ</button>
    </header>

    <div class="container">
      <aside class="sidebar">
        <div class="nav-menu">
          <button
            v-for="menu in menuItems"
            :key="menu.id"
            class="menu-btn"
            @click="handleMenuClick(menu.id)"
          >
            {{ menu.label }}
          </button>
        </div>
      </aside>

      <main class="main-content">
        <div class="content-title">
          <h2>แจ้งเรื่อง</h2>
          <button class="upload-image-link" @click="$refs.fileInput.click()">
            <i class="bi bi-cloud-arrow-up"></i>
            อัพโหลดไฟล์ภาพ
          </button>
        </div>

        <div class="form-container">
          <div class="upload-section">
            <div
              class="upload-box"
              @click="$refs.fileInput.click()"
              :class="{ 'has-image': uploadedImage }"
            >
              <div v-if="uploadedImage" class="uploaded-image">
                <img :src="uploadedImage" :alt="fileName" />
                <button type="button" class="remove-btn" @click.stop="removeImage">
                  ✕
                </button>
              </div>
              <div v-else class="upload-placeholder">
                <svg
                  class="upload-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>อัพโหลดรูปภาพ</p>
                <small>กดที่นี่เพื่อเลือกรูป (สูงสุด 5MB)</small>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleImageUpload"
            />
          </div>

          <div class="form-fields">
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

            <div class="form-group">
              <label for="title">หัวข้อ:</label>
              <input
                v-model="formData.title"
                type="text"
                id="title"
                class="form-control"
                placeholder="กรอกหัวข้อการแจ้งปัญหา"
              />
            </div>

            <div class="form-group">
              <label for="map">📍 สถานที่ (เลื่อนหมุดเพื่อระบุพิกัด):</label>
              <div id="map" ref="mapContainer" class="map-container"></div>
              <div class="location-info">
                <p>
                  ละติจูด: <strong>{{ formData.latitude }}</strong>
                </p>
                <p>
                  ลองจิจูด: <strong>{{ formData.longitude }}</strong>
                </p>
              </div>
            </div>

            <div class="form-group">
              <label for="description">รายละเอียด:</label>
              <textarea
                v-model="formData.description"
                id="description"
                class="form-control"
                placeholder="กรอกรายละเอียดเพิ่มเติม..."
                rows="5"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="contact">เบอร์โทรศัพท์:</label>
              <input
                v-model="formData.contact"
                type="tel"
                id="contact"
                class="form-control"
                maxlength="10"
                placeholder="0xxxxxxxxx"
                @input="formData.contact = $event.target.value.replace(/[^0-9]/g, '')"
              />
            </div>
          </div>

          <div v-if="successMessage" class="alert alert-success mt-3">
            <i class="bi bi-check-circle"></i> {{ successMessage }}
          </div>

          <div v-if="errorMessage" class="alert alert-danger mt-3">
            <i class="bi bi-exclamation-circle"></i> {{ errorMessage }}
          </div>

          <div class="button-group">
            <button @click="handleSubmit" :disabled="isLoading" class="btn btn-submit">
              <span v-if="!isLoading">บันทึกข้อมูล</span>
              <span v-else>กำลังบันทึก...</span>
            </button>
            <button @click="handleCancel" class="btn btn-cancel" :disabled="isLoading">
              ยกเลิก
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ⚠️ แก้ Bug Icon Leaflet หาย
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const router = useRouter();

// ✅ ดึง Base URL (ถ้าใน .env เป็น / ค่านี้จะเป็น /)
const API_URL = import.meta.env.VITE_API_BASE_URL;

const userName = ref("Guest");
const fileInput = ref(null);
const mapContainer = ref(null);
const map = ref(null);
const marker = ref(null);
const uploadedImage = ref(null);
const fileName = ref("");
const isLoading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const menuItems = [
  { id: "home", label: "หน้าหลัก" },
  { id: "report", label: "แจ้งปัญหา" },
];

const formData = ref({
  category: "",
  title: "",
  latitude: 13.7563,
  longitude: 100.5018,
  description: "",
  contact: "",
  image: null,
});

// ✅ ปรับปรุง getImageUrl ให้รองรับ Proxy (ตัด localhost ออก)
const getImageUrl = (path) => {
  if (!path) return "/admin-profile.png";

  let cleanPath = path;
  if (path.includes("localhost:3000")) {
    cleanPath = path.split("localhost:3000")[1];
  }

  if (cleanPath.startsWith("data:") || cleanPath.startsWith("http")) return cleanPath;

  let cleanBase = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  cleanBase = cleanBase.replace("/api", "");

  const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `${cleanBase}${finalPath}`;
};

const userImage = computed(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.image_url ? getImageUrl(user.image_url) : "/admin-profile.png";
  }
  return "/admin-profile.png";
});

onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    userName.value = user.fullname || user.username || "Guest";
  }

  nextTick(() => {
    initializeMap();
  });
});

const initializeMap = () => {
  if (!mapContainer.value) return;
  if (map.value) map.value.remove();

  map.value = L.map(mapContainer.value).setView(
    [formData.value.latitude, formData.value.longitude],
    13
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map.value);

  addMarker(formData.value.latitude, formData.value.longitude);

  map.value.on("click", (e) => {
    const { lat, lng } = e.latlng;
    addMarker(lat, lng);
    formData.value.latitude = lat.toFixed(6);
    formData.value.longitude = lng.toFixed(6);
  });

  setTimeout(() => {
    if (map.value) map.value.invalidateSize();
  }, 100);
};

const addMarker = (lat, lng) => {
  if (marker.value) map.value.removeLayer(marker.value);
  marker.value = L.marker([lat, lng]).addTo(map.value);
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์ต้องไม่เกิน 5 MB");
      return;
    }
    fileName.value = file.name;
    formData.value.image = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
    errorMessage.value = "";
  }
};

const removeImage = () => {
  uploadedImage.value = null;
  fileName.value = "";
  formData.value.image = null;
  if (fileInput.value) fileInput.value.value = "";
};

const handleSubmit = async () => {
  if (!formData.value.category || !formData.value.title || !formData.value.contact) {
    errorMessage.value = "กรุณากรอกข้อมูลให้ครบถ้วน (ประเภท, หัวข้อ, เบอร์โทร)";
    return;
  }
  if (!formData.value.image) {
    errorMessage.value = "กรุณาอัพโหลดรูปภาพประกอบ";
    return;
  }

  errorMessage.value = "";
  isLoading.value = true;

  try {
    const data = new FormData();
    data.append("title", `[${formData.value.category}] ${formData.value.title}`);
    data.append("description", formData.value.description);
    data.append("latitude", formData.value.latitude);
    data.append("longitude", formData.value.longitude);
    data.append("contact", formData.value.contact);
    data.append("image", formData.value.image);

    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id) data.append("user_id", user.id);
    }

    const token = localStorage.getItem("token");

    // 🚩 ปรับจุดส่ง URL ให้เข้ากับระบบ Proxy
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;

    // ยิงไปที่ /api/reports ผ่าน Proxy
    await axios.post(`${baseUrl}/api/reports`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    successMessage.value = "✓ แจ้งปัญหาเรียบร้อยแล้ว!";
    setTimeout(() => {
      router.push("/");
    }, 1500);
  } catch (error) {
    console.error(error);
    errorMessage.value = error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งข้อมูล";
  } finally {
    isLoading.value = false;
  }
};

const handleCancel = () => {
  if (confirm("ยกเลิกการแจ้งเรื่อง? ข้อมูลที่กรอกจะหายไป")) router.push("/");
};

const handleMenuClick = (menuId) => {
  if (menuId === "home") router.push("/");
  else if (menuId === "report") router.push("/reportpage");
};

const handleLogout = () => {
  if (confirm("ยืนยันออกจากระบบ?")) {
    localStorage.clear();
    router.push("/login");
  }
};
</script>

<style scoped>
/* Style เดิมของคุณ */
* {
  box-sizing: border-box;
}

.reportpage-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-image: url("/background.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  font-family: "Kanit", sans-serif;
  overflow: hidden;
}

.header {
  background-color: #2e5936;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: opacity 0.2s;
}

.user-profile:hover {
  opacity: 0.8;
}

.user-profile img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
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
}
.logout-btn:hover {
  background-color: #ccc;
}

.container {
  display: flex;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
}

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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  font-family: "Kanit", sans-serif;
}
.menu-btn:hover {
  background-color: #e0e0e0;
}

.main-content {
  flex: 1;
  background-color: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.content-title {
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.content-title h2 {
  margin: 0;
  color: #333;
}
.upload-image-link {
  background-color: #5c9454;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.upload-box {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  width: 100%;
  max-width: 400px;
  background-color: #f9f9f9;
  transition: 0.2s;
}
.upload-box:hover {
  border-color: #2e5936;
  background-color: #f0f8f0;
}
.upload-box.has-image {
  padding: 0;
  border: 2px solid #66bb6a;
}
.uploaded-image {
  position: relative;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 10px;
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
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
}
.upload-icon {
  width: 50px;
  height: 50px;
  color: #2e5936;
  margin-bottom: 10px;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
}
.form-group label {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
  display: block;
}
.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: "Kanit", sans-serif;
}
.map-container {
  width: 100%;
  height: 250px;
  border-radius: 8px;
  border: 1px solid #ddd;
  z-index: 1;
}
.location-info p {
  margin: 5px 0;
  font-size: 13px;
  color: #2e5936;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}
.btn {
  padding: 10px 40px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  transition: 0.2s;
}

.btn-submit {
  background-color: #2e5936;
  color: white;
  border: 2px solid #2e5936;
}
.btn-submit:hover:not(:disabled) {
  background-color: #1b3820;
}
.btn-submit:disabled {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: white;
  color: #333;
  border: 2px solid #ddd;
}
.btn-cancel:hover {
  background-color: #eee;
}

.alert {
  padding: 10px;
  border-radius: 6px;
  text-align: center;
  font-weight: bold;
}
.alert-success {
  background: #d4edda;
  color: #155724;
}
.alert-danger {
  background: #f8d7da;
  color: #721c24;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
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
  }
}
</style>
