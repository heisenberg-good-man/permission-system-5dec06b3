<template>
  <div class="stats-bar">
    <div class="stat-card" @click="onJump('jobs')" title="点击查看所有职位">
      <div class="stat-icon" style="background:#e6f7ff;color:#1890ff;">📋</div>
      <div class="stat-info">
        <div class="stat-value">{{ displayStats.openPositions }}</div>
        <div class="stat-label">开放职位</div>
      </div>
    </div>
    <div class="stat-card" @click="onJump('apps')" title="点击查看今日投递">
      <div class="stat-icon" style="background:#fff7e6;color:#fa8c16;">📝</div>
      <div class="stat-info">
        <div class="stat-value pulse" v-if="displayStats.todayNewApplications > 0">{{ displayStats.todayNewApplications }}</div>
        <div class="stat-value" v-else>{{ displayStats.todayNewApplications }}</div>
        <div class="stat-label">今日新增投递</div>
      </div>
    </div>
    <div class="stat-card" @click="onJump('apps', 'pending')" title="点击筛选待筛选">
      <div class="stat-icon" style="background:#fff1f0;color:#f5222d;">⏳</div>
      <div class="stat-info">
        <div class="stat-value">{{ displayStats.pendingCandidates }}</div>
        <div class="stat-label">待筛选候选人</div>
      </div>
    </div>
    <div class="stat-card" @click="onJump('apps', 'contacted')" title="点击筛选已沟通">
      <div class="stat-icon" style="background:#f9f0ff;color:#722ed1;">💬</div>
      <div class="stat-info">
        <div class="stat-value">{{ displayStats.contactedCount }}</div>
        <div class="stat-label">已沟通人数</div>
      </div>
    </div>
    <div class="stat-card" @click="onJump('apps', 'interviewing')" title="点击筛选面试中">
      <div class="stat-icon" style="background:#f6ffed;color:#52c41a;">🎯</div>
      <div class="stat-info">
        <div class="stat-value">{{ displayStats.interviewingCount }}</div>
        <div class="stat-label">面试中</div>
      </div>
    </div>
    <div class="stat-card" @click="onJump('interviews', 'scheduled')" title="点击查看今日面试">
      <div class="stat-icon" style="background:#e6f7ff;color:#13c2c2;">📅</div>
      <div class="stat-info">
        <div class="stat-value">{{ displayStats.todayInterviews || 0 }}</div>
        <div class="stat-label">今日面试</div>
      </div>
    </div>
    <div class="stat-card" @click="onJump('interviews', 'scheduled')" title="点击查看待反馈面试">
      <div class="stat-icon" style="background:#fff7e6;color:#faad14;">📝</div>
      <div class="stat-info">
        <div class="stat-value pulse" v-if="(displayStats.pendingFeedbackInterviews || 0) > 0">{{ displayStats.pendingFeedbackInterviews }}</div>
        <div class="stat-value" v-else>{{ displayStats.pendingFeedbackInterviews || 0 }}</div>
        <div class="stat-label">待反馈面试</div>
      </div>
    </div>
    <div class="stat-card" @click="onJump('interviews', 'completed')" title="点击查看通过面试">
      <div class="stat-icon" style="background:#f6ffed;color:#52c41a;">✅</div>
      <div class="stat-info">
        <div class="stat-value">{{ displayStats.passedInterviews || 0 }}</div>
        <div class="stat-label">通过面试人数</div>
      </div>
    </div>
    <div class="stat-card" @click="onJump('notifications')" title="点击查看通知">
      <div class="stat-icon" style="background:#fff1f0;color:#ff4d4f;">🔔</div>
      <div class="stat-info">
        <div class="stat-value pulse" v-if="(displayStats.unreadNotifications || 0) > 0">{{ displayStats.unreadNotifications }}</div>
        <div class="stat-value" v-else>{{ displayStats.unreadNotifications || 0 }}</div>
        <div class="stat-label">未读通知</div>
      </div>
    </div>
    <div class="stat-card" @click="onJump('apps')" title="点击查看所有投递">
      <div class="stat-icon" style="background:#f5f5f5;color:#666;">📊</div>
      <div class="stat-info">
        <div class="stat-value">{{ displayStats.totalApplications }}</div>
        <div class="stat-label">总投递数</div>
      </div>
    </div>
  </div>
  <div v-if="loadError" class="stats-error">
    ⚠️ 统计数据加载失败，<span @click="loadStats" class="retry-link">点击重试</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, inject, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { statsApi } from '../services/api'

defineOptions({ name: 'StatsBar' })

const props = defineProps({
  stats: {
    type: Object,
    default: null
  }
})

const router = useRouter()
const toast = inject('toast')
const role = inject('role')
const markRefreshed = inject('markRefreshed', () => {})
const emit = defineEmits(['updated'])

const defaultStats = {
  openPositions: 0,
  todayNewApplications: 0,
  pendingCandidates: 0,
  contactedCount: 0,
  interviewingCount: 0,
  rejectedCount: 0,
  totalApplications: 0,
  statusBreakdown: {},
  todayInterviews: 0,
  pendingFeedbackInterviews: 0,
  passedInterviews: 0,
  unreadNotifications: 0,
  recentInterviews: []
}

const innerStats = ref({ ...defaultStats })
const loadError = ref(false)

const displayStats = computed(() => {
  if (props.stats && Object.keys(props.stats).length > 0) {
    return { ...defaultStats, ...props.stats }
  }
  return innerStats.value
})

function onJump(target, status) {
  if (target === 'jobs') {
    router.push('/jobs')
  } else if (target === 'apps') {
    router.push(status ? { path: '/applications', query: { status } } : '/applications')
  } else if (target === 'interviews') {
    router.push(status ? { path: '/interviews', query: { status } } : '/interviews')
  } else if (target === 'notifications') {
    router.push('/')
    nextTick(() => {
      const bell = document.querySelector('.notif-bell-btn')
      if (bell) bell.click()
    })
  }
}

async function loadStats(silent = false) {
  if (props.stats) return
  loadError.value = false
  try {
    const params = { role: role?.role?.value || 'manager' }
    if (role?.isApplicant?.value) {
      const name = localStorage.getItem('lastApplicantName')
      if (name) params.applicantName = name
    }
    innerStats.value = { ...defaultStats, ...(await statsApi.get(params)) }
    markRefreshed()
    emit('updated')
  } catch (e) {
    console.error('加载统计失败:', e)
    loadError.value = true
    if (!silent && toast) toast.error('统计数据加载失败')
  }
}

onMounted(() => loadStats())
onActivated(() => loadStats())

defineExpose({ loadStats, stats: innerStats })
</script>

<style scoped>
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #e94560;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  color: #1a1a2e;
}

.stat-value.pulse {
  animation: pulse 2s ease-in-out infinite;
  color: #e94560;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.stat-label {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
}

.stats-error {
  margin-bottom: 16px;
  padding: 10px 16px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  color: #d46b08;
  border-radius: 8px;
  font-size: 13px;
}

.retry-link {
  color: #e94560;
  text-decoration: underline;
  cursor: pointer;
}
</style>
