<template>
  <div class="application-detail">
    <div v-if="!canView" class="no-permission card">
      <div class="np-icon">🔒</div>
      <h3>无权限访问</h3>
      <p>该功能需要招聘方或招聘负责人权限。</p>
      <router-link to="/jobs" class="btn btn-primary">返回职位大厅</router-link>
    </div>
    <template v-else>
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary btn-sm" @click="$router.back()">← 返回列表</button>
        <h1>{{ isApplicant ? '我的投递详情' : '候选人详情' }}</h1>
      </div>
      <div class="header-right" v-if="app.id">
        <span class="app-id-badge">投递编号 #{{ app.id }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>加载投递信息中...</span>
    </div>

    <div v-else-if="loadError" class="error-box card">
      <p>⚠️ 加载投递详情失败：{{ loadError }}</p>
      <button class="btn btn-secondary btn-sm" @click="loadApp">重新加载</button>
    </div>

    <template v-else>
      <div class="detail-grid">
        <div class="detail-left">
          <div class="card">
            <div class="detail-header">
              <div class="candidate-main">
                <div class="avatar">{{ app.applicantName ? app.applicantName.charAt(0) : '?' }}</div>
                <div class="candidate-meta">
                  <h2>{{ isApplicant ? '投递记录' : app.applicantName }}</h2>
                  <div class="sub-info">
                    <span class="target-pos">🎯 {{ app.targetPosition }}</span>
                    <span class="company">🏢 {{ app.company }}</span>
                    <span v-if="!isApplicant" class="years">💼 {{ app.workYears }}年经验</span>
                  </div>
                </div>
              </div>
              <span class="tag status-tag-big" :class="`status-${app.status}`">
                {{ statusLabel(app.status) }}
              </span>
            </div>

            <div class="info-grid">
              <div class="info-item" v-if="!isApplicant">
                <span class="info-label">📞 联系方式</span>
                <span class="info-value contact-val">{{ app.contact }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📅 投递时间</span>
                <span class="info-value">{{ formatDate(app.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">🏷️ 目标职位</span>
                <span class="info-value">{{ app.targetPosition }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">🏢 所属公司</span>
                <span class="info-value">{{ app.company }}</span>
              </div>
              <div class="info-item" v-if="!isApplicant">
                <span class="info-label">💼 工作年限</span>
                <span class="info-value">{{ app.workYears }}年</span>
              </div>
            </div>

            <div class="detail-section" v-if="!isApplicant">
              <h3>🛠️ 技能标签</h3>
              <div class="tags-row">
                <span v-for="tag in app.skillTags" :key="tag" class="tag tag-blue">{{ tag }}</span>
                <span v-if="app.skillTags.length === 0" class="no-data">候选人未填写技能标签</span>
              </div>
            </div>

            <div class="detail-section" v-if="!isApplicant">
              <h3>📄 简历摘要</h3>
              <p class="resume-text">{{ app.resumeSummary || '候选人未提供简历摘要' }}</p>
            </div>

            <div v-if="!isApplicant" class="detail-section status-section">
              <h3>🔄 候选人状态流转</h3>
              <p class="section-desc">点击下方按钮选择目标状态，然后点击「确认更新」完成流转</p>
              <StatusSelector
                v-model="currentStatus"
                :show-tip="true"
                :show-arrow="true"
              />
              <div class="status-actions">
                <span v-if="currentStatus !== app.status" class="pending-hint">
                  ⚠️ 已选择：<b>{{ statusLabel(currentStatus) }}</b>，当前为：{{ statusLabel(app.status) }}
                </span>
                <button
                  class="btn btn-primary"
                  @click="updateStatus"
                  :disabled="statusUpdating || currentStatus === app.status"
                >
                  <span v-if="statusUpdating">更新中...</span>
                  <span v-else>确认更新状态</span>
                </button>
              </div>
            </div>

            <div v-if="!isApplicant" class="detail-section interview-section">
              <div class="section-head">
                <h3>📅 面试安排</h3>
                <div class="section-actions">
                  <button
                    v-if="canScheduleInterview && !showInterviewForm"
                    class="btn btn-primary btn-sm"
                    :disabled="!['contacted', 'interviewing'].includes(app.status)"
                    @click="showInterviewForm = true"
                  >
                    + 安排面试
                  </button>
                  <span v-if="!['contacted', 'interviewing'].includes(app.status)" class="hint-text">
                    候选人需为「已沟通」或「面试中」状态
                  </span>
                </div>
              </div>

              <InterviewForm
                v-if="showInterviewForm"
                :application-id="app.id"
                :application-summary="{ applicantName: app.applicantName, targetPosition: app.targetPosition }"
                @cancel="showInterviewForm = false"
                @success="onInterviewScheduled"
              />

              <div v-if="interviewsLoading" class="interviews-loading">加载面试记录中...</div>
              <div v-else-if="interviews.length === 0 && !showInterviewForm" class="empty-sm">
                暂无面试记录
              </div>
              <div v-else class="interview-list">
                <div v-for="itv in interviews" :key="itv.id" class="interview-item" :class="`itv-${itv.status}`">
                  <div class="itv-head">
                    <span class="itv-time">📅 {{ formatInterviewTime(itv.interviewTime) }}</span>
                    <span class="tag" :class="`status-${itv.status}`">{{ itv.statusLabel }}</span>
                  </div>
                  <div class="itv-body">
                    <div class="itv-row">
                      <span class="itv-label">方式</span>
                      <span>{{ itv.interviewTypeLabel }}</span>
                    </div>
                    <div class="itv-row">
                      <span class="itv-label">面试官</span>
                      <span>{{ itv.interviewer }}</span>
                    </div>
                    <div class="itv-row" v-if="itv.location">
                      <span class="itv-label">地点</span>
                      <span>{{ itv.location }}</span>
                    </div>
                    <div class="itv-row" v-if="itv.meetingLink">
                      <span class="itv-label">会议链接</span>
                      <a :href="itv.meetingLink" target="_blank" class="link">{{ itv.meetingLink }}</a>
                    </div>
                    <div class="itv-row" v-if="itv.note">
                      <span class="itv-label">备注</span>
                      <span class="itv-note">{{ itv.note }}</span>
                    </div>
                    <div class="itv-row" v-if="itv.feedbackResult">
                      <span class="itv-label">反馈结果</span>
                      <span class="tag" :class="feedbackClass(itv.feedbackResult)">{{ itv.feedbackResultLabel }}</span>
                    </div>
                    <div class="itv-row" v-if="itv.feedbackContent">
                      <span class="itv-label">反馈内容</span>
                      <p class="feedback-text">{{ itv.feedbackContent }}</p>
                    </div>
                  </div>
                  <div class="itv-actions" v-if="!isApplicant && itv.status === 'scheduled'">
                    <button
                      v-if="!showFeedbackForm || feedbackTargetId !== itv.id"
                      class="btn btn-primary btn-sm"
                      @click="openFeedback(itv.id)"
                    >
                      📝 提交反馈
                    </button>
                    <button
                      class="btn btn-secondary btn-sm"
                      @click="cancelInterview(itv.id)"
                    >
                      取消面试
                    </button>
                  </div>
                  <InterviewFeedbackForm
                    v-if="showFeedbackForm && feedbackTargetId === itv.id"
                    :interview-id="itv.id"
                    @cancel="closeFeedback"
                    @success="onFeedbackSubmitted"
                  />
                </div>
              </div>
            </div>

            <div v-else-if="isApplicant && interviews.length > 0" class="detail-section interview-section">
              <div class="section-head">
                <h3>📅 我的面试</h3>
              </div>
              <div class="interview-list">
                <div v-for="itv in interviews" :key="itv.id" class="interview-item" :class="`itv-${itv.status}`">
                  <div class="itv-head">
                    <span class="itv-time">📅 {{ formatInterviewTime(itv.interviewTime) }}</span>
                    <span class="tag" :class="`status-${itv.status}`">{{ itv.statusLabel }}</span>
                  </div>
                  <div class="itv-body">
                    <div class="itv-row">
                      <span class="itv-label">方式</span>
                      <span>{{ itv.interviewTypeLabel }}</span>
                    </div>
                    <div class="itv-row">
                      <span class="itv-label">面试官</span>
                      <span>{{ itv.interviewer }}</span>
                    </div>
                    <div class="itv-row" v-if="itv.location">
                      <span class="itv-label">地点</span>
                      <span>{{ itv.location }}</span>
                    </div>
                    <div class="itv-row" v-if="itv.meetingLink">
                      <span class="itv-label">会议链接</span>
                      <a :href="itv.meetingLink" target="_blank" class="link">{{ itv.meetingLink }}</a>
                    </div>
                    <div class="itv-row" v-if="itv.note">
                      <span class="itv-label">备注</span>
                      <span class="itv-note">{{ itv.note }}</span>
                    </div>
                    <div class="itv-row" v-if="itv.feedbackResult">
                      <span class="itv-label">反馈结果</span>
                      <span class="tag" :class="feedbackClass(itv.feedbackResult)">{{ itv.feedbackResultLabel }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="detail-section status-section">
              <h3>📌 状态说明</h3>
              <p class="section-desc">当前处理进度由招聘方更新，您可随时在此查看</p>
              <div class="status-timeline">
                <div
                  v-for="(item, idx) in statusTimeline"
                  :key="item.value"
                  class="tl-item"
                  :class="{ active: isStatusActive(item.value), done: isStatusDone(item.value) }"
                >
                  <div class="tl-dot">{{ item.icon }}</div>
                  <div class="tl-content">
                    <div class="tl-label">{{ item.label }}</div>
                    <div class="tl-desc">{{ item.desc }}</div>
                  </div>
                  <div v-if="idx < statusTimeline.length - 1" class="tl-line"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-right">
          <div class="card message-card">
            <div class="msg-header">
              <h3 class="section-heading">💬 沟通消息</h3>
              <span class="msg-count" v-if="msgCount >= 0">共 {{ msgCount }} 条</span>
            </div>
            <MessageBoard
              :application-id="app.id"
              :default-role="isApplicant ? 'applicant' : 'recruiter'"
              @sent="onMsgSent"
            />
          </div>
        </div>
      </div>
    </template>
    </template>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onActivated, defineOptions, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import StatusSelector from '../components/StatusSelector.vue'
import MessageBoard from '../components/MessageBoard.vue'
import InterviewForm from '../components/InterviewForm.vue'
import InterviewFeedbackForm from '../components/InterviewFeedbackForm.vue'
import { applicationApi, interviewApi } from '../services/api'
import { useNotifications } from '../composables/useNotifications'
import { useRole } from '../composables/useRole'

defineOptions({ name: 'ApplicationDetailView' })

const route = useRoute()
const toast = inject('toast')
const role = useRole()
const markRefreshed = inject('markRefreshed', () => {})
const notifications = useNotifications()

const isApplicant = computed(() => role.isApplicant?.value || false)
const canView = computed(() =>
  role.canViewApplications?.value ||
  isApplicant.value ||
  false
)
const canScheduleInterview = computed(() => role.canScheduleInterview?.value || false)

const app = ref({ skillTags: [] })
const loading = ref(true)
const loadError = ref('')
const currentStatus = ref('pending')
const statusUpdating = ref(false)
const msgCount = ref(-1)

const showInterviewForm = ref(false)
const showFeedbackForm = ref(false)
const feedbackTargetId = ref('')
const interviews = ref([])
const interviewsLoading = ref(false)

const statusLabels = {
  pending: '⏳ 待筛选',
  contacted: '💬 已沟通',
  interviewing: '🎯 面试中',
  rejected: '❌ 不合适'
}

const statusTimeline = [
  { value: 'pending', icon: '⏳', label: '待筛选', desc: '简历已提交，等待招聘方初步筛选' },
  { value: 'contacted', icon: '💬', label: '已沟通', desc: '招聘方已联系您，正在初步沟通' },
  { value: 'interviewing', icon: '🎯', label: '面试中', desc: '您已进入面试阶段，请按时参加' },
  { value: 'rejected', icon: '❌', label: '不合适', desc: '很遗憾，本次未通过评估，感谢参与' }
]

const statusOrder = ['pending', 'contacted', 'interviewing', 'rejected']

function statusLabel(s) { return statusLabels[s] || s }
function isStatusActive(s) { return app.value.status === s }
function isStatusDone(s) {
  const curIdx = statusOrder.indexOf(app.value.status)
  const sIdx = statusOrder.indexOf(s)
  return sIdx < curIdx
}

function feedbackClass(r) {
  if (r === 'pass') return 'status-pending'
  if (r === 'pending') return 'status-contacted'
  if (r === 'fail') return 'status-rejected'
  return 'tag-blue'
}

function formatInterviewTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function loadInterviews() {
  if (!route.params.id) return
  interviewsLoading.value = true
  try {
    const list = await interviewApi.list({ applicationId: route.params.id })
    interviews.value = list
  } catch (e) {
    console.warn('加载面试记录失败:', e.message)
  } finally {
    interviewsLoading.value = false
  }
}

function onInterviewScheduled() {
  showInterviewForm.value = false
  loadApp()
  loadInterviews()
  notifications.refresh()
}

function openFeedback(id) {
  feedbackTargetId.value = id
  showFeedbackForm.value = true
}
function closeFeedback() {
  showFeedbackForm.value = false
  feedbackTargetId.value = ''
}

function onFeedbackSubmitted() {
  closeFeedback()
  loadApp()
  loadInterviews()
  notifications.refresh()
}

async function cancelInterview(id) {
  if (!confirm('确定取消该面试安排？')) return
  try {
    await interviewApi.cancel(id)
    toast.success('面试已取消')
    loadInterviews()
    notifications.refresh()
  } catch (e) {
    toast.error('取消失败：' + e.message)
  }
}

async function loadApp() {
  loading.value = true
  loadError.value = ''
  try {
    const data = await applicationApi.get(route.params.id)
    app.value = data
    currentStatus.value = data.status
    await nextTick()
    markRefreshed()
    loadInterviews()
  } catch (e) {
    loadError.value = e.message
    toast.error('加载候选人详情失败：' + e.message)
  } finally {
    loading.value = false
  }
}

async function updateStatus() {
  if (currentStatus.value === app.value.status) {
    toast.info('状态未发生变化')
    return
  }

  statusUpdating.value = true
  const oldStatus = app.value.status
  try {
    const updated = await applicationApi.updateStatus(route.params.id, currentStatus.value)
    app.value.status = updated.status
    currentStatus.value = updated.status
    msgCount.value = -1
    toast.success(`状态已更新：${statusLabel(oldStatus)} → ${statusLabel(updated.status)}`)
    markRefreshed()
  } catch (e) {
    currentStatus.value = app.value.status
    toast.error('状态更新失败：' + e.message)
  } finally {
    statusUpdating.value = false
  }
}

function onMsgSent(payload) {
  if (payload && typeof payload.total === 'number') {
    msgCount.value = payload.total
  } else if (msgCount.value >= 0) {
    msgCount.value += 1
  }
  if (payload && payload.msg) {
    toast.success('消息发送成功')
  }
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
  if (diff < 7) return `${diff}天前 ${time}`
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${time}`
}

watch(
  () => route.params.id,
  (newId) => {
    if (newId && app.value.id && String(newId) !== String(app.value.id)) {
      loadApp()
    }
  }
)

onMounted(loadApp)
onActivated(loadApp)
</script>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
}

.app-id-badge {
  font-size: 12px;
  padding: 4px 10px;
  background: #f5f5f5;
  border-radius: 12px;
  color: #888;
  font-family: monospace;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.candidate-main {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e94560, #ff6b81);
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.candidate-meta h2 {
  font-size: 22px;
  margin: 0 0 6px;
  color: #222;
}

.sub-info {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 13px;
  color: #888;
}

.contact-val {
  font-family: 'Consolas', 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.status-tag-big {
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  padding: 14px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #999;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.detail-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
}

.detail-section:first-of-type {
  border-top: none;
}

.detail-section h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 10px;
  color: #555;
}

.section-desc {
  font-size: 12px;
  color: #999;
  margin: -4px 0 12px;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.no-data {
  color: #ccc;
  font-size: 13px;
  font-style: italic;
}

.resume-text {
  font-size: 14px;
  line-height: 1.8;
  color: #555;
  white-space: pre-line;
  padding: 12px 14px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 3px solid #e94560;
  margin: 0;
}

.status-section {
  background: #fafbff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  border: 1px solid #eef0f8;
}

.status-actions {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pending-hint {
  font-size: 13px;
  color: #e67e22;
  background: #fff8e6;
  padding: 6px 12px;
  border-radius: 6px;
  flex: 1;
}

.message-card {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  min-height: 600px;
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-heading {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.msg-count {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 3px 10px;
  border-radius: 10px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px;
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

@media (max-width: 1000px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .message-card {
    height: 560px;
    min-height: auto;
  }
}

.status-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.tl-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  padding-bottom: 16px;
}

.tl-item:last-child {
  padding-bottom: 0;
}

.tl-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.tl-item.active .tl-dot {
  background: #fff0f3;
  border-color: #e94560;
  transform: scale(1.05);
}

.tl-item.done .tl-dot {
  background: #e8f5e9;
  border-color: #4caf50;
  opacity: 0.7;
}

.tl-content {
  flex: 1;
  padding-top: 4px;
}

.tl-label {
  font-size: 14px;
  font-weight: 600;
  color: #999;
  margin-bottom: 2px;
}

.tl-item.active .tl-label {
  color: #e94560;
}

.tl-item.done .tl-label {
  color: #4caf50;
}

.tl-desc {
  font-size: 12px;
  color: #aaa;
  line-height: 1.5;
}

.tl-item.active .tl-desc {
  color: #666;
}

.tl-line {
  position: absolute;
  left: 17px;
  top: 40px;
  width: 2px;
  height: calc(100% - 30px);
  background: #e0e0e0;
}

.tl-item.done .tl-line {
  background: #a5d6a7;
}

.no-permission {
  text-align: center;
  padding: 60px 20px;
  max-width: 480px;
  margin: 40px auto;
}

.no-permission .np-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-permission h3 {
  font-size: 20px;
  margin: 0 0 10px;
  color: #333;
}

.no-permission p {
  font-size: 14px;
  color: #888;
  margin: 0 0 20px;
}

.no-permission .btn {
  display: block;
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
}

.interview-section {
  background: #fafbff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  border: 1px solid #eef0f8;
}
.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-head h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #555;
}
.section-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hint-text {
  font-size: 12px;
  color: #aaa;
}
.interviews-loading,
.empty-sm {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}
.empty-sm {
  background: #fff;
  border-radius: 6px;
  border: 1px dashed #e0e0e0;
}
.interview-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}
.interview-item {
  background: #fff;
  border-radius: 8px;
  padding: 14px;
  border: 1px solid #eef0f8;
  transition: all 0.2s;
}
.interview-item.itv-completed {
  border-color: #d9f7be;
  background: #fcffe6;
}
.interview-item.itv-cancelled {
  border-color: #ffd6d6;
  background: #fff7f7;
  opacity: 0.75;
}
.itv-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}
.itv-time {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a2e;
}
.itv-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.itv-row {
  display: flex;
  gap: 10px;
  font-size: 13px;
  align-items: flex-start;
}
.itv-label {
  width: 70px;
  flex-shrink: 0;
  color: #888;
}
.itv-note {
  color: #666;
  line-height: 1.5;
}
.feedback-text {
  margin: 0;
  background: #fafafa;
  padding: 8px 12px;
  border-radius: 4px;
  line-height: 1.6;
  color: #444;
  font-size: 12px;
  flex: 1;
}
.link {
  color: #1890ff;
  text-decoration: none;
  word-break: break-all;
}
.link:hover { text-decoration: underline; }
.itv-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed #eef0f8;
}
</style>
