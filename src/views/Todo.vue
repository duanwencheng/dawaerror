<template>
  <Layout>
    <div class="todo">
      <!-- 头部 -->
      <div class="header">
        <div class="title">
          <h1>个人待办</h1>
          <div class="user-info">
            <span class="user-name">当前用户：{{ user.name }}</span>
            <span class="user-role">({{ user.role }})</span>
            <span class="update-time">最后更新: {{ lastUpdateTime }}</span>
          </div>
        </div>
        <div class="actions">
          <el-button type="success" :icon="Refresh" circle @click="refreshData" class="tech-button">
          </el-button>
        </div>
      </div>

    <!-- 待办统计 -->
    <div class="stats">
      <div class="stat-item">
        <div class="stat-icon"><i class="el-icon-data-analysis"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ totalTodos }}</div>
          <div class="stat-label">总待办</div>
        </div>
        <div class="stat-bg"></div>
      </div>
      <div class="stat-item danger">
        <div class="stat-icon"><i class="el-icon-warning"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ urgentTodos }}</div>
          <div class="stat-label">紧急待办</div>
        </div>
        <div class="stat-bg"></div>
      </div>
      <div class="stat-item warning">
        <div class="stat-icon"><i class="el-icon-s-flag"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ mediumTodos }}</div>
          <div class="stat-label">重要待办</div>
        </div>
        <div class="stat-bg"></div>
      </div>
      <div class="stat-item info">
        <div class="stat-icon"><i class="el-icon-s-check"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ completedTodos }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-bg"></div>
      </div>
    </div>

    <!-- 待办列表 -->
    <div class="todo-list">
      <el-tabs v-model="activeTab" class="tech-tabs">
        <el-tab-pane label="全部" name="all">
          <el-table :data="allTodos" style="width: 100%" class="tech-table">
            <el-table-column prop="id" label="ID" width="80" class="table-header"></el-table-column>
            <el-table-column prop="category" label="分类" class="table-header"></el-table-column>
            <el-table-column prop="meetingDate" label="早会日期" class="table-header"></el-table-column>
            <el-table-column prop="model" label="机型" class="table-header"></el-table-column>
            <el-table-column prop="machineNumber" label="机号" class="table-header"></el-table-column>
            <el-table-column prop="description" label="故障描述" show-overflow-tooltip class="table-header"></el-table-column>
            <el-table-column prop="riskAssessment" label="风险评估" class="table-header">
              <template #default="scope">
                <span :class="getRiskClass(scope.row.riskAssessment)">{{ scope.row.riskAssessment }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="isClosed" label="状态" class="table-header">
              <template #default="scope">
                <span :class="scope.row.isClosed ? 'status-completed' : 'status-pending'">{{ scope.row.isClosed ? '已完成' : '待处理' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" class="table-header">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewFaultDetail(scope.row)" class="table-button">查看</el-button>
                <el-button type="success" size="small" @click="updateProgress(scope.row)" v-if="!scope.row.isClosed" class="table-button">更新</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="待处理" name="pending">
          <el-table :data="pendingTodos" style="width: 100%" class="tech-table">
            <el-table-column prop="id" label="ID" width="80" class="table-header"></el-table-column>
            <el-table-column prop="category" label="分类" class="table-header"></el-table-column>
            <el-table-column prop="meetingDate" label="早会日期" class="table-header"></el-table-column>
            <el-table-column prop="model" label="机型" class="table-header"></el-table-column>
            <el-table-column prop="machineNumber" label="机号" class="table-header"></el-table-column>
            <el-table-column prop="description" label="故障描述" show-overflow-tooltip class="table-header"></el-table-column>
            <el-table-column prop="riskAssessment" label="风险评估" class="table-header">
              <template #default="scope">
                <span :class="getRiskClass(scope.row.riskAssessment)">{{ scope.row.riskAssessment }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" class="table-header">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewFaultDetail(scope.row)" class="table-button">查看</el-button>
                <el-button type="success" size="small" @click="updateProgress(scope.row)" class="table-button">更新</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed">
          <el-table :data="completedTodosList" style="width: 100%" class="tech-table">
            <el-table-column prop="id" label="ID" width="80" class="table-header"></el-table-column>
            <el-table-column prop="category" label="分类" class="table-header"></el-table-column>
            <el-table-column prop="meetingDate" label="早会日期" class="table-header"></el-table-column>
            <el-table-column prop="model" label="机型" class="table-header"></el-table-column>
            <el-table-column prop="machineNumber" label="机号" class="table-header"></el-table-column>
            <el-table-column prop="description" label="故障描述" show-overflow-tooltip class="table-header"></el-table-column>
            <el-table-column prop="riskAssessment" label="风险评估" class="table-header">
              <template #default="scope">
                <span :class="getRiskClass(scope.row.riskAssessment)">{{ scope.row.riskAssessment }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" class="table-header">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewFaultDetail(scope.row)" class="table-button">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 故障详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="故障详情"
      width="70%"
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
      </div>
    </el-dialog>

    <!-- 更新进展对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="更新进展"
      width="50%"
    >
      <el-form :model="progressForm" :rules="progressRules" ref="progressForm">
        <el-form-item label="临时对策" prop="temporaryCountermeasure">
          <el-input v-model="progressForm.temporaryCountermeasure" type="textarea" :rows="2"></el-input>
        </el-form-item>
        <el-form-item label="长久对策及进展" prop="longTermCountermeasure">
          <el-input v-model="progressForm.longTermCountermeasure" type="textarea" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="是否闭环" prop="isClosed">
          <el-switch v-model="progressForm.isClosed"></el-switch>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="progressForm.remark" type="textarea" :rows="2" placeholder="请输入备注信息"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="progressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpdateProgress">确定</el-button>
        </span>
      </template>
    </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import Layout from '../components/Layout.vue'

// 用户信息
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// 标签页
const activeTab = ref('all')

// 对话框状态
const detailDialogVisible = ref(false)
const progressDialogVisible = ref(false)

// 最后更新时间
const lastUpdateTime = ref(new Date().toLocaleTimeString('zh-CN'))

// 选中的故障
const selectedFault = ref(null)
const currentFault = ref(null)

// 更新进展表单
const progressForm = reactive({
  temporaryCountermeasure: '',
  longTermCountermeasure: '',
  isClosed: false,
  remark: ''
})

const progressRules = {
  temporaryCountermeasure: [{ required: true, message: '请输入临时对策', trigger: 'blur' }],
  longTermCountermeasure: [{ required: true, message: '请输入长久对策及进展', trigger: 'blur' }]
}

// 模拟待办故障数据
const todos = ref([
  {
    id: 1,
    category: '国内故障',
    meetingDate: '2026-04-09',
    serviceEngineer: '李四',
    engineerPhone: '13800138001',
    company: '大挖',
    model: 'SY980H',
    workHours: 1200,
    machineNumber: 'DW980001',
    productionDate: '2025-12-15',
    agent: '新疆京泓',
    description: '发动机启动困难，需要多次尝试才能启动',
    responder: '10001', // 当前用户
    responderName: '张三',
    faultLocation: '斯堪尼亚+发动机+DC16',
    isCountermeasured: '对策前',
    partStatus: '量产',
    riskAssessment: '有批量风险',
    rootCause: '燃油系统故障',
    temporaryCountermeasure: '更换燃油滤清器',
    longTermCountermeasure: '检查燃油管路，更换老化部件',
    isClosed: false,
    investigator: '10001', // 当前用户
    investigatorName: '张三',
    photos: []
  },
  {
    id: 2,
    category: '国内故障',
    meetingDate: '2026-04-09',
    serviceEngineer: '李四',
    engineerPhone: '13800138001',
    company: '大挖',
    model: 'SY750H',
    workHours: 800,
    machineNumber: 'DW750002',
    productionDate: '2026-01-20',
    agent: '巴西',
    description: '液压系统压力异常，动作缓慢',
    responder: '10001', // 当前用户
    responderName: '张三',
    faultLocation: '液压系统+主泵',
    isCountermeasured: '对策中',
    partStatus: '小批',
    riskAssessment: '零星偶发',
    rootCause: '主泵内部泄漏',
    temporaryCountermeasure: '调整系统压力',
    longTermCountermeasure: '更换主泵密封件',
    isClosed: false,
    investigator: '10002',
    investigatorName: '王五',
    photos: []
  },
  {
    id: 3,
    category: '国内巡检',
    meetingDate: '2026-04-08',
    serviceEngineer: '王五',
    engineerPhone: '13900139001',
    company: '大挖',
    model: 'SY980H',
    workHours: 2000,
    machineNumber: 'DW980003',
    productionDate: '2025-10-10',
    agent: '新疆京泓',
    description: '空调系统不制冷',
    responder: '10004',
    responderName: '钱七',
    faultLocation: '空调系统+压缩机',
    isCountermeasured: '对策后',
    partStatus: '量产',
    riskAssessment: '首发',
    rootCause: '压缩机故障',
    temporaryCountermeasure: '更换压缩机',
    longTermCountermeasure: '已更换压缩机，系统正常',
    isClosed: true,
    investigator: '10001', // 当前用户
    investigatorName: '张三',
    photos: []
  }
])

// 计算属性：所有待办
const allTodos = computed(() => {
  return todos.value
})

// 计算属性：待处理的待办
const pendingTodos = computed(() => {
  return todos.value.filter(todo => !todo.isClosed)
})

// 计算属性：已完成的待办
const completedTodosList = computed(() => {
  return todos.value.filter(todo => todo.isClosed)
})

// 计算属性：统计数据
const totalTodos = computed(() => todos.value.length)
const urgentTodos = computed(() => todos.value.filter(todo => !todo.isClosed && todo.riskAssessment === '有批量风险').length)
const mediumTodos = computed(() => todos.value.filter(todo => !todo.isClosed && todo.riskAssessment === '零星偶发').length)
const completedTodos = computed(() => todos.value.filter(todo => todo.isClosed).length)

// 获取风险等级样式
const getRiskClass = (risk) => {
  switch (risk) {
    case '有批量风险':
      return 'risk-high'
    case '零星偶发':
      return 'risk-medium'
    case '首发':
      return 'risk-low'
    default:
      return ''
  }
}

// 查看故障详情
const viewFaultDetail = (fault) => {
  selectedFault.value = fault
  detailDialogVisible.value = true
}

// 更新进展
const updateProgress = (fault) => {
  currentFault.value = fault
  progressForm.temporaryCountermeasure = fault.temporaryCountermeasure
  progressForm.longTermCountermeasure = fault.longTermCountermeasure
  progressForm.isClosed = fault.isClosed
  progressForm.remark = ''
  progressDialogVisible.value = true
}

// 确认更新进展
const confirmUpdateProgress = () => {
  if (currentFault.value) {
    // 实际项目中应该调用API更新进展
    const index = todos.value.findIndex(todo => todo.id === currentFault.value.id)
    if (index !== -1) {
      todos.value[index].temporaryCountermeasure = progressForm.temporaryCountermeasure
      todos.value[index].longTermCountermeasure = progressForm.longTermCountermeasure
      todos.value[index].isClosed = progressForm.isClosed
    }
    progressDialogVisible.value = false
    ElMessage.success('进展更新成功')
  }
}

// 刷新数据
const refreshData = () => {
  // 实际项目中应该调用API获取最新数据
  console.log('刷新数据')
  lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
  ElMessage.success('数据已刷新')
}
</script>

<style scoped>
/* 全局样式 */
.todo {
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
  flex-direction: column;
  gap: 10px;
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

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 14px;
}

.user-name {
  color: #495057;
  font-weight: 500;
}

.user-role {
  color: #6c757d;
}

.update-time {
  color: #95a5a6;
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

.stat-item.info .stat-icon {
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

.stat-item.info .stat-bg {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.05));
}

/* 待办列表样式 */
.todo-list {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.todo-list:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.tech-tabs {
  --el-tabs-header-border-color: rgba(0, 0, 0, 0.05) !important;
  --el-tabs-active-color: #409eff !important;
}

.tech-table {
  border-radius: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
  margin-top: 20px !important;
}

.tech-table th {
  background: linear-gradient(90deg, #f8f9fa, #e9ecef) !important;
  font-weight: bold !important;
  color: #1a1a2e !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.tech-table td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s ease !important;
}

.tech-table tr:hover td {
  background-color: rgba(64, 158, 255, 0.05) !important;
}

.table-button {
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  margin-right: 8px !important;
}

.table-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* 风险等级样式 */
.risk-high {
  background: linear-gradient(90deg, #f56c6c, #f88b8b);
  color: white !important;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

.risk-medium {
  background: linear-gradient(90deg, #e6a23c, #ebb563);
  color: white !important;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
}

.risk-low {
  background: linear-gradient(90deg, #67c23a, #85ce61);
  color: white !important;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

/* 状态样式 */
.status-pending {
  background: linear-gradient(90deg, #f56c6c, #f88b8b);
  color: white !important;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

.status-completed {
  background: linear-gradient(90deg, #67c23a, #85ce61);
  color: white !important;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

/* 故障详情样式 */
.fault-detail {
  padding: 30px;
}

/* 对话框样式 */
.dialog-footer {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .todo {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 15px;
  }
  
  .title {
    gap: 8px;
  }
  
  .title h1 {
    font-size: 24px !important;
  }
  
  .actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .user-name {
    font-size: 14px !important;
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
  
  .todo-list {
    padding: 15px;
  }
  
  .el-tabs__content {
    padding: 15px 0 !important;
  }
  
  .tech-table {
    font-size: 11px !important;
  }
  
  .tech-table th {
    padding: 10px 5px !important;
  }
  
  .tech-table td {
    padding: 10px 5px !important;
  }
  
  .table-button {
    font-size: 10px !important;
    padding: 2px 6px !important;
    margin-right: 2px !important;
  }
  
  .pagination {
    justify-content: center;
  }
  
  .tech-pagination {
    font-size: 12px !important;
  }
  
  .fault-detail {
    padding: 20px;
  }
}
</style>