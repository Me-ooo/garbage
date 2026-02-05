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
        <span>{{ userName }} (Admin)</span>
      </div>
      <button class="logout-btn" @click="logout">ออกจากระบบ</button>
    </header>

    <div class="container">
      <aside class="sidebar">
        <div class="banner-box">
          <img
            src="/admin-sidebar.png"
            alt="Admin Banner"
            @error="
              $event.target.src = 'https://placehold.co/250x150?text=Garbage+System'
            "
          />
        </div>

        <div class="nav-menu">
          <button class="menu-btn" @click="goToSystemOverview">
            <i class="bi bi-bar-chart-line-fill"></i> ภาพรวมระบบ
          </button>

          <button
            class="menu-btn"
            :class="{ 'active-btn': activeTab === 'reports' }"
            @click="switchTab('reports')"
          >
            <i class="bi bi-file-earmark-text-fill"></i> รายการแจ้งขยะ
          </button>

          <button
            class="menu-btn"
            :class="{ 'active-btn': activeTab === 'users' }"
            @click="switchTab('users')"
          >
            <i class="bi bi-people-fill"></i> จัดการผู้ใช้
          </button>

          <div class="menu-divider"></div>
        </div>
      </aside>

      <main class="main-content">
        <div class="content-header">
          <h2>
            {{
              activeTab === "reports"
                ? "📦 รายการแจ้งปัญหาทั้งหมด"
                : "👥 รายชื่อสมาชิกในระบบ"
            }}
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
          <div class="loading-text">กำลังโหลดข้อมูล...</div>
        </div>

        <div v-else class="table-card">
          <div v-if="activeTab === 'reports'" class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th width="80">รูปภาพ</th>
                  <th width="25%">หัวข้อ</th>
                  <th width="15%">ผู้แจ้ง</th>
                  <th width="120">วันที่</th>
                  <th width="150">สถานะการจัดการ</th>
                  <th width="120" class="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="report in paginatedItems" :key="report.id">
                  <td>
                    <div
                      class="img-wrapper"
                      @click="viewReportDetail(report)"
                      style="cursor: pointer"
                    >
                      <img
                        :src="getImageUrl(report.image_url)"
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
                    >
                      {{ report.description }}
                    </small>
                  </td>
                  <td>{{ report.username || "บุคคลทั่วไป" }}</td>
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
                        @click="viewReportDetail(report)"
                        title="ดูรายละเอียด & พิกัด"
                      >
                        <i class="bi bi-eye-fill"></i>
                      </button>

                      <button
                        class="btn-icon delete"
                        @click="deleteReport(report.id)"
                        title="ลบรายงาน"
                      >
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="paginatedItems.length === 0">
                  <td colspan="6" class="empty-row">ไม่พบข้อมูลรายงานขยะ</td>
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
                  <th>สิทธิ์</th>
                  <th class="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in paginatedItems" :key="user.id">
                  <td>
                    <div class="img-wrapper circle">
                      <img
                        :src="getImageUrl(user.image_url)"
                        @error="
                          $event.target.src = 'https://placehold.co/40x40?text=User'
                        "
                      />
                    </div>
                  </td>
                  <td class="fw-bold">{{ user.fullname || user.username }}</td>
                  <td>{{ user.email }}</td>
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
                        <i class="bi bi-person-x-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="paginatedItems.length === 0">
                  <td colspan="5" class="empty-row">ไม่พบรายชื่อสมาชิก</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-container" v-if="totalPages > 1">
            <button
              class="page-btn nav-btn"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              <i class="bi bi-chevron-left"></i>
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
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";

const router = useRouter();
const route = useRoute();
const API_URL = import.meta.env.VITE_API_BASE_URL;

// State Variables
const activeTab = ref("reports");
const reports = ref([]);
const users = ref([]);
const loading = ref(true);
const searchText = ref("");
const filterStatus = ref("all");
const userName = ref("Admin");

// Pagination
const currentPage = ref(1);
const itemsPerPage = 6;

onMounted(async () => {
  const userStr = localStorage.getItem("user");
  const user = JSON.parse(userStr || "{}");

  if (user.role !== "admin") {
    Swal.fire("สิทธิ์ไม่เพียงพอ", "คุณไม่ใช่ Admin", "error");
    router.push("/");
    return;
  }
  userName.value = user.fullname || user.username || "Admin";

  if (route.query.tab) {
    activeTab.value = route.query.tab;
  }

  await fetchData();
});

const fetchData = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;

    const [resReports, resUsers] = await Promise.all([
      axios.get(`${baseUrl}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${baseUrl}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    reports.value = resReports.data;
    users.value = resUsers.data;
  } catch (error) {
    console.error("Fetch Data Error:", error);
    if (error.response?.status === 401) router.push("/login");
  } finally {
    loading.value = false;
  }
};

const switchTab = (tabName) => {
  activeTab.value = tabName;
  currentPage.value = 1;
  searchText.value = "";
};

const goToSystemOverview = () => {
  router.push("/system-overview");
};

const filteredItems = computed(() => {
  const lowerSearch = searchText.value.toLowerCase();

  if (activeTab.value === "reports") {
    return reports.value.filter((item) => {
      const matchStatus =
        filterStatus.value === "all" || item.status === filterStatus.value;
      const matchText =
        (item.title && item.title.toLowerCase().includes(lowerSearch)) ||
        (item.description && item.description.toLowerCase().includes(lowerSearch));
      return matchStatus && matchText;
    });
  } else {
    return users.value.filter((item) => {
      return (
        (item.fullname && item.fullname.toLowerCase().includes(lowerSearch)) ||
        (item.email && item.email.toLowerCase().includes(lowerSearch))
      );
    });
  }
});

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / itemsPerPage);
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredItems.value.slice(start, end);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

const getImageUrl = (path) => {
  if (!path) return "/no-image.png";
  let cleanPath = path;
  if (path.includes("localhost:3000")) {
    cleanPath = path.split("localhost:3000")[1];
  }
  if (cleanPath.startsWith("data:") || cleanPath.startsWith("https")) return cleanPath;
  let baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  baseUrl = baseUrl.replace("/api", "");
  const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `${baseUrl}${finalPath}`;
};

const userImage = computed(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.image_url ? getImageUrl(user.image_url) : "/admin-profile.png";
  }
  return "/admin-profile.png";
});

const getStatusClass = (status) =>
  ({
    pending: "status-pending",
    in_progress: "status-progress",
    resolved: "status-resolved",
  }[status] || "");

const formatDate = (date) => new Date(date).toLocaleDateString("th-TH");

const updateStatus = async (id, status) => {
  try {
    const token = localStorage.getItem("token");
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    await axios.put(
      `${baseUrl}/api/admin/reports/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    Swal.fire({
      icon: "success",
      title: "อัปเดตสถานะสำเร็จ",
      timer: 1000,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire("ผิดพลาด", "ไม่สามารถอัปเดตได้", "error");
  }
};

const deleteReport = async (id) => {
  const result = await Swal.fire({
    title: "ยืนยันการลบ?",
    text: "ข้อมูลจะหายไปถาวร",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "ลบเลย",
  });
  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
      await axios.delete(`${baseUrl}/api/admin/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      reports.value = reports.value.filter((r) => r.id !== id);
      Swal.fire("ลบสำเร็จ", "", "success");
    } catch (err) {
      Swal.fire("ผิดพลาด", "ลบไม่ได้", "error");
    }
  }
};

const viewReportDetail = (report) => {
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;

  // แปลงสถานะเป็นภาษาไทย
  const statusLabel =
    {
      pending: "⏳ รอดำเนินการ",
      in_progress: "🔧 กำลังแก้ไข",
      resolved: "✅ แก้ไขแล้ว",
    }[report.status] || report.status;

  Swal.fire({
    title: `<h3 style="color:#333; margin:0;">${report.title}</h3>`,
    html: `
      <div style="text-align: left; padding: 0 10px; font-size: 0.95rem;">
        
        <div style="margin: 15px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <img src="${getImageUrl(report.image_url)}" 
               style="width: 100%; max-height: 300px; object-fit: cover; display: block;"
               onerror="this.src='https://placehold.co/400x300?text=No+Image'">
        </div>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; border: 1px solid #eee;">
          <p style="margin: 8px 0; font-size: 1rem;">
            <strong>📌 สถานะ:</strong> <span style="color: #2e5936; font-weight: bold;">${statusLabel}</span>
          </p>
          <p style="margin: 8px 0;"><strong>👤 ผู้แจ้ง:</strong> ${
            report.username || "ไม่ระบุ"
          }</p>
          <p style="margin: 8px 0;"><strong>📞 เบอร์โทร:</strong> ${
            report.contact || "-"
          }</p>
          <p style="margin: 8px 0;"><strong>🕒 วันที่แจ้ง:</strong> ${formatDate(
            report.created_at
          )}</p>
          <hr style="margin: 10px 0; border-top: 1px solid #ddd;">
          <p style="margin: 8px 0;"><strong>📝 รายละเอียด:</strong><br><span style="color: #555;">${
            report.description || "-"
          }</span></p>
        </div>

        <a href="${mapLink}" target="_blank" 
           style="display: flex; align-items: center; justify-content: center; gap: 8px; 
                  background-color: #4285F4; color: white; text-decoration: none; 
                  padding: 12px; border-radius: 50px; font-weight: bold; margin-top: 15px; 
                  box-shadow: 0 4px 6px rgba(66, 133, 244, 0.3);">
          <i class="bi bi-geo-alt-fill"></i> เปิดดูพิกัดใน Google Maps
        </a>
      </div>
    `,
    showConfirmButton: false, 
    showCloseButton: true,
    width: "500px",
    padding: "20px",
  });
};

const changeUserRole = async (id, role) => {
  const result = await Swal.fire({
    title: "ยืนยันการตั้งเป็น Admin?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
  });
  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
      await axios.put(
        `${baseUrl}/api/users/${id}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("สำเร็จ", "เปลี่ยนสิทธิ์ผู้ใช้แล้ว", "success");
      await fetchData();
    } catch (err) {
      Swal.fire("ผิดพลาด", "เปลี่ยนสิทธิ์ไม่ได้", "error");
    }
  }
};

// ✅ ฟังก์ชันใหม่: เชื่อมต่อ API ลบผู้ใช้จริง
const deleteUser = async (id) => {
  const result = await Swal.fire({
    title: "ลบผู้ใช้คนนี้?",
    text: "การกระทำนี้ไม่สามารถย้อนกลับได้",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "ยืนยันลบ",
    cancelButtonText: "ยกเลิก"
  });

  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
      
      // เรียก API ลบผู้ใช้
      await axios.delete(`${baseUrl}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // อัปเดตรายการในหน้าเว็บโดยไม่ต้องโหลดใหม่
      users.value = users.value.filter((u) => u.id !== id);

      Swal.fire("ลบสำเร็จ", "ผู้ใช้งานถูกลบออกจากระบบแล้ว", "success");
    } catch (err) {
      console.error("Delete User Error:", err);
      Swal.fire("ผิดพลาด", "ไม่สามารถลบผู้ใช้งานได้", "error");
    }
  }
};

const logout = () => {
  localStorage.clear();
  router.push("/login");
};
</script>

<style scoped>
/* Style เดิมทั้งหมด (ไม่มีการเปลี่ยนแปลง) */
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

  gap: 8px;
}

.menu-btn {
  background: #f8f9fa;

  border: 1px solid #eee;

  padding: 12px 15px;

  border-radius: 10px;

  cursor: pointer;

  text-align: left;

  font-weight: 500;

  font-family: "Kanit";

  transition: all 0.2s;

  color: #555;

  display: flex;

  align-items: center;

  gap: 10px;

  font-size: 0.95rem;
}

.menu-btn:hover {
  background-color: #f0f0f0;

  transform: translateX(3px);
}

.menu-btn i {
  font-size: 1.1rem;

  color: #777;

  width: 20px;

  text-align: center;
}

/* ✅ Active Button Style */

.active-btn {
  background: #2e5936;

  color: white;

  border-color: #2e5936;

  box-shadow: 0 4px 10px rgba(46, 89, 54, 0.2);
}

.active-btn:hover {
  background-color: #2e5936;

  transform: none;
}

.active-btn i {
  color: white;
}

.menu-divider {
  height: 1px;

  background: #eee;

  margin: 5px 0;
}

.main-content {
  flex-grow: 1;

  display: flex;

  flex-direction: column;

  padding-bottom: 20px;
}

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

.table-card {
  background: white;

  border-radius: 20px;

  padding: 20px;

  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);

  overflow: hidden;

  display: flex;

  flex-direction: column;
}

.custom-table {
  width: 100%;

  border-collapse: collapse;
}

.custom-table th {
  background: #f8f9fa;

  padding: 15px;

  text-align: left;

  color: #666;

  font-weight: 600;

  border-bottom: 2px solid #eee;
}

.custom-table td {
  padding: 15px;

  border-bottom: 1px solid #f0f0f0;

  vertical-align: middle;
}

.custom-table tr:hover {
  background-color: #f9fdf9;
}

.img-wrapper {
  width: 50px;

  height: 50px;

  border-radius: 10px;

  overflow: hidden;

  border: 1px solid #eee;
}

.img-wrapper.circle {
  border-radius: 50%;
}

.img-wrapper img {
  width: 100%;

  height: 100%;

  object-fit: cover;
}

.status-select {
  padding: 6px 12px;

  border-radius: 20px;

  border: none;

  font-weight: 600;

  font-size: 0.85rem;

  cursor: pointer;

  text-align: center;

  width: 100%;
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

  gap: 10px;
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

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

.empty-row {
  text-align: center;

  padding: 40px;

  color: #999;

  font-style: italic;
}

.loading-text {
  font-size: 1.2rem;

  color: #666;

  font-weight: bold;
}

/* ✅ CSS สำหรับ Pagination Bar */

.pagination-container {
  display: flex;

  justify-content: center;

  align-items: center;

  gap: 10px;

  margin-top: 20px;

  padding: 10px;

  padding-bottom: 20px;
}

.page-btn {
  width: 40px;

  height: 40px;

  border-radius: 50%;

  border: 1px solid #ddd;

  background: white;

  color: #555;

  cursor: pointer;

  font-family: "Kanit";

  font-weight: 600;

  display: flex;

  justify-content: center;

  align-items: center;

  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #f0f0f0;

  border-color: #ccc;
}

.page-btn.active {
  background-color: #2e5936;

  color: white;

  border-color: #2e5936;

  box-shadow: 0 4px 10px rgba(46, 89, 54, 0.3);
}

.page-btn:disabled {
  color: #ccc;

  cursor: not-allowed;

  background-color: #fafafa;
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