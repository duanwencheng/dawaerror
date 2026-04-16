<template>
  <div 
    v-if="!isLoginPage"
    ref="aiRobotRef"
    class="ai-robot"
    :class="{ 'ai-robot-hidden': isHidden, 'ai-robot-active': isActive }"
    @click="toggleDialog($event)"
    @dblclick="toggleHidden"
  >
    <div class="ai-robot-image">
      <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- 头部 -->
        <rect x="25" y="15" width="50" height="35" fill="#4A90E2" rx="15" />
        <!-- 头盔顶部 -->
        <rect x="35" y="8" width="30" height="10" fill="#3A80D2" rx="5" />
        <!-- 面罩 -->
        <rect x="30" y="25" width="40" height="20" fill="#000000" rx="5" />
        <!-- 眼睛 -->
        <circle cx="40" cy="32" r="4" fill="#4A90E2" />
        <circle cx="60" cy="32" r="4" fill="#4A90E2" />
        <!-- 嘴巴 -->
        <path d="M40 40 Q50 45 60 40" stroke="#4A90E2" stroke-width="2" fill="none" />
        <!-- 耳机/天线 -->
        <rect x="18" y="25" width="7" height="15" fill="#4A90E2" rx="3" />
        <rect x="75" y="25" width="7" height="15" fill="#4A90E2" rx="3" />
        <!-- 耳机细节 -->
        <circle cx="21" cy="32" r="2" fill="#3A80D2" />
        <circle cx="78" cy="32" r="2" fill="#3A80D2" />
        <!-- 身体 -->
        <rect x="35" y="50" width="30" height="30" fill="#4A90E2" rx="5" />
        <!-- 白色腰带 -->
        <rect x="35" y="60" width="30" height="3" fill="white" />
        <!-- 胸前标志 -->
        <rect x="45" y="55" width="10" height="10" fill="white" rx="2" />
        <path d="M50 55 L55 65 L45 65 Z" fill="#FF4444" />
        <!-- 手臂 -->
        <rect x="25" y="55" width="10" height="20" fill="#4A90E2" rx="5" />
        <rect x="65" y="55" width="10" height="20" fill="#4A90E2" rx="5" />
        <!-- 手部 -->
        <circle cx="30" cy="75" r="3" fill="#4A90E2" />
        <circle cx="70" cy="75" r="3" fill="#4A90E2" />
        <!-- 腿部 -->
        <rect x="40" y="80" width="10" height="10" fill="#4A90E2" rx="3" />
        <rect x="50" y="80" width="10" height="10" fill="#4A90E2" rx="3" />
        <!-- 脚部 -->
        <rect x="38" y="90" width="14" height="3" fill="#3A80D2" rx="1" />
        <rect x="48" y="90" width="14" height="3" fill="#3A80D2" rx="1" />
      </svg>
    </div>
    
    <!-- 对话框 -->
    <div v-if="isActive" class="ai-dialog" :style="dialogStyle">
      <div class="ai-dialog-header">
        <h3>AI 助手</h3>
        <button @click="closeDialog" class="close-btn">×</button>
      </div>
      <div class="ai-dialog-body">
        <div class="ai-messages">
          <div v-for="(message, index) in messages" :key="index" class="message" :class="{ 'user-message': message.isUser }">
            <div class="message-content">{{ message.text }}</div>
          </div>
        </div>
        <div class="ai-input-area">
          <input 
            v-model="inputMessage"
            @keyup.enter="sendMessage"
            placeholder="最近一个月故障率最高的是哪个机型"
            class="ai-input"
          />
          <button @click="sendMessage" class="send-btn">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const aiRobotRef = ref(null)
const isActive = ref(false)
const isHidden = ref(false)
const inputMessage = ref('')
const messages = ref([
  { text: '你好！我是大挖故障追踪系统的AI助手，有什么可以帮助您的吗？', isUser: false }
])
// 固定位置在右下角
const position = ref({ x: 80, y: 80 })
const lastInteraction = ref(Date.now())
const defaultPosition = { x: 80, y: 80 }

// 判断当前是否在登录页面
const isLoginPage = computed(() => {
  return route.path === '/login'
})

// 计算对话框位置
const dialogStyle = computed(() => {
  return {
    bottom: '80px',
    right: `${position.value.x}px`
  }
})

// 切换对话框
const toggleDialog = (e) => {
  // 如果点击的是对话框或其内部元素，不切换对话框
  if (e.target.closest('.ai-dialog')) return
  
  isActive.value = !isActive.value
  if (isActive.value) {
    lastInteraction.value = Date.now()
  }
}

// 关闭对话框
const closeDialog = () => {
  isActive.value = false
}

// 切换隐藏状态
const toggleHidden = () => {
  isHidden.value = !isHidden.value
}

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) return
  
  // 添加用户消息
  messages.value.push({ text: inputMessage.value, isUser: true })
  lastInteraction.value = Date.now()
  
  // 模拟AI回复
  setTimeout(() => {
    const reply = generateReply(inputMessage.value)
    messages.value.push({ text: reply, isUser: false })
  }, 500)
  
  inputMessage.value = ''
}

// 生成AI回复
const generateReply = (message) => {
  message = message.toLowerCase()
  
  if (message.includes('故障率最高') && message.includes('部位')) {
    return '根据系统记录，故障率最高的故障部位是液压系统，占总故障的35%。'
  } else if (message.includes('故障率最高') && message.includes('机型')) {
    return '根据系统记录，故障率最高的机型是DW-200，故障率为18.5%。'
  } else if (message.includes('故障') && message.includes('解决方案')) {
    return '根据您的描述，建议您：1. 检查相关部件是否正常工作；2. 参考历史故障案例中的解决方案；3. 如果问题复杂，建议联系专业技术人员进行处理。'
  } else if (message.includes('你好') || message.includes('hi') || message.includes('hello')) {
    return '你好！很高兴为您服务。'
  } else if (message.includes('谢谢') || message.includes('thank')) {
    return '不客气，随时为您服务！'
  } else {
    return '对不起，我不太理解您的问题。请问您可以详细描述一下吗？'
  }
}

// 自动交互
const autoInteraction = () => {
  const now = Date.now()
  if (now - lastInteraction.value > 30000 && !isActive.value) {
    // 30秒无交互，AI机器人自己玩
    const randomActions = [
      '眨眨眼',
      '摇摇头',
      '挥挥手'
    ]
    const randomAction = randomActions[Math.floor(Math.random() * randomActions.length)]
    // 这里可以添加动画效果
    console.log('AI机器人在', randomAction)
    lastInteraction.value = now
  }
}

// 监听鼠标移动，更新最后交互时间
const updateLastInteraction = () => {
  lastInteraction.value = Date.now()
}

onMounted(() => {
  setInterval(autoInteraction, 5000)
  document.addEventListener('mousemove', updateLastInteraction)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', updateLastInteraction)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.ai-robot {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translateX(0);
}

.ai-robot-hidden {
  transform: translateX(70%);
}

.ai-robot-active .ai-robot-image {
  animation: pulse 2s infinite;
}

.ai-robot-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.ai-robot:hover .ai-robot-image {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}



.ai-dialog-header {
  background-color: #4A90E2;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.ai-dialog-body {
  display: flex;
  flex-direction: column;
  height: 350px;
}

.ai-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.message {
  margin-bottom: 10px;
  max-width: 80%;
}

.message-content {
  padding: 10px 15px;
  border-radius: 18px;
  line-height: 1.4;
}

.user-message {
  align-self: flex-end;
  margin-left: auto;
}

.user-message .message-content {
  background-color: #4A90E2;
  color: white;
  border-bottom-right-radius: 4px;
}

.message:not(.user-message) .message-content {
  background-color: #e0e0e0;
  color: #333;
  border-bottom-left-radius: 4px;
}

.ai-input-area {
  display: flex;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
  background-color: white;
}

.ai-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.ai-input:focus {
  border-color: #4A90E2;
}

.send-btn {
  margin-left: 10px;
  padding: 0 15px;
  background-color: #4A90E2;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.send-btn:hover {
  background-color: #357ABD;
}

.send-btn:active {
  transform: translateY(1px);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.ai-dialog {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  max-height: 450px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .ai-dialog {
    width: 300px;
    max-height: 400px;
  }
  
  .ai-dialog-body {
    height: 300px;
  }
}
</style>
