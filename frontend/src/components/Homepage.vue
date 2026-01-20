@ -1,529 +0,0 @@
<template>
  <div class="homepage-container">
    <!-- Header -->
    <header class="header">
      <div class="user-profile">
        <img src="https://placehold.co/40x40/orange/white?text=User" alt="User Avatar">
        <span>สวัสดีคุณ {{ userName }}</span>
      </div>
      <button class="logout-btn" @click="handleLogout">
        ออกจากระบบ
      </button>
    </header>

    <!-- Main Layout -->
    <div class="container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="banner-box">
          <img src="https://placehold.co/250x120/81c784/ffffff?text=Project+Banner" alt="Campaign Banner">
        </div>
        
        <div class="nav-menu">
          <button 
            v-for="menu in menuItems" 
            :key="menu.id"
            class="menu-btn"
            :class="{ 'admin-btn': menu.id === 'admin' }"
            @click="handleMenuClick(menu.id)"
          >
            {{ menu.label }}
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <div class="banner-top">
          <img src="https://placehold.co/800x150/4caf50/ffffff?text=Community+Environment+Banner" alt="Environment Banner">
        </div>

        <!-- Search Bar -->
        <div class="search-bar">
          <input 
            v-model="searchText" 
            type="text" 
            class="search-input" 
            placeholder="ค้นหา..."
            @input="filterReports"
          >
          <select 
            v-model="selectedCategory" 
            class="category-select"
            @change="filterReports"
          >
            <option value="all">หมวดหมู่ ทั้งหมด</option>
            <option value="กำลังแก้ไข">กำลังแก้ไข</option>
            <option value="แก้ไขแล้ว">แก้ไขแล้ว</option>
          </select>
        </div>

        <!-- Report List -->
        <div class="report-list">
          <div 
            v-for="report in filteredReports" 
            :key="report.id"
            class="report-card"
          >
            <img :src="report.image" :alt="report.title" class="report-img">
            <div class="report-info">
              <span 
                class="status-badge"
                :class="{ 'status-processing': report.status === 'กำลังแก้ไข', 'status-done': report.status === 'แก้ไขแล้ว' }"
              >
                {{ report.status }}
              </span>
              <h3 class="report-title">{{ report.title }}</h3>
            </div>
            <div class="report-meta">
              <span>{{ report.time }}</span>
              <span>{{ report.date }}</span>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button class="page-btn" @click="prevPage">&lt;</button>
          <button 
            v-for="page in 5" 
            :key="page"
            class="page-btn"
            :class="{ active: currentPage === page }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button class="page-btn" @click="nextPage">&gt;</button>
        </div>

        <!-- Floating Action Button -->
        <button class="fab" @click="openNewReport">+</button>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { defineEmits } from 'vue'

const emit = defineEmits(['change-page'])

const userName = ref('โจโจ้')
const activeMenu = ref('home')
const searchText = ref('')
const selectedCategory = ref('all')
const currentPage = ref(1)

const menuItems = [
  { id: 'home', label: 'หน้าหลัก' },
  { id: 'report', label: 'แจ้งปัญหา' },
  { id: 'status', label: 'ติดตามสถานะ' },
  { id: 'admin', label: 'Admin Dashboard' }
]

const reports = [
  {
    id: 1,
    title: 'ขยะเน่าเสีย',
    status: 'กำลังแก้ไข',
    image: 'https://placehold.co/80/555/fff?text=Trash',
    time: '15:18',
    date: '10/12/68'
  },
  {
    id: 2,
    title: 'ขยะอันตราย',
    status: 'กำลังแก้ไข',
    image: 'https://placehold.co/80/333/fff?text=Danger',
    time: '15:18',
    date: '10/12/68'
  },
  {
    id: 3,
    title: 'ถังขยะไม่เพียงพอ',
    status: 'กำลังแก้ไข',
    image: 'https://placehold.co/80/777/fff?text=Bin',
    time: '15:18',
    date: '10/12/68'
  },
  {
    id: 4,
    title: 'เจ้าหน้าที่ไม่มาเก็บขยะ',
    status: 'แก้ไขแล้ว',
    image: 'https://placehold.co/80/2e7d32/fff?text=Done',
    time: '15:18',
    date: '10/12/68'
  },
]

const filteredReports = computed(() => {
  return reports.filter(report => {
    const matchText = report.title.toLowerCase().includes(searchText.value.toLowerCase())
    const matchCategory = selectedCategory.value === 'all' || report.status === selectedCategory.value
    return matchText && matchCategory
  })
})

const filterReports = () => {
  currentPage.value = 1
}

const handleLogout = () => {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    emit('change-page', 'login')
  }
}

const openNewReport = () => {
  emit('change-page', 'reportpage')
}

const handleMenuClick = (menuId) => {
  if (menuId === 'home') {
    // Stay on homepage
    activeMenu.value = menuId
  } else if (menuId === 'report') {
    emit('change-page', 'reportpage')
  } else if (menuId === 'status') {
    console.log('Navigate to status page')
  } else if (menuId === 'admin') {
    emit('change-page', 'dashboard')
  }
}

const prevPage = () {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < 5) currentPage.value++
}
</script>

<style scoped>
:root {
  --primary-green: #2e5936;
  --secondary-green: #5c9454;
  --bg-light: #e8f5e9;
  --text-dark: #333;
  --status-processing: #fdd835;
  --status-done: #66bb6a;
}

* {
  box-sizing: border-box;
}

.homepage-container {
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

.user-profile img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid white;
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
}

.menu-btn:hover {
  background-color: #e0e0e0;
}

.admin-btn {
  background-color: var(--primary-green);
  color: white;
  border: none;
  margin-top: auto;
}

.admin-btn:hover {
  background-color: #1b3820;
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
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
}

.banner-top img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* Search Bar */
.search-bar {
  background-color: var(--secondary-green);
  padding: 10px;
  border-radius: 10px;
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex-grow: 1;
  padding: 8px 15px;
  border-radius: 5px;
  border: none;
  outline: none;
  font-family: 'Kanit', sans-serif;
}

.category-select {
  padding: 8px 15px;
  border-radius: 20px;
  border: none;
  background-color: white;
  cursor: pointer;
  font-family: 'Kanit', sans-serif;
}

/* Report List */
.report-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.report-card {
  border: 1px solid #ddd;
  border-radius: 15px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.report-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  background-color: #eee;
  flex-shrink: 0;
}

.report-info {
  flex-grow: 1;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.status-processing {
  background-color: var(--status-processing);
  color: #555;
}

.status-done {
  background-color: var(--status-done);
  color: white;
}

.report-title {
  font-size: 1.1rem;
  color: #555;
  margin: 0;
}

.report-meta {
  text-align: right;
  font-size: 0.9rem;
  color: #777;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 80px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.page-btn {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}

.page-btn:hover {
  background-color: #e0e0e0;
}

.page-btn.active {
  background-color: #ddd;
  font-weight: bold;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background-color: #00c853;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  cursor: pointer;
  border: none;
  transition: 0.3s;
}

.fab:hover {
  transform: scale(1.1);
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

  .fab {
    bottom: 20px;
    right: 20px;
  }
}
</style>
