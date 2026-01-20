<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <img src="/profile.png" alt="Profile" class="profile-avatar">
        <span class="header-title">สวัสดีคุณโปรแกรมเมอร์</span>
      </div>
      <div class="header-right">
        <button class="notification-btn">
          <i class="bi bi-bell"></i>
          <span class="notification-badge">3</span>
        </button>
        <button class="exit-btn">ออกจากระบบ</button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="dashboard-main">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <div class="sidebar-content">
          <button 
            v-for="item in menuItems" 
            :key="item.id"
            class="menu-btn"
            :class="{ active: activeMenu === item.id }"
            @click="selectMenu(item.id)"
          >
            {{ item.label }}
          </button>
        </div>
        <button class="admin-btn">
          <i class="bi bi-speedometer2"></i>
          Admin Dashboard
        </button>
      </aside>

      <!-- Main Content Area -->
      <main class="content-area">
        <div class="content-header">
          <h2>{{ getMenuTitle() }}</h2>
        </div>

        <!-- Messages/Info Cards -->
        <div class="messages-container">
          <div 
            v-for="message in filteredMessages" 
            :key="message.id"
            class="message-card"
          >
            <div class="message-image">
              <img :src="message.image" :alt="message.name">
            </div>
            <div class="message-content">
              <div class="message-header">
                <h3 class="message-name">{{ message.name }}</h3>
                <span class="message-category">{{ message.category }}</span>
              </div>
              <div class="message-details">
                <div class="detail-row">
                  <span class="detail-label">ประเภท:</span>
                  <span class="detail-value">{{ message.type }}</span>
                  <span class="detail-label">อายุ:</span>
                  <span class="detail-value">{{ message.age }}</span>
                  <span class="detail-label">เวลา:</span>
                  <span class="detail-value">{{ message.time }}</span>
                </div>
              </div>
              <div class="message-text">
                <p>{{ message.description }}</p>
              </div>
              <div class="message-footer">
                <span class="message-date">{{ message.date }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-controls">
          <button class="pagination-btn prev-btn">
            <i class="bi bi-chevron-left"></i>
          </button>
          <div class="pagination-numbers">
            <button 
              v-for="page in totalPages" 
              :key="page"
              class="page-number"
              :class="{ active: currentPage === page }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </div>
          <button class="pagination-btn next-btn">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </main>
    </div>

    <!-- Floating Action Button -->
    <button class="fab">
      <i class="bi bi-plus-lg"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeMenu = ref('inbox')
const currentPage = ref(1)
const totalPages = ref(5)

const menuItems = [
  { id: 'inbox', label: 'หมวดหมู่' },
  { id: 'important', label: 'แจ้งสำคัญ' },
  { id: 'animals', label: 'อาสาสมัครสัตว์' },
]

// Sample messages data
const allMessages = [
  {
    id: 1,
    name: 'น้องตั้มป้อม',
    category: 'สัตว์ป่า',
    type: 'ลิง',
    age: '15-18',
    time: '10/12/68',
    image: 'https://via.placeholder.com/100?text=Monkey',
    description: 'พบสัตว์ป่าตัวนี้ในพื้นที่ป่าที่ได้รับการคุ้มครอง สภาพแขนขาบาดเจ็บและต้องการการช่วยเหลือ',
    date: '10/12/68',
    menu: 'inbox'
  },
  {
    id: 2,
    name: 'น้องชมพู่',
    category: 'สัตว์ป่า',
    type: 'กรงหมู',
    age: '8-10',
    time: '09/12/68',
    image: 'https://via.placeholder.com/100?text=Wild+Boar',
    description: 'สัตว์ป่าหลงเข้ามาในหมู่บ้าน ต้องการความช่วยเหลือจากทีมงาน',
    date: '09/12/68',
    menu: 'important'
  },
  {
    id: 3,
    name: 'น้องมายโล่',
    category: 'สัตว์ป่า',
    type: 'นก',
    age: '5-7',
    time: '08/12/68',
    image: 'https://via.placeholder.com/100?text=Bird',
    description: 'พบนกบาดเจ็บที่ขาดใจจำหายไป ต้องการการฟื้นฟูและตรวจสุขภาพ',
    date: '08/12/68',
    menu: 'animals'
  },
  {
    id: 4,
    name: 'น้องเสือ',
    category: 'สัตว์ป่า',
    type: 'แมว',
    age: '3-5',
    time: '07/12/68',
    image: 'https://via.placeholder.com/100?text=Tiger',
    description: 'แมวป่าเข้ามาในบ้านเรือนและต้องการการเก็บกักเพื่อความปลอดภัย',
    date: '07/12/68',
    menu: 'inbox'
  },
]

const filteredMessages = computed(() => {
  return allMessages.filter(msg => msg.menu === activeMenu.value)
})

const selectMenu = (menuId) => {
  activeMenu.value = menuId
  currentPage.value = 1
}

const getMenuTitle = () => {
  const menu = menuItems.find(item => item.id === activeMenu.value)
  return menu ? menu.label : 'ข้อมูล'
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #a8d5ff 0%, #e0f4ff 50%, #90ee90 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
}

/* Header */
.header {
  background: linear-gradient(90deg, #4a9bb8 0%, #3d8fa0 100%);
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid white;
  background: #ddd;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  font-size: 18px;
  transition: all 0.3s ease;
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.notification-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.exit-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.exit-btn:hover {
  background: #ee5a52;
  transform: translateY(-2px);
}

/* Main Dashboard */
.dashboard-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 200px;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-btn {
  background: white;
  border: 2px solid #ddd;
  padding: 12px 15px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
  text-align: center;
}

.menu-btn:hover {
  border-color: #4a9bb8;
  color: #4a9bb8;
  background: #f0f8fc;
}

.menu-btn.active {
  background: #4a9bb8;
  color: white;
  border-color: #4a9bb8;
}

.admin-btn {
  background: #2d7f5f;
  color: white;
  border: none;
  padding: 12px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
  transition: all 0.3s ease;
}

.admin-btn:hover {
  background: #1f5940;
  transform: translateY(-2px);
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.content-header {
  margin-bottom: 25px;
}

.content-header h2 {
  color: #333;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.message-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.message-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.message-image {
  flex-shrink: 0;
}

.message-image img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.message-name {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.message-category {
  background: #ffd700;
  color: #333;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.message-details {
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 13px;
}

.detail-label {
  color: #666;
  font-weight: 600;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.message-text {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.message-text p {
  margin: 0;
  color: #555;
  font-size: 13px;
  line-height: 1.5;
}

.message-footer {
  text-align: right;
}

.message-date {
  color: #999;
  font-size: 12px;
}

/* Pagination */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 15px 0;
}

.pagination-btn {
  background: white;
  border: 2px solid #ddd;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #333;
  font-size: 16px;
}

.pagination-btn:hover {
  background: #4a9bb8;
  color: white;
  border-color: #4a9bb8;
}

.pagination-numbers {
  display: flex;
  gap: 8px;
}

.page-number {
  background: white;
  border: 2px solid #ddd;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #333;
  font-weight: 600;
  font-size: 13px;
}

.page-number:hover {
  border-color: #4a9bb8;
  color: #4a9bb8;
}

.page-number.active {
  background: #4a9bb8;
  color: white;
  border-color: #4a9bb8;
}

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #4a9bb8;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.fab:hover {
  background: #3d8fa0;
  transform: scale(1.1) translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.fab:active {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 150px;
    padding: 15px 10px;
  }

  .content-area {
    padding: 20px;
  }

  .message-card {
    flex-direction: column;
  }

  .message-image img {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    overflow-x: auto;
    padding: 10px;
  }

  .sidebar-content {
    flex-direction: row;
    gap: 10px;
  }

  .menu-btn {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .admin-btn {
    margin-top: 0;
    margin-left: auto;
    flex-shrink: 0;
  }

  .content-area {
    padding: 15px;
  }

  .message-card {
    padding: 15px;
    gap: 15px;
  }

  .fab {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
}
</style>
