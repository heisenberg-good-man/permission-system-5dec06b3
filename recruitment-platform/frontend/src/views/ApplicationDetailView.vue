<template>
  <div class="application-detail">
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary btn-sm" @click="$router.back()">← 返回列表</button>
        <h1>候选人详情</h1>
      </div>
      <div class="header-right" v-if="app.id">
        <span class="app-id-badge">投递编号 #{{ app.id }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <span>加载候选人信息中...</span>
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
                  <h2>{{ app.applicantName }}</h2>
                  <div class="sub-info">
                    <span class="target-pos">🎯 {{ app.targetPosition }}</span>
                    <span class="company">🏢 {{ app.company }}</span>
                    <span class="years">💼 {{ app.workYears }}年经验</span>
                  </div>
                </div>
              </div>
              <span class="tag status-tag-big" :class="`status-${app.status}`">
                {{ statusLabel(app.status) }}
              </span>
            </div>

            <div class="info-grid">
              <div class="info-item">
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
            </div>

            <div class="detail-section">
              <h3>🛠️ 技能标签</h3>
              <div class="tags-row">
                <span v-for="tag in app.skillTags" :key="tag" class="tag tag-blue">{{ tag }}</span>
                <span v-if="app.skillTags.length === 0" class="no-data">候选人未填写技能标签</span>
              </div>
            </div>

            <div class="detail-section">
              <h3>📄 简历摘要</h3>
              <p class="resume-text">{{ app.resumeSummary || '候选人未提供简历摘要' }}</p>
            </div>

            <div class="detail-section status-section">
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
              default-role="recruiter"
              @sent="onMsgSent"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onActivated, defineOptions, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import StatusSelector from '../components/StatusSelector.vue'
import MessageBoard from '../components/MessageBoard.vue'
import { applicationApi } from '../services/api'

defineOptions({ name: 'ApplicationDetailView' })

const route = useRoute()
const toast = inject('toast')
const markRefreshed = inject('markRefreshed', () => {})

const app = ref({ skillTags: [] })
const loading = ref(true)
const loadError = ref('')
const currentStatus = ref('pending')
const statusUpdating = ref(false)
const msgCount = ref(-1)

const statusLabels = {
  pending: '⏳ 待筛选',
  contacted: '💬 已沟通',
  interviewing: '🎯 面试中',
  rejected: '❌ 不合适'
}

function statusLabel(s) { return statusLabels[s] || s }

async function loadApp() {
  loading.value = true
  loadError.value = ''
  try {
    const data = await applicationApi.get(route.params.id)
    app.value = data
    currentStatus.value = data.status
    await nextTick()
    markRefreshed()
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
</style>
