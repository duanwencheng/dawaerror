<template>
  <Layout>
    <div class="trends">
      <!-- 头部 -->
      <div class="header">
        <div class="title">
          <h1>故障趋势</h1>
          <span class="update-time">最后更新: {{ lastUpdateTime }}</span>
        </div>
        <div class="actions">
          <el-button type="success" :icon="Refresh" circle @click="refreshData" class="tech-button">
          </el-button>
        </div>
      </div>

    <!-- 筛选条件 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="filterForm" class="demo-form-inline">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM"
            format="YYYY-MM"
            class="tech-date-picker"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="机型">
          <el-select v-model="filterForm.model" placeholder="请选择" class="tech-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="SY980H" value="SY980H"></el-option>
            <el-option label="SY750H" value="SY750H"></el-option>
            <el-option label="SY650H" value="SY650H"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="机号">
          <el-input v-model="filterForm.serialNumber" placeholder="请输入机号" class="tech-input"></el-input>
        </el-form-item>
        <el-form-item label="故障部位">
          <el-select v-model="filterForm.location" placeholder="请选择" class="tech-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="发动机" value="发动机"></el-option>
            <el-option label="液压系统" value="液压系统"></el-option>
            <el-option label="电气系统" value="电气系统"></el-option>
            <el-option label="空调系统" value="空调系统"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filterForm.category" placeholder="请选择" class="tech-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="国内故障" value="国内故障"></el-option>
            <el-option label="国际故障" value="国际故障"></el-option>
            <el-option label="国内巡检" value="国内巡检"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateCharts" class="tech-button">查询</el-button>
          <el-button @click="resetFilter" class="tech-button">重置</el-button>
          <el-button type="success" @click="exportData" class="tech-button">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片 -->
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
        <div class="stat-icon"><i class="el-icon-s-mark"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ faultRate }}%</div>
          <div class="stat-label">平均故障率</div>
        </div>
        <div class="stat-bg"></div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts">
      <!-- 故障数量趋势图 -->
      <div class="chart-item">
        <div class="chart-header">
          <h3>故障数量趋势</h3>
          <div class="chart-info">按月份统计</div>
        </div>
        <div id="faultCountChart" class="chart tech-chart"></div>
      </div>

      <!-- 故障类型分布 -->
      <div class="chart-item">
        <div class="chart-header">
          <h3>故障类型分布</h3>
          <div class="chart-info">占比分析</div>
        </div>
        <div id="faultTypeChart" class="chart tech-chart"></div>
      </div>

      <!-- 故障部位分布 -->
      <div class="chart-item">
        <div class="chart-header">
          <h3>故障部位分布</h3>
          <div class="chart-info">热门故障点</div>
        </div>
        <div id="faultLocationChart" class="chart tech-chart"></div>
      </div>

      <!-- 故障率趋势 -->
      <div class="chart-item">
        <div class="chart-header">
          <h3>故障率趋势</h3>
          <div class="chart-info">月度变化</div>
        </div>
        <div id="faultRateChart" class="chart tech-chart"></div>
      </div>
    </div>
  </div>
  </Layout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import { Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Layout from '../components/Layout.vue'

// 筛选条件
const filterForm = reactive({
  dateRange: [],
  model: '',
  serialNumber: '',
  location: '',
  category: ''
})

// 图表实例
let faultCountChart = null
let faultTypeChart = null
let faultLocationChart = null
let faultRateChart = null

// 最后更新时间
const lastUpdateTime = ref(new Date().toLocaleTimeString('zh-CN'))

// 模拟故障数据
const faultData = ref([
  { month: '2026-01', count: 12, high: 3, medium: 5, low: 4, rate: 2.5, type: '国内故障', location: '发动机', model: 'SY980H', serialNumber: 'SY980H-001' },
  { month: '2026-02', count: 15, high: 4, medium: 6, low: 5, rate: 3.2, type: '国内故障', location: '液压系统', model: 'SY750H', serialNumber: 'SY750H-001' },
  { month: '2026-03', count: 10, high: 2, medium: 4, low: 4, rate: 2.1, type: '国际故障', location: '电气系统', model: 'SY650H', serialNumber: 'SY650H-001' },
  { month: '2026-04', count: 18, high: 5, medium: 8, low: 5, rate: 3.8, type: '国内巡检', location: '空调系统', model: 'SY980H', serialNumber: 'SY980H-002' },
  { month: '2026-05', count: 14, high: 3, medium: 6, low: 5, rate: 2.9, type: '国内故障', location: '发动机', model: 'SY750H', serialNumber: 'SY750H-002' },
  { month: '2026-06', count: 16, high: 4, medium: 7, low: 5, rate: 3.4, type: '国际故障', location: '液压系统', model: 'SY650H', serialNumber: 'SY650H-002' }
])

// 计算属性
const totalFaults = computed(() => {
  return faultData.value.reduce((sum, item) => sum + item.count, 0)
})

const highPriorityFaults = computed(() => {
  return faultData.value.reduce((sum, item) => sum + item.high, 0)
})

const mediumPriorityFaults = computed(() => {
  return faultData.value.reduce((sum, item) => sum + item.medium, 0)
})

const lowPriorityFaults = computed(() => {
  return faultData.value.reduce((sum, item) => sum + item.low, 0)
})

const faultRate = computed(() => {
  const avgRate = faultData.value.reduce((sum, item) => sum + item.rate, 0) / faultData.value.length
  return avgRate.toFixed(1)
})

// 初始化图表
const initCharts = () => {
  // 故障数量趋势图
  faultCountChart = echarts.init(document.getElementById('faultCountChart'))
  // 故障类型分布图
  faultTypeChart = echarts.init(document.getElementById('faultTypeChart'))
  // 故障部位分布图
  faultLocationChart = echarts.init(document.getElementById('faultLocationChart'))
  // 故障率趋势图
  faultRateChart = echarts.init(document.getElementById('faultRateChart'))
  
  updateCharts()
}

// 更新图表
const updateCharts = () => {
  // 处理筛选后的数据
  let filteredData = [...faultData.value]
  
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const startDate = filterForm.dateRange[0]
    const endDate = filterForm.dateRange[1]
    filteredData = filteredData.filter(item => {
      return item.month >= startDate && item.month <= endDate
    })
  }
  
  if (filterForm.model) {
    filteredData = filteredData.filter(item => item.model === filterForm.model)
  }
  
  if (filterForm.serialNumber) {
    filteredData = filteredData.filter(item => item.serialNumber.includes(filterForm.serialNumber))
  }
  
  if (filterForm.location) {
    filteredData = filteredData.filter(item => item.location === filterForm.location)
  }
  
  if (filterForm.category) {
    filteredData = filteredData.filter(item => item.type === filterForm.category)
  }
  
  // 更新故障数量趋势图
  const months = filteredData.map(item => item.month)
  const counts = filteredData.map(item => item.count)
  const highCounts = filteredData.map(item => item.high)
  const mediumCounts = filteredData.map(item => item.medium)
  const lowCounts = filteredData.map(item => item.low)
  
  faultCountChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['总故障数', '紧急故障', '重要故障', '一般故障']
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '总故障数',
        type: 'line',
        data: counts,
        smooth: true
      },
      {
        name: '紧急故障',
        type: 'line',
        data: highCounts,
        smooth: true,
        itemStyle: {
          color: '#f56c6c'
        }
      },
      {
        name: '重要故障',
        type: 'line',
        data: mediumCounts,
        smooth: true,
        itemStyle: {
          color: '#e6a23c'
        }
      },
      {
        name: '一般故障',
        type: 'line',
        data: lowCounts,
        smooth: true,
        itemStyle: {
          color: '#67c23a'
        }
      }
    ]
  })
  
  // 更新故障类型分布图
  const typeData = [
    { name: '国内故障', value: 0 },
    { name: '国际故障', value: 0 },
    { name: '国内巡检', value: 0 }
  ]
  
  filteredData.forEach(item => {
    const typeIndex = typeData.findIndex(t => t.name === item.type)
    if (typeIndex !== -1) {
      typeData[typeIndex].value += item.count
    }
  })
  
  faultTypeChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '故障类型',
        type: 'pie',
        radius: '60%',
        data: typeData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
  
  // 更新故障部位分布图
  const locationData = [
    { name: '发动机', value: 0 },
    { name: '液压系统', value: 0 },
    { name: '电气系统', value: 0 },
    { name: '空调系统', value: 0 }
  ]
  
  filteredData.forEach(item => {
    const locationIndex = locationData.findIndex(l => l.name === item.location)
    if (locationIndex !== -1) {
      locationData[locationIndex].value += item.count
    }
  })
  
  faultLocationChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '故障部位',
        type: 'pie',
        radius: '60%',
        data: locationData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
  
  // 更新故障率趋势图
  const rates = filteredData.map(item => item.rate)
  
  faultRateChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '故障率',
        type: 'line',
        data: rates,
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.1)'
            }
          ])
        }
      }
    ]
  })
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.dateRange = []
  filterForm.model = ''
  filterForm.serialNumber = ''
  filterForm.location = ''
  filterForm.category = ''
  updateCharts()
}

// 刷新数据
const refreshData = () => {
  // 实际项目中应该调用API获取最新数据
  console.log('刷新数据')
  lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
  updateCharts()
}

// 导出数据
const exportData = () => {
  // 处理筛选后的数据
  let filteredData = [...faultData.value]
  
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const startDate = filterForm.dateRange[0]
    const endDate = filterForm.dateRange[1]
    filteredData = filteredData.filter(item => {
      return item.month >= startDate && item.month <= endDate
    })
  }
  
  if (filterForm.model) {
    filteredData = filteredData.filter(item => item.model === filterForm.model)
  }
  
  if (filterForm.serialNumber) {
    filteredData = filteredData.filter(item => item.serialNumber.includes(filterForm.serialNumber))
  }
  
  if (filterForm.location) {
    filteredData = filteredData.filter(item => item.location === filterForm.location)
  }
  
  if (filterForm.category) {
    filteredData = filteredData.filter(item => item.type === filterForm.category)
  }
  
  // 准备导出数据
  const exportContent = [
    ['月份', '机型', '机号', '故障部位', '故障类型', '总故障数', '紧急故障', '重要故障', '一般故障', '故障率']
  ]
  
  filteredData.forEach(item => {
    exportContent.push([
      item.month,
      item.model,
      item.serialNumber,
      item.location,
      item.type,
      item.count,
      item.high,
      item.medium,
      item.low,
      item.rate + '%'
    ])
  })
  
  // 生成CSV文件
  const csvContent = exportContent.map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `故障趋势数据_${new Date().toISOString().slice(0, 10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('数据导出成功')
}

// 窗口大小变化时重新调整图表大小
const handleResize = () => {
  faultCountChart?.resize()
  faultTypeChart?.resize()
  faultLocationChart?.resize()
  faultRateChart?.resize()
}

// 生命周期
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  faultCountChart?.dispose()
  faultTypeChart?.dispose()
  faultLocationChart?.dispose()
  faultRateChart?.dispose()
})
</script>

<style scoped>
/* 全局样式 */
.trends {
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

.update-time {
  color: #95a5a6;
  font-size: 14px;
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

/* 筛选栏样式 */
.filter-bar {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 30px;
  transition: all 0.3s ease;
}

.filter-bar:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.tech-input {
  border-radius: 8px !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.tech-input:focus {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
  border-color: #409eff !important;
}

.tech-select {
  border-radius: 8px !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.tech-select:focus {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
  border-color: #409eff !important;
}

.tech-date-picker {
  border-radius: 8px !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.tech-date-picker:focus-within {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
  border-color: #409eff !important;
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

/* 图表区域样式 */
.charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.chart-item {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.chart-item:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.chart-header h3 {
  font-size: 18px;
  font-weight: bold;
  color: #1a1a2e;
  margin: 0;
  background: linear-gradient(90deg, #3a7bd5, #00d2ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.chart-info {
  font-size: 14px;
  color: #95a5a6;
  background: rgba(64, 158, 255, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
}

.tech-chart {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .trends {
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
  
  .filter-bar {
    padding: 15px;
  }
  
  .demo-form-inline {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .demo-form-inline .el-form-item {
    margin-right: 0 !important;
  }
  
  .demo-form-inline .el-form-item__content {
    width: 100%;
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
  
  .charts {
    gap: 20px;
  }
  
  .chart-item {
    padding: 15px;
  }
  
  .chart-header {
    padding: 15px;
  }
  
  .tech-chart {
    height: 250px;
  }
}
</style>