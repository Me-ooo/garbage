<template>
  <div class="dashboard-container">
    <div class="header-section shadow-sm">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h4 class="fw-bold text-success mb-0">
            <i class="bi bi-speedometer2"></i>
            Admin Dashboard
          </h4>
          <small class="text-muted">ระบบจัดการหหลังบ้าน</small>
        </div>
        <button class="btn btn-outline-danger btn-sm rounded-pill" @click="logout">
          <i class="bi bi-box-arrow-right"></i>ออกจากระบบ
        </button>
      </div>

      <div class="nav nav-pills mt-3 p-1 bg-light rounded-pill">
        <div class="nav-item">
          <button
            class="nav-link rounded-pill"
            :class="{ active: activeTab === 'users' }"
            @click="activeTab = 'users'"
          >
            รายการปัญหา
          </button>
          <div class="nav-item">
            <button
              class="nav-link rounded-pill"
              :class="{ active: activeTab === 'reports' }"
              @click="activeTab = 'reports'"
            >
              รายงานปัญหา
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="content-section p-3">
      <div v-if="activeTab === 'reports'">
        <div v-if="loading" class="text-center mt-5">
          <div class="spinner-border text-success" role="status"></div>
        </div>
        <div v-else>
          <div
            v-for="report in reports"
            :key="report.id"
            class="card-report mb-3 shadow-sm"
          >
            <div class="row g-0 align-items-center">
              <div class="col-4 col-sm-3">
                <img
                  :src="
                    report.image_url
                      ? `http://localhost:3000${report.image_url}`
                      : 'https://via.placeholder.com/150'
                  "
                  class="img-fluid rounded-start h-100 object-fit-cover"
                  style="min-height: 120px"
                />
              </div>

              <div class="col-8 col-sm-9">
                <div class="card-body p-3">
                  <div class="d-flex justify-content-between align-items-start">
                    <h6 class="card-title fw-bold text-dark mb-1">{{ report.title }}</h6>
                    <button class="btn-delete" @click="deleteReport(report.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>

                  <p class="text-muted small mb-2">
                    <i class="bi bi-geo-alt-fill text-danger"></i>
                    {{ report.location_name }}
                  </p>

                  <div class="status-control mt-2">
                    <label class="small text-muted me-2">สถานะ:</label>
                    <select
                      class="form-select form-select-sm status-select"
                      :class="getStatusClass(report.status)"
                      v-model="report.status"
                      @change="updateStatus(report.id, report.status)"
                    >
                      <option value="pending">⏳ รอดำเนินการ</option>
                      <option value="in_progress">🔧 กำลังแก้ไข</option>
                      <option value="resolved">✅ แก้ไขแล้ว</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="reports.length === 0" class="text-center text-muted mt-5">
            <i class="bi bi-clipboard-check display-1"></i>
            <p class="mt-2">ไม่มีรายการแจ้งปัญหา</p>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'users'">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <table class="table table-hover mb-0 align-middle">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">User</th>
                <th>Role</th>
                <th class="text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td class="ps-4">
                  <div class="fw-bold text-dark">{{ user.username }}</div>
                  <small class="text-muted">{{ user.email }}</small>
                </td>
                <td>
                  <span
                    class="badge rounded-pill"
                    :class="user.role === 'admin' ? 'bg-danger' : 'bg-primary'"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button
                    v-if="user.role !== 'admin'"
                    class="btn btn-sm btn-outline-danger rounded-circle"
                    @click="deleteUser(user.id)"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const router = useRouter();
const activeTab = ref("users");
const reports = ref([]);
const users = ref([]);
const loading = ref(false);

// ดึงข้อมูลรายงานปัญหา
const fetchReports = async () => {
  loading.value = true;
  try {
    if (activeTab.value === "reports") {
      const response = await axios.get("http://localhost:3000/api/reports");
      reports.value = response.data;
    } else {
      const response = await axios.get("http://localhost:3000/api/users");
      users.value = response.data;
    }
  } catch (err) {
    console.error(err);
  }
  loading.value = false;
};
// เปลี่ยนสถานะ
const updateStatus = async (id, newStatus) => {
  try {
    // API Call PUT
    await axios.put(`http://localhost:3000/api/admin/reports/${id}/status`, {
      status: newStatus,
    });

    // Popup แจ้งเตือนเล็กๆ มุมขวาบน
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
    Toast.fire({ icon: "success", title: "อัปเดตสถานะเรียบร้อย" });
  } catch (err) {
    Swal.fire("Error", "ไม่สามารถอัปเดตสถานะได้", "error");
    fetchData(); // โหลดข้อมูลเดิมกลับมาถ้าพลาด
  }
};

const deleteReport = async (id) => {
  if (await confirmDelete()) {
    await axios.delete(`http://localhost:3000/api/admin/reports/${id}`);
    fetchData();
  }
};

const deleteUser = async (id) => {
  if (await confirmDelete()) {
    await axios.delete(`http://localhost:3000/api/users/${id}`);
    fetchData();
  }
};

const confirmDelete = async () => {
  const result = await Swal.fire({
    title: "ยืนยันการลบ?",
    text: "การกระทำนี้ไม่สามารถย้อนกลับได้",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "ใช่, ลบเลย!",
    cancelButtonText: "ยกเลิก",
  });
  return result.isConfirmed;
};
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

const getStatusClass = (status) => {
  if(status === 'pending') return 'status-pending';
  if(status === 'in_progress') return 'status-progress';
  return 'status-resolved';
};

onMounted(fetchData);
watch(activeTab, fetchData);
</script>
<style scoped>
/* 3. CSS Styling - แต่งสวย */

.dashboard-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 80px;
}

/* Header ให้ติดอยู่ด้านบนตลอด */
.header-section {
  background: white;
  padding: 15px 20px;
  position: sticky;
  top: 0;
  z-index: 99;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

/* Tabs Styling */
.nav-pills .nav-link {
  color: #666;
  font-weight: 600;
  transition: all 0.3s ease;
}
.nav-pills .nav-link.active {
  background-color: var(--primary-green, #4CAF50);
  color: white;
  box-shadow: 0 4px 6px rgba(76, 175, 80, 0.3);
}

/* Card Styling */
.card-report {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid #eee;
  transition: transform 0.2s, box-shadow 0.2s;
}
.card-report:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1) !important;
}

/* ปุ่มลบ (ถังขยะ) */
.btn-delete {
  background: none;
  border: none;
  color: #dc3545;
  opacity: 0.5;
  transition: 0.2s;
}
.btn-delete:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* Dropdown Status (พระเอกของเรา) */
.status-control {
  background: #f8f9fa;
  padding: 5px 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
}
.status-select {
  border: none;
  font-weight: bold;
  background-color: transparent;
  cursor: pointer;
}
.status-select:focus {
  box-shadow: none;
}

/* สีของ Dropdown ตามสถานะ */
.status-pending { color: #ff9800; }
.status-progress { color: #2196f3; }
.status-resolved { color: #4caf50; }

</style>