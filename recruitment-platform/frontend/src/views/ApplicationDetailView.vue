<template>
  <div class="application-detail">
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary btn-sm" @click="$router.back()">← 返回</button>
        <h1>投递详情</h1>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <template v-else>
      <div class="detail-grid">
        <div class="detail-left">
          <div class="card">
            <div class="detail-header">
              <h2>{{ app.applicantName }}</h2>
              <span class="tag" :class="`status-${app.status}`">{{ statusLabel(app.status) }}</span>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">目标职位</span>
                <span class="info-value">{{ app.targetPosition }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">公司</span>
                <span class="info-value">{{ app.company }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联系方式</span>
                <span class="info-value">{{ app.contact }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">工作年限</span>
                <span class="info-value">{{ app.workYears }}年</span>
              </div>
            </div>

            <div class="detail-section">
              <h3>技能标签</h3>
              <div class="tags-row">
                <span v-for="tag in app.skillTags" :key="tag" class="tag tag-blue">{{ tag }}</span>
                <span v-if="app.skillTags.length === 0" class="no-data">未填写</span>
              </div>
            </div>

            <div class="detail-section">
              <h3>简历摘要</h3>
              <p class="resume-text">{{ app.resumeSummary || '未填写' }}</p>
            </div>

            <div class="detail-section">
              <h3>候选人状态切换</h3>
              <StatusSelector v-model="currentStatus" />
              <button class="btn btn-primary btn-sm" style="margin-top:10px" @click="updateStatus" :disabled="statusUpdating">
                {{ statusUpdating ? '更新中...' : '确认更新状态' }}
              </button>
              <div v-if="statusMsg" class="status-msg" :class="statusOk ? 'ok' : 'err'">{{ statusMsg }}</div>
            </div>
          </div>
        </div>

        <div class="detail-right">
          <div class="card">
            <h3 class="section-heading">沟通消息</h3>
            <MessageBoard :application-id="app.id" @sent="onMsgSent" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StatusSelector from '../components/StatusSelector.vue'
import MessageBoard from '../components/MessageBoard.vue'
import { applicationApi } from '../services/api'

const route = useRoute()
const app = ref({ skillTags: [] })
const loading = ref(true)
const currentStatus = ref('pending')
const statusUpdating = ref(false)
const statusMsg = ref('')
const statusOk = ref(true)

const statusLabels = {
  pending: '待筛选',
  contacted: '已沟通',
  interviewing: '面试中',
  rejected: '不合适'
}

function statusLabel(s) { return statusLabels[s] || s }

async function loadApp() {
  loading.value = true
  try {
    const data = await applicationApi.get(route.params.id)
    app.value = data
    currentStatus.value = data.status
  } catch (e) {
    console.error('加载投递详情失败:', e)
  } finally {
    loading.value = false
  }
}

async function updateStatus() {
  statusUpdating.value = true
  statusMsg.value = ''
  try {
    const updated = await applicationApi.updateStatus(route.params.id, currentStatus.value)
    app.value.status = updated.status
    statusOk.value = true
    statusMsg.value = `状态已更新为「${statusLabel(updated.status)}」`
  } catch (e) {
    statusOk.value = false
    statusMsg.value = '更新失败: ' + e.message
  } finally {
    statusUpdating.value = false
  }
}

function onMsgSent() {
}

onMounted(loadApp)
</script>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-header h2 {
  font-size: 20px;
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

.info-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
}

.detail-section {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f5f5f5;
}

.detail-section h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #555;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.no-data {
  color: #ccc;
  font-size: 13px;
}

.resume-text {
  font-size: 14px;
  line-height: 1.7;
  color: #555;
  white-space: pre-line;
}

.section-heading {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.status-msg {
  margin-top: 8px;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 4px;
}

.status-msg.ok {
  background: #f6ffed;
  color: #52c41a;
}

.status-msg.err {
  background: #fff1f0;
  color: #f5222d;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
