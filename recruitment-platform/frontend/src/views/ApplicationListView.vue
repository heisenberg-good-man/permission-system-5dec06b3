<template>
  <div class="application-list">
    <div class="page-header">
      <h1>投递管理</h1>
    </div>

    <SearchFilter
      placeholder="搜索候选人姓名、岗位或技能..."
      :show-status="true"
      :statuses="appStatuses"
      @filter="onFilter"
    />

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="applications.length === 0" class="empty card">暂无匹配的投递记录</div>
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
          <tr v-for="app in applications" :key="app.id">
            <td>
              <span class="applicant-name" @click="$router.push(`/applications/${app.id}`)">{{ app.applicantName }}</span>
            </td>
            <td>{{ app.targetPosition }}</td>
            <td>{{ app.company }}</td>
            <td>{{ app.workYears }}年</td>
            <td>
              <span v-for="tag in app.skillTags.slice(0, 3)" :key="tag" class="tag tag-blue">{{ tag }}</span>
              <span v-if="app.skillTags.length > 3" class="more-tags">+{{ app.skillTags.length - 3 }}</span>
            </td>
            <td><span class="tag" :class="`status-${app.status}`">{{ statusLabel(app.status) }}</span></td>
            <td class="time-cell">{{ formatDate(app.createdAt) }}</td>
            <td>
              <router-link :to="`/applications/${app.id}`" class="btn btn-secondary btn-sm">查看</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SearchFilter from '../components/SearchFilter.vue'
import { applicationApi } from '../services/api'

const applications = ref([])
const loading = ref(true)

const appStatuses = [
  { value: 'pending', label: '待筛选' },
  { value: 'contacted', label: '已沟通' },
  { value: 'interviewing', label: '面试中' },
  { value: 'rejected', label: '不合适' }
]

const statusLabels = {
  pending: '待筛选',
  contacted: '已沟通',
  interviewing: '面试中',
  rejected: '不合适'
}

function statusLabel(s) { return statusLabels[s] || s }

let currentFilter = {}

async function loadApplications() {
  loading.value = true
  try {
    const params = {}
    if (currentFilter.keyword) params.keyword = currentFilter.keyword
    if (currentFilter.status) params.status = currentFilter.status
    applications.value = await applicationApi.list(params)
  } catch (e) {
    console.error('加载投递列表失败:', e)
  } finally {
    loading.value = false
  }
}

function onFilter(filter) {
  currentFilter = filter
  loadApplications()
}

function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(loadApplications)
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

.applicant-name {
  font-weight: 500;
  color: #e94560;
  cursor: pointer;
}

.applicant-name:hover {
  text-decoration: underline;
}

.more-tags {
  font-size: 12px;
  color: #999;
}

.time-cell {
  color: #999;
  font-size: 13px;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
