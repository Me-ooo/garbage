<template>
  <div class="stats-container">
    <div class="stat-card users-card">
      <div class="stat-content">
        <div class="stat-text">
          <p class="stat-label">ผู้ใช้งานทั้งหมด</p>
          <h3 class="stat-value">{{ totalUsers }} <span class="unit">คน</span></h3>
        </div>
        <div class="stat-icon">
          <i class="bi bi-people-fill"></i>
        </div>
      </div>
    </div>

    <div class="stat-card reports-card">
      <div class="stat-content">
        <div class="stat-text">
          <p class="stat-label">เรื่องร้องเรียนทั้งหมด</p>
          <h3 class="stat-value">{{ totalReports }} <span class="unit">รายการ</span></h3>
        </div>
        <div class="stat-icon">
          <i class="bi bi-file-earmark-text-fill"></i>
        </div>
      </div>
    </div>

    <div class="stat-card pending-card">
      <div class="stat-content">
        <div class="stat-text">
          <p class="stat-label">รอการตรวจสอบ</p>
          <h3 class="stat-value">
            {{ pendingReports }} <span class="unit">รายการ</span>
          </h3>
        </div>
        <div class="stat-icon">
          <i class="bi bi-clock-history"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  totalUsers: {
    type: Number,
    default: 0,
  },
  totalReports: {
    type: Number,
    default: 0,
  },
  pendingReports: {
    type: Number,
    default: 0,
  },
});
</script>

<style scoped>
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.02);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.stat-label {
  color: #6c757d;
  font-size: 1rem;
  margin-bottom: 5px;
  font-weight: 500;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.unit {
  font-size: 1rem;
  color: #adb5bd;
  font-weight: 400;
  margin-left: 5px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

/* --- ธีมสี --- */
.users-card .stat-icon { background-color: rgba(46, 204, 113, 0.15); color: #27ae60; }
.users-card { border-left: 5px solid #27ae60; }

.reports-card .stat-icon { background-color: rgba(52, 152, 219, 0.15); color: #2980b9; }
.reports-card { border-left: 5px solid #2980b9; }

.pending-card .stat-icon { background-color: rgba(241, 196, 15, 0.15); color: #f39c12; }
.pending-card { border-left: 5px solid #f39c12; }

@media (max-width: 768px) {
  .stats-container { grid-template-columns: 1fr; }
}
</style>