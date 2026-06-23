<template>
  <div class="job-detail">
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary btn-sm" @click="$router.back()">← 返回</button>
        <h1>{{ job.title }}</h1>
      </div>
      <div class="header-actions">
        <router-link :to="`/jobs/${job.id}/edit`" class="btn btn-secondary btn-sm">编辑职位</router-link>
        <router-link :to="`/apply/${job.id}`" class="btn btn-primary btn-sm">投递简历</router-link>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <template v-else>
      <div class="detail-grid">
        <div class="card detail-main">
          <div class="detail-status">
            <span class="tag" :class="`status-${job.status}`">{{ job.status === 'open' ? '招聘中' : '已关闭' }}</span>
          </div>
          <h2>{{ job.title }}</h2>
          <p class="detail-company">{{ job.company }} · {{ job.department }}</p>

          <div class="detail-info-grid">
            <div class="info-item">
              <span class="info-label">工作地点</span>
              <span class="info-value">{{ job.location }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">薪资范围</span>
              <span class="info-value salary">{{ job.salaryMin }}-{{ job.salaryMax }}元/月</span>
            </div>
            <div class="info-item">
              <span class="info-label">招聘人数</span>
              <span class="info-value">{{ job.headcount }}人</span>
            </div>
            <div class="info-item">
              <span class="info-label">发布时间</span>
              <span class="info-value">{{ formatDate(job.createdAt) }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h3>岗位要求</h3>
            <div class="requirements">{{ job.requirements }}</div>
          </div>
        </div>

        <div class="card detail-sidebar">
          <h3>该职位投递记录</h3>
          <div v-if="appList.length === 0" class="empty">暂无投递记录</div>
          <div v-for="app in appList" :key="app.id" class="app-item" @click="$router.push(`/applications/${app.id}`)">
            <div class="app-item-main">
              <span class="app-name">{{ app.applicantName }}</span>
              <span class="app-years">{{ app.workYears }}年经验</span>
            </div>
            <span class="tag" :class="`status-${app.status}`">{{ statusLabel(app.status) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { jobApi, applicationApi } from '../services/api'

const route = useRoute()
const job = ref({})
const appList = ref([])
const loading = ref(true)

const statusLabels = {
  pending: '待筛选',
  contacted: '已沟通',
  interviewing: '面试中',
  rejected: '不合适'
}

function statusLabel(s) { return statusLabels[s] || s }

function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function loadData() {
  loading.value = true
  try {
    const [jobData, apps] = await Promise.all([
      jobApi.get(route.params.id),
      applicationApi.list({ jobId: route.params.id })
    ])
    job.value = jobData
    appList.value = apps
  } catch (e) {
    console.error('加载职位详情失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.detail-main h2 {
  font-size: 22px;
  margin-bottom: 4px;
}

.detail-company {
  color: #888;
  font-size: 15px;
  margin-bottom: 20px;
}

.detail-status {
  margin-bottom: 12px;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.info-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
}

.info-value.salary {
  color: #e94560;
}

.detail-section h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
}

.requirements {
  font-size: 14px;
  line-height: 1.8;
  color: #555;
  white-space: pre-line;
}

.detail-sidebar h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.app-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #fafafa;
  cursor: pointer;
}

.app-item:hover {
  background: #fafafa;
  padding: 10px;
  margin: 0 -10px;
  border-radius: 4px;
}

.app-item-main {
  display: flex;
  gap: 8px;
  align-items: center;
}

.app-name {
  font-weight: 500;
}

.app-years {
  font-size: 12px;
  color: #999;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
