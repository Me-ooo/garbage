<template>
  <div class="overview-container">
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
          <button class="menu-btn active-btn">
            <i class="bi bi-bar-chart-line-fill"></i> ภาพรวมระบบ
          </button>

          <button class="menu-btn" @click="goToAdmin('reports')">
            <i class="bi bi-file-earmark-text-fill"></i> รายการปัญหา
          </button>

          <button class="menu-btn" @click="goToAdmin('users')">
            <i class="bi bi-people-fill"></i> รายชื่อผู้ใช้
          </button>

          <div class="spacer"></div>

          <button class="menu-btn back-home-btn" @click="$router.push('/')">
            <i class="bi bi-house-door-fill"></i> กลับหน้าหลัก
          </button>
        </div>
      </aside>

      <main class="main-content">
        <div class="content-header">
          <h2>📊 ภาพรวมสถิติระบบ</h2>
          <p>สรุปข้อมูลการใช้งานและการแจ้งปัญหาทั้งหมด</p>
        </div>

        <div v-if="loading" class="text-center mt-5">
          <div class="spinner-border text-success" role="status"></div>
        </div>

        <div v-else>
          <AdminStats
            :totalUsers="users.length"
            :totalReports="reports.length"
            :pendingReports="pendingCount"
          />

          <div class="summary-section mt-4">
            <h3 class="section-title">
              <i class="bi bi-pie-chart-fill"></i> สรุปสถานะงาน
            </h3>

            <div class="summary-grid">
              <div class="summary-card resolved">
                <div class="card-content-wrapper">
                  <div class="card-icon">
                    <i class="bi bi-check-circle-fill"></i>
                  </div>
                  <div class="card-details">
                    <h4>แก้ไขแล้ว</h4>
                    <p>{{ resolvedCount }} <span class="unit">รายการ</span></p>
                  </div>
                </div>
              </div>

              <div class="summary-card progress">
                <div class="card-content-wrapper">
                  <div class="card-icon">
                    <i class="bi bi-tools"></i>
                  </div>
                  <div class="card-details">
                    <h4>กำลังดำเนินการ</h4>
                    <p>{{ progressCount }} <span class="unit">รายการ</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import AdminStats from "./AdminStats.vue";

const router = useRouter();
const reports = ref([]);
const users = ref([]);
const loading = ref(false);
const userName = ref("Admin");

const userImage = computed(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.image_url
      ? `http://localhost:3000${user.image_url}`
      : "/admin-profile.png";
  }
  return "/admin-profile.png";
});

const pendingCount = computed(
  () => reports.value.filter((r) => r.status === "pending").length
);
const resolvedCount = computed(
  () => reports.value.filter((r) => r.status === "resolved").length
);
const progressCount = computed(
  () => reports.value.filter((r) => r.status === "in_progress").length
);

const fetchData = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const [reportsRes, usersRes] = await Promise.all([
      axios.get("http://localhost:3000/api/admin/reports", config),
      axios.get("http://localhost:3000/api/users", config),
    ]);

    reports.value = reportsRes.data;
    users.value = usersRes.data;
  } catch (err) {
    if (err.response?.status === 401) router.push("/login");
  }
  loading.value = false;
};

const goToAdmin = (tab) => {
  router.push("/admin");
};

const logout = () => {
  if (confirm("ต้องการออกจากระบบ?")) {
    localStorage.clear();
    router.push("/login");
  }
};

onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.fullname) userName.value = user.fullname;
  fetchData();
});
</script>

<style scoped>
:root {
  --primary-green: #2e5936;
}
* {
  box-sizing: border-box;
}

.overview-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-image: url("/background.png");
  background-size: cover;
  font-family: "Kanit";
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
  cursor: pointer;
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
.banner-box img {
  width: 100%;
  border-radius: 15px;
  display: block;
}

/* Sidebar Menu */
.nav-menu {
  background: white;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.menu-btn {
  padding: 12px 15px;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  font-weight: 600;
  font-family: "Kanit";
  transition: 0.2s;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid transparent;
  background: #f8f9fa; /* Default background */
  color: #555;
}

.menu-btn:hover {
  background-color: #e0e0e0;
}
.menu-btn i {
  font-size: 1.2rem;
  width: 25px;
  text-align: center;
}

/* ✅ 1. แก้ไขปุ่ม Active ให้เป็นสีเขียว */
.active-btn {
  background-color: #2e5936 !important;
  color: white !important;
  box-shadow: 0 4px 8px rgba(46, 89, 54, 0.3);
}
.active-btn i {
  color: white !important;
}

.back-home-btn {
  background-color: #555;
  color: white;
  justify-content: center;
  margin-top: auto;
}
.back-home-btn:hover {
  background-color: #333;
}
.spacer {
  flex-grow: 1;
}

/* Main Content */
.main-content {
  flex-grow: 1;
  background: white;
  border-radius: 15px;
  padding: 40px;
  overflow-y: auto;
}
.content-header {
  margin-bottom: 30px;
  text-align: center;
}
.content-header h2 {
  margin-bottom: 5px;
  color: #333;
}
.content-header p {
  color: #888;
}

/* ✅ 2. ปรับขนาด Summary Cards ให้ใหญ่สะใจ */
.summary-section {
  background: #fdfdfd;
  padding: 30px;
  border-radius: 20px;
  border: 1px solid #eee;
}
.section-title {
  font-size: 1.5rem;
  color: #555;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-grid {
  display: grid;
  /* ปรับ minmax ให้กว้างขึ้น */
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.summary-card {
  padding: 40px 30px; /* เพิ่ม Padding */
  border-radius: 25px;
  color: white;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
  min-height: 180px; /* เพิ่มความสูง */
}
.summary-card:hover {
  transform: translateY(-8px);
}

.card-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
}

.card-icon {
  font-size: 4rem; /* ไอคอนใหญ่ */
  background: rgba(255, 255, 255, 0.25);
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.card-details {
  text-align: right;
  flex-grow: 1;
}
.card-details h4 {
  margin: 0 0 10px 0;
  font-size: 1.8rem;
  font-weight: 500;
  opacity: 0.95;
  white-space: nowrap;
}
.card-details p {
  margin: 0;
  font-size: 4.5rem;
  font-weight: bold;
  line-height: 1;
} /* ตัวเลขใหญ่ยักษ์ */
.unit {
  font-size: 1.2rem;
  font-weight: normal;
  opacity: 0.8;
  margin-left: 5px;
}

.resolved {
  background: linear-gradient(135deg, #5c9454 0%, #3e6b39 100%);
  border-bottom: 8px solid #2e5936;
}
.progress {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-bottom: 8px solid #1a5276;
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
  .card-details h4 {
    font-size: 1.4rem;
  }
  .card-details p {
    font-size: 3.5rem;
  }
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
  }
}
</style>
