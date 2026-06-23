<template>
  <div class="application-list">
    <div class="page-header">
      <div class="header-left">
        <h1>投递管理</h1>
        <span class="subtitle" v-if="!loading">共 {{ applications.length }} 条投递记录</span>
      </div>
      <div class="header-right">
        <button class="btn btn-secondary btn-sm" @click="refresh" :disabled="loading">
          <span v-if="loading">刷新中...</span>
          <span v-else>🔄 刷新</span>
        </button>
      </div>
    </div>

    <SearchFilter
      ref="filterRef"
      placeholder="搜索候选人姓名、岗位或技能..."
      :show-status="true"
      :statuses="appStatuses"
      :init-keyword="initKeyword"
      :init-status="initStatus"
      @filter="onFilter"
    />

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>加载投递记录中...</span>
    </div>

    <div v-else-if="loadError" class="error-box card">
      <p>⚠️ 加载投递记录失败：{{ loadError }}</p>
      <button class="btn btn-secondary btn-sm" @click="refresh">重新加载</button>
    </div>

    <div v-else-if="applications.length === 0" class="empty card">
      <div class="empty-icon">📭</div>
      <h3>暂无匹配的投递记录</h3>
      <p v-if="hasFilter">尝试调整筛选条件，或 <button class="link-btn" @click="clearFilter">清除筛选</button></p>
      <p v-else>发布职位后，候选人将在此处投递简历。</p>
    </div>

    <div v-else class="app-table-wrap card">
      <table class="app-table">
        <thead>
          <tr>
            <th>候选人</th>
            <th>目标职位</th>
            <th>公司</th>
            <th>工作年限</th>
            <th>技能标签</th>
            <th>状态</th>
            <th>投递时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applications" :key="app.id" class="app-row" @click="goDetail(app.id)">
            <td>
              <span class="applicant-name">{{ app.applicantName }}</span>
            </td>
            <td>{{ app.targetPosition }}</td>
            <td>{{ app.company }}</td>
            <td>{{ app.workYears }}年</td>
            <td @click.stop>
              <span v-for="tag in app.skillTags.slice(0, 3)" :key="tag" class="tag tag-blue">{{ tag }}</span>
              <span v-if="app.skillTags.length > 3" class="more-tags">+{{ app.skillTags.length - 3 }}</span>
              <span v-if="app.skillTags.length === 0" class="no-tags">—</span>
            </td>
            <td><span class="tag" :class="`status-${app.status}`">{{ statusLabel(app.status) }}</span></td>
            <td class="time-cell">{{ formatDate(app.createdAt) }}</td>
            <td @click.stop>
              <router-link :to="`/applications/${app.id}`" class="btn btn-primary btn-sm">查看详情</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onActivated, defineOptions, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchFilter from '../components/SearchFilter.vue'
import { applicationApi } from '../services/api'

defineOptions({ name: 'ApplicationListView' })

const route = useRoute()
const router = useRouter()
const toast = inject('toast')
const filterRef = ref(null)

const applications = ref([])
const loading = ref(true)
const loadError = ref('')
const markRefreshed = inject('markRefreshed', () => {})

const initKeyword = computed(() => route.query.keyword || '')
const initStatus = computed(() => route.query.status || '')
const hasFilter = computed(() => currentFilter.keyword || currentFilter.status)

const appStatuses = [
  { value: 'pending', label: '⏳ 待筛选' },
  { value: 'contacted', label: '💬 已沟通' },
  { value: 'interviewing', label: '🎯 面试中' },
  { value: 'rejected', label: '❌ 不合适' }
]

const statusLabels = {
  pending: '⏳ 待筛选',
  contacted: '💬 已沟通',
  interviewing: '🎯 面试中',
  rejected: '❌ 不合适'
}

function statusLabel(s) { return statusLabels[s] || s }

let currentFilter = {}

async function loadApplications() {
  loading.value = true
  loadError.value = ''
  try {
    const params = {}
    if (currentFilter.keyword) params.keyword = currentFilter.keyword
    if (currentFilter.status) params.status = currentFilter.status
    applications.value = await applicationApi.list(params)
  } catch (e) {
    loadError.value = e.message
    toast.error('加载投递列表失败：' + e.message)
  } finally {
    loading.value = false
    markRefreshed()
  }
}

function onFilter(filter) {
  currentFilter = filter
  if (!loading.value) {
    toast.info('已更新筛选条件')
  }
  loadApplications()
}

function clearFilter() {
  currentFilter = {}
  if (filterRef.value && typeof filterRef.value.resetAll === 'function') {
    filterRef.value.resetAll()
  }
  loadApplications()
}

function refresh() {
  toast.info('正在刷新数据...')
  loadApplications()
}

function goDetail(id) {
  router.push(`/applications/${id}`)
}

function formatDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 86400000
  const targetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (targetDay === today) return `今天 ${time}`
  if (targetDay === yesterday) return `昨天 ${time}`
  const diff = Math.floor((now - targetDay) / 86400000)
  if (diff < 7) return `${diff}天前`
  return `${d.getMonth() + 1}/${d.getDate()} ${time}`
}

onMounted(() => {
  currentFilter = {
    keyword: initKeyword.value,
    status: initStatus.value
  }
  loadApplications()
})
onActivated(loadApplications)
</script>

<style scoped>
.app-table-wrap {
  overflow-x: auto;
}

.app-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.app-table th,
.app-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
}

.app-table th {
  font-weight: 600;
  color: #666;
  font-size: 13px;
  background: #fafafa;
}

.app-row {
  cursor: pointer;
  transition: background 0.15s;
}

.app-row:hover {
  background: #f9fafb;
}

.app-row:hover .applicant-name {
  color: #c73653;
}

.applicant-name {
  font-weight: 500;
  color: #e94560;
}

.more-tags {
  font-size: 12px;
  color: #999;
}

.no-tags {
  color: #ccc;
  font-size: 13px;
}

.time-cell {
  color: #999;
  font-size: 13px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
}

.subtitle {
  font-size: 13px;
  color: #999;
}

.empty {
  text-align: center;
  padding: 50px 20px;
  color: #888;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty h3 {
  font-size: 16px;
  margin: 0 0 6px;
  color: #555;
}

.empty p {
  margin: 0;
  font-size: 13px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 50px;
  color: #888;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-top-color: #e94560;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff1f0;
  color: #f5222d;
}

.error-box p {
  margin: 0;
  font-size: 14px;
}

.link-btn {
  display: inline;
  padding: 0;
  border: none;
  background: none;
  color: #e94560;
  cursor: pointer;
  font-size: inherit;
  text-decoration: underline;
}

.link-btn:hover {
  color: #c73653;
}
</style>
