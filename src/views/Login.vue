<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <h1>大挖故障调查系统</h1>
        <p>故障管理与分析平台</p>
      </div>
      <div class="login-btn">
        <el-button type="primary" size="large" @click="loginWithFeishu">
          <i class="el-icon-user"></i>
          飞书授权登录
        </el-button>
      </div>
      <div class="login-tips">
        <p>限大挖公司内部员工登录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 飞书授权登录
const loginWithFeishu = () => {
  // 模拟飞书登录流程
  // 实际项目中需要配置飞书应用并使用真实的OAuth流程
  setTimeout(() => {
    // 模拟登录成功，生成token
    const token = 'mock_token_' + Date.now()
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({
      name: '张三',
      department: '技术部',
      employeeId: '10001',
      role: '工程师'
    }))
    ElMessage.success('登录成功')
    router.push('/dashboard')
  }, 1000)
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 400px;
  text-align: center;
}

.logo h1 {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.logo p {
  color: #909399;
  margin-bottom: 40px;
}

.login-btn {
  margin-bottom: 30px;
}

.login-btn .el-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
}

.login-tips p {
  color: #909399;
  font-size: 14px;
}
</style>