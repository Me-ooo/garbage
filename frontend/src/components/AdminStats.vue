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
import { ref, watch, onMounted } from "vue";

// รับค่าจาก SystemOverview (Parent Component)
const props = defineProps({
  totalUsers: { type: Number, default: 0 },
  totalReports: { type: Number, default: 0 },
  pendingReports: { type: Number, default: 0 },
  inProgressReports: { type: Number, default: 0 },
  resolvedReports: { type: Number, default: 0 },
});

// ตัวแปรสำหรับแสดงผล Animation
const displayedUsers = ref(0);
const displayedReports = ref(0);
const displayedPending = ref(0);
const displayedInProgress = ref(0);
const displayedResolved = ref(0);

// ฟังก์ชัน Count Up Animation (ตัวเลขวิ่ง)
const animateValue = (targetRef, end, duration = 1000) => {
  const start = targetRef.value;
  if (start === end) return;

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    // คำนวณค่าปัจจุบันตาม Progress
    targetRef.value = Math.floor(progress * (end - start) + start);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      targetRef.value = end; // จบ Animation ให้ค่าตรงเป๊ะ
    }
  };
  window.requestAnimationFrame(step);
};

// Watch ค่าต่างๆ เมื่อ Parent ส่งค่าใหม่มา ให้เล่น Animation
watch(
  () => props.totalUsers,
  (val) => animateValue(displayedUsers, val)
);
watch(
  () => props.totalReports,
  (val) => animateValue(displayedReports, val)
);
watch(
  () => props.pendingReports,
  (val) => animateValue(displayedPending, val)
);
watch(
  () => props.inProgressReports,
  (val) => animateValue(displayedInProgress, val)
);
watch(
  () => props.resolvedReports,
  (val) => animateValue(displayedResolved, val)
);

onMounted(() => {
  // เริ่ม Animation ครั้งแรกตอนโหลดหน้าเว็บ
  animateValue(displayedUsers, props.totalUsers);
  animateValue(displayedReports, props.totalReports);
  animateValue(displayedPending, props.pendingReports);
  animateValue(displayedInProgress, props.inProgressReports);
  animateValue(displayedResolved, props.resolvedReports);
});
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
