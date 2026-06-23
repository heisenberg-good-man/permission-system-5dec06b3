import { createRouter, createWebHistory } from 'vue-router'
import { useToast } from '../composables/useToast'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: '仪表盘' }
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
  next()
})

router.onError((err) => {
  console.error('路由错误:', err)
  const toast = useToast()
  toast.error('页面加载失败，请刷新重试')
})

export default router
