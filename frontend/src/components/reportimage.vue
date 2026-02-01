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
                  <button
                    v-if="user.role !== 'admin'"
                    class="btn-icon delete"
                    @click="deleteUser(user.id)"
                    title="ลบผู้ใช้"
                  >
                    <i class="bi bi-trash-fill"></i>
                  </button>
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
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router = useRouter();
const API_URL = import.meta.env.VITE_API_BASE_URL; // ✅ ดึง URL API กลาง

const activeTab = ref("reports");
const reports = ref([]);
const users = ref([]);
const loading = ref(false);
const userName = ref("Admin");

const searchText = ref("");
const filterStatus = ref("all");

// ✅ ฟังก์ชันกลางสำหรับจัดการ URL รูปภาพ
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path; // รูปจาก Google
  const baseUrl = API_URL.replace("/api", ""); // ตัด /api ออก
  return `${baseUrl}${path}`;
};

const userImage = computed(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.image_url ? getImageUrl(user.image_url) : "/admin-profile.png";
  }
  return "/admin-profile.png";
});

const pendingCount = computed(
  () => reports.value.filter((r) => r.status === "pending").length
);

const filteredReports = computed(() => {
  return reports.value.filter((report) => {
    const matchStatus =
      filterStatus.value === "all" || report.status === filterStatus.value;
    const query = searchText.value.toLowerCase();
    const matchSearch =
      (report.title && report.title.toLowerCase().includes(query)) ||
      (report.description && report.description.toLowerCase().includes(query)) ||
      (report.username && report.username.toLowerCase().includes(query));
    return matchStatus && matchSearch;
  });
});

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const query = searchText.value.toLowerCase();
    return (
      (user.fullname && user.fullname.toLowerCase().includes(query)) ||
      (user.username && user.username.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query))
    );
  });
});

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

const fetchData = async () => {
  loading.value = true;
  try {
    const config = getAuthConfig();
    // ดึงข้อมูลทั้ง Reports (ผ่าน route admin) และ Users
    const [reportsRes, usersRes] = await Promise.all([
      axios.get(`${API_URL}/admin/reports`, config),
      axios.get(`${API_URL}/users`, config),
    ]);
    reports.value = reportsRes.data;
    users.value = usersRes.data;
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      Swal.fire({
        icon: "error",
        title: "Session หมดอายุ",
        text: "กรุณาเข้าสู่ระบบใหม่",
      });
      localStorage.clear();
      router.push("/login");
    }
  }
  loading.value = false;
};

const viewAndForward = (report) => {
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;

  Swal.fire({
    title: `<strong>${report.title}</strong>`,
    html: `
      <div style="text-align: left; font-size: 0.95rem;">
        <div style="margin-bottom: 15px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <img src="${getImageUrl(report.image_url)}" 
               style="width:100%; max-height:250px; object-fit:cover; display:block;"
               onerror="this.style.display='none'">
        </div>
        <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:15px;">
          <p class="mb-1"><strong>👤 ผู้แจ้ง:</strong> ${report.username || "ไม่ระบุ"}</p>
          <p class="mb-1"><strong>📞 เบอร์โทร:</strong> ${report.contact || "-"}</p>
          <p class="mb-1"><strong>📝 รายละเอียด:</strong> ${report.description}</p>
          <p class="mb-0"><strong>📍 พิกัด:</strong> ${report.latitude}, ${
      report.longitude
    }</p>
        </div>
        <a href="${mapLink}" target="_blank" class="btn-map" style="display:block; text-align:center; background:#4285F4; color:white; padding:10px; border-radius:30px; text-decoration:none; font-weight:bold; margin-bottom:15px;">
          <i class="bi bi-geo-alt-fill"></i> เปิดใน Google Maps
        </a>
        <hr style="margin: 15px 0; border-color:#eee;">
        <label style="font-weight:bold; display:block; margin-bottom:8px;">ส่งต่อไปยังหน่วยงาน:</label>
        <select id="agency-select" class="swal2-input" style="width: 100%; margin: 0; border-radius:8px;">
          <option value="" disabled selected>-- เลือกหน่วยงาน --</option>
          <option value="อบต.">อบต.</option>
          <option value="สำนักงานเขต">สำนักงานเขต</option>
          <option value="กรมทางหลวง">กรมทางหลวง</option>
          <option value="การไฟฟ้า">การไฟฟ้า</option>
        </select>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="bi bi-send"></i> ส่งเรื่อง',
    confirmButtonColor: "#2e5936",
    cancelButtonText: "ปิด",
    preConfirm: () => {
      const agency = document.getElementById("agency-select").value;
      if (!agency) Swal.showValidationMessage("กรุณาเลือกหน่วยงาน");
      return agency;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: "ส่งเรื่องสำเร็จ!",
        text: `ส่งไปยัง ${result.value} เรียบร้อย`,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  });
};

const updateStatus = async (id, newStatus) => {
  try {
    await axios.put(
      `${API_URL}/admin/reports/${id}/status`,
      { status: newStatus },
      getAuthConfig()
    );
    Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
    }).fire({ icon: "success", title: "อัปเดตสถานะเรียบร้อย" });
  } catch (err) {
    Swal.fire("Error", "ไม่สามารถอัปเดตสถานะได้", "error");
    fetchData();
  }
};

const deleteReport = async (id) => {
  if (
    await Swal.fire({
      title: "ยืนยันการลบ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
    }).then((r) => r.isConfirmed)
  ) {
    await axios.delete(`${API_URL}/admin/reports/${id}`, getAuthConfig());
    fetchData();
    Swal.fire("ลบสำเร็จ", "", "success");
  }
};

const deleteUser = async (id) => {
  if (
    await Swal.fire({
      title: "ยืนยันการลบ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
    }).then((r) => r.isConfirmed)
  ) {
    await axios.delete(`${API_URL}/users/${id}`, getAuthConfig());
    fetchData();
    Swal.fire("ลบสำเร็จ", "", "success");
  }
};

const logout = () => {
  if (confirm("ต้องการออกจากระบบ?")) {
    localStorage.clear();
    router.push("/login");
  }
};
const goToHome = () => router.push("/");
const getStatusClass = (s) =>
  ({
    pending: "status-pending",
    in_progress: "status-progress",
    resolved: "status-resolved",
  }[s]);
const formatDate = (d) =>
  new Date(d).toLocaleDateString("th-TH", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });

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
