// 报表导出工具

// 导出字段配置
const EXPORT_FIELDS = [
  { key: 'id', label: 'ID', visible: true },
  { key: 'category', label: '分类', visible: true },
  { key: 'meetingDate', label: '早会日期', visible: true },
  { key: 'serviceEngineer', label: '服务工程师', visible: true },
  { key: 'engineerPhone', label: '工程师电话', visible: true },
  { key: 'company', label: '公司', visible: true },
  { key: 'model', label: '机型', visible: true },
  { key: 'workHours', label: '工作小时', visible: true },
  { key: 'machineNumber', label: '机号', visible: true },
  { key: 'productionDate', label: '生产日期', visible: true },
  { key: 'agent', label: '代理商', visible: true },
  { key: 'description', label: '故障描述', visible: true },
  { key: 'responderName', label: '回复责任人', visible: true },
  { key: 'faultLocation', label: '故障部位3', visible: true },
  { key: 'isCountermeasured', label: '是否对策', visible: true },
  { key: 'partStatus', label: '部品状态', visible: true },
  { key: 'riskAssessment', label: '故障风险评估', visible: true },
  { key: 'rootCause', label: '原因分析', visible: true },
  { key: 'temporaryCountermeasure', label: '临时对策', visible: true },
  { key: 'longTermCountermeasure', label: '长久对策及进展', visible: true },
  { key: 'productionSite', label: '整机生产地', visible: true },
  { key: 'isClosed', label: '是否闭环', visible: true },
  { key: 'investigatorName', label: '调查人', visible: true },
  { key: 'photos', label: '故障照片', visible: true }
]

// 模拟导出Excel文件
const exportToExcel = (data, fields, fileName = '故障报表') => {
  // 实际项目中应该使用xlsx库生成Excel文件
  console.log('导出Excel', {
    data,
    fields,
    fileName
  })
  
  // 模拟导出成功
  setTimeout(() => {
    console.log('导出成功')
    // 实际项目中应该触发文件下载
  }, 1000)
}

// 记录导出日志
const recordExportLog = (user, conditions) => {
  // 实际项目中应该调用API记录导出日志
  console.log('记录导出日志', {
    user,
    conditions,
    timestamp: new Date().toISOString()
  })
}

// 获取导出字段
const getExportFields = () => {
  return [...EXPORT_FIELDS]
}

// 导出故障数据
export const exportFaults = (data, selectedFields, user, conditions) => {
  // 记录导出日志
  recordExportLog(user, conditions)
  
  // 处理导出数据
  const exportData = data.map(item => {
    const row = {}
    selectedFields.forEach(field => {
      if (field.key === 'isClosed') {
        row[field.label] = item[field.key] ? '是' : '否'
      } else if (field.key === 'photos') {
        // 照片不嵌入，仅导出照片文件名或链接
        if (item[field.key] && item[field.key].length > 0) {
          row[field.label] = item[field.key].map(photo => {
            // 提取文件名
            return photo.split('/').pop()
          }).join('; ')
        } else {
          row[field.label] = ''
        }
      } else {
        row[field.label] = item[field.key] || ''
      }
    })
    return row
  })
  
  // 导出Excel
  exportToExcel(exportData, selectedFields, '故障报表')
  
  return true
}

export { getExportFields }