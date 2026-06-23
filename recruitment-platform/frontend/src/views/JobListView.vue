<template>
  <div class="job-list">
    <div class="page-header">
      <div>
        <h1>职位管理</h1>
        <p class="page-subtitle">共 {{ jobs.length }} 个职位{{ currentFilterText ? `（${currentFilterText}）` : '' }}</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" @click="loadJobs" title="刷新">🔄</button>
        <router-link to="/jobs/create" class="btn btn-primary">+ 发布职位</router-link>
      </div>
    </div>

    <SearchFilter
      placeholder="搜索职位名称、公司名称或岗位要求..."
      :show-location="true"
      :locations="locationOptions"
      :show-status="true"
      :statuses="jobStatuses"
      :init-status="initStatus"
      @filter="onFilter"
      @reset="onReset"
    />

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="jobs.length === 0" class="empty card">
      <div class="empty-icon">🔍</div>
      <p>没有匹配的职位</p>
      <p class="empty-hint" v-if="hasFilter">请尝试调整搜索条件，或 <button class="link-btn" @click="resetFilter">重置筛选</button></p>
      <router-link v-else to="/jobs/create" class="btn btn-primary btn-sm" style="margin-top:12px">发布第一个职位</router-link>
    </div>
    <div v-else class="job-grid">
      <div v-for="job in jobs" :key="job.id" class="job-card card" @click="openJob(job.id)">
        <div class="job-card-header">
          <h3 class="job-card-title">{{ job.title }}</h3>
          <span class="tag" :class="`status-${job.status}`">
            {{ job.status === 'open' ? '招聘中' : '已关闭' }}
          </span>
        </div>
        <div class="job-card-company">{{ job.company }}{{ job.department ? ' · ' + job.department : '' }}</div>
        <div class="job-card-meta">
          <span v-if="job.location">📍 {{ job.location }}</span>
          <span v-if="job.salaryMin && job.salaryMax">💰 {{ formatSalary(job.salaryMin, job.salaryMax) }}</span>
          <span>👤 招{{ job.headcount || 1 }}人</span>
        </div>
        <div v-if="job.requirements" class="job-card-req">
          {{ truncateReq(job.requirements) }}
        </div>
        <div class="job-card-footer">
          <span class="job-card-time">发布于 {{ formatDate(job.createdAt) }}</span>
          <div class="job-card-actions">
            <router-link :to="`/apply/${job.id}`" class="btn btn-primary btn-sm" @click.stop>
              立即投递
            </router-link>
          </div>
        </div>
        <div class="job-card-hover-bar" v-if="job.id === hoveredId"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchFilter from '../components/SearchFilter.vue'
import { jobApi } from '../services/api'

defineOptions({ name: 'JobListView' })

const route = useRoute()
const router = useRouter()
const toast = inject('toast')

const jobs = ref([])
const loading = ref(false)
const hoveredId = ref('')
const locationOptions = ['北京', '上海', '深圳', '广州', '杭州', '成都', '南京', '武汉', '西安']
const jobStatuses = [
  { value: 'open', label: '招聘中' },
  { value: 'closed', label: '已关闭' }
]

let currentFilter = {}

const initStatus = computed(() => route.query.status || '')

const hasFilter = computed(() => {
  return !!currentFilter.keyword || !!currentFilter.location || !!currentFilter.status
})

const currentFilterText = computed(() => {
  const parts = []
  if (currentFilter.keyword) parts.push(`关键词"${currentFilter.keyword}"`)
  if (currentFilter.location) parts.push(currentFilter.location)
  if (currentFilter.status) {
    const s = jobStatuses.find(x => x.value === currentFilter.status)
    if (s) parts.push(s.label)
  }
  return parts.join('，')
})

function formatSalary(min, max) {
  if (min >= 10000 && max >= 10000) return `${(min/10000).toFixed(1)}K-${(max/10000).toFixed(1)}K`
  return `${min}-${max}元/月`
}

function formatDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = (now - d) / 86400000
  if (diff < 1) return '今天'
  if (diff < 2) return '昨天'
  if (diff < 30) return `${Math.floor(diff)}天前`
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function truncateReq(text) {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  return cleaned.length > 60 ? cleaned.slice(0, 60) + '...' : cleaned
}

function openJob(id) {
  router.push(`/jobs/${id}`)
}

function resetFilter() {
  currentFilter = {}
  loadJobs()
}

function onReset() {
  currentFilter = {}
  if (toast) toast.info('筛选条件已重置')
}

function onFilter(filter) {
  currentFilter = filter
  loadJobs()
}

async function loadJobs() {
  loading.value = true
  try {
    const params = {}
    if (currentFilter.keyword) params.keyword = currentFilter.keyword
    if (currentFilter.location) params.location = currentFilter.location
    if (currentFilter.status) params.status = currentFilter.status
    else if (initStatus.value) params.status = initStatus.value
    jobs.value = await jobApi.list(params)
  } catch (e) {
    console.error('加载职位失败:', e)
    if (toast) toast.error('加载职位列表失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadJobs)
onActivated(loadJobs)
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

.link-btn {
  background: none;
  border: none;
  color: #e94560;
  cursor: pointer;
  font-size: inherit;
  text-decoration: underline;
  padding: 0;
  font-family: inherit;
}

.job-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

.job-card {
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.job-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  border-color: #ffccc7;
}

.job-card:hover .job-card-title {
  color: #e94560;
}

.job-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
  gap: 8px;
}

.job-card-title {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}

.job-card-company {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

.job-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.job-card-req {
  font-size: 12px;
  color: #999;
  line-height: 1.6;
  margin-bottom: 12px;
  padding: 6px 10px;
  background: #fafafa;
  border-radius: 4px;
  min-height: 20px;
}

.job-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
  margin-top: auto;
}

.job-card-time {
  font-size: 12px;
  color: #bbb;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}

.empty {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 12px;
  opacity: 0.4;
}

.empty-hint {
  font-size: 13px;
  color: #bbb;
  margin-top: 4px;
}
</style>
