<template>
  <div class="stats-grid">
    <div class="stat-card users-card">
      <div class="stat-icon-wrapper">
        <i class="bi bi-people-fill stat-icon"></i>
      </div>
      <div class="stat-content">
        <h3 class="stat-value">{{ displayedUsers }}</h3>
        <p class="stat-label">สมาชิกทั้งหมด</p>
      </div>
    </div>

    <div class="stat-card reports-card">
      <div class="stat-icon-wrapper">
        <i class="bi bi-file-earmark-text-fill stat-icon"></i>
      </div>
      <div class="stat-content">
        <h3 class="stat-value">{{ displayedReports }}</h3>
        <p class="stat-label">แจ้งขยะทั้งหมด</p>
      </div>
    </div>

    <div class="stat-card pending-card">
      <div class="stat-icon-wrapper">
        <i class="bi bi-clock-history stat-icon"></i>
      </div>
      <div class="stat-content">
        <h3 class="stat-value text-warning">{{ displayedPending }}</h3>
        <p class="stat-label">รอดำเนินการ</p>
      </div>
    </div>

    <div class="stat-card progress-card">
      <div class="stat-icon-wrapper">
        <i class="bi bi-tools stat-icon"></i>
      </div>
      <div class="stat-content">
        <h3 class="stat-value text-info">{{ displayedInProgress }}</h3>
        <p class="stat-label">กำลังจัดการ</p>
      </div>
    </div>

    <div class="stat-card resolved-card">
      <div class="stat-icon-wrapper">
        <i class="bi bi-check-circle-fill stat-icon"></i>
      </div>
      <div class="stat-content">
        <h3 class="stat-value text-success">{{ displayedResolved }}</h3>
        <p class="stat-label">จัดการเรียบร้อย</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";

// ✅ 1. รับค่าจากหน้าแม่ (SystemOverview)
const props = defineProps({
  totalUsers: Number,
  totalReports: Number,
  pendingReports: Number,
  inProgressReports: Number,
  resolvedReports: Number,
});

const router = useRouter();
const API_URL = import.meta.env.VITE_API_BASE_URL;

const stats = ref({
  totalReports: 0,
  pending: 0,
  inProgress: 0,
  resolved: 0,
  totalUsers: 0,
});

const isLoading = ref(true);

// ✅ 2. คำนวณค่าที่จะแสดง (ถ้ามี Props ให้ใช้ Props ถ้าไม่มีให้ใช้ stats ที่โหลดเอง)
const displayedUsers = computed(() => props.totalUsers ?? stats.value.totalUsers);
const displayedReports = computed(() => props.totalReports ?? stats.value.totalReports);
const displayedPending = computed(() => props.pendingReports ?? stats.value.pending);
const displayedInProgress = computed(
  () => props.inProgressReports ?? stats.value.inProgress
);
const displayedResolved = computed(() => props.resolvedReports ?? stats.value.resolved);

onMounted(async () => {
  // เช็คสิทธิ์ Admin
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role !== "admin") {
    return;
  }

  // ถ้าไม่มีค่าส่งมาจาก Props (คือเปิดหน้านี้เดี่ยวๆ) ให้ดึงข้อมูลเอง
  if (props.totalUsers === undefined) {
    await fetchStats();
  } else {
    isLoading.value = false;
  }
});

const fetchStats = async () => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem("token");
    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;

    const response = await axios.get(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    stats.value = response.data;
  } catch (error) {
    console.error("Fetch Stats Error:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* สไตล์เดิมของคุณ ไม่มีการแก้ไขครับ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  font-size: 1.5rem;
}

.stat-value {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.1;
}

.stat-label {
  margin: 4px 0 0 0;
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
}

.users-card .stat-icon-wrapper {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.reports-card .stat-icon-wrapper {
  background-color: #e3f2fd;
  color: #1976d2;
}

.pending-card .stat-icon-wrapper {
  background-color: #fff3e0;
  color: #ef6c00;
}

.progress-card .stat-icon-wrapper {
  background-color: #e0f7fa;
  color: #00838f;
}

.resolved-card .stat-icon-wrapper {
  background-color: #f1f8e9;
  color: #388e3c;
}

@media (max-width: 1200px) {
  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
