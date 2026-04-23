import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// 读取Excel文件
const filePath = 'test_data.xlsx';
const workbook = XLSX.readFile(filePath);

// 检查可用的sheet名称
console.log('可用的sheet名称:', workbook.SheetNames);

// 使用索引访问sheet（第一个sheet是当日故障，第二个是历史故障）
const todayWorksheet = workbook.Sheets[workbook.SheetNames[0]];
const historyWorksheet = workbook.Sheets[workbook.SheetNames[1]];

if (!todayWorksheet) {
  console.error('当日故障sheet不存在！');
  process.exit(1);
}

if (!historyWorksheet) {
  console.error('历史故障sheet不存在！');
  process.exit(1);
}

// 定义列索引
const COL = {
  CATEGORY: 0,         // 分类
  MEETING_DATE: 1,     // 早会日期
  SERVICE_ENGINEER: 2,  // 服务工程师
  ENGINEER_PHONE: 3,   // 工程师电话
  COMPANY: 4,          // 公司
  MODEL: 5,            // 机型
  WORK_HOURS: 6,       // 工作小时
  MACHINE_NUMBER: 7,   // 机号
  PRODUCTION_DATE: 8,  // 生产日期
  AGENT: 9,            // 代理商
  DESCRIPTION: 10,     // 故障描述
  RESPONDER: 11,       // 回复责任人
  FAULT_LOCATION: 12,  // 故障部位3
  IS_COUNTERMEASURED: 13, // 是否对策
  PART_STATUS: 14,     // 部品状态
  RISK_ASSESSMENT: 15, // 故障风险评估
  ROOT_CAUSE: 17,      // 原因分析
  TEMPORARY_COUNTER: 18, // 临时对策
  LONGTERM_COUNTER: 19, // 长久对策及进展
  IS_CLOSED: 23,       // 是否闭环
  INVESTIGATOR: 24     // 调查人
};

// 处理日期
function formatDate(dateValue) {
  if (!dateValue) return '';
  try {
    if (typeof dateValue === 'number') {
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
}

// 清理名字（去掉@符号和空格）
function cleanName(nameValue) {
  if (!nameValue) return '张三';
  const cleaned = nameValue.toString().replace(/@/g, '').replace(/\s/g, '').trim();
  return cleaned || '张三';
}

// 处理单个sheet的数据
function processSheet(worksheet, startId) {
  // 获取范围
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const startRow = 1; // 数据从第2行开始（索引1）
  
  const processedData = [];
  
  for (let R = startRow; R <= range.e.r; ++R) {
    const rowIndex = R - startRow + 1;

    // 按列索引获取单元格值
    const getCellValue = (colIndex) => {
      const cell = worksheet[XLSX.utils.encode_cell({r: R, c: colIndex})];
      return cell ? cell.v : undefined;
    };

    // 提取数据
    const responderValue = getCellValue(COL.RESPONDER);

    const fault = {
      id: startId + rowIndex - 1,
      category: getCellValue(COL.CATEGORY) || '',
      meetingDate: formatDate(getCellValue(COL.MEETING_DATE)),
      serviceEngineer: getCellValue(COL.SERVICE_ENGINEER) || '',
      engineerPhone: getCellValue(COL.ENGINEER_PHONE) ? getCellValue(COL.ENGINEER_PHONE).toString() : '',
      company: getCellValue(COL.COMPANY) || '大挖',
      model: getCellValue(COL.MODEL) || '',
      workHours: parseInt(getCellValue(COL.WORK_HOURS)) || 0,
      machineNumber: getCellValue(COL.MACHINE_NUMBER) || '',
      productionDate: formatDate(getCellValue(COL.PRODUCTION_DATE)),
      agent: getCellValue(COL.AGENT) || '',
      description: getCellValue(COL.DESCRIPTION) || '',
      responder: '10001',
      responderName: cleanName(responderValue),
      faultLocation: getCellValue(COL.FAULT_LOCATION) || '',
      isCountermeasured: getCellValue(COL.IS_COUNTERMEASURED) || '',
      partStatus: getCellValue(COL.PART_STATUS) || '',
      riskAssessment: getCellValue(COL.RISK_ASSESSMENT) || '',
      rootCause: getCellValue(COL.ROOT_CAUSE) || '',
      temporaryCountermeasure: getCellValue(COL.TEMPORARY_COUNTER) || '',
      longTermCountermeasure: getCellValue(COL.LONGTERM_COUNTER) || '',
      isClosed: getCellValue(COL.IS_CLOSED) === '是',
      investigator: '10001',
      investigatorName: cleanName(getCellValue(COL.INVESTIGATOR)),
      photos: []
    };

    processedData.push(fault);
  }
  
  return processedData;
}

// 处理当日故障数据
const todayFaults = processSheet(todayWorksheet, 1);

// 处理历史故障数据（从当日故障数量+1开始编号）
const historyFaults = processSheet(historyWorksheet, todayFaults.length + 1);

// 合并数据，保持前三条当日故障不变
const processedData = [...todayFaults, ...historyFaults];

// 保存为JSON文件
const outputPath = 'src/data/faultData.js';

// 确保data目录存在
const dataDir = 'src/data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 写入文件
const fileContent = `// 故障数据
const faultData = ${JSON.stringify(processedData, null, 2)};

export default faultData;
`;

fs.writeFileSync(outputPath, fileContent);

console.log('数据导入成功！');
console.log(`处理了 ${processedData.length} 条记录`);
console.log(`数据已保存到 ${outputPath}`);