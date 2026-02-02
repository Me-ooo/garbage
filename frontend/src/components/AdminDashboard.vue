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
          <div class="loading-text">กำลังโหลดข้อมูลจาก TiDB...</div>
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
                    <div class="img-wrapper">
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
                        @click="viewAndForward(report)"
                        title="ดูพิกัด & ส่งเรื่อง"
                      >
                        <i class="bi bi-geo-alt-fill"></i>
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
                  <td class="fw-bold">{{ user.fullname }}</td>
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
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_BASE_URL;

const activeTab = ref("reports");
const reports = ref([]);
const users = ref([]);
const loading = ref(false);
const userName = ref("Admin");
const searchText = ref("");
const filterStatus = ref("all");

const currentPage = ref(1);
const itemsPerPage = 6;

// ✅ จัดการ URL รูปภาพ
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // ตัด /api ออกจาก URL เพื่อดึงไฟล์ Static จากโฟลเดอร์ uploads
  const baseUrl = API_URL.replace("/api", "");
  return `${baseUrl}${path}`;
};

const userImage = computed(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.image_url
    ? getImageUrl(user.image_url)
    : "https://placehold.co/40x40?text=Admin";
});

const filteredReports = computed(() => {
  return reports.value.filter((r) => {
    const matchStatus = filterStatus.value === "all" || r.status === filterStatus.value;
    const query = searchText.value.toLowerCase();
    const matchSearch =
      r.title?.toLowerCase().includes(query) || r.username?.toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });
});

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    const query = searchText.value.toLowerCase();
    return (
      u.fullname?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query)
    );
  });
});

const paginatedItems = computed(() => {
  const list =
    activeTab.value === "reports" ? filteredReports.value : filteredUsers.value;
  const start = (currentPage.value - 1) * itemsPerPage;
  return list.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => {
  const list =
    activeTab.value === "reports" ? filteredReports.value : filteredUsers.value;
  return Math.ceil(list.length / itemsPerPage);
});

const changePage = (p) => (currentPage.value = p);
const switchTab = (tab) => {
  activeTab.value = tab;
  currentPage.value = 1;
};

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ✅ ดึงข้อมูลจาก Backend
const fetchData = async () => {
  loading.value = true;
  try {
    const config = getAuthConfig();
    const [reportsRes, usersRes] = await Promise.all([
      axios.get(`${API_URL}/reports`, config),
      axios.get(`${API_URL}/users`, config),
    ]);
    reports.value = reportsRes.data;
    users.value = usersRes.data;
  } catch (err) {
    if (err.response?.status === 401) router.push("/login");
  } finally {
    loading.value = false;
  }
};

// ✅ ดูรายละเอียดพิกัด
const viewAndForward = (report) => {
  const mapLink = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
  Swal.fire({
    title: `พิกัดขยะ: ${report.title}`,
    html: `
      <img src="${getImageUrl(
        report.image_url
      )}" style="width:100%; border-radius:10px; margin-bottom:10px;">
      <p style="text-align:left;"><b>รายละเอียด:</b> ${report.description}</p>
      <a href="${mapLink}" target="_blank" style="color:blue;">📍 ดูบน Google Maps</a>
    `,
    confirmButtonText: "รับทราบ",
    confirmButtonColor: "#2e5936",
  });
};

// ✅ อัปเดตสถานะ (เชื่อมกับ router.put('/:id/status'))
const updateStatus = async (id, newStatus) => {
  try {
    await axios.put(
      `${API_URL}/reports/${id}/status`,
      { status: newStatus },
      getAuthConfig()
    );
    Swal.fire({
      icon: "success",
      title: "อัปเดตสำเร็จ",
      toast: true,
      position: "top-end",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire("Error", "ไม่สามารถอัปเดตได้", "error");
    fetchData();
  }
};

// ✅ ลบรายงาน
const deleteReport = async (id) => {
  const result = await Swal.fire({
    title: "ลบรายการนี้?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "ลบ",
    cancelButtonText: "ยกเลิก",
  });
  if (result.isConfirmed) {
    try {
      await axios.delete(`${API_URL}/reports/${id}`, getAuthConfig());
      fetchData();
      Swal.fire("ลบสำเร็จ", "", "success");
    } catch (err) {
      Swal.fire("Error", "ลบไม่ได้", "error");
    }
  }
};

// ✅ เปลี่ยนสิทธิ์ User (ฟีเจอร์ใหม่ที่เพิ่มใน users.js)
const changeUserRole = async (id, newRole) => {
  try {
    await axios.put(`${API_URL}/users/${id}/role`, { role: newRole }, getAuthConfig());
    Swal.fire("สำเร็จ", "ตั้งค่าแอดมินคนใหม่เรียบร้อย", "success");
    fetchData();
  } catch (err) {
    Swal.fire("Error", "เปลี่ยนสิทธิ์ไม่ได้", "error");
  }
};

const deleteUser = async (id) => {
  const result = await Swal.fire({
    title: "ลบผู้ใช้?",
    icon: "warning",
    showCancelButton: true,
  });
  if (result.isConfirmed) {
    try {
      await axios.delete(`${API_URL}/users/${id}`, getAuthConfig());
      fetchData();
    } catch (err) {
      Swal.fire("Error", "ลบไม่ได้", "error");
    }
  }
};

const logout = () => {
  localStorage.clear();
  router.push("/login");
};
const goToSystemOverview = () => router.push("/system-overview");

const getStatusClass = (s) =>
  ({
    pending: "status-pending",
    in_progress: "status-progress",
    resolved: "status-resolved",
  }[s]);
const formatDate = (d) => new Date(d).toLocaleDateString("th-TH");

onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  userName.value = user.fullname || "Admin";
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
