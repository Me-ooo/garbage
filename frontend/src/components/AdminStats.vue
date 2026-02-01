<script setup>
import { defineProps, computed, ref, watch, onMounted } from "vue";
import gsap from "gsap"; // ถ้าไม่ได้ลง gsap ให้ลบส่วน Animation ออก หรือใช้ CSS แทน

const props = defineProps({
  totalUsers: { type: Number, default: 0 },
  totalReports: { type: Number, default: 0 },
  pendingReports: { type: Number, default: 0 },
  resolvedReports: { type: Number, default: 0 }, // ✅ เพิ่มอันนี้เพื่อความครบถ้วน
});

// --- ตัวแปรสำหรับ Animation ตัวเลข ---
const animatedUsers = ref(0);
const animatedReports = ref(0);
const animatedPending = ref(0);
const animatedResolved = ref(0);

// ฟังก์ชันทำให้ตัวเลขวิ่ง (Count Up Animation)
const animateValue = (targetRef, endValue) => {
  gsap.to(targetRef, { duration: 1, value: endValue, roundProps: "value", ease: "power2.out" });
};

// เฝ้าดูการเปลี่ยนแปลงของ Props (เมื่อ API โหลดเสร็จ ตัวเลขจะวิ่ง)
watch(() => props.totalUsers, (newVal) => animateValue(animatedUsers, newVal));
watch(() => props.totalReports, (newVal) => animateValue(animatedReports, newVal));
watch(() => props.pendingReports, (newVal) => animateValue(animatedPending, newVal));
watch(() => props.resolvedReports, (newVal) => animateValue(animatedResolved, newVal));

// กรณีข้อมูลมาตั้งแต่เริ่ม
onMounted(() => {
  animateValue(animatedUsers, props.totalUsers);
  animateValue(animatedReports, props.totalReports);
  animateValue(animatedPending, props.pendingReports);
  animateValue(animatedResolved, props.resolvedReports);
});
</script>

<template>
  <div class="stats-container">

    <div class="stat-card users-card">
      <div class="stat-content">
        <div class="stat-text">
          <p class="stat-label">ผู้ใช้งานทั้งหมด</p>
          <h3 class="stat-value">{{ animatedUsers }} <span class="unit">คน</span></h3>
        </div>
        <div class="stat-icon">
          <i class="bi bi-people-fill"></i>
        </div>
      </div>
      <div class="stat-footer">
        <small>Active Users</small>
      </div>
    </div>

    <div class="stat-card reports-card">
      <div class="stat-content">
        <div class="stat-text">
          <p class="stat-label">ร้องเรียนทั้งหมด</p>
          <h3 class="stat-value">{{ animatedReports }} <span class="unit">เรื่อง</span></h3>
        </div>
        <div class="stat-icon">
          <i class="bi bi-file-earmark-text-fill"></i>
        </div>
      </div>
      <div class="stat-footer">
        <small>Total Reports</small>
      </div>
    </div>

    <div class="stat-card pending-card">
      <div class="stat-content">
        <div class="stat-text">
          <p class="stat-label">รอตรวจสอบ</p>
          <h3 class="stat-value">{{ animatedPending }} <span class="unit">เรื่อง</span></h3>
        </div>
        <div class="stat-icon">
          <i class="bi bi-hourglass-split"></i>
        </div>
      </div>
      <div class="stat-footer">
        <small>Pending Action</small>
      </div>
    </div>

    <div class="stat-card resolved-card">
      <div class="stat-content">
        <div class="stat-text">
          <p class="stat-label">แก้ไขเสร็จสิ้น</p>
          <h3 class="stat-value">{{ animatedResolved }} <span class="unit">เรื่อง</span></h3>
        </div>
        <div class="stat-icon">
          <i class="bi bi-check-circle-fill"></i>
        </div>
      </div>
      <div class="stat-footer">
        <small>Completed</small>
      </div>
    </div>

  </div>
</template>

<style scoped>
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  font-family: 'Kanit', sans-serif;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 140px;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* เพิ่มวงกลมตกแต่งด้านหลัง */
.stat-card::after {
  content: '';
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.1;
  z-index: 0;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.stat-label {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  color: #333;
  line-height: 1;
}

.unit {
  font-size: 0.9rem;
  color: #aaa;
  font-weight: 400;
  margin-left: 5px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
}

.stat-footer {
  margin-top: auto;
  font-size: 0.8rem;
  color: #bbb;
  position: relative;
  z-index: 1;
}

/* --- Themes --- */

/* Users: Primary Green (Brand) */
.users-card .stat-icon {
  background: rgba(46, 89, 54, 0.1);
  color: #2e5936;
}

.users-card::after {
  background: #2e5936;
}

.users-card:hover {
  border-bottom: 4px solid #2e5936;
}

/* Reports: Blue (Info) */
.reports-card .stat-icon {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.reports-card::after {
  background: #3498db;
}

.reports-card:hover {
  border-bottom: 4px solid #3498db;
}

/* Pending: Orange (Warning) */
.pending-card .stat-icon {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.pending-card::after {
  background: #f39c12;
}

.pending-card:hover {
  border-bottom: 4px solid #f39c12;
}

/* Resolved: Teal/Green (Success) */
.resolved-card .stat-icon {
  background: rgba(26, 188, 156, 0.1);
  color: #1abc9c;
}

.resolved-card::after {
  background: #1abc9c;
}

.resolved-card:hover {
  border-bottom: 4px solid #1abc9c;
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
}
</style>