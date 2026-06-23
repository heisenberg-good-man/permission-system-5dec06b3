<template>
  <div class="job-list">
    <div class="page-header">
      <h1>职位管理</h1>
      <router-link to="/jobs/create" class="btn btn-primary">发布职位</router-link>
    </div>

    <SearchFilter
      placeholder="搜索职位名称、公司或要求..."
      :show-location="true"
      :locations="locationOptions"
      :show-status="true"
      :statuses="jobStatuses"
      @filter="onFilter"
    />

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="jobs.length === 0" class="empty card">暂无匹配的职位</div>
    <div v-else class="job-grid">
      <div v-for="job in jobs" :key="job.id" class="job-card card" @click="$router.push(`/jobs/${job.id}`)">
        <div class="job-card-header">
          <h3 class="job-card-title">{{ job.title }}</h3>
          <span class="tag" :class="`status-${job.status}`">{{ job.status === 'open' ? '招聘中' : '已关闭' }}</span>
        </div>
        <div class="job-card-company">{{ job.company }} · {{ job.department }}</div>
        <div class="job-card-meta">
          <span>📍 {{ job.location }}</span>
          <span>💰 {{ job.salaryMin }}-{{ job.salaryMax }}元/月</span>
          <span>👤 招{{ job.headcount }}人</span>
        </div>
        <div class="job-card-footer">
          <span class="job-card-time">{{ formatDate(job.createdAt) }}</span>
          <router-link :to="`/apply/${job.id}`" class="btn btn-primary btn-sm" @click.stop>投递简历</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SearchFilter from '../components/SearchFilter.vue'
import { jobApi } from '../services/api'

const jobs = ref([])
const loading = ref(true)
const locationOptions = ['北京', '上海', '深圳', '广州', '杭州', '成都']
const jobStatuses = [
  { value: 'open', label: '招聘中' },
  { value: 'closed', label: '已关闭' }
]

let currentFilter = {}

async function loadJobs() {
  loading.value = true
  try {
    const params = {}
    if (currentFilter.keyword) params.keyword = currentFilter.keyword
    if (currentFilter.location) params.location = currentFilter.location
    if (currentFilter.status) params.status = currentFilter.status
    jobs.value = await jobApi.list(params)
  } catch (e) {
    console.error('加载职位失败:', e)
  } finally {
    loading.value = false
  }
}

function onFilter(filter) {
  currentFilter = filter
  loadJobs()
}

function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

onMounted(loadJobs)
</script>

<style scoped>
.job-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.job-card {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.job-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.job-card-title {
  font-size: 16px;
  font-weight: 600;
}

.job-card-company {
  font-size: 13px;
  color: #888;
  margin-bottom: 10px;
}

.job-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.job-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}

.job-card-time {
  font-size: 12px;
  color: #bbb;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
