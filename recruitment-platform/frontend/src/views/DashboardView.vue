<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>仪表盘</h1>
      <div>
        <router-link to="/jobs/create" class="btn btn-primary">发布职位</router-link>
      </div>
    </div>

    <StatsBar ref="statsBar" />

    <div class="dashboard-grid">
      <div class="card">
        <h3 class="section-title">最近开放职位</h3>
        <div v-if="recentJobs.length === 0" class="empty">暂无开放职位</div>
        <div v-for="job in recentJobs" :key="job.id" class="quick-item" @click="$router.push(`/jobs/${job.id}`)">
          <div class="quick-item-main">
            <span class="job-title">{{ job.title }}</span>
            <span class="job-company">{{ job.company }}</span>
          </div>
          <div class="quick-item-meta">
            <span class="tag tag-blue">{{ job.location }}</span>
            <span class="salary">{{ job.salaryMin }}-{{ job.salaryMax }}元</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="section-title">最近投递</h3>
        <div v-if="recentApps.length === 0" class="empty">暂无投递记录</div>
        <div v-for="app in recentApps" :key="app.id" class="quick-item" @click="$router.push(`/applications/${app.id}`)">
          <div class="quick-item-main">
            <span class="job-title">{{ app.applicantName }}</span>
            <span class="job-company">{{ app.targetPosition }}</span>
          </div>
          <div class="quick-item-meta">
            <span class="tag" :class="`status-${app.status}`">{{ statusLabel(app.status) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StatsBar from '../components/StatsBar.vue'
import { jobApi, applicationApi } from '../services/api'

const statsBar = ref(null)
const recentJobs = ref([])
const recentApps = ref([])

const statusLabels = {
  pending: '待筛选',
  contacted: '已沟通',
  interviewing: '面试中',
  rejected: '不合适'
}

function statusLabel(s) {
  return statusLabels[s] || s
}

async function loadData() {
  try {
    const [jobs, apps] = await Promise.all([
      jobApi.list({ status: 'open' }),
      applicationApi.list()
    ])
    recentJobs.value = jobs.slice(0, 5)
    recentApps.value = apps
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  } catch (e) {
    console.error('加载数据失败:', e)
  }
}

onMounted(loadData)
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.quick-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #fafafa;
  cursor: pointer;
  transition: background 0.15s;
}

.quick-item:hover {
  background: #fafafa;
  margin: 0 -10px;
  padding: 10px;
  border-radius: 4px;
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
  font-weight: 500;
  font-size: 14px;
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
  font-weight: 500;
}

.empty {
  text-align: center;
  color: #bbb;
  padding: 24px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
