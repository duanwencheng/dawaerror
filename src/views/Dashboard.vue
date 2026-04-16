<template>
  <Layout>
    <div class="dashboard">
      <!-- 头部 -->
      <div class="header">
        <div class="title">
          <h1>当日故障</h1>
          <span class="date">{{ currentDate }}</span>
          <span class="update-time">最后更新: {{ lastUpdateTime }}</span>
        </div>
        <div class="actions">
          <el-button type="primary" :icon="Refresh" circle @click="refreshData" class="tech-button">
          </el-button>
          <el-button type="success" :icon="Plus" circle @click="navigateToManagement" class="tech-button">
          </el-button>
        </div>
      </div>

    <!-- 故障统计 -->
    <div class="stats">
      <div class="stat-item">
        <div class="stat-icon"><i class="el-icon-data-analysis"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ totalFaults }}</div>
          <div class="stat-label">总故障数</div>
        </div>
        <div class="stat-bg"></div>
      </div>
      <div class="stat-item warning">
        <div class="stat-icon"><i class="el-icon-warning"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ highPriorityFaults }}</div>
          <div class="stat-label">紧急故障</div>
        </div>
        <div class="stat-bg"></div>
      </div>
      <div class="stat-item info">
        <div class="stat-icon"><i class="el-icon-s-flag"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ mediumPriorityFaults }}</div>
          <div class="stat-label">重要故障</div>
        </div>
        <div class="stat-bg"></div>
      </div>
      <div class="stat-item success">
        <div class="stat-icon"><i class="el-icon-s-check"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ lowPriorityFaults }}</div>
          <div class="stat-label">一般故障</div>
        </div>
        <div class="stat-bg"></div>
      </div>
      <div class="stat-item danger">
        <div class="stat-icon"><i class="el-icon-s-close"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ unclosedFaults }}</div>
          <div class="stat-label">未闭环故障</div>
        </div>
        <div class="stat-bg"></div>
      </div>
    </div>

    <!-- 故障卡片展示 -->
    <div class="fault-sections">
      <!-- 紧急故障 -->
      <div class="fault-section">
        <div class="section-header danger">
          <div class="section-icon"><i class="el-icon-warning"></i></div>
          <h2>紧急故障</h2>
          <span class="count">{{ highPriorityFaults }}</span>
        </div>
        <div class="fault-cards">
          <div 
            v-for="fault in highPriorityFaultsList" 
            :key="fault.id"
            class="fault-card danger"
            :class="{ 'unclosed': !fault.isClosed }"
            @click="showFaultDetail(fault)"
          >
            <div class="card-header">
              <div class="machine-info">
                <div class="model">{{ fault.model }}</div>
                <div class="machine-number">{{ fault.machineNumber }}</div>
              </div>
              <span class="priority">高</span>
            </div>
            <div class="card-body">
              <div class="fault-description">{{ fault.description }}</div>
              <div class="fault-meta">
                <div class="meta-item">
                  <i class="el-icon-user"></i>
                  <span>{{ fault.responderName }}</span>
                </div>
                <div class="meta-item">
                  <i class="el-icon-time"></i>
                  <span>{{ fault.meetingDate }}</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <span class="status" :class="{ 'closed': fault.isClosed, 'unclosed': !fault.isClosed }">
                {{ fault.isClosed ? '已闭环' : '未闭环' }}
              </span>
              <el-button type="text" size="small" @click.stop="showFaultDetail(fault)">
                查看详情
              </el-button>
            </div>
            <div class="card-glow"></div>
          </div>
          <div v-if="highPriorityFaultsList.length === 0" class="empty-card">
            <div class="empty-icon"><i class="el-icon-s-success"></i></div>
            <div class="empty-text">暂无紧急故障</div>
          </div>
        </div>
      </div>

      <!-- 重要故障 -->
      <div class="fault-section">
        <div class="section-header warning">
          <div class="section-icon"><i class="el-icon-s-flag"></i></div>
          <h2>重要故障</h2>
          <span class="count">{{ mediumPriorityFaults }}</span>
        </div>
        <div class="fault-cards">
          <div 
            v-for="fault in mediumPriorityFaultsList" 
            :key="fault.id"
            class="fault-card warning"
            :class="{ 'unclosed': !fault.isClosed }"
            @click="showFaultDetail(fault)"
          >
            <div class="card-header">
              <div class="machine-info">
                <div class="model">{{ fault.model }}</div>
                <div class="machine-number">{{ fault.machineNumber }}</div>
              </div>
              <span class="priority">中</span>
            </div>
            <div class="card-body">
              <div class="fault-description">{{ fault.description }}</div>
              <div class="fault-meta">
                <div class="meta-item">
                  <i class="el-icon-user"></i>
                  <span>{{ fault.responderName }}</span>
                </div>
                <div class="meta-item">
                  <i class="el-icon-time"></i>
                  <span>{{ fault.meetingDate }}</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <span class="status" :class="{ 'closed': fault.isClosed, 'unclosed': !fault.isClosed }">
                {{ fault.isClosed ? '已闭环' : '未闭环' }}
              </span>
              <el-button type="text" size="small" @click.stop="showFaultDetail(fault)">
                查看详情
              </el-button>
            </div>
            <div class="card-glow"></div>
          </div>
          <div v-if="mediumPriorityFaultsList.length === 0" class="empty-card">
            <div class="empty-icon"><i class="el-icon-s-success"></i></div>
            <div class="empty-text">暂无重要故障</div>
          </div>
        </div>
      </div>

      <!-- 一般故障 -->
      <div class="fault-section">
        <div class="section-header info">
          <div class="section-icon"><i class="el-icon-info"></i></div>
          <h2>一般故障</h2>
          <span class="count">{{ lowPriorityFaults }}</span>
        </div>
        <div class="fault-cards">
          <div 
            v-for="fault in lowPriorityFaultsList" 
            :key="fault.id"
            class="fault-card info"
            :class="{ 'unclosed': !fault.isClosed }"
            @click="showFaultDetail(fault)"
          >
            <div class="card-header">
              <div class="machine-info">
                <div class="model">{{ fault.model }}</div>
                <div class="machine-number">{{ fault.machineNumber }}</div>
              </div>
              <span class="priority">低</span>
            </div>
            <div class="card-body">
              <div class="fault-description">{{ fault.description }}</div>
              <div class="fault-meta">
                <div class="meta-item">
                  <i class="el-icon-user"></i>
                  <span>{{ fault.responderName }}</span>
                </div>
                <div class="meta-item">
                  <i class="el-icon-time"></i>
                  <span>{{ fault.meetingDate }}</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <span class="status" :class="{ 'closed': fault.isClosed, 'unclosed': !fault.isClosed }">
                {{ fault.isClosed ? '已闭环' : '未闭环' }}
              </span>
              <el-button type="text" size="small" @click.stop="showFaultDetail(fault)">
                查看详情
              </el-button>
            </div>
            <div class="card-glow"></div>
          </div>
          <div v-if="lowPriorityFaultsList.length === 0" class="empty-card">
            <div class="empty-icon"><i class="el-icon-s-success"></i></div>
            <div class="empty-text">暂无一般故障</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 故障详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="故障详情"
      size="70%"
    >
      <div v-if="selectedFault" class="fault-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="分类">{{ selectedFault.category }}</el-descriptions-item>
          <el-descriptions-item label="早会日期">{{ selectedFault.meetingDate }}</el-descriptions-item>
          <el-descriptions-item label="服务工程师">{{ selectedFault.serviceEngineer }}</el-descriptions-item>
          <el-descriptions-item label="工程师电话">{{ selectedFault.engineerPhone }}</el-descriptions-item>
          <el-descriptions-item label="公司">{{ selectedFault.company }}</el-descriptions-item>
          <el-descriptions-item label="机型">{{ selectedFault.model }}</el-descriptions-item>
          <el-descriptions-item label="工作小时">{{ selectedFault.workHours }}</el-descriptions-item>
          <el-descriptions-item label="机号">{{ selectedFault.machineNumber }}</el-descriptions-item>
          <el-descriptions-item label="生产日期">{{ selectedFault.productionDate }}</el-descriptions-item>
          <el-descriptions-item label="代理商">{{ selectedFault.agent }}</el-descriptions-item>
          <el-descriptions-item label="故障描述" :span="2">{{ selectedFault.description }}</el-descriptions-item>
          <el-descriptions-item label="回复责任人">{{ selectedFault.responderName }}</el-descriptions-item>
          <el-descriptions-item label="故障部位">{{ selectedFault.faultLocation }}</el-descriptions-item>
          <el-descriptions-item label="是否对策">{{ selectedFault.isCountermeasured }}</el-descriptions-item>
          <el-descriptions-item label="部品状态">{{ selectedFault.partStatus }}</el-descriptions-item>
          <el-descriptions-item label="故障风险评估">{{ selectedFault.riskAssessment }}</el-descriptions-item>
          <el-descriptions-item label="整机生产地">{{ selectedFault.productionSite }}</el-descriptions-item>
          <el-descriptions-item label="原因分析" :span="2">{{ selectedFault.rootCause }}</el-descriptions-item>
          <el-descriptions-item label="临时对策" :span="2">{{ selectedFault.temporaryCountermeasure }}</el-descriptions-item>
          <el-descriptions-item label="长久对策及进展" :span="2">{{ selectedFault.longTermCountermeasure }}</el-descriptions-item>
          <el-descriptions-item label="是否闭环">{{ selectedFault.isClosed ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="调查人">{{ selectedFault.investigatorName }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 故障照片 -->
        <div v-if="selectedFault.photos && selectedFault.photos.length > 0" class="fault-photos">
          <h3>故障照片</h3>
          <div class="photo-grid">
            <div v-for="(photo, index) in selectedFault.photos" :key="index" class="photo-item">
              <el-image
                :src="photo"
                fit="cover"
                style="width: 200px; height: 150px"
                preview-src-list="[photo]"
              />
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, Plus } from '@element-plus/icons-vue'
import Layout from '../components/Layout.vue'
import faultData from '../data/faultData.js'

const router = useRouter()
const currentDate = ref(new Date().toLocaleDateString('zh-CN'))
const lastUpdateTime = ref(new Date().toLocaleTimeString('zh-CN'))
const drawerVisible = ref(false)
const selectedFault = ref(null)
const refreshTimer = ref(null)

// 使用实际故障数据
const faults = ref(faultData)

// 计算属性：按优先级分组故障
const highPriorityFaultsList = computed(() => {
  return faults.value.filter(fault => fault.riskAssessment === '有批量风险')
})

const mediumPriorityFaultsList = computed(() => {
  return faults.value.filter(fault => fault.riskAssessment === '零星偶发')
})

const lowPriorityFaultsList = computed(() => {
  return faults.value.filter(fault => fault.riskAssessment === '首发')
})

// 统计数据
const totalFaults = computed(() => faults.value.length)
const highPriorityFaults = computed(() => highPriorityFaultsList.value.length)
const mediumPriorityFaults = computed(() => mediumPriorityFaultsList.value.length)
const lowPriorityFaults = computed(() => lowPriorityFaultsList.value.length)
const unclosedFaults = computed(() => faults.value.filter(fault => !fault.isClosed).length)

// 显示故障详情
const showFaultDetail = (fault) => {
  selectedFault.value = fault
  drawerVisible.value = true
}

// 刷新数据
const refreshData = () => {
  // 模拟数据刷新
  console.log('刷新数据')
  lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
  // 实际项目中应该调用API获取最新数据
}

// 导航到故障管理页面
const navigateToManagement = () => {
  router.push('/fault-management')
}

// 自动刷新
const startAutoRefresh = () => {
  refreshTimer.value = setInterval(() => {
    refreshData()
  }, 5 * 60 * 1000) // 5分钟
}

// 生命周期
onMounted(() => {
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
})
</script>

<style scoped>
/* 全局样式 */
.dashboard {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  background-attachment: fixed;
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 25px 30px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.title h1 {
  font-size: 28px;
  font-weight: bold;
  color: #1a1a2e;
  margin: 0;
  background: linear-gradient(90deg, #3a7bd5, #00d2ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title .date {
  color: #6c757d;
  font-size: 16px;
  font-weight: 500;
}

.title .update-time {
  color: #95a5a6;
  font-size: 14px;
  margin-left: 10px;
}

.actions {
  display: flex;
  gap: 15px;
}

.tech-button {
  transition: all 0.3s ease;
  border-radius: 50% !important;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.tech-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* 统计卡片样式 */
.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stat-item {
  flex: 1;
  min-width: 180px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stat-item.danger {
  border-left: 4px solid #f56c6c;
}

.stat-item.warning {
  border-left: 4px solid #e6a23c;
}

.stat-item.info {
  border-left: 4px solid #409eff;
}

.stat-item.success {
  border-left: 4px solid #67c23a;
}

.stat-icon {
  font-size: 28px;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  z-index: 1;
}

.stat-item.danger .stat-icon {
  color: #f56c6c;
  background: linear-gradient(135deg, #fce4ec, #f8bbd0);
}

.stat-item.warning .stat-icon {
  color: #e6a23c;
  background: linear-gradient(135deg, #fff3e0, #ffcc80);
}

.stat-item.success .stat-icon {
  color: #67c23a;
  background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
}

.stat-content {
  flex: 1;
  z-index: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #1a1a2e;
  margin-bottom: 5px;
  font-family: 'Arial', sans-serif;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.stat-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
  border-radius: 0 12px 0 100px;
}

.stat-item.danger .stat-bg {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.1), rgba(245, 108, 108, 0.05));
}

.stat-item.warning .stat-bg {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(230, 162, 60, 0.05));
}

.stat-item.success .stat-bg {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.05));
}

/* 故障区域样式 */
.fault-sections {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.fault-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
}

.fault-section:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.section-header {
  padding: 20px 30px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
}

.section-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
}

.section-header.danger {
  background: linear-gradient(90deg, #fef0f0, #fde2e2);
  color: #f56c6c;
}

.section-header.warning {
  background: linear-gradient(90deg, #fdf6ec, #fce8c8);
  color: #e6a23c;
}

.section-header.info {
  background: linear-gradient(90deg, #ecf5ff, #d9ecff);
  color: #409eff;
}

.section-header h2 {
  font-size: 18px;
  margin: 0;
  flex: 1;
}

.count {
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 故障卡片样式 */
.fault-cards {
  padding: 25px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.fault-card {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.fault-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.fault-card.danger {
  border-left: 4px solid #f56c6c;
  background: linear-gradient(135deg, rgba(254, 240, 240, 0.95), rgba(255, 255, 255, 0.95));
}

.fault-card.warning {
  border-left: 4px solid #e6a23c;
  background: linear-gradient(135deg, rgba(253, 246, 236, 0.95), rgba(255, 255, 255, 0.95));
}

.fault-card.info {
  border-left: 4px solid #409eff;
  background: linear-gradient(135deg, rgba(236, 245, 255, 0.95), rgba(255, 255, 255, 0.95));
}

.fault-card.unclosed {
  border: 2px solid #f56c6c;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(245, 108, 108, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.machine-info {
  flex: 1;
}

.model {
  font-weight: bold;
  color: #1a1a2e;
  font-size: 16px;
  margin-bottom: 4px;
}

.machine-number {
  color: #6c757d;
  font-size: 14px;
}

.priority {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.fault-card.danger .priority {
  background: linear-gradient(90deg, #f56c6c, #f88b8b);
}

.fault-card.warning .priority {
  background: linear-gradient(90deg, #e6a23c, #ebb563);
}

.fault-card.info .priority {
  background: linear-gradient(90deg, #409eff, #69b1ff);
}

.card-body {
  margin-bottom: 15px;
}

.fault-description {
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.fault-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #6c757d;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.status.closed {
  background: linear-gradient(90deg, #67c23a, #85ce61);
  color: white;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.status.unclosed {
  background: linear-gradient(90deg, #f56c6c, #f88b8b);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fault-card:hover .card-glow {
  opacity: 1;
}

/* 空状态卡片 */
.empty-card {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  background: linear-gradient(135deg, rgba(244, 244, 245, 0.9), rgba(255, 255, 255, 0.9));
  border-radius: 12px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.empty-card:hover {
  border-color: #409eff;
  background: linear-gradient(135deg, rgba(236, 245, 255, 0.9), rgba(255, 255, 255, 0.9));
}

.empty-icon {
  font-size: 48px;
  color: #67c23a;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
}

/* 故障详情抽屉 */
.fault-detail {
  padding: 30px;
}

.fault-photos {
  margin-top: 30px;
}

.fault-photos h3 {
  font-size: 18px;
  font-weight: bold;
  color: #1a1a2e;
  margin-bottom: 15px;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
}

.photo-item {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.photo-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 15px;
  }
  
  .title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .title h1 {
    font-size: 24px !important;
  }
  
  .actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .stat-item {
    width: 100%;
    padding: 20px;
  }
  
  .stat-value {
    font-size: 28px !important;
  }
  
  .fault-sections {
    gap: 20px;
  }
  
  .section-header {
    padding: 15px 20px;
  }
  
  .fault-cards {
    grid-template-columns: 1fr;
    padding: 15px;
    gap: 15px;
  }
  
  .fault-card {
    padding: 15px;
  }
  
  .model {
    font-size: 14px !important;
  }
  
  .fault-description {
    font-size: 13px !important;
  }
  
  .fault-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .empty-card {
    padding: 40px 20px;
  }
  
  .fault-detail {
    padding: 20px;
  }
  
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>