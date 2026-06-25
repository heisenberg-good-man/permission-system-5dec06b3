<template>
  <div class="interview-list">
    <div v-if="!canView" class="no-permission card">
      <div class="np-icon">🔒</div>
      <h3>无权限访问</h3>
      <p>该功能需要招聘方或招聘负责人权限。</p>
      <button class="btn btn-secondary" @click="switchToRecruiter">切换到招聘方</button>
    </div>
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <h1>{{ isApplicant ? '我的面试' : '面试安排' }}</h1>
          <span class="subtitle" v-if="!loading">共 {{ interviews.length }} 条记录</span>
        </div>
        <div class="header-right">
          <button class="btn btn-secondary btn-sm" @click="loadData" :disabled="loading">
            <span v-if="loading">加载中...</span>
            <span v-else>🔄 刷新</span>
          </button>
        </div>
      </div>

      <div class="card filter-bar">
        <div class="filter-row">
          <div class="filter-item">
            <label>搜索候选人</label>
            <input
              type="text"
              v-model="filters.keyword"
              placeholder="搜索候选人姓名..."
              @keyup.enter="loadData"
            />
          </div>
          <div class="filter-item" v-if="!isApplicant">
            <label>面试状态</label>
            <select v-model="filters.status" @change="loadData">
              <option value="">全部状态</option>
              <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div class="filter-item">
            <label>面试方式</label>
            <select v-model="filters.interviewType" @change="loadData">
              <option value="">全部方式</option>
              <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div class="filter-item">
            <button class="btn btn-secondary btn-sm" @click="resetFilter">重置</button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading">加载面试记录中...</div>
      <div v-else-if="loadError" class="error-box card">
        <p>⚠️ 加载失败：{{ loadError }}</p>
        <button class="btn btn-secondary btn-sm" @click="loadData">重试</button>
      </div>
      <div v-else-if="interviews.length === 0" class="empty card">
        <div class="empty-icon">📅</div>
        <h3>暂无面试记录</h3>
        <p v-if="hasFilter">尝试调整筛选条件，或 <button class="link-btn" @click="resetFilter">清除筛选</button></p>
        <p v-else-if="isApplicant">您目前还没有面试安排</p>
        <p v-else>可在候选人详情中为「已沟通」或「面试中」的候选人安排面试</p>
      </div>
      <div v-else class="itv-table-wrap card">
        <table class="itv-table">
          <thead>
            <tr>
              <th v-if="!isApplicant">候选人</th>
              <th>目标职位</th>
              <th>面试时间</th>
              <th>方式</th>
              <th>面试官</th>
              <th>状态</th>
              <th>反馈结果</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="itv in interviews" :key="itv.id" class="itv-row" @click="goDetail(itv.id)">
              <td v-if="!isApplicant"><span class="applicant">{{ itv.applicantName }}</span></td>
              <td>{{ itv.jobTitle || itv.targetPosition }}</td>
              <td class="time-cell">{{ formatTime(itv.interviewTime) }}</td>
              <td><span class="tag tag-blue">{{ itv.interviewTypeLabel }}</span></td>
              <td>{{ itv.interviewer }}</td>
              <td><span class="tag" :class="statusClass(itv.status)">{{ itv.statusLabel }}</span></td>
              <td>
                <span v-if="itv.feedbackResult" class="tag" :class="feedbackClass(itv.feedbackResult)">
                  {{ itv.feedbackResultLabel }}
                </span>
                <span v-else class="no-feedback">—</span>
              </td>
              <td @click.stop>
                <router-link :to="`/interviews/${itv.id}`" class="btn btn-primary btn-sm">查看详情</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onActivated, defineOptions, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { interviewApi } from '../services/api'
import { useRole } from '../composables/useRole'

defineOptions({ name: 'InterviewListView' })

const router = useRouter()
const toast = inject('toast')
const role = useRole()

const isApplicant = computed(() => role.isApplicant?.value || false)
const canView = computed(() =>
  role.canViewInterviews?.value ||
  isApplicant.value ||
  false
)

function switchToRecruiter() {
  role.switchToRecruiter?.()
  toast?.success?.('已切换到招聘方视角')
}

const statusOptions = [
  { value: 'scheduled', label: '已安排' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]
const typeOptions = [
  { value: 'onsite', label: '现场面试' },
  { value: 'video', label: '视频面试' },
  { value: 'phone', label: '电话面试' }
]

const filters = reactive({ keyword: '', status: '', interviewType: '' })
const hasFilter = computed(() => filters.keyword || filters.status || filters.interviewType)

const interviews = ref([])
const loading = ref(true)
const loadError = ref('')

function statusClass(s) {
  if (s === 'scheduled') return 'status-contacted'
  if (s === 'completed') return 'status-pending'
  if (s === 'cancelled') return 'status-rejected'
  return 'tag-blue'
}
function feedbackClass(r) {
  if (r === 'pass') return 'status-pending'
  if (r === 'pending') return 'status-contacted'
  if (r === 'fail') return 'status-rejected'
  return 'tag-blue'
}
function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function goDetail(id) { router.push(`/interviews/${id}`) }

async function loadData() {
  loading.value = true
  loadError.value = ''
  try {
    const params = {}
    if (filters.keyword) params.applicantName = filters.keyword
    if (filters.status) params.status = filters.status
    if (filters.interviewType) params.interviewType = filters.interviewType
    if (isApplicant.value) {
      try {
        const name = localStorage.getItem('lastApplicantName')
        if (name) params.applicantName = name
      } catch (e) {}
    }
    interviews.value = await interviewApi.list(params)
  } catch (e) {
    loadError.value = e.message
    toast.error('加载面试列表失败：' + e.message)
  } finally {
    loading.value = false
  }
}

function resetFilter() {
  filters.keyword = ''
  filters.status = ''
  filters.interviewType = ''
  loadData()
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
.header-right {
  display: flex;
  gap: 8px;
}
.subtitle {
  font-size: 13px;
  color: #888;
}
.filter-bar { padding: 14px 20px; margin-bottom: 16px; }
.filter-row {
  display: flex;
  gap: 14px;
  align-items: flex-end;
  flex-wrap: wrap;
}
.filter-item { display: flex; flex-direction: column; gap: 4px; }
.filter-item label {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}
.filter-item input,
.filter-item select {
  min-width: 160px;
  padding: 7px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
}
.itv-table-wrap { padding: 0; overflow: hidden; }
.itv-table {
  width: 100%;
  border-collapse: collapse;
}
.itv-table th,
.itv-table td {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
}
.itv-table th {
  background: #fafafa;
  font-weight: 600;
  color: #666;
  font-size: 12px;
}
.itv-row { cursor: pointer; transition: background 0.15s; }
.itv-row:hover { background: #fafbff; }
.applicant { font-weight: 600; color: #1a1a2e; }
.time-cell { font-variant-numeric: tabular-nums; color: #555; }
.no-feedback { color: #ccc; }

.no-permission {
  text-align: center;
  padding: 60px 20px;
  max-width: 480px;
  margin: 40px auto;
}
.no-permission .np-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.6; }
.no-permission h3 { font-size: 20px; margin: 0 0 10px; color: #333; }
.no-permission p { font-size: 14px; color: #888; margin: 0 0 20px; }
.no-permission .btn { display: block; width: 100%; max-width: 240px; margin: 0 auto; }

.empty h3 { font-size: 16px; color: #666; margin: 0 0 8px; }
.empty .empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }
.empty p { color: #999; margin: 0; }
.link-btn {
  background: none;
  border: none;
  color: #e94560;
  cursor: pointer;
  font-size: inherit;
  text-decoration: underline;
  padding: 0;
}
.error-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff1f0;
  color: #f5222d;
}
.error-box p { margin: 0; font-size: 14px; }
</style>
