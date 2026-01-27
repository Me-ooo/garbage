<template>
  <div class="homepage-container">
    <header class="header">
      <div 
        class="user-profile" 
        @click="$router.push('/profile')"
        style="cursor: pointer;" 
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
        <div class="banner-box">
          <img
            src="/admin-sidebar.png"
            alt="Campaign Banner"
            @error="$event.target.src = 'https://placehold.co/250x150'"
          />
        </div>

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

      <main class="main-content">
        <div class="banner-top">
          <img
            src="/admin-banner.png"
            alt="Environment Banner"
            @error="$event.target.src = 'https://placehold.co/800x150'"
          />
        </div>

        <div class="search-bar">
          <input
            v-model="searchText"
            type="text"
            class="search-input"
            placeholder="ค้นหาปัญหา..."
            @input="handleFilterChange"
          />
          <select
            v-model="selectedCategory"
            class="category-select"
            @change="handleFilterChange"
          >
            <option value="all">สถานะ: ทั้งหมด</option>
            <option value="pending">⏳ รอดำเนินการ</option>
            <option value="in_progress">🔧 กำลังแก้ไข</option>
            <option value="resolved">✅ แก้ไขแล้ว</option>
          </select>
        </div>

        <div v-if="loading" class="text-center mt-5">
          <div class="spinner-border text-success" role="status"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>

        <div v-else class="report-list">
          <div v-for="report in reports" :key="report.id" class="report-card">
            <img
              :src="
                report.image_url
                  ? `http://localhost:3000${report.image_url}`
                  : '/no-image.png'
              "
              :alt="report.title"
              class="report-img"
              @error="$event.target.src = 'https://placehold.co/100x100?text=No+Image'"
            />

            <div class="report-info">
              <span class="status-badge" :class="getStatusClass(report.status)">
                {{ getStatusLabel(report.status) }}
              </span>

              <h3 class="report-title">{{ report.title }}</h3>
              <p class="report-desc">{{ report.description }}</p>
              <small class="text-muted">โดย: {{ report.username || "ไม่ระบุ" }}</small>
            </div>

            <div class="report-meta">
              <span>{{ formatTime(report.created_at) }}</span>
              <span>{{ formatDate(report.created_at) }}</span>
            </div>
          </div>

          <div v-if="reports.length === 0" class="empty-state">
            <p>ไม่พบรายการแจ้งปัญหา</p>
          </div>

          <div class="pagination-container" v-if="totalPages > 0">
            <button
              class="page-btn nav-btn"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              &lt;
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              class="page-btn number-btn"
              :class="{ active: currentPage === page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>

            <button
              class="page-btn nav-btn"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              &gt;
            </button>
          </div>
        </div>

        <button class="fab" @click="openNewReport" title="แจ้งปัญหาใหม่">+</button>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const userName = ref("Guest");
const reports = ref([]);
const loading = ref(false);
const searchText = ref("");
const selectedCategory = ref("all");

// --- ตัวแปรสำหรับ Pagination ---
const currentPage = ref(1);
const totalPages = ref(1);

const menuItems = [
  { id: "home", label: "หน้าหลัก" },
  { id: "report", label: "แจ้งปัญหา" },
  { id: "status", label: "ติดตามสถานะ" },
  { id: "admin", label: "Admin Dashboard" },
];

// Computed Property สำหรับดึงรูปโปรไฟล์
const userImage = computed(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    // ถ้ามีรูปใน DB ให้ใช้รูปนั้น ถ้าไม่มีให้ใช้รูป Default
    return user.image_url ? `http://localhost:3000${user.image_url}` : '/admin-profile.png';
  }
  return '/admin-profile.png';
});

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.fullname || user.username) {
    userName.value = user.fullname || user.username;
  }
  await fetchReports();
});

const fetchReports = async (page = 1) => {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get("http://localhost:3000/api/reports", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: page,
        limit: 2, // 🔴 ปรับเป็น 2 เพื่อเทสหน้า (เสร็จแล้วเปลี่ยนเป็น 6)
        search: searchText.value,
        status: selectedCategory.value,
      },
    });

    reports.value = response.data.data;
    currentPage.value = response.data.currentPage;
    totalPages.value = response.data.totalPages;
  } catch (err) {
    console.error("Error fetching reports:", err);
    if (err.response && err.response.status === 401) {
      router.push("/login");
    }
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = () => {
  currentPage.value = 1;
  fetchReports(1);
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchReports(page);
  }
};

// Helper Functions
const getStatusClass = (status) => {
  if (status === "pending") return "status-pending";
  if (status === "in_progress") return "status-progress";
  if (status === "resolved") return "status-done";
  return "";
};
const getStatusLabel = (status) => {
  if (status === "pending") return "รอดำเนินการ";
  if (status === "in_progress") return "กำลังแก้ไข";
  if (status === "resolved") return "แก้ไขแล้ว";
  return status;
};
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};
const formatTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
const openNewReport = () => {
  router.push("/reportpage");
};
const handleMenuClick = (menuId) => {
  if (menuId === "home") fetchReports(1);
  else if (menuId === "report") router.push("/reportpage");
  else if (menuId === "admin") router.push("/admin");
};
const handleLogout = () => {
  if (confirm("ออกจากระบบ?")) {
    localStorage.clear();
    router.push("/login");
  }
};
</script>

<style scoped>
:root {
  --primary-green: #2e5936;
  --secondary-green: #5c9454;
  --bg-light: #e8f5e9;
  --text-dark: #333;
  --status-pending: #fff3cd;
  --status-progress: #cff4fc;
  --status-done: #d1e7dd;
}

* {
  box-sizing: border-box;
}

.homepage-container {
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

/* Header */
.header {
  background-color: var(--primary-green);
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

/* Main Layout */
.container {
  display: flex;
  flex: 1;
  max-width: 1200px;
  margin: 20px auto;
  gap: 20px;
  padding: 0 10px;
  width: 100%;
  overflow-y: auto;
}

/* Sidebar */
.sidebar {
  width: 250px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.banner-box {
  background-color: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.banner-box img {
  width: 100%;
  display: block;
}

.nav-menu {
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.menu-btn {
  background-color: #eee;
  border: 1px solid #ccc;
  padding: 12px;
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
  flex-grow: 1;
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.banner-top {
  width: 881px;
  height: 154px;
  max-width: 100%;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
}
.banner-top img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Search Bar */
.search-bar {
  background-color: var(--secondary-green);
  padding: 10px;
  border-radius: 10px;
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex-grow: 1;
  padding: 8px 15px;
  border-radius: 5px;
  border: none;
  outline: none;
  font-family: "Kanit", sans-serif;
}

.category-select {
  padding: 8px 15px;
  border-radius: 20px;
  border: none;
  background-color: white;
  cursor: pointer;
  font-family: "Kanit", sans-serif;
}

/* Report List */
.report-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.report-card {
  border: 1px solid #ddd;
  border-radius: 15px;
  padding: 15px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  transition: transform 0.2s;
  background: #fff;
}
.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
  background-color: #eee;
  flex-shrink: 0;
  border: 1px solid #eee;
}

.report-info {
  flex-grow: 1;
}

.report-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 5px 0;
}

.report-desc {
  font-size: 0.95rem;
  color: #666;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}
.status-progress {
  background-color: #cff4fc;
  color: #055160;
}
.status-done {
  background-color: #d1e7dd;
  color: #0f5132;
}

.report-meta {
  text-align: right;
  font-size: 0.85rem;
  color: #888;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 80px;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px; /* เพิ่มช่องว่าง */
  margin-top: 20px;
  padding: 10px;
  padding-bottom: 20px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* กลม */
  border: 1px solid #ddd;
  background: white;
  color: black; /* ดำ */
  cursor: pointer;
  font-family: "Kanit", sans-serif;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.page-btn.active {
  background-color: #d1e7dd;
  border: 2px solid var(--primary-green); /* ขอบเขียวหนา */
  color: black;
  font-weight: 800;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(46, 89, 54, 0.2);
}

.page-btn:disabled {
  background-color: #f9f9f9;
  color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  border: 1px solid #eee;
}

.nav-btn {
  font-size: 18px;
  color: black;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background-color: #00c853;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  border: none;
  transition: 0.3s;
  z-index: 99;
}
.fab:hover {
  transform: scale(1.1);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    margin: 10px auto;
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
    min-width: 45%;
  }
  .fab {
    bottom: 20px;
    right: 20px;
  }
  .report-card {
    flex-direction: column;
  }
  .report-img {
    width: 100%;
    height: 150px;
  }
  .report-meta {
    text-align: left;
    flex-direction: row;
    gap: 10px;
    margin-top: 10px;
  }
}
</style>