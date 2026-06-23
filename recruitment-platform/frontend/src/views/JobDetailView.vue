<template>
  <div class="job-detail">
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary btn-sm" @click="$router.back()">← 返回</button>
        <div>
          <h1 v-if="job">{{ job.title }}</h1>
          <h1 v-else>职位详情</h1>
        </div>
      </div>
      <div class="header-actions" v-if="job">
        <router-link v-if="canEdit" :to="`/jobs/${job.id}/edit`" class="btn btn-secondary btn-sm">✎ 编辑</router-link>
        <router-link
          v-if="canApply && job.status === 'open'"
          :to="`/apply/${job.id}`"
          class="btn btn-primary btn-sm"
        >
          投递简历
        </router-link>
        <span v-if="job.status === 'closed'" class="tag status-closed" style="margin-left:8px">🔒 已关闭</span>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="loadError" class="error-box card">
      <div class="empty-icon">⚠️</div>
      <p>加载失败：{{ loadError }}</p>
      <button class="btn btn-primary btn-sm" style="margin-top:12px" @click="loadData">重新加载</button>
    </div>
    <template v-else-if="job">
      <div class="detail-grid">
        <div class="card detail-main">
          <div class="detail-status-row">
            <span class="tag" :class="`status-${job.status}`">
              {{ job.status === 'open' ? '✅ 招聘中' : '🔒 已关闭' }}
            </span>
            <span class="detail-id">职位ID: {{ job.id }}</span>
          </div>

          <h2 class="detail-h2">{{ job.title }}</h2>
          <p class="detail-company">{{ job.company }}{{ job.department ? ' · ' + job.department : '' }}</p>

          <div class="detail-info-grid">
            <div class="info-item">
              <span class="info-label">📍 工作地点</span>
              <span class="info-value">{{ job.location || '未指定' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">💰 薪资范围</span>
              <span class="info-value salary" v-if="job.salaryMin && job.salaryMax">
                {{ formatSalary(job.salaryMin, job.salaryMax) }}
              </span>
              <span class="info-value" v-else>面议</span>
            </div>
            <div class="info-item">
              <span class="info-label">👥 招聘人数</span>
              <span class="info-value">{{ job.headcount || 1 }}人</span>
            </div>
            <div class="info-item">
              <span class="info-label">📅 发布时间</span>
              <span class="info-value">{{ formatDate(job.createdAt) }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h3>📋 岗位要求</h3>
            <div class="requirements" v-if="job.requirements">{{ job.requirements }}</div>
            <div class="empty-sm" v-else>暂无岗位要求描述</div>
          </div>

          <div class="detail-section quick-actions">
            <button class="btn btn-secondary btn-sm" @click="loadData">🔄 刷新</button>
            <router-link
              v-if="canApply && job.status === 'open'"
              :to="`/apply/${job.id}`"
              class="btn btn-primary btn-sm"
            >
              📝 我要投递
            </router-link>
            <button
              v-if="!canApply && job.status === 'open'"
              class="btn btn-secondary btn-sm"
              disabled
              title="请切换到应聘方视角投递"
            >
              🔒 请切换到应聘方视角投递
            </button>
          </div>
        </div>

        <div v-if="showSidebar" class="card detail-sidebar">
          <div class="app-section-head">
            <h3>📥 该职位投递</h3>
            <span class="app-badge" :class="appList.length ? 'has' : ''">{{ appList.length }} 份</span>
          </div>
          <div v-if="loadingApps" class="loading-sm">加载投递记录中...</div>
          <div v-else-if="appList.length === 0" class="empty-sm">
            <div class="empty-icon">📭</div>
            <p>暂无投递</p>
          </div>
          <div v-else class="app-list-wrap">
            <div
              v-for="app in appList"
              :key="app.id"
              class="app-item"
              :class="{ selected: selectedAppId === app.id }"
              @click="openApp(app.id)"
            >
              <div class="app-item-main">
                <span class="app-name">{{ app.applicantName }}</span>
                <span class="app-years">{{ app.workYears }}年经验</span>
              </div>
              <div class="app-item-bottom">
                <span class="tag" :class="`status-${app.status}`">{{ statusLabel(app.status) }}</span>
                <span class="app-time">{{ formatShortTime(app.createdAt) }}</span>
              </div>
              <div class="app-tags" v-if="app.skillTags && app.skillTags.length">
                <span v-for="tag in app.skillTags.slice(0, 3)" :key="tag" class="tag tag-blue">{{ tag }}</span>
              </div>
            </div>
          </div>

          <div class="status-summary">
            <h4>状态统计</h4>
            <div class="ss-grid">
              <div class="ss-item pending">
                <span class="ss-num">{{ countByStatus('pending') }}</span>
                <span class="ss-lab">待筛选</span>
              </div>
              <div class="ss-item contacted">
                <span class="ss-num">{{ countByStatus('contacted') }}</span>
                <span class="ss-lab">已沟通</span>
              </div>
              <div class="ss-item interviewing">
                <span class="ss-num">{{ countByStatus('interviewing') }}</span>
                <span class="ss-lab">面试中</span>
              </div>
              <div class="ss-item rejected">
                <span class="ss-num">{{ countByStatus('rejected') }}</span>
                <span class="ss-lab">不合适</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, inject, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jobApi, applicationApi } from '../services/api'

defineOptions({ name: 'JobDetailView' })

const route = useRoute()
const router = useRouter()
const toast = inject('toast')
const role = inject('role')

const isApplicant = computed(() => role?.isApplicant?.value || false)
const canEdit = computed(() => role?.canEditJob?.value || false)
const canApply = computed(() => role?.canApply?.value || false)
const showSidebar = computed(() => !isApplicant.value)

const job = ref(null)
const appList = ref([])
const loading = ref(false)
const loadingApps = ref(false)
const loadError = ref('')
const selectedAppId = ref('')

const statusLabels = {
  pending: '待筛选',
  contacted: '已沟通',
  interviewing: '面试中',
  rejected: '不合适'
}

function statusLabel(s) { return statusLabels[s] || s }
function formatSalary(min, max) {
  if (min >= 10000 && max >= 10000) return `${(min/10000).toFixed(1)}K-${(max/10000).toFixed(1)}K/月`
  return `${min}-${max}元/月`
}
function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function formatShortTime(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = (now - d) / 86400000
  if (diff < 1) {
    const h = Math.floor(diff * 24)
    if (h < 1) return '刚刚'
    return `${h}小时前`
  }
  if (diff < 7) return `${Math.floor(diff)}天前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function countByStatus(status) {
  return appList.value.filter(a => a.status === status).length
}

function openApp(id) {
  selectedAppId.value = id
  router.push(`/applications/${id}`)
}

async function loadApps() {
  loadingApps.value = true
  try {
    appList.value = await applicationApi.list({ jobId: route.params.id })
    appList.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (e) {
    console.error('加载投递列表失败:', e)
    if (toast) toast.warning('加载投递记录失败')
  } finally {
    loadingApps.value = false
  }
}

async function loadData() {
  loading.value = true
  loadError.value = ''
  try {
    const jobData = await jobApi.get(route.params.id)
    job.value = jobData
    await loadApps()
  } catch (e) {
    loadError.value = e.message
    if (toast) toast.error('加载职位详情失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
onActivated(loadData)
</script>

<style scoped>
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  font-size: 20px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
}

.detail-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.detail-id {
  font-size: 11px;
  color: #ccc;
  font-family: monospace;
}

.detail-h2 {
  font-size: 24px;
  margin-bottom: 4px;
  font-weight: 700;
}

.detail-company {
  color: #888;
  font-size: 14px;
  margin-bottom: 20px;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 18px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.info-item {
  padding: 6px 0;
}

.info-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.info-value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.info-value.salary {
  color: #e94560;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #1a1a2e;
}

.requirements {
  font-size: 14px;
  line-height: 1.9;
  color: #555;
  white-space: pre-line;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
}

.empty-sm {
  text-align: center;
  padding: 20px;
  color: #bbb;
  font-size: 13px;
}

.empty-sm .empty-icon {
  font-size: 32px;
  opacity: 0.4;
  margin-bottom: 6px;
}

.loading-sm {
  text-align: center;
  padding: 20px;
  color: #bbb;
  font-size: 13px;
}

.quick-actions {
  display: flex;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
}

.app-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
}

.app-section-head h3 {
  font-size: 15px;
  font-weight: 700;
}

.app-badge {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 12px;
  background: #f5f5f5;
  color: #999;
}

.app-badge.has {
  background: #e94560;
  color: #fff;
}

.app-list-wrap {
  max-height: 300px;
  overflow-y: auto;
  margin: 0 -10px;
  padding: 0 2px;
}

.app-item {
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  margin: 6px 0;
  cursor: pointer;
  transition: all 0.15s;
}

.app-item:hover {
  background: #fafafa;
  border-color: #f0f0f0;
}

.app-item.selected {
  background: #fff7e6;
  border-color: #ffd591;
}

.app-item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.app-name {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a2e;
}

.app-years {
  font-size: 12px;
  color: #999;
}

.app-item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.app-time {
  font-size: 11px;
  color: #bbb;
}

.app-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 4px;
}

.status-summary {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f5f5f5;
}

.status-summary h4 {
  font-size: 13px;
  font-weight: 600;
  color: #888;
  margin-bottom: 10px;
}

.ss-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.ss-item {
  text-align: center;
  padding: 8px;
  border-radius: 6px;
  background: #fafafa;
}

.ss-num {
  display: block;
  font-size: 18px;
  font-weight: 700;
}

.ss-lab {
  font-size: 11px;
  color: #888;
}

.ss-item.pending .ss-num { color: #d46b08; }
.ss-item.contacted .ss-num { color: #096dd9; }
.ss-item.interviewing .ss-num { color: #531dab; }
.ss-item.rejected .ss-num { color: #cf1322; }

.ss-item.pending { background: #fff7e6; }
.ss-item.contacted { background: #e6f7ff; }
.ss-item.interviewing { background: #f9f0ff; }
.ss-item.rejected { background: #fff1f0; }

.error-box {
  text-align: center;
  padding: 40px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #999;
  font-size: 14px;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
