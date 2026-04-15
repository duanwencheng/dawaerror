<template>
  <el-dialog
    :visible="visible"
    @close="$emit('update:visible', false)"
    title="导出报表"
    width="500px"
  >
    <el-form :model="form" ref="form">
      <el-form-item label="导出范围">
        <el-radio-group v-model="form.exportScope">
          <el-radio label="current">当前查询结果</el-radio>
          <el-radio label="all">所有数据</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="导出字段">
        <el-checkbox-group v-model="form.selectedFields" @change="handleFieldChange">
          <div class="field-list">
            <el-checkbox
              v-for="field in exportFields"
              :key="field.key"
              :label="field.key"
            >
              {{ field.label }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="selectAll">全选</el-button>
        <el-button @click="selectNone">取消全选</el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confirmExport">导出</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getExportFields, exportFaults } from '../utils/export'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Array,
    default: () => []
  },
  conditions: {
    type: Object,
    default: () => {}
  }
})

// Emits
const emit = defineEmits(['update:visible', 'export-success'])

// 表单数据
const form = reactive({
  exportScope: 'current',
  selectedFields: []
})

// 导出字段
const exportFields = ref([])

// 生命周期
onMounted(() => {
  // 获取导出字段
  exportFields.value = getExportFields()
  // 默认选中所有字段
  form.selectedFields = exportFields.value.map(field => field.key)
})

// 处理字段选择变化
const handleFieldChange = (values) => {
  console.log('选中的字段', values)
}

// 全选
const selectAll = () => {
  form.selectedFields = exportFields.value.map(field => field.key)
}

// 取消全选
const selectNone = () => {
  form.selectedFields = []
}

// 确认导出
const confirmExport = () => {
  if (form.selectedFields.length === 0) {
    ElMessage.warning('请至少选择一个导出字段')
    return
  }

  // 获取用户信息
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // 处理导出数据
  let exportData = [...props.data]
  if (form.exportScope === 'all') {
    // 实际项目中应该调用API获取所有数据
    console.log('导出所有数据')
  }

  // 过滤选中的字段
  const selectedFields = exportFields.value.filter(field => 
    form.selectedFields.includes(field.key)
  )

  // 执行导出
  const success = exportFaults(exportData, selectedFields, user, props.conditions)

  if (success) {
    emit('export-success')
    emit('update:visible', false)
  }
}
</script>

<style scoped>
.field-list {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.field-list .el-checkbox {
  width: calc(50% - 5px);
  margin-right: 0;
}

.dialog-footer {
  text-align: right;
}
</style>