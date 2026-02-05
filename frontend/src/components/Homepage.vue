<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_BASE_URL;

const userName = ref("Guest");
const reports = ref([]);
const loading = ref(false);
const searchText = ref("");
const selectedCategory = ref("all");

const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 6;

const menuItems = [
  { id: "home", label: "หน้าหลัก" },
  { id: "report", label: "แจ้งปัญหา" },
];

// ✅ ฟังก์ชันช่วยตัดข้อความในวงเล็บ [] ออก
const cleanTitle = (title) => {
  if (!title) return "";
  // Regex: ลบข้อความที่ขึ้นต้นด้วย [ ตามด้วยอะไรก็ได้ จนถึง ] แล้วตัดช่องว่างหัวท้าย
  return title.replace(/\[.*?\]/g, "").trim();
};

const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 1;
  const range = [];
  const rangeWithDots = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) range.push(i);
    return range;
  }

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  let l;
  for (let i of range) {
    if (l) {
      if (i - l === 2) rangeWithDots.push(l + 1);
      else if (i - l !== 1) rangeWithDots.push("...");
    }
    rangeWithDots.push(i);
    l = i;
  }
  return rangeWithDots;
});

const getImageUrl = (path) => {
  if (!path) return "/no-image.png";
  if (path.startsWith("http")) return path;
  let cleanBase = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  cleanBase = cleanBase.replace("/api", "");
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
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    const response = await axios.get(`${baseUrl}/api/reports`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let allReports = response.data;

    if (selectedCategory.value !== "all") {
      allReports = allReports.filter((r) => r.status === selectedCategory.value);
    }

    if (searchText.value) {
      const query = searchText.value.toLowerCase();
      allReports = allReports.filter(
        (r) =>
          (r.title && r.title.toLowerCase().includes(query)) ||
          (r.description && r.description.toLowerCase().includes(query))
      );
    }

    totalPages.value = Math.ceil(allReports.length / itemsPerPage);
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    reports.value = allReports.slice(start, end);
    currentPage.value = page;
  } catch (err) {
    console.error("Error fetching reports:", err);
    if (err.response && err.response.status === 401) {
      router.push("/login");
    }
  } finally {
    loading.value = false;
  }
};

const viewReportDetails = (report) => {
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;
  
  // ✅ ใช้ cleanTitle ตัดวงเล็บออกก่อนแสดงใน Popup
  const displayTitle = cleanTitle(report.title);

  Swal.fire({
    title: `<h3 style="color:#333; margin-bottom:5px;">${displayTitle}</h3>`,
    html: `
      <div style="text-align: left; font-size: 0.95rem; color:#555;">
        <div style="margin-bottom: 15px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <img src="${getImageUrl(
            report.image_url
          )}" style="width:100%; max-height:280px; object-fit:cover; display:block;" onerror="this.src='/no-image.png'">
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 15px; border: 1px solid #eee;">
          <p style="margin: 5px 0;"><strong>👤 ผู้แจ้ง:</strong> ${
            report.username || "ไม่ระบุ"
          }</p>
          <p style="margin: 5px 0;"><strong>📞 เบอร์โทร:</strong> ${
            report.contact || "-"
          }</p>
          <p style="margin: 5px 0;"><strong>📝 รายละเอียด:</strong><br>${
            report.description
          }</p>
          <p style="margin: 5px 0;"><strong>📍 พิกัด:</strong> ${
            report.latitude || "-"
          }, ${report.longitude || "-"}</p>
        </div>
        <a href="${mapLink}" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 8px; background-color: #4285F4; color: white; text-decoration: none; padding: 12px; border-radius: 25px; font-weight: bold; box-shadow: 0 4px 6px rgba(66, 133, 244, 0.3); transition: 0.2s;">
          <i class="bi bi-geo-alt-fill"></i> เปิดใน Google Maps
        </a>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    width: "500px",
    padding: "20px",
  });
};

const handleFilterChange = () => {
  currentPage.value = 1;
  fetchReports(1);
};
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) fetchReports(page);
};
const getStatusClass = (status) =>
  ({ pending: "status-pending", in_progress: "status-progress", resolved: "status-done" }[
    status
  ] || "");
const getStatusLabel = (status) =>
  ({ pending: "รอดำเนินการ", in_progress: "กำลังแก้ไข", resolved: "แก้ไขแล้ว" }[status] ||
  status);
const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    : "";
const formatTime = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
const openNewReport = () => {
  router.push("/reportpage");
};
const handleMenuClick = (menuId) => {
  if (menuId === "home") fetchReports(1);
  else if (menuId === "report") router.push("/reportpage");
};
const handleLogout = () => {
  Swal.fire({
    title: "ยืนยันการออกจากระบบ?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "ใช่, ออกจากระบบ",
    cancelButtonText: "ยกเลิก",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.clear();
      router.push("/login");
    }
  });
};
</script>

<template>
  <div class="homepage-container">
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
          <div class="loading-spinner"></div>
          <p class="loading-text">กำลังโหลดข้อมูล...</p>
        </div>

        <div v-else class="report-list">
          <div v-for="report in reports" :key="report.id" class="report-card">
            <img
              :src="getImageUrl(report.image_url)"
              :alt="report.title"
              class="report-img"
              @click="viewReportDetails(report)"
              style="cursor: pointer"
              @error="$event.target.src = 'https://placehold.co/100x100?text=No+Image'"
            />

            <div class="report-info">
              <div class="report-header-row">
                <span class="status-badge" :class="getStatusClass(report.status)">
                  {{ getStatusLabel(report.status) }}
                </span>

                <button
                  class="btn-view"
                  @click="viewReportDetails(report)"
                  title="ดูรายละเอียด"
                >
                  <i class="bi bi-eye-fill"></i>
                </button>
              </div>

              <h3 class="report-title">{{ cleanTitle(report.title) }}</h3>
              
              <p class="report-desc">{{ report.description }}</p>
              <div class="report-author">โดย: {{ report.username || "ไม่ระบุ" }}</div>
            </div>

            <div class="report-meta">
              <span class="time">{{ formatTime(report.created_at) }}</span>
              <span class="date">{{ formatDate(report.created_at) }}</span>
            </div>
          </div>

          <div v-if="reports.length === 0" class="empty-state">
            <p>ไม่พบรายการแจ้งปัญหา</p>
          </div>

          <div class="pagination-container" v-if="totalPages > 1">
            <button
              class="page-btn nav-btn"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              <i class="bi bi-chevron-left"></i>
            </button>

            <template v-for="(page, index) in displayedPages" :key="index">
              <button
                v-if="page !== '...'"
                class="page-btn number-btn"
                :class="{ active: currentPage === page }"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
              <span v-else class="dots">...</span>
            </template>

            <button
              class="page-btn nav-btn"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        <button class="fab" @click="openNewReport" title="แจ้งปัญหาใหม่">+</button>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ใช้ Style เดิมจากโค้ดที่คุณส่งมาได้เลยครับ */
:root {
  --primary-green: #2e5936;
  --secondary-green: #5c9454;
  --bg-light: #e8f5e9;
  --text-dark: #333;
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
}
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
  font-family: "Kanit", sans-serif;
}
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
  width: 100%;
  height: 150px;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
}
.banner-top img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.search-bar {
  background-color: white;
  padding: 10px;
  border-radius: 12px;
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
}
.search-input {
  flex-grow: 1;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #eee;
  outline: none;
  font-family: "Kanit", sans-serif;
  background-color: #f9f9f9;
}
.category-select {
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #eee;
  background-color: #f9f9f9;
  cursor: pointer;
  font-family: "Kanit", sans-serif;
}

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
  align-items: center; /* จัดให้อยู่กึ่งกลางแนวตั้ง */
  gap: 20px;
  background: #fff;
  transition: box-shadow 0.3s;
}
.report-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.report-img {
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 12px;
  background-color: #eee;
  flex-shrink: 0;
}
.report-info {
  flex-grow: 1; /* ขยายส่วนข้อมูลให้เต็มพื้นที่ว่าง */
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.report-header-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}
.report-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}
.report-desc {
  font-size: 0.95rem;
  color: #666;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1; /* ปรับให้เหลือบรรทัดเดียวถ้าชื่อคนแจ้งยาว */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.report-author {
  font-size: 0.9rem;
  color: #777;
  margin-top: 5px;
}
.report-meta {
  text-align: right;
  font-size: 0.85rem;
  color: #888;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 100px; /* ล็อกความกว้างส่วนวันที่ให้คงที่ */
  border-left: 1px solid #eee; /* เพิ่มเส้นคั่นนิดหน่อย */
  padding-left: 15px;
}
.report-meta .time {
  font-weight: bold;
  color: #555;
  font-size: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
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
.btn-view {
  background: none;
  border: none;
  color: #2e5936;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: auto; /* ให้ปุ่มตาไปอยู่ขวาสุดของส่วน info */
}
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding-bottom: 20px;
}
.page-btn {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-family: "Kanit";
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-btn.active {
  background-color: #2e5936;
  color: white;
}
.dots {
  color: #888;
  font-weight: bold;
}
.fab {
  position: absolute;
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
  z-index: 99;
}
.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-left-color: #2e5936;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.loading-text {
  margin-top: 10px;
  color: #666;
  font-weight: bold;
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
    min-width: 45%;
  }
  .report-card {
    flex-direction: row;
    align-items: flex-start;
  }
  .report-img {
    width: 80px;
    height: 80px;
  }
  .report-meta {
    min-width: 70px;
    padding-left: 10px;
  }
}
</style>