<template>
  <div class="dashboard">
    <div v-if="!canView" class="no-permission card">
      <div class="np-icon">🔒</div>
      <h3>无权限访问</h3>
      <p>该功能需要招聘负责人权限，用于查看平台全局统计。</p>
      <p class="np-hint">作为{{ isApplicant ? '应聘方' : '招聘方' }}，您可以：</p>
      <template v-if="isApplicant">
        <router-link to="/jobs" class="btn btn-primary" style="margin-bottom:8px">浏览职位</router-link>
        <button class="btn btn-secondary" @click="switchToManager">切换为招聘负责人</button>
      </template>
      <template v-else>
        <router-link to="/applications" class="btn btn-primary" style="margin-bottom:8px">管理候选人</router-link>
        <button class="btn btn-secondary" @click="switchToManager">切换为招聘负责人</button>
      </template>
    </div>
    <template v-else>
    <div class="page-header">
      <div>
        <h1>仪表盘</h1>
        <p class="page-subtitle">招聘平台全局概览，实时反映最新数据</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" @click="refreshAll" title="手动刷新所有数据">🔄 刷新</button>
        <router-link to="/jobs/create" class="btn btn-primary">+ 发布职位</router-link>
      </div>
    </div>

    <StatsBar ref="statsBar" />

    <div class="dashboard-grid">
      <div class="card section-card">
        <div class="section-head">
          <h3 class="section-title">最近开放职位</h3>
          <router-link to="/jobs" class="link-more">查看全部 →</router-link>
        </div>
        <div v-if="loadingJobs" class="loading-sm">加载中...</div>
        <div v-else-if="recentJobs.length === 0" class="empty-sm">
          <div class="empty-icon">💼</div>
          暂无开放职位，<router-link to="/jobs/create" class="link-primary">立即发布</router-link>
        </div>
        <div v-else>
          <div v-for="job in recentJobs" :key="job.id" class="quick-item" @click="goJob(job.id)">
            <div class="quick-item-main">
              <span class="job-title">{{ job.title }}</span>
              <span class="job-company">{{ job.company }} · {{ job.department || '未填部门' }}</span>
            </div>
            <div class="quick-item-meta">
              <span class="tag tag-blue">{{ job.location || '未指定地点' }}</span>
              <span class="salary" v-if="job.salaryMin && job.salaryMax">
                {{ formatSalary(job.salaryMin, job.salaryMax) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="card section-card">
        <div class="section-head">
          <h3 class="section-title">最近投递</h3>
          <router-link to="/applications" class="link-more">查看全部 →</router-link>
        </div>
        <div v-if="loadingApps" class="loading-sm">加载中...</div>
        <div v-else-if="recentApps.length === 0" class="empty-sm">
          <div class="empty-icon">📝</div>
          暂无投递记录
        </div>
        <div v-else>
          <div v-for="app in recentApps" :key="app.id" class="quick-item" @click="goApp(app.id)">
            <div class="quick-item-main">
              <span class="job-title">{{ app.applicantName }}</span>
              <span class="job-company">{{ app.targetPosition }} · {{ app.company || '未关联公司' }}</span>
            </div>
            <div class="quick-item-meta">
              <span class="tag" :class="`status-${app.status}`">{{ statusLabel(app.status) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="status-panel card">
      <h3 class="section-title">候选人状态分布</h3>
      <div v-if="statsBar && statsBar.stats" class="status-bars">
        <div v-for="s in statusDisplayList" :key="s.value" class="sb-row" :class="`sb-${s.value}`">
          <div class="sb-info">
            <span class="sb-icon">{{ s.icon }}</span>
            <span class="sb-label">{{ s.label }}</span>
          </div>
          <div class="sb-bar-wrap">
            <div class="sb-bar" :style="{ width: getBarWidth(s.value) + '%' }"></div>
          </div>
          <span class="sb-count">{{ getStatusCount(s.value) }}</span>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import StatsBar from '../components/StatsBar.vue'
import { jobApi, applicationApi } from '../services/api'

defineOptions({ name: 'DashboardView' })

const router = useRouter()
const toast = inject('toast')
const role = inject('role')
const markRefreshed = inject('markRefreshed', () => {})

const isApplicant = computed(() => role?.isApplicant?.value || false)
const isManager = computed(() => role?.isManager?.value || false)
const canView = computed(() => isManager.value || role?.canViewDashboard?.value || false)

function switchToManager() {
  role?.switchToManager?.()
  toast?.success?.('已切换到招聘负责人视角')
}

const statsBar = ref(null)
const recentJobs = ref([])
const recentApps = ref([])
const loadingJobs = ref(false)
const loadingApps = ref(false)

const statusLabels = {
  pending: '待筛选',
  contacted: '已沟通',
  interviewing: '面试中',
  rejected: '不合适'
}

const statusDisplayList = [
  { value: 'pending', label: '待筛选', icon: '⏳' },
  { value: 'contacted', label: '已沟通', icon: '💬' },
  { value: 'interviewing', label: '面试中', icon: '🎯' },
  { value: 'rejected', label: '不合适', icon: '❌' }
]

function statusLabel(s) { return statusLabels[s] || s }
function formatSalary(min, max) {
  if (min >= 10000 && max >= 10000) return `${(min/10000).toFixed(1)}K-${(max/10000).toFixed(1)}K`
  return `${min}-${max}元`
}
function goJob(id) { router.push(`/jobs/${id}`) }
function goApp(id) { router.push(`/applications/${id}`) }

function getStatusCount(key) {
  const map = {
    pending: 'pendingCandidates',
    contacted: 'contactedCount',
    interviewing: 'interviewingCount',
    rejected: 'rejectedCount'
  }
  return statsBar.value?.stats?.[map[key]] || 0
}

function getBarWidth(key) {
  const total = statsBar.value?.stats?.totalApplications || 0
  if (total === 0) return 0
  return Math.min(100, Math.round(getStatusCount(key) / total * 100))
}

async function loadJobs() {
  loadingJobs.value = true
  try {
    const jobs = await jobApi.list({ status: 'open' })
    recentJobs.value = jobs
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
  } catch (e) {
    console.error('加载职位失败:', e)
    if (toast) toast.error('加载职位列表失败')
  } finally {
    loadingJobs.value = false
  }
}

async function loadApps() {
  loadingApps.value = true
  try {
    const apps = await applicationApi.list()
    recentApps.value = apps
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
  } catch (e) {
    console.error('加载投递失败:', e)
    if (toast) toast.error('加载投递记录失败')
  } finally {
    loadingApps.value = false
  }
}

async function refreshAll() {
  try {
    await Promise.all([
      loadJobs(),
      loadApps(),
      statsBar.value?.loadStats()
    ])
    markRefreshed()
    if (toast) toast.success('数据已刷新')
  } catch (e) {
    if (toast) toast.warning('部分数据刷新失败')
  }
}

onMounted(refreshAll)
onActivated(refreshAll)
</script>

<style scoped>
.page-subtitle {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.page-actions {
  display: flex;
  gap: 8px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.section-card {
  display: flex;
  flex-direction: column;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
}

.link-more {
  font-size: 12px;
  color: #e94560;
  text-decoration: none;
}

.link-more:hover {
  text-decoration: underline;
}

.link-primary {
  color: #e94560;
  text-decoration: none;
}

.link-primary:hover {
  text-decoration: underline;
}

.quick-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px;
  border-bottom: 1px solid #fafafa;
  cursor: pointer;
  transition: all 0.15s;
  border-radius: 6px;
  margin: 0 -4px;
}

.quick-item:hover {
  background: #fafafa;
  padding: 12px 8px;
  margin: 0 -8px;
}

.quick-item:last-child {
  border-bottom: none;
}

.quick-item-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.job-title {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a2e;
}

.job-company {
  font-size: 12px;
  color: #999;
}

.quick-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.salary {
  font-size: 13px;
  color: #e94560;
  font-weight: 600;
}

.loading-sm {
  text-align: center;
  padding: 28px;
  color: #bbb;
  font-size: 13px;
}

.empty-sm {
  text-align: center;
  padding: 28px 16px;
  color: #bbb;
  font-size: 13px;
}

.empty-sm .empty-icon {
  font-size: 36px;
  opacity: 0.4;
  margin-bottom: 8px;
}

.status-panel {
  margin-top: 0;
}

.status-bars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-top: 4px;
}

.sb-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fafafa;
}

.sb-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 80px;
}

.sb-icon {
  font-size: 14px;
}

.sb-label {
  font-size: 13px;
  font-weight: 500;
}

.sb-bar-wrap {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.sb-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.sb-pending .sb-bar { background: linear-gradient(90deg, #ffc069, #fa8c16); }
.sb-contacted .sb-bar { background: linear-gradient(90deg, #69c0ff, #1890ff); }
.sb-interviewing .sb-bar { background: linear-gradient(90deg, #b37feb, #722ed1); }
.sb-rejected .sb-bar { background: linear-gradient(90deg, #ff7875, #f5222d); }

.sb-pending .sb-label { color: #d46b08; }
.sb-contacted .sb-label { color: #096dd9; }
.sb-interviewing .sb-label { color: #531dab; }
.sb-rejected .sb-label { color: #cf1322; }

.sb-count {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  min-width: 30px;
  text-align: right;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.no-permission {
  text-align: center;
  padding: 60px 20px;
  max-width: 480px;
  margin: 40px auto;
}

.no-permission .np-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-permission h3 {
  font-size: 20px;
  margin: 0 0 10px;
  color: #333;
}

.no-permission p {
  font-size: 14px;
  color: #888;
  margin: 0 0 12px;
}

.no-permission .np-hint {
  color: #e94560;
  font-size: 13px;
  margin-bottom: 16px;
}

.no-permission .btn {
  display: block;
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
}
</style>
