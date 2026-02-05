<template>
  <div class="admin-container">
    <header class="header">
      <div
        class="user-profile"
        @click="$router.push('/profile')"
        style="cursor: pointer"
        title="แก้ไขโปรไฟล์"
      >
        <img
          :src="userImage"
          alt="Admin Avatar"
          class="profile-img"
          @error="$event.target.src = 'https://placehold.co/40x40?text=Admin'"
        />
        <span>{{ userName }}</span>
      </div>
      <button class="logout-btn" @click="logout">ออกจากระบบ</button>
    </header>

    <div class="container">
      <aside class="sidebar">
        <div class="banner-box">
          <img
            src="/admin-sidebar.png"
            alt="Admin Banner"
            @error="$event.target.src = 'https://placehold.co/250x150'"
          />
        </div>

        <div class="nav-menu">
          <button
            class="menu-btn"
            :class="{ 'active-btn': activeTab === 'reports' }"
            @click="activeTab = 'reports'"
          >
            <i class="bi bi-file-earmark-text-fill"></i> รายการปัญหา
          </button>

          <button
            class="menu-btn"
            :class="{ 'active-btn': activeTab === 'users' }"
            @click="activeTab = 'users'"
          >
            <i class="bi bi-people-fill"></i> รายชื่อผู้ใช้
          </button>

          <button class="menu-btn back-home-btn" @click="goToHome">
            <i class="bi bi-house-fill"></i> กลับหน้าหลัก
          </button>
        </div>
      </aside>

      <main class="main-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon green-icon"><i class="bi bi-people-fill"></i></div>
            <div class="stat-info">
              <p class="stat-label">ผู้ใช้งานทั้งหมด</p>
              <h3>{{ users.length }} <small>คน</small></h3>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue-icon">
              <i class="bi bi-file-earmark-text-fill"></i>
            </div>
            <div class="stat-info">
              <p class="stat-label">เรื่องร้องเรียนทั้งหมด</p>
              <h3>{{ reports.length }} <small>รายการ</small></h3>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon yellow-icon"><i class="bi bi-clock-history"></i></div>
            <div class="stat-info">
              <p class="stat-label">รอการตรวจสอบ</p>
              <h3>{{ pendingCount }} <small>รายการ</small></h3>
            </div>
          </div>
        </div>

        <div class="content-header">
          <h2>
            {{ activeTab === "reports" ? "จัดการรายการปัญหา" : "จัดการรายชื่อผู้ใช้" }}
          </h2>
        </div>

        <div class="search-bar">
          <input
            v-model="searchText"
            type="text"
            class="search-input"
            :placeholder="
              activeTab === 'reports'
                ? 'ค้นหาหัวข้อ, รายละเอียด...'
                : 'ค้นหาชื่อ, อีเมล...'
            "
          />
          <select
            v-if="activeTab === 'reports'"
            v-model="filterStatus"
            class="category-select"
          >
            <option value="all">สถานะ: ทั้งหมด</option>
            <option value="pending">⏳ รอดำเนินการ</option>
            <option value="in_progress">🔧 กำลังแก้ไข</option>
            <option value="resolved">✅ แก้ไขแล้ว</option>
          </select>
        </div>

        <div v-if="loading" class="text-center mt-5">
          <div class="spinner-border text-success" role="status"></div>
          <p class="mt-2 text-muted">กำลังโหลดข้อมูล...</p>
        </div>

        <div v-else-if="activeTab === 'reports'" class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th width="80">รูปภาพ</th>
                <th width="20%">หัวข้อ</th>
                <th width="15%">ผู้แจ้ง</th>
                <th width="120">วันที่</th>
                <th width="140">สถานะ</th>
                <th width="120" class="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in filteredReports" :key="report.id">
                <td>
                  <div class="img-wrapper">
                    <img
                      :src="getImageUrl(report.image_url)"
                      class="table-img"
                      @error="
                        $event.target.src = 'https://placehold.co/50x50?text=No+Img'
                      "
                    />
                  </div>
                </td>
                <td>
                  <div class="fw-bold">{{ report.title }}</div>
                  <small
                    class="text-muted text-truncate d-block"
                    style="max-width: 200px"
                    >{{ report.description }}</small
                  >
                </td>
                <td>{{ report.username || "ไม่ระบุ" }}</td>
                <td>{{ formatDate(report.created_at) }}</td>
                <td>
                  <select
                    class="status-select"
                    :class="getStatusClass(report.status)"
                    v-model="report.status"
                    @change="updateStatus(report.id, report.status)"
                  >
                    <option value="pending">⏳ รอดำเนินการ</option>
                    <option value="in_progress">🔧 กำลังแก้ไข</option>
                    <option value="resolved">✅ แก้ไขแล้ว</option>
                  </select>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      class="btn-icon view"
                      @click="viewAndForward(report)"
                      title="ดูรายละเอียด"
                    >
                      <i class="bi bi-eye-fill"></i>
                    </button>
                    <button
                      class="btn-icon delete"
                      @click="deleteReport(report.id)"
                      title="ลบรายการ"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredReports.length === 0">
                <td colspan="6" class="text-center text-muted py-5">
                  ไม่พบข้อมูลที่ค้นหา
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="activeTab === 'users'" class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th width="80">รูป</th>
                <th>ชื่อผู้ใช้</th>
                <th>อีเมล</th>
                <th>เบอร์โทรศัพท์</th>
                <th>สิทธิ์</th>
                <th class="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="img-wrapper circle">
                    <img
                      :src="getImageUrl(user.image_url)"
                      class="table-img"
                      @error="$event.target.src = 'https://placehold.co/40x40?text=User'"
                    />
                  </div>
                </td>
                <td class="fw-bold">{{ user.fullname || user.username }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone || "-" }}</td>
                <td>
                  <span
                    class="role-badge"
                    :class="user.role === 'admin' ? 'role-admin' : 'role-user'"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="action-buttons">
                    <button
                      v-if="user.role !== 'admin'"
                      class="btn-icon view"
                      @click="changeUserRole(user.id, 'admin')"
                      title="ตั้งเป็น Admin"
                    >
                      <i class="bi bi-shield-lock-fill"></i>
                    </button>
                    <button
                      v-if="user.role !== 'admin'"
                      class="btn-icon delete"
                      @click="deleteUser(user.id)"
                      title="ลบผู้ใช้"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="text-center text-muted py-5">
                  ไม่พบรายชื่อผู้ใช้
                </td>
              </tr>
            </tbody>
          </table>
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

// ✅ ดึงค่า Base URL (ถ้าใน .env เป็น / ค่านี้จะเป็น /)
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

// ✅ ปรับปรุง getImageUrl ให้รองรับ Proxy (ดึงรูปจาก Port 3000)
const getImageUrl = (path) => {
  if (!path) return "/admin-profile.png";
  if (path.startsWith("http")) return path;
  
  // ตัด /api ออกเพื่อให้เหลือแค่ Domain ของ ngrok
  let cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  cleanBase = cleanBase.replace('/api', '');
  
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
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
    formData.value.image = file; // เก็บไฟล์จริงไว้ส่ง Backend
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImage.value = e.target.result; // สำหรับ Preview ในหน้าเว็บ
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

// 🚩 ฟังก์ชันส่งข้อมูล (แก้ไข URL)
const handleSubmit = async () => {
  if (!formData.value.category || !formData.value.title || !formData.value.contact) {
    errorMessage.value = "กรุณากรอกข้อมูลให้ครบถ้วน";
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

    // ✅ จัดการ URL ให้เข้ากับระบบ Proxy
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    
    await axios.post(`${baseUrl}/api/reports`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    successMessage.value = "✓ แจ้งปัญหาเรียบร้อยแล้ว!";
    setTimeout(() => { router.push("/"); }, 1500);
  } catch (error) {
    console.error("Submit Error:", error);
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
/* Style เดิมของคุณ (ไม่มีการเปลี่ยนแปลง) */
:root {
  --primary-green: #2e5936;
}
* {
  box-sizing: border-box;
}

.admin-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-image: url("/background.png");
  background-size: cover;
  font-family: "Kanit", sans-serif;
  overflow: hidden;
}
.header {
  background: #2e5936;
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
.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
}
.logout-btn {
  background: #ddd;
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
}

.container {
  display: flex;
  flex: 1;
  max-width: 1200px;
  margin: 20px auto;
  gap: 20px;
  padding: 0 10px;
  overflow-y: auto;
}
.sidebar {
  width: 250px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.banner-box {
  background: white;
  border-radius: 15px;
  overflow: hidden;
}
.banner-box img {
  width: 100%;
  display: block;
}
.nav-menu {
  background: white;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.menu-btn {
  background: #f8f9fa;
  border: 1px solid #eee;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  font-weight: 600;
  font-family: "Kanit";
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.menu-btn:hover {
  background-color: #eee;
  transform: translateX(3px);
}
.active-btn {
  background: #2e5936;
  color: white;
  border: none;
}
.active-btn:hover {
  background: #1b3820;
  transform: none;
}
.back-home-btn {
  margin-top: auto;
  background: #555;
  color: white;
}

.main-content {
  flex-grow: 1;
  background: white;
  border-radius: 15px;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}
.stat-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  color: white;
}
.green-icon {
  background: #4caf50;
}
.blue-icon {
  background: #2196f3;
}
.yellow-icon {
  background: #ffc107;
}
.stat-info h3 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

/* Search Bar */
.search-bar {
  background-color: white;
  padding: 10px;
  border-radius: 12px;
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.search-input {
  flex-grow: 1;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #eee;
  outline: none;
  font-family: "Kanit";
  background-color: #f9f9f9;
}
.category-select {
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #eee;
  background-color: #f9f9f9;
  cursor: pointer;
  font-family: "Kanit";
}

/* Table */
.custom-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.custom-table th {
  background: #f8f9fa;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #eee;
}
.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}
.img-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}
.img-wrapper.circle {
  border-radius: 50%;
}
.table-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-select {
  padding: 6px 12px;
  border-radius: 20px;
  border: none;
  font-weight: 600;
  text-align: center;
  font-size: 0.85rem;
  width: 100%;
  cursor: pointer;
}
.status-pending {
  background: #fff3cd;
  color: #856404;
}
.status-progress {
  background: #cff4fc;
  color: #055160;
}
.status-resolved {
  background: #d1e7dd;
  color: #0f5132;
}

.role-badge {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
}
.role-admin {
  background-color: #f8d7da;
  color: #721c24;
}
.role-user {
  background-color: #d1e7dd;
  color: #0f5132;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.btn-icon {
  background: white;
  border: 1px solid #eee;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
.btn-icon:hover {
  transform: translateY(-2px);
}
.view {
  color: #0d6efd;
}
.view:hover {
  background: #0d6efd;
  color: white;
}
.delete {
  color: #dc3545;
}
.delete:hover {
  background: #dc3545;
  color: white;
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
  .table-responsive {
    overflow-x: auto;
  }
}
</style>
