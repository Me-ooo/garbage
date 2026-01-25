<template>
  <div class="admin-container">
    <header class="header">
      <div class="user-profile">
        <img src="/admin-profile.png" alt="Admin Avatar" class="profile-img" @error="$event.target.src='https://placehold.co/40x40'">
        <span>Admin Control Panel</span>
      </div>
      <button class="logout-btn" @click="logout">
        ออกจากระบบ
      </button>
    </header>

    <div class="container">
      <aside class="sidebar">
        <div class="banner-box">
          <img src="/admin-sidebar.png" alt="Admin Banner" @error="$event.target.src='https://placehold.co/250x150'">
        </div>
        
        <div class="nav-menu">
          <button 
            class="menu-btn"
            :class="{ 'active-btn': activeTab === 'reports' }"
            @click="activeTab = 'reports'"
          >
            รายการปัญหา
          </button>
          
          <button 
            class="menu-btn"
            :class="{ 'active-btn': activeTab === 'users' }"
            @click="activeTab = 'users'"
          >
            รายชื่อผู้ใช้
          </button>

          <button class="menu-btn back-home-btn" @click="goToHome">
            กลับหน้าหลัก
          </button>
        </div>
      </aside>

      <main class="main-content">
        <div class="banner-top">
          <img src="/admin-banner.png" alt="System Banner" @error="$event.target.src='https://placehold.co/800x150'">
        </div>

        <div class="content-header">
          <h2>{{ activeTab === 'reports' ? 'จัดการรายการปัญหา' : 'จัดการรายชื่อผู้ใช้' }}</h2>
        </div>

        <div v-if="loading" class="text-center mt-5">
          <div class="spinner-border text-success" role="status"></div>
        </div>

        <div v-else-if="activeTab === 'reports'" class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th width="10%">รูปภาพ</th>
                <th width="25%">หัวข้อ</th>
                <th width="15%">ผู้แจ้ง</th>
                <th width="15%">วันที่</th>
                <th width="20%">สถานะ</th>
                <th width="15%">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in reports" :key="report.id">
                <td>
                  <img 
                    :src="report.image_url ? `http://localhost:3000${report.image_url}` : '/no-image.png'" 
                    class="table-img"
                    @error="$event.target.src='https://placehold.co/50x50?text=No+Img'"
                  >
                </td>
                <td class="fw-bold">{{ report.title }}</td>
                <td>{{ report.username || 'ไม่ระบุ' }}</td>
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
                  <button class="btn-icon delete" @click="deleteReport(report.id)" title="ลบรายการ">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="reports.length === 0">
                <td colspan="6" class="text-center text-muted py-4">ไม่มีรายการแจ้งปัญหา</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="activeTab === 'users'" class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>ชื่อผู้ใช้</th>
                <th>อีเมล</th>
                <th>เบอร์โทรศัพท์</th>
                <th>สิทธิ์</th>
                <th class="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td class="fw-bold">{{ user.fullname || user.username }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone || '-' }}</td>
                <td>
                  <span class="badge rounded-pill" :class="user.role === 'admin' ? 'bg-danger' : 'bg-success'">
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
                    <i class="bi bi-trash"></i>
                  </button>
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
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router = useRouter();
const activeTab = ref("reports");
const reports = ref([]);
const users = ref([]);
const loading = ref(false);

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

const fetchData = async () => {
  loading.value = true;
  try {
    const config = getAuthConfig();

    if (activeTab.value === "reports") {
      // ✅ แก้ไขตรงนี้: เรียกไปที่ /api/admin/reports เพื่อเอาข้อมูลทั้งหมด (ไม่แบ่งหน้า)
      const response = await axios.get("http://localhost:3000/api/admin/reports", config);
      reports.value = response.data;
    } else {
      // ดึงรายชื่อผู้ใช้
      const response = await axios.get("http://localhost:3000/api/users", config);
      users.value = response.data;
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      Swal.fire({
        icon: 'error',
        title: 'Session หมดอายุ',
        text: 'กรุณาเข้าสู่ระบบใหม่'
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  }
  loading.value = false;
};

const updateStatus = async (id, newStatus) => {
  try {
    const config = getAuthConfig();
    await axios.put(`http://localhost:3000/api/admin/reports/${id}/status`, 
      { status: newStatus }, 
      config
    );
    
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
    Toast.fire({ icon: "success", title: "อัปเดตสถานะเรียบร้อย" });
  } catch (err) {
    Swal.fire("Error", "ไม่สามารถอัปเดตสถานะได้", "error");
    fetchData(); // โหลดข้อมูลเดิมกลับมา
  }
};

const deleteReport = async (id) => {
  if (await confirmDelete()) {
    try {
      const config = getAuthConfig();
      await axios.delete(`http://localhost:3000/api/admin/reports/${id}`, config);
      fetchData();
      Swal.fire('ลบสำเร็จ', 'รายการถูกลบแล้ว', 'success');
    } catch(e) { 
      console.error(e);
      Swal.fire('Error', 'เกิดข้อผิดพลาดในการลบ', 'error');
    }
  }
};

const deleteUser = async (id) => {
  if (await confirmDelete()) {
    try {
      const config = getAuthConfig();
      await axios.delete(`http://localhost:3000/api/users/${id}`, config);
      fetchData();
      Swal.fire('ลบสำเร็จ', 'ผู้ใช้งานถูกลบออกจากระบบแล้ว', 'success');
    } catch(e) { 
      console.error(e);
      Swal.fire('Error', 'เกิดข้อผิดพลาดในการลบ', 'error');
    }
  }
};

const confirmDelete = async () => {
  const result = await Swal.fire({
    title: "ยืนยันการลบ?",
    text: "ไม่สามารถย้อนกลับได้",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "ลบเลย",
    cancelButtonText: "ยกเลิก",
  });
  return result.isConfirmed;
};

const logout = () => {
  if(confirm("ต้องการออกจากระบบ?")) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }
};

const goToHome = () => {
  router.push('/');
}

const getStatusClass = (status) => {
  if(status === 'pending') return 'status-pending';
  if(status === 'in_progress') return 'status-progress';
  return 'status-resolved';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });
};

onMounted(fetchData);
watch(activeTab, fetchData);
</script>

<style scoped>
:root {
  --primary-green: #2e5936;
  --secondary-green: #5c9454;
  --bg-light: #e8f5e9;
  --text-dark: #333;
}

* {
  box-sizing: border-box;
}

.admin-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  font-family: 'Kanit', sans-serif;
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

.profile-img {
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
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
  font-family: 'Kanit', sans-serif;
  color: #333;
}

.menu-btn:hover {
  background-color: #e0e0e0;
}

.active-btn {
  background-color: var(--primary-green) !important;
  color: white !important;
  border: none !important;
}

.back-home-btn {
  margin-top: auto;
  background-color: #555;
  color: white;
  border: none;
}
.back-home-btn:hover {
  background-color: #333;
}

/* Main Content */
.main-content {
  flex-grow: 1;
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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

.content-header h2 {
  color: var(--text-dark);
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

/* Custom Table for Admin */
.custom-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.custom-table th {
  background-color: #f8f9fa;
  color: #555;
  font-weight: 600;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #ddd;
}

.custom-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.custom-table tr:hover {
  background-color: #f9f9f9;
}

.table-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* Status Dropdown */
.status-select {
  padding: 5px 10px;
  border-radius: 20px;
  border: none;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: center;
}

.status-pending { background-color: #fff3cd; color: #856404; }
.status-progress { background-color: #cff4fc; color: #055160; }
.status-resolved { background-color: #d1e7dd; color: #0f5132; }

/* Delete Button */
.btn-icon {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 1.2rem;
  transition: 0.2s;
}

.btn-icon:hover {
  transform: scale(1.2);
  color: #c82333;
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
  
  .table-responsive {
    overflow-x: auto;
  }
}
</style>