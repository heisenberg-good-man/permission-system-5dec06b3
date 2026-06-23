import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/jobs', name: 'job-list', component: () => import('../views/JobListView.vue') },
  { path: '/jobs/create', name: 'job-create', component: () => import('../views/JobFormView.vue') },
  { path: '/jobs/:id/edit', name: 'job-edit', component: () => import('../views/JobFormView.vue') },
  { path: '/jobs/:id', name: 'job-detail', component: () => import('../views/JobDetailView.vue') },
  { path: '/apply/:jobId', name: 'apply', component: () => import('../views/ApplicationFormView.vue') },
  { path: '/applications', name: 'application-list', component: () => import('../views/ApplicationListView.vue') },
  { path: '/applications/:id', name: 'application-detail', component: () => import('../views/ApplicationDetailView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
