import { createRouter, createWebHistory } from 'vue-router'
import { useToast } from '../composables/useToast'
import { useRole } from '../composables/useRole'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录 · 选择角色', layout: 'blank' }
  },
  {
    path: '/',
    name: 'home',
    redirect: () => {
      try {
        const role = (localStorage.getItem('currentRole') || 'manager')
        if (role === 'applicant') return '/jobs'
        if (role === 'recruiter') return '/candidates'
        return '/dashboard'
      } catch {
        return '/dashboard'
      }
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: '仪表盘' }
  },
  {
    path: '/candidates',
    name: 'candidate-list',
    component: () => import('../views/ApplicationListView.vue'),
    meta: { title: '候选人管理' }
  },
  {
    path: '/jobs',
    name: 'job-list',
    component: () => import('../views/JobListView.vue'),
    meta: { title: '职位管理' }
  },
  {
    path: '/jobs/create',
    name: 'job-create',
    component: () => import('../views/JobFormView.vue'),
    meta: { title: '发布职位' }
  },
  {
    path: '/jobs/:id/edit',
    name: 'job-edit',
    component: () => import('../views/JobFormView.vue'),
    meta: { title: '编辑职位' }
  },
  {
    path: '/jobs/:id',
    name: 'job-detail',
    component: () => import('../views/JobDetailView.vue'),
    meta: { title: '职位详情' }
  },
  {
    path: '/apply/:jobId',
    name: 'apply',
    component: () => import('../views/ApplicationFormView.vue'),
    meta: { title: '投递简历' }
  },
  {
    path: '/applications',
    name: 'application-list',
    component: () => import('../views/ApplicationListView.vue'),
    meta: { title: '投递管理' }
  },
  {
    path: '/applications/:id',
    name: 'application-detail',
    component: () => import('../views/ApplicationDetailView.vue'),
    meta: { title: '投递详情' }
  },
  {
    path: '/interviews',
    name: 'interview-list',
    component: () => import('../views/InterviewListView.vue'),
    meta: { title: '面试安排' }
  },
  {
    path: '/interviews/:id',
    name: 'interview-detail',
    component: () => import('../views/InterviewDetailView.vue'),
    meta: { title: '面试详情' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const title = to.meta?.title ? `${to.meta.title} - 招聘平台` : '招聘平台'
  document.title = title

  try {
    if (!localStorage.getItem('currentRole')) {
      localStorage.setItem('currentRole', 'manager')
    }
  } catch {}

  next()
})

router.onError((err) => {
  console.error('路由错误:', err)
  try {
    const toast = useToast()
    toast.error('页面加载失败，请刷新重试')
  } catch {}
})

export default router
