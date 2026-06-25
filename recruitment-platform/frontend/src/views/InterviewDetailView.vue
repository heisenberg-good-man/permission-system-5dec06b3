<template>
  <div class="interview-detail">
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary btn-sm" @click="$router.back()">← 返回列表</button>
        <h1>面试详情</h1>
      </div>
      <div class="header-right" v-if="itv.id">
        <span class="badge">面试编号 #{{ itv.id }}</span>
        <span class="tag" :class="statusClass(itv.status)">{{ itv.statusLabel }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading">加载面试详情中...</div>
    <div v-else-if="loadError" class="error-box card">
      <p>⚠️ 加载失败：{{ loadError }}</p>
      <button class="btn btn-secondary btn-sm" @click="loadData">重试</button>
    </div>
    <template v-else>
      <div class="detail-grid">
        <div class="detail-left">
          <div class="card">
            <div class="info-header">
              <div class="candidate">
                <div class="avatar">{{ itv.applicantName ? itv.applicantName.charAt(0) : '?' }}</div>
                <div>
                  <h2>{{ itv.applicantName }}</h2>
                  <p class="sub">{{ itv.jobTitle || itv.targetPosition }} · {{ itv.jobCompany }}</p>
                </div>
              </div>
              <div class="status-big" :class="statusClass(itv.status)">
                {{ itv.statusLabel }}
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">📅 面试时间</span>
                <span class="info-value highlight">{{ formatTime(itv.interviewTime) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">🎯 面试方式</span>
                <span class="info-value"><span class="tag tag-blue">{{ itv.interviewTypeLabel }}</span></span>
              </div>
              <div class="info-item">
                <span class="info-label">👤 面试官</span>
                <span class="info-value">{{ itv.interviewer }}</span>
              </div>
              <div class="info-item" v-if="itv.location">
                <span class="info-label">📍 地点</span>
                <span class="info-value">{{ itv.location }}</span>
              </div>
              <div class="info-item" v-if="itv.meetingLink">
                <span class="info-label">🔗 会议链接</span>
                <a class="info-value link" :href="itv.meetingLink" target="_blank">{{ itv.meetingLink }}</a>
              </div>
              <div class="info-item" v-if="itv.note">
                <span class="info-label">📝 备注</span>
                <p class="info-value note">{{ itv.note }}</p>
              </div>
            </div>

            <div v-if="!isApplicant && itv.status === 'scheduled' && !showFeedbackForm" class="detail-section">
              <div class="section-head">
                <h3>操作</h3>
              </div>
              <div class="action-row">
                <button class="btn btn-primary" @click="showFeedbackForm = true">📝 提交面试反馈</button>
                <button class="btn btn-danger" @click="onCancel">取消面试</button>
                <router-link :to="`/applications/${itv.applicationId}`" class="btn btn-secondary">查看候选人详情</router-link>
                <router-link :to="`/applications/${itv.applicationId}`" class="btn btn-secondary tag-msg">💬 沟通消息</router-link>
              </div>
            </div>
            <InterviewFeedbackForm
              v-if="!isApplicant && showFeedbackForm"
              :interview-id="itv.id"
              @cancel="showFeedbackForm = false"
              @success="onFeedbackSubmitted"
            />

            <div v-if="itv.feedbackResult" class="detail-section feedback-section">
              <h3>📋 面试反馈</h3>
              <div class="feedback-head">
                <span class="tag" :class="feedbackClass(itv.feedbackResult)">{{ itv.feedbackResultLabel }}</span>
                <span class="feedback-at">提交于 {{ formatTime(itv.feedbackAt) }}</span>
              </div>
              <p class="feedback-content">{{ itv.feedbackContent }}</p>
            </div>
          </div>
        </div>

        <div class="detail-right">
          <div class="card">
            <h3 class="section-title">关联投递摘要</h3>
            <div class="related-block">
              <div class="related-row">
                <span class="related-label">目标职位</span>
                <span>{{ itv.jobTitle || itv.targetPosition }}</span>
              </div>
              <div class="related-row">
                <span class="related-label">所属公司</span>
                <span>{{ itv.jobCompany }}</span>
              </div>
              <div class="related-row">
                <span class="related-label">候选人状态</span>
                <span class="tag" :class="`status-${itv.applicationStatus}`">
                  {{ statusLabels[itv.applicationStatus] || itv.applicationStatus }}
                </span>
              </div>
            </div>
            <router-link :to="`/applications/${itv.applicationId}`" class="btn btn-primary full">
              查看完整投递详情与沟通消息
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onActivated, defineOptions, computed } from 'vue'
import { useRoute } from 'vue-router'
import InterviewFeedbackForm from '../components/InterviewFeedbackForm.vue'
import { interviewApi } from '../services/api'
import { useNotifications } from '../composables/useNotifications'
import { useRole } from '../composables/useRole'

defineOptions({ name: 'InterviewDetailView' })

const route = useRoute()
const toast = inject('toast')
const role = useRole()
const notifications = useNotifications()

const isApplicant = computed(() => role.isApplicant?.value || false)

const statusLabels = {
  pending: '⏳ 待筛选',
  contacted: '💬 已沟通',
  interviewing: '🎯 面试中',
  rejected: '❌ 不合适'
}

const itv = ref({})
const loading = ref(true)
const loadError = ref('')
const showFeedbackForm = ref(false)

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

async function loadData() {
  loading.value = true
  loadError.value = ''
  try {
    itv.value = await interviewApi.get(route.params.id)
  } catch (e) {
    loadError.value = e.message
    toast.error('加载面试详情失败：' + e.message)
  } finally {
    loading.value = false
  }
}

function onFeedbackSubmitted() {
  showFeedbackForm.value = false
  loadData()
  notifications.refresh()
}

async function onCancel() {
  if (!confirm('确定取消该面试安排？')) return
  try {
    await interviewApi.cancel(route.params.id)
    toast.success('面试已取消')
    loadData()
    notifications.refresh()
  } catch (e) {
    toast.error('取消失败：' + e.message)
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
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.badge {
  background: #f5f5f5;
  color: #666;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 20px;
}
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}
.candidate {
  display: flex;
  gap: 14px;
  align-items: center;
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e94560, #ff758c);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}
.candidate h2 { font-size: 18px; margin: 0; }
.candidate .sub { font-size: 13px; color: #888; margin: 4px 0 0; }
.status-big {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid;
}
.status-big.status-contacted {
  background: #e6f7ff;
  color: #096dd9;
  border-color: #91d5ff;
}
.status-big.status-pending {
  background: #fff7e6;
  color: #d46b08;
  border-color: #ffd591;
}
.status-big.status-rejected {
  background: #fff1f0;
  color: #cf1322;
  border-color: #ffa39e;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
  margin-bottom: 8px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-item.full { grid-column: 1 / -1; }
.info-label { font-size: 12px; color: #999; }
.info-value { font-size: 14px; color: #333; }
.info-value.highlight {
  font-size: 16px;
  font-weight: 600;
  color: #e94560;
}
.info-value.note {
  background: #fafafa;
  padding: 10px 14px;
  border-radius: 6px;
  line-height: 1.6;
  margin: 0;
}
.info-value.link { color: #1890ff; text-decoration: none; word-break: break-all; }
.info-value.link:hover { text-decoration: underline; }

.detail-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.detail-section h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #555;
}
.section-head { margin-bottom: 10px; }
.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.btn.full { width: 100%; margin-top: 12px; }

.feedback-section {
  background: #fafbff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eef0f8;
}
.feedback-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.feedback-at {
  font-size: 12px;
  color: #999;
}
.feedback-content {
  margin: 0;
  background: #fff;
  padding: 12px;
  border-radius: 6px;
  line-height: 1.7;
  color: #444;
  font-size: 13px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 14px;
  color: #333;
}
.related-block {
  margin-bottom: 16px;
}
.related-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #f0f0f0;
  font-size: 13px;
}
.related-row:last-child { border-bottom: none; }
.related-label { color: #888; }

@media (max-width: 900px) {
  .detail-grid { grid-template-columns: 1fr; }
  .info-grid { grid-template-columns: 1fr; }
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
