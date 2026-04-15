<template>
  <Layout>
    <div class="fault-management">
      <!-- 头部 -->
      <div class="header">
        <div class="title">
          <h1>故障管理</h1>
          <span class="update-time">最后更新: {{ lastUpdateTime }}</span>
        </div>
        <div class="actions">
          <el-button type="primary" :icon="Plus" circle @click="showAddFaultDialog" class="tech-button">
          </el-button>
          <el-button type="info" :icon="Upload" circle @click="showImportDialog" class="tech-button">
          </el-button>
          <el-button type="success" :icon="Refresh" circle @click="refreshData" class="tech-button">
          </el-button>
        </div>
      </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择" class="tech-select">
            <el-option label="国内故障" value="国内故障"></el-option>
            <el-option label="国际故障" value="国际故障"></el-option>
            <el-option label="国内巡检" value="国内巡检"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="机型">
          <el-input v-model="searchForm.model" placeholder="请输入机型" class="tech-input"></el-input>
        </el-form-item>
        <el-form-item label="机号">
          <el-input v-model="searchForm.machineNumber" placeholder="请输入机号" class="tech-input"></el-input>
        </el-form-item>
        <el-form-item label="故障描述">
          <el-input v-model="searchForm.description" placeholder="请输入故障描述" class="tech-input"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchFaults" class="tech-button">查询</el-button>
          <el-button @click="resetSearch" class="tech-button">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 故障列表 -->
    <div class="fault-list">
      <el-table :data="filteredFaults" style="width: 100%" class="tech-table">
        <el-table-column prop="id" label="ID" width="80" class="table-header"></el-table-column>
        <el-table-column prop="category" label="分类" class="table-header"></el-table-column>
        <el-table-column prop="meetingDate" label="早会日期" class="table-header"></el-table-column>
        <el-table-column prop="model" label="机型" class="table-header"></el-table-column>
        <el-table-column prop="machineNumber" label="机号" class="table-header"></el-table-column>
        <el-table-column prop="description" label="故障描述" show-overflow-tooltip class="table-header"></el-table-column>
        <el-table-column prop="responderName" label="责任人" class="table-header"></el-table-column>
        <el-table-column prop="riskAssessment" label="风险评估" class="table-header">
          <template #default="scope">
            <span :class="getRiskClass(scope.row.riskAssessment)">{{ scope.row.riskAssessment }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isClosed" label="是否闭环" class="table-header">
          <template #default="scope">
            <el-switch v-model="scope.row.isClosed" @change="updateFaultStatus(scope.row)" class="tech-switch"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" class="table-header">
          <template #default="scope">
            <el-button type="primary" size="small" @click="showEditFaultDialog(scope.row)" class="table-button">编辑</el-button>
            <el-button type="success" size="small" @click="showUpdateProgressDialog(scope.row)" class="table-button">更新进展</el-button>
            <el-button type="danger" size="small" @click="deleteFault(scope.row)" v-if="canDelete" class="table-button">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredFaults.length"
          class="tech-pagination"
        ></el-pagination>
      </div>
    </div>

    <!-- 新增故障对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增故障"
      width="70%"
    >
      <el-form :model="newFault" :rules="faultRules" ref="faultForm">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="newFault.category" placeholder="请选择">
                <el-option label="国内故障" value="国内故障"></el-option>
                <el-option label="国际故障" value="国际故障"></el-option>
                <el-option label="国内巡检" value="国内巡检"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="早会日期" prop="meetingDate">
              <el-date-picker v-model="newFault.meetingDate" type="date" placeholder="选择日期"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务工程师" prop="serviceEngineer">
              <el-input v-model="newFault.serviceEngineer"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工程师电话" prop="engineerPhone">
              <el-input v-model="newFault.engineerPhone" placeholder="请输入手机号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司" prop="company">
              <el-input v-model="newFault.company"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="机型" prop="model">
              <el-input v-model="newFault.model"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作小时" prop="workHours">
              <el-input v-model.number="newFault.workHours" type="number"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="机号" prop="machineNumber">
              <el-input v-model="newFault.machineNumber"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产日期" prop="productionDate">
              <el-date-picker v-model="newFault.productionDate" type="date" placeholder="选择日期"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代理商" prop="agent">
              <el-input v-model="newFault.agent"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="故障描述" prop="description">
              <el-input v-model="newFault.description" type="textarea" :rows="3"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="回复责任人" prop="responderName">
              <el-input v-model="newFault.responderName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="故障部位3" prop="faultLocation">
              <el-input v-model="newFault.faultLocation"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否对策" prop="isCountermeasured">
              <el-select v-model="newFault.isCountermeasured" placeholder="请选择">
                <el-option label="对策前" value="对策前"></el-option>
                <el-option label="对策中" value="对策中"></el-option>
                <el-option label="对策后" value="对策后"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部品状态" prop="partStatus">
              <el-select v-model="newFault.partStatus" placeholder="请选择">
                <el-option label="试装" value="试装"></el-option>
                <el-option label="小批" value="小批"></el-option>
                <el-option label="量产" value="量产"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="故障风险评估" prop="riskAssessment">
              <el-select v-model="newFault.riskAssessment" placeholder="请选择">
                <el-option label="首发" value="首发"></el-option>
                <el-option label="零星偶发" value="零星偶发"></el-option>
                <el-option label="有批量风险" value="有批量风险"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="整机生产地" prop="productionSite">
              <el-select v-model="newFault.productionSite" placeholder="请选择">
                <el-option label="昆山" value="昆山"></el-option>
                <el-option label="重庆" value="重庆"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="原因分析" prop="rootCause">
              <el-input v-model="newFault.rootCause" type="textarea" :rows="2"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="临时对策" prop="temporaryCountermeasure">
              <el-input v-model="newFault.temporaryCountermeasure" type="textarea" :rows="2"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="长久对策及进展" prop="longTermCountermeasure">
              <el-input v-model="newFault.longTermCountermeasure" type="textarea" :rows="2"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否闭环" prop="isClosed">
              <el-switch v-model="newFault.isClosed"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="调查人" prop="investigatorName">
              <el-input v-model="newFault.investigatorName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="故障照片">
              <el-upload
                class="upload-demo"
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
                :file-list="fileList"
                :limit="4"
              >
                <el-button type="primary">点击上传</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    最多上传4张照片，支持JPG/PNG格式
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addFault">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑故障对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑故障"
      width="70%"
    >
      <el-form :model="editFault" :rules="faultRules" ref="editFaultForm">
        <!-- 表单内容与新增故障类似，省略 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="editFault.category" placeholder="请选择">
                <el-option label="国内故障" value="国内故障"></el-option>
                <el-option label="国际故障" value="国际故障"></el-option>
                <el-option label="国内巡检" value="国内巡检"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="早会日期" prop="meetingDate">
              <el-date-picker v-model="editFault.meetingDate" type="date" placeholder="选择日期"></el-date-picker>
            </el-form-item>
          </el-col>
          <!-- 其他表单字段省略 -->
          <el-col :span="24">
            <el-form-item label="故障描述" prop="description">
              <el-input v-model="editFault.description" type="textarea" :rows="3"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateFault">确定</el-button>
        </span>
      </template>
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
          <el-button type="primary" @click="updateProgress">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入故障"
      width="50%"
    >
      <el-upload
        class="upload-demo"
        action="#"
        :auto-upload="false"
        :on-change="handleImportFileChange"
        accept=".xlsx,.xls"
      >
        <el-button type="primary">点击上传Excel文件</el-button>
        <template #tip>
          <div class="el-upload__tip">
            请按照模板格式上传Excel文件
          </div>
        </template>
      </el-upload>
      <div class="import-tips">
        <p>1. 请下载模板文件并按照格式填写数据</p>
        <p>2. 确保必填字段（早会日期、故障描述、机型、机号）不为空</p>
        <p>3. 一次最多导入100条记录</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="importFaults">导入</el-button>
        </span>
      </template>
    </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Refresh } from '@element-plus/icons-vue'
import { canAddFault } from '../utils/permission'
import Layout from '../components/Layout.vue'

// 用户信息
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// 搜索表单
const searchForm = reactive({
  category: '',
  model: '',
  machineNumber: '',
  description: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 最后更新时间
const lastUpdateTime = ref(new Date().toLocaleTimeString('zh-CN'))

// 对话框状态
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const progressDialogVisible = ref(false)
const importDialogVisible = ref(false)

// 文件上传
const fileList = ref([])
const importFile = ref(null)

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
  }
])

// 新增故障表单
const newFault = reactive({
  category: '',
  meetingDate: new Date(),
  serviceEngineer: '',
  engineerPhone: '',
  company: '',
  model: '',
  workHours: 0,
  machineNumber: '',
  productionDate: '',
  agent: '',
  description: '',
  responderName: '',
  faultLocation: '',
  isCountermeasured: '',
  partStatus: '',
  riskAssessment: '',
  rootCause: '',
  temporaryCountermeasure: '',
  longTermCountermeasure: '',
  isClosed: false,
  investigatorName: ''
})

// 编辑故障表单
const editFault = reactive({})

// 更新进展表单
const progressForm = reactive({
  temporaryCountermeasure: '',
  longTermCountermeasure: '',
  isClosed: false,
  remark: ''
})

// 表单验证规则
const faultRules = {
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  meetingDate: [{ required: true, message: '请选择早会日期', trigger: 'change' }],
  model: [{ required: true, message: '请输入机型', trigger: 'blur' }],
  machineNumber: [{ required: true, message: '请输入机号', trigger: 'blur' }],
  description: [{ required: true, message: '请输入故障描述', trigger: 'blur' }]
}

const progressRules = {
  temporaryCountermeasure: [{ required: true, message: '请输入临时对策', trigger: 'blur' }],
  longTermCountermeasure: [{ required: true, message: '请输入长久对策及进展', trigger: 'blur' }]
}

// 计算属性：过滤后的故障列表
const filteredFaults = computed(() => {
  let result = [...faults.value]
  
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
  
  // 按故障描述过滤
  if (searchForm.description) {
    result = result.filter(fault => fault.description.includes(searchForm.description))
  }
  
  return result
})

// 权限检查
const canDelete = computed(() => {
  return user.value.role === '管理员'
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
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

// 刷新数据
const refreshData = () => {
  // 实际项目中应该调用API获取最新数据
  console.log('刷新数据')
  lastUpdateTime.value = new Date().toLocaleTimeString('zh-CN')
}

// 显示新增故障对话框
const showAddFaultDialog = () => {
  // 重置表单
  Object.keys(newFault).forEach(key => {
    if (key === 'meetingDate') {
      newFault[key] = new Date()
    } else if (key === 'isClosed') {
      newFault[key] = false
    } else if (key === 'workHours') {
      newFault[key] = 0
    } else {
      newFault[key] = ''
    }
  })
  fileList.value = []
  addDialogVisible.value = true
}

// 显示编辑故障对话框
const showEditFaultDialog = (fault) => {
  // 复制故障数据到编辑表单
  Object.assign(editFault, fault)
  editDialogVisible.value = true
}

// 显示更新进展对话框
const showUpdateProgressDialog = (fault) => {
  // 复制故障数据到进展表单
  progressForm.temporaryCountermeasure = fault.temporaryCountermeasure
  progressForm.longTermCountermeasure = fault.longTermCountermeasure
  progressForm.isClosed = fault.isClosed
  progressForm.remark = ''
  progressDialogVisible.value = true
}

// 显示批量导入对话框
const showImportDialog = () => {
  importFile.value = null
  importDialogVisible.value = true
}

// 新增故障
const addFault = () => {
  // 实际项目中应该调用API添加故障
  const newId = faults.value.length + 1
  const fault = {
    ...newFault,
    id: newId,
    responder: '10001', // 模拟
    investigator: '10001', // 模拟
    photos: [] // 实际项目中应该处理文件上传
  }
  faults.value.push(fault)
  addDialogVisible.value = false
  ElMessage.success('故障添加成功')
}

// 更新故障
const updateFault = () => {
  // 实际项目中应该调用API更新故障
  const index = faults.value.findIndex(f => f.id === editFault.id)
  if (index !== -1) {
    faults.value[index] = { ...editFault }
  }
  editDialogVisible.value = false
  ElMessage.success('故障更新成功')
}

// 更新故障状态
const updateFaultStatus = (fault) => {
  // 实际项目中应该调用API更新状态
  console.log('更新故障状态', fault.id, fault.isClosed)
  ElMessage.success('状态更新成功')
}

// 更新进展
const updateProgress = () => {
  // 实际项目中应该调用API更新进展
  console.log('更新进展', progressForm)
  progressDialogVisible.value = false
  ElMessage.success('进展更新成功')
}

// 删除故障
const deleteFault = (fault) => {
  ElMessageBox.confirm('确定要删除这个故障吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际项目中应该调用API删除故障
    const index = faults.value.findIndex(f => f.id === fault.id)
    if (index !== -1) {
      faults.value.splice(index, 1)
    }
    ElMessage.success('故障删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 批量导入故障
const importFaults = () => {
  // 实际项目中应该处理Excel文件并调用API导入
  console.log('批量导入故障', importFile.value)
  importDialogVisible.value = false
  ElMessage.success('故障导入成功')
}

// 处理文件上传
const handleFileChange = (file, fileList) => {
  // 实际项目中应该处理文件上传
  console.log('文件上传', file, fileList)
}

// 处理导入文件上传
const handleImportFileChange = (file, fileList) => {
  importFile.value = file
  console.log('导入文件', file)
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}
</script>

<style scoped>
/* 全局样式 */
.fault-management {
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
  margin-right: 8px !important;
}

.table-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.tech-switch {
  --el-switch-on-color: #67c23a !important;
  --el-switch-off-color: #f56c6c !important;
  transition: all 0.3s ease !important;
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

/* 导入提示样式 */
.import-tips {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(245, 247, 250, 0.9), rgba(255, 255, 255, 0.9));
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.import-tips p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.import-tips p:before {
  content: "•";
  color: #409eff;
  font-weight: bold;
  font-size: 16px;
}

/* 对话框样式 */
.dialog-footer {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .fault-management {
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
  
  .import-tips {
    padding: 15px;
  }
  
  .import-tips p {
    font-size: 13px !important;
  }
}
</style>