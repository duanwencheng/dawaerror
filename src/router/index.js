import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/fault-management',
    name: 'FaultManagement',
    component: () => import('../views/FaultManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history-faults',
    name: 'HistoryFaults',
    component: () => import('../views/HistoryFaults.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/trends',
    name: 'Trends',
    component: () => import('../views/Trends.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/todo',
    name: 'Todo',
    component: () => import('../views/Todo.vue'),
    meta: { requiresAuth: true }
  },
  // 404路由
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    // 未登录用户访问需要认证的页面，跳转到登录页
    next('/login')
  } else {
    next()
  }
})

export default router