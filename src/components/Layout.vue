<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
      <div class="sidebar-header">
        <h1 class="logo" :class="{ 'logo-collapsed': isCollapsed }">
          {{ isCollapsed ? '大挖' : '大挖故障追踪系统' }}
        </h1>
        <el-button type="text" class="collapse-btn" @click="toggleSidebar">
          <el-icon>
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
        </el-button>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#303133"
        text-color="#fff"
        active-text-color="#409EFF"
        :collapse="isCollapsed"
        :collapse-transition="false"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>当日故障</span>
        </el-menu-item>
        <el-menu-item index="/history-faults">
          <el-icon><Document /></el-icon>
          <span>历史故障</span>
        </el-menu-item>
        <el-menu-item index="/trends">
          <el-icon><DataAnalysis /></el-icon>
          <span>故障趋势</span>
        </el-menu-item>
        <el-menu-item index="/fault-management">
          <el-icon><Edit /></el-icon>
          <span>故障管理</span>
        </el-menu-item>
        <el-menu-item index="/todo">
          <el-icon><Tickets /></el-icon>
          <span>个人待办</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <div class="top-nav">
        <div class="nav-left">
          <el-button type="text" class="menu-btn" @click="toggleSidebar">
            <el-icon><Menu /></el-icon>
          </el-button>
        </div>
        <div class="nav-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span class="user-name">{{ user.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>设置</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  HomeFilled, 
  Edit, 
  Document, 
  DataAnalysis, 
  Tickets, 
  User, 
  ArrowDown,
  Fold,
  Expand,
  Menu
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 侧边栏状态
const isCollapsed = ref(false)

// 用户信息
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 切换侧边栏
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 菜单选择
const handleMenuSelect = (key) => {
  // 如果点击的是当前激活的菜单，且侧边栏是收起状态，则展开侧边栏
  if (key === route.path && isCollapsed.value) {
    isCollapsed.value = false
  } else {
    // 点击其他菜单，只进行路由跳转，不展开侧边栏
    router.push(key)
  }
}

// 退出登录
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ElMessage.success('退出登录成功')
  router.push('/login')
}

// 监听路由变化
watch(() => route.path, (newPath) => {
  // 可以在这里添加路由变化的处理逻辑
})
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.sidebar {
  width: 240px;
  background-color: #303133;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar.sidebar-collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #404040;
}

.logo {
  color: white;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s;
}

.logo.logo-collapsed {
  font-size: 16px;
}

.collapse-btn {
  color: white;
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 64px);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.top-nav {
  height: 64px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.menu-btn {
  margin-right: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-name {
  margin: 0 10px;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar.sidebar-collapsed {
    left: -240px;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .top-nav {
    padding: 0 10px;
  }
  
  .user-name {
    display: none;
  }
  
  .content {
    padding: 10px;
  }
  
  .logo {
    font-size: 16px !important;
  }
  
  .logo.logo-collapsed {
    font-size: 14px !important;
  }
}
</style>