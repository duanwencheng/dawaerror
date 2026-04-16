<template>
  <Layout>
    <div class="history-faults">
      <!-- 头部 -->
      <div class="header">
        <div class="title">
          <h1>历史故障</h1>
          <span class="update-time">最后更新: {{ lastUpdateTime }}</span>
        </div>
        <div class="actions">
          <el-button type="primary" :icon="Download" circle @click="showExportDialog" class="tech-button">
          </el-button>
          <el-button type="success" :icon="Refresh" circle @click="refreshData" class="tech-button">
          </el-button>
        </div>
      </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="早会日期">
          <el-date-picker
            v-model="searchForm.meetingDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="tech-date-picker"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择" class="tech-select">
            <el-option label="国内故障" value="国内故障"></el-option>
            <el-option label="国内投诉" value="国内投诉"></el-option>
            <el-option label="国内巡检" value="国内巡检"></el-option>
            <el-option label="国际故障" value="国际故障"></el-option>
            <el-option label="国际投诉" value="国际投诉"></el-option>
            <el-option label="国际巡检" value="国际巡检"></el-option>
            <el-option label="特别话题" value="特别话题"></el-option>
            <el-option label="结构件" value="结构件"></el-option>
            <el-option label="试验故障" value="试验故障"></el-option>
            <el-option label="质量升级运动" value="质量升级运动"></el-option>
            <el-option label="订单差评" value="订单差评"></el-option>
            <el-option label="客户回访" value="客户回访"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="机型">
          <el-input v-model="searchForm.model" placeholder="请输入机型" class="tech-input"></el-input>
        </el-form-item>
        <el-form-item label="机号">
          <el-input v-model="searchForm.machineNumber" placeholder="请输入机号" class="tech-input"></el-input>
        </el-form-item>
        <el-form-item label="服务工程师">
          <el-input v-model="searchForm.serviceEngineer" placeholder="请输入服务工程师" class="tech-input"></el-input>
        </el-form-item>
        <el-form-item label="是否对策">
          <el-select v-model="searchForm.isCountermeasured" placeholder="请选择" class="tech-select">
            <el-option label="对策前" value="对策前"></el-option>
            <el-option label="对策中" value="对策中"></el-option>
            <el-option label="对策后" value="对策后"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="故障风险评估">
          <el-select v-model="searchForm.riskAssessment" placeholder="请选择" class="tech-select">
            <el-option label="首发" value="首发"></el-option>
            <el-option label="零星偶发" value="零星偶发"></el-option>
            <el-option label="有批量风险" value="有批量风险"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否闭环">
          <el-select v-model="searchForm.isClosed" placeholder="请选择" class="tech-select">
            <el-option label="是" value="true"></el-option>
            <el-option label="否" value="false"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="整机生产地">
          <el-select v-model="searchForm.productionSite" placeholder="请选择" class="tech-select">
            <el-option label="昆山" value="昆山"></el-option>
            <el-option label="重庆" value="重庆"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="故障部位">
          <el-input v-model="searchForm.faultLocation" placeholder="请输入故障部位" class="tech-input"></el-input>
        </el-form-item>
      </el-form>
      
      <!-- 操作按钮区域 -->
      <div class="search-actions">
        <el-button type="primary" @click="searchFaults" class="action-btn search-btn">
          <el-icon><Search /></el-icon>
          <span>查询</span>
        </el-button>
        <el-button @click="resetSearch" class="action-btn reset-btn">
          <el-icon><RefreshRight /></el-icon>
          <span>重置</span>
        </el-button>
        <el-button type="info" @click="saveSearchCondition" class="action-btn save-btn">
          <el-icon><Star /></el-icon>
          <span>保存条件</span>
        </el-button>
      </div>
    </div>

    <!-- 常用查询条件 -->
    <div class="saved-conditions" v-if="savedConditions.length > 0">
      <el-tag
        v-for="(condition, index) in savedConditions"
        :key="index"
        closable
        @close="removeSavedCondition(index)"
        @click="loadSavedCondition(condition)"
        class="tech-tag"
      >
        {{ condition.name }}
      </el-tag>
    </div>

    <!-- 故障列表 -->
    <div class="fault-list">
      <el-table :data="paginatedFaults" style="width: 100%" class="tech-table">
        <el-table-column prop="id" label="ID" width="80" sortable class="table-header"></el-table-column>
        <el-table-column prop="category" label="分类" sortable class="table-header"></el-table-column>
        <el-table-column prop="meetingDate" label="早会日期" sortable class="table-header"></el-table-column>
        <el-table-column prop="model" label="机型" sortable class="table-header"></el-table-column>
        <el-table-column prop="machineNumber" label="机号" sortable class="table-header"></el-table-column>
        <el-table-column prop="description" label="故障描述" show-overflow-tooltip class="table-header"></el-table-column>
        <el-table-column prop="serviceEngineer" label="服务工程师" sortable class="table-header"></el-table-column>
        <el-table-column prop="responderName" label="责任人" class="table-header"></el-table-column>
        <el-table-column prop="isCountermeasured" label="是否对策" class="table-header"></el-table-column>
        <el-table-column prop="riskAssessment" label="风险评估" class="table-header">
          <template #default="scope">
            <span :class="getRiskClass(scope.row.riskAssessment)">{{ scope.row.riskAssessment }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="productionSite" label="生产地" class="table-header"></el-table-column>
        <el-table-column prop="isClosed" label="是否闭环" class="table-header">
          <template #default="scope">
            <span :class="scope.row.isClosed ? 'status-closed' : 'status-unclosed'">{{ scope.row.isClosed ? '是' : '否' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" class="table-header">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewFaultDetail(scope.row)" class="table-button">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredFaults.length"
          class="tech-pagination"
        ></el-pagination>
      </div>
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
          <el-descriptions-item label="故障部位3">{{ selectedFault.faultLocation }}</el-descriptions-item>
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

    <!-- 保存查询条件对话框 -->
    <el-dialog
      v-model="saveConditionDialogVisible"
      title="保存查询条件"
      width="400px"
    >
      <el-form :model="conditionForm" :rules="conditionRules" ref="conditionForm">
        <el-form-item label="条件名称" prop="name">
          <el-input v-model="conditionForm.name" placeholder="请输入条件名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="saveConditionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSaveCondition">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导出对话框 -->
    <export-dialog
      v-model:visible="exportDialogVisible"
      :data="filteredFaults"
      :conditions="searchForm"
      @export-success="handleExportSuccess"
    />
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh, Search, RefreshRight, Star } from '@element-plus/icons-vue'
import ExportDialog from '../components/ExportDialog.vue'
import Layout from '../components/Layout.vue'

// 搜索表单
const searchForm = reactive({
  meetingDate: [],
  category: '',
  model: '',
  machineNumber: '',
  serviceEngineer: '',
  isCountermeasured: '',
  riskAssessment: '',
  isClosed: '',
  productionSite: '',
  faultLocation: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 最后更新时间
const lastUpdateTime = ref(new Date().toLocaleTimeString('zh-CN'))

// 对话框状态
const detailDialogVisible = ref(false)
const saveConditionDialogVisible = ref(false)
const exportDialogVisible = ref(false)

// 选中的故障
const selectedFault = ref(null)

// 保存的查询条件
const savedConditions = ref([
  { name: '未闭环故障', conditions: { isClosed: 'false' } },
  { name: '紧急故障', conditions: { riskAssessment: '有批量风险' } }
])

// 保存条件表单
const conditionForm = reactive({ name: '' })

const conditionRules = {
  name: [{ required: true, message: '请输入条件名称', trigger: 'blur' }]
}

// 模拟故障数据
const faults = ref([
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
    responder: '10002',
    responderName: '王五',
    faultLocation: '斯堪尼亚+发动机+DC16',
    isCountermeasured: '对策前',
    partStatus: '量产',
    riskAssessment: '有批量风险',
    rootCause: '燃油系统故障',
    temporaryCountermeasure: '更换燃油滤清器',
    longTermCountermeasure: '检查燃油管路，更换老化部件',
    isClosed: false,
    investigator: '10003',
    investigatorName: '赵六',
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
    responder: '10001',
    responderName: '张三',
    faultLocation: '液压系统+主泵',
    isCountermeasured: '对策中',
    partStatus: '小批',
    riskAssessment: '零星偶发',
    rootCause: '主泵内部泄漏',
    temporaryCountermeasure: '调整系统压力',
    longTermCountermeasure: '更换主泵密封件',
    isClosed: false,
    investigator: '10001',
    investigatorName: '张三',
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
    investigator: '10004',
    investigatorName: '钱七',
    photos: []
  },
  {
    id: 4,
    category: '国际故障',
    meetingDate: '2026-04-07',
    serviceEngineer: '赵六',
    engineerPhone: '13700137001',
    company: '大挖',
    model: 'SY980H',
    workHours: 1500,
    machineNumber: 'DW980004',
    productionDate: '2025-11-20',
    agent: '巴西',
    description: '电气系统故障，仪表盘无显示',
    responder: '10005',
    responderName: '孙八',
    faultLocation: '电气系统+仪表盘',
    isCountermeasured: '对策中',
    partStatus: '量产',
    riskAssessment: '零星偶发',
    rootCause: '线路松动',
    temporaryCountermeasure: '重新连接线路',
    longTermCountermeasure: '检查所有线路连接',
    isClosed: false,
    investigator: '10005',
    investigatorName: '孙八',
    photos: []
  }
])

// 计算属性：过滤后的故障列表
const filteredFaults = computed(() => {
  let result = [...faults.value]
  
  // 按早会日期范围过滤
  if (searchForm.meetingDate && searchForm.meetingDate.length === 2) {
    const startDate = new Date(searchForm.meetingDate[0])
    const endDate = new Date(searchForm.meetingDate[1])
    result = result.filter(fault => {
      const faultDate = new Date(fault.meetingDate)
      return faultDate >= startDate && faultDate <= endDate
    })
  }
  
  // 按分类过滤
  if (searchForm.category) {
    result = result.filter(fault => fault.category === searchForm.category)
  }
  
  // 按机型过滤
  if (searchForm.model) {
    result = result.filter(fault => fault.model.includes(searchForm.model))
  }
  
  // 按机号过滤
  if (searchForm.machineNumber) {
    result = result.filter(fault => fault.machineNumber.includes(searchForm.machineNumber))
  }
  
  // 按服务工程师过滤
  if (searchForm.serviceEngineer) {
    result = result.filter(fault => fault.serviceEngineer.includes(searchForm.serviceEngineer))
  }
  
  // 按是否对策过滤
  if (searchForm.isCountermeasured) {
    result = result.filter(fault => fault.isCountermeasured === searchForm.isCountermeasured)
  }
  
  // 按故障风险评估过滤
  if (searchForm.riskAssessment) {
    result = result.filter(fault => fault.riskAssessment === searchForm.riskAssessment)
  }
  
  // 按是否闭环过滤
  if (searchForm.isClosed) {
    const isClosed = searchForm.isClosed === 'true'
    result = result.filter(fault => fault.isClosed === isClosed)
  }
  
  // 按整机生产地过滤
  if (searchForm.productionSite) {
    result = result.filter(fault => fault.productionSite === searchForm.productionSite)
  }
  
  // 按故障部位3过滤
  if (searchForm.faultLocation) {
    result = result.filter(fault => fault.faultLocation.includes(searchForm.faultLocation))
  }
  
  // 按早会日期倒序排序
  result.sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate))
  
  return result
})

// 计算属性：分页后的故障列表
const paginatedFaults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredFaults.value.slice(start, end)
})

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

// 搜索故障
const searchFaults = () => {
  // 实际项目中应该调用API进行搜索
  console.log('搜索故障', searchForm)
  currentPage.value = 1
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'meetingDate') {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  currentPage.value = 1
}

// 刷新数据
const refreshData = () => {
  // 实际项目中应该调用API获取最新数据
  console.log('刷新数据')
  lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
}

// 显示导出对话框
const showExportDialog = () => {
  exportDialogVisible.value = true
}

// 处理导出成功
const handleExportSuccess = () => {
  ElMessage.success('数据导出成功')
}

// 查看故障详情
const viewFaultDetail = (fault) => {
  selectedFault.value = fault
  detailDialogVisible.value = true
}

// 保存查询条件
const saveSearchCondition = () => {
  saveConditionDialogVisible.value = true
}

// 确认保存查询条件
const confirmSaveCondition = () => {
  if (conditionForm.name) {
    const newCondition = {
      name: conditionForm.name,
      conditions: { ...searchForm }
    }
    savedConditions.value.push(newCondition)
    saveConditionDialogVisible.value = false
    conditionForm.name = ''
    ElMessage.success('查询条件保存成功')
  }
}

// 加载保存的查询条件
const loadSavedCondition = (condition) => {
  Object.assign(searchForm, condition.conditions)
  searchFaults()
}

// 删除保存的查询条件
const removeSavedCondition = (index) => {
  savedConditions.value.splice(index, 1)
  ElMessage.success('查询条件删除成功')
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}
</script>

<style scoped>
/* 全局样式 */
.history-faults {
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

/* 搜索栏样式 */
.search-bar {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 30px;
  transition: all 0.3s ease;
}

.search-bar:hover {
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

/* 操作按钮区域 */
.search-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.search-btn {
  background: linear-gradient(90deg, #409eff, #69b1ff);
  border: none;
}

.search-btn:hover {
  background: linear-gradient(90deg, #3a8ee6, #5cadff);
}

.reset-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #606266;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #409eff;
  color: #409eff;
}

.save-btn {
  background: linear-gradient(90deg, #909399, #a6a9ad);
  border: none;
}

.save-btn:hover {
  background: linear-gradient(90deg, #82848a, #9ca0a4);
}

/* 常用查询条件 */
.saved-conditions {
  margin-bottom: 25px;
  padding: 15px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tech-tag {
  border-radius: 20px !important;
  padding: 6px 16px !important;
  font-size: 14px !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(64, 158, 255, 0.3) !important;
  color: #409eff !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.tech-tag:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2) !important;
  background: rgba(64, 158, 255, 0.1) !important;
}

/* 故障列表样式 */
.fault-list {
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.fault-list:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.tech-table {
  border-radius: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
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
.status-closed {
  background: linear-gradient(90deg, #67c23a, #85ce61);
  color: white !important;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.status-unclosed {
  background: linear-gradient(90deg, #f56c6c, #f88b8b);
  color: white !important;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

/* 分页样式 */
.pagination {
  margin-top: 25px;
  display: flex;
  justify-content: flex-end;
}

.tech-pagination {
  --el-pagination-item-bg-color: rgba(255, 255, 255, 0.9) !important;
  --el-pagination-item-active-bg-color: #409eff !important;
  --el-pagination-item-hover-bg-color: rgba(64, 158, 255, 0.1) !important;
  --el-pagination-border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  border-radius: 8px !important;
  padding: 8px !important;
  background: rgba(255, 255, 255, 0.9) !important;
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
  .history-faults {
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
  
  .search-bar {
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
  
  .search-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    margin-top: 20px;
    padding-top: 20px;
  }
  
  .action-btn {
    justify-content: center;
    padding: 14px 20px;
    width: 100%;
  }
  
  .saved-conditions {
    flex-direction: column;
    gap: 10px;
    padding: 15px;
  }
  
  .tech-tag {
    width: 100%;
    padding: 8px 16px;
  }
  
  .fault-list {
    padding: 15px;
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