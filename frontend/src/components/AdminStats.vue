<template>
  <div class="stats-grid">
    <div class="stat-card users-card">
      <div class="stat-icon-wrapper">
        <i class="bi bi-people-fill stat-icon"></i>
      </div>
      <div class="stat-content">
        <h3 class="stat-value">{{ displayedUsers }}</h3>
        <p class="stat-label">ผู้ใช้งานทั้งหมด</p>
      </div>
    </div>

    <div class="stat-card reports-card">
      <div class="stat-icon-wrapper">
        <i class="bi bi-file-earmark-text-fill stat-icon"></i>
      </div>
      <div class="stat-content">
        <h3 class="stat-value">{{ displayedReports }}</h3>
        <p class="stat-label">เรื่องร้องเรียนทั้งหมด</p>
      </div>
    </div>

    <div class="stat-card pending-card">
      <div class="stat-icon-wrapper">
        <i class="bi bi-clock-history stat-icon"></i>
      </div>
      <div class="stat-content">
        <h3 class="stat-value">{{ displayedPending }}</h3>
        <p class="stat-label">รอการตรวจสอบ</p>
      </div>
    </div>

    <div class="stat-card resolved-card">
      <div class="stat-icon-wrapper">
        <i class="bi bi-check-circle-fill stat-icon"></i>
      </div>
      <div class="stat-content">
        <h3 class="stat-value">{{ displayedResolved }}</h3>
        <p class="stat-label">แก้ไขเสร็จสิ้น</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  totalUsers: { type: Number, default: 0 },
  totalReports: { type: Number, default: 0 },
  pendingReports: { type: Number, default: 0 },
  resolvedReports: { type: Number, default: 0 },
});

// ตัวแปรสำหรับแสดงผล (เพื่อทำ Animation)
const displayedUsers = ref(0);
const displayedReports = ref(0);
const displayedPending = ref(0);
const displayedResolved = ref(0);

// ฟังก์ชัน Count Up Animation
const animateValue = (targetRef, start, end, duration) => {
  if (start === end) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    targetRef.value = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
};

// Watch การเปลี่ยนแปลงของ Props แล้วสั่ง Animate
watch(
  () => props.totalUsers,
  (newVal) => animateValue(displayedUsers, 0, newVal, 1000)
);
watch(
  () => props.totalReports,
  (newVal) => animateValue(displayedReports, 0, newVal, 1000)
);
watch(
  () => props.pendingReports,
  (newVal) => animateValue(displayedPending, 0, newVal, 1000)
);
watch(
  () => props.resolvedReports,
  (newVal) => animateValue(displayedResolved, 0, newVal, 1000)
);

onMounted(() => {
  // Initial Animation
  animateValue(displayedUsers, 0, props.totalUsers, 1000);
  animateValue(displayedReports, 0, props.totalReports, 1000);
  animateValue(displayedPending, 0, props.pendingReports, 1000);
  animateValue(displayedResolved, 0, props.resolvedReports, 1000);
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); /* Responsive Grid */
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f0f0f0;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  font-size: 1.8rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.stat-label {
  margin: 0;
  color: #888;
  font-size: 0.9rem;
}

/* Color Themes */
.users-card .stat-icon-wrapper {
  background-color: #e8f5e9;
  color: #2e7d32;
}
.reports-card .stat-icon-wrapper {
  background-color: #e3f2fd;
  color: #1976d2;
}
.pending-card .stat-icon-wrapper {
  background-color: #fff8e1;
  color: #ffa000;
}
.resolved-card .stat-icon-wrapper {
  background-color: #f3e5f5; /* สีม่วงอ่อน */
  color: #7b1fa2; /* สีม่วงเข้ม */
}
</style>
