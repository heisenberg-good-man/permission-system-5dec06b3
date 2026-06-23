<template>
  <div class="message-board">
    <div class="mb-header">
      <h4 class="mb-title">沟通消息</h4>
      <span class="mb-count">共 {{ messages.length }} 条</span>
    </div>

    <div class="message-list" ref="listEl">
      <div v-if="loading" class="mini-loading">加载消息中...</div>
      <div v-else-if="messages.length === 0" class="empty-msgs">
        <div class="empty-icon">💬</div>
        <p>暂无沟通消息</p>
        <p class="empty-hint">开始发送第一条消息吧</p>
      </div>
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-item"
        :class="msg.senderRole"
      >
        <div class="msg-header">
          <span class="msg-sender">{{ msg.senderName }}</span>
          <span class="msg-role" :class="`role-${msg.senderRole}`">
            {{ msg.senderRole === 'recruiter' ? '招聘方' : '应聘方' }}
          </span>
          <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
        </div>
        <div class="msg-content">{{ msg.content }}</div>
      </div>
    </div>

    <div class="message-input">
      <div class="role-toggle">
        <span class="role-label">发送身份:</span>
        <button
          :class="{ active: senderRole === 'recruiter' }"
          @click="senderRole = 'recruiter'"
        >招聘方</button>
        <button
          :class="{ active: senderRole === 'applicant' }"
          @click="senderRole = 'applicant'"
        >应聘方</button>
      </div>
      <div class="input-row">
        <textarea
          v-model="inputText"
          :placeholder="placeholder"
          rows="2"
          class="msg-textarea"
          @keyup.ctrl.enter.exact="send"
          @keyup.meta.enter.exact="send"
        />
        <div class="input-actions">
          <span v-if="inputError" class="input-error">{{ inputError }}</span>
          <button class="btn btn-primary btn-sm send-btn" @click="send" :disabled="sending">
            {{ sending ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>
      <div class="send-hint">提示：按 Ctrl + Enter 快速发送</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed, inject } from 'vue'
import { messageApi } from '../services/api'

const props = defineProps({
  applicationId: { type: String, required: true },
  defaultRole: { type: String, default: 'recruiter' }
})

const emit = defineEmits(['sent', 'error'])

const toast = inject('toast')

const messages = ref([])
const inputText = ref('')
const inputError = ref('')
const senderRole = ref(props.defaultRole)
const sending = ref(false)
const loading = ref(false)
const listEl = ref(null)

const placeholder = computed(() => {
  return senderRole.value === 'recruiter'
    ? '以招聘方身份回复候选人...'
    : '以应聘方身份询问招聘方...'
})

async function loadMessages() {
  loading.value = true
  try {
    messages.value = await messageApi.list(props.applicationId)
    await nextTick()
    scrollToBottom()
    emit('sent', { msg: null, total: messages.value.length })
  } catch (e) {
    console.error('加载消息失败:', e)
    if (toast) toast.warning('消息加载失败，请刷新重试')
    emit('error', e)
  } finally {
    loading.value = false
  }
}

function scrollToBottom() {
  if (listEl.value) {
    listEl.value.scrollTop = listEl.value.scrollHeight
  }
}

async function send() {
  inputError.value = ''
  const content = inputText.value.trim()
  if (!content) {
    inputError.value = '消息内容不能为空'
    if (toast) toast.warning('请输入消息内容')
    return
  }
  if (content.length > 1000) {
    inputError.value = '消息长度不能超过 1000 字'
    return
  }
  sending.value = true
  try {
    const senderName = senderRole.value === 'recruiter'
      ? (localStorage.getItem('recruiterName') || '招聘方HR')
      : (localStorage.getItem('lastApplicantName') || localStorage.getItem('applicantName') || '应聘者')
    const msg = await messageApi.create({
      applicationId: props.applicationId,
      senderRole: senderRole.value,
      senderName,
      content
    })
    messages.value.push(msg)
    inputText.value = ''
    await nextTick()
    scrollToBottom()
    if (toast) toast.success('消息发送成功')
    emit('sent', { msg, total: messages.value.length })
  } catch (e) {
    inputError.value = '发送失败: ' + e.message
    if (toast) toast.error('消息发送失败: ' + e.message)
    emit('error', e)
  } finally {
    sending.value = false
  }
}

function formatTime(ts) {
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (isToday) return `今天 ${timeStr}`
  return `${d.getMonth() + 1}/${d.getDate()} ${timeStr}`
}

onMounted(loadMessages)
watch(() => props.applicationId, () => { loadMessages() })
</script>

<style scoped>
.message-board {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.mb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.mb-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.mb-count {
  font-size: 12px;
  color: #999;
}

.message-list {
  max-height: 340px;
  overflow-y: auto;
  padding: 12px;
  background: #fafafa;
  flex: 1;
}

.mini-loading {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}

.empty-msgs {
  text-align: center;
  padding: 36px 16px;
  color: #bbb;
}

.empty-icon {
  font-size: 42px;
  opacity: 0.4;
  margin-bottom: 8px;
}

.empty-msgs p {
  margin: 2px 0;
  font-size: 13px;
}

.empty-hint {
  font-size: 12px;
  color: #ccc;
}

.message-item {
  margin-bottom: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.message-item.recruiter {
  border-left: 3px solid #1890ff;
}

.message-item.applicant {
  border-left: 3px solid #52c41a;
}

.msg-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.msg-sender {
  font-weight: 600;
  font-size: 13px;
  color: #333;
}

.msg-role {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
}

.role-recruiter {
  background: #e6f7ff;
  color: #1890ff;
}

.role-applicant {
  background: #f6ffed;
  color: #52c41a;
}

.msg-time {
  font-size: 11px;
  color: #bbb;
  margin-left: auto;
}

.msg-content {
  font-size: 14px;
  line-height: 1.7;
  color: #444;
  white-space: pre-wrap;
  word-break: break-all;
}

.message-input {
  padding: 12px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.role-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.role-label {
  font-size: 12px;
  color: #999;
}

.role-toggle button {
  padding: 3px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;
  color: #666;
}

.role-toggle button.active {
  background: #e94560;
  color: #fff;
  border-color: #e94560;
}

.input-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.msg-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  resize: vertical;
  min-height: 54px;
  font-family: inherit;
  transition: all 0.2s;
}

.msg-textarea:focus {
  outline: none;
  border-color: #e94560;
  box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.1);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.input-error {
  font-size: 12px;
  color: #f5222d;
}

.send-btn {
  align-self: flex-end;
}

.send-hint {
  margin-top: 6px;
  font-size: 11px;
  color: #ccc;
}
</style>
