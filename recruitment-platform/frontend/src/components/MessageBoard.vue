<template>
  <div class="message-board">
    <div class="message-list" ref="listEl">
      <div v-if="messages.length === 0" class="empty-msg">暂无消息</div>
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
        <input
          v-model="inputText"
          placeholder="输入消息..."
          @keyup.enter="send"
        />
        <button class="btn btn-primary btn-sm" @click="send">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { messageApi } from '../services/api'

const props = defineProps({
  applicationId: { type: String, required: true }
})

const emit = defineEmits(['sent'])

const messages = ref([])
const inputText = ref('')
const senderRole = ref('recruiter')
const listEl = ref(null)

async function loadMessages() {
  try {
    messages.value = await messageApi.list(props.applicationId)
    await nextTick()
    scrollToBottom()
  } catch (e) {
    console.error('加载消息失败:', e)
  }
}

function scrollToBottom() {
  if (listEl.value) {
    listEl.value.scrollTop = listEl.value.scrollHeight
  }
}

async function send() {
  const content = inputText.value.trim()
  if (!content) return
  try {
    await messageApi.create({
      applicationId: props.applicationId,
      senderRole: senderRole.value,
      senderName: senderRole.value === 'recruiter' ? '招聘方' : '应聘方',
      content
    })
    inputText.value = ''
    await loadMessages()
    emit('sent')
  } catch (e) {
    console.error('发送消息失败:', e)
  }
}

function formatTime(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(loadMessages)

watch(() => props.applicationId, () => { loadMessages() })
</script>

<style scoped>
.message-board {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.message-list {
  max-height: 320px;
  overflow-y: auto;
  padding: 16px;
  background: #fafafa;
}

.empty-msg {
  text-align: center;
  color: #bbb;
  padding: 24px;
  font-size: 14px;
}

.message-item {
  margin-bottom: 12px;
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
  gap: 8px;
  margin-bottom: 6px;
}

.msg-sender {
  font-weight: 600;
  font-size: 13px;
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
  font-size: 12px;
  color: #bbb;
  margin-left: auto;
}

.msg-content {
  font-size: 14px;
  line-height: 1.6;
  color: #444;
}

.message-input {
  padding: 12px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.role-toggle {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.role-toggle button {
  padding: 3px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;
}

.role-toggle button.active {
  background: #e94560;
  color: #fff;
  border-color: #e94560;
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-row input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
}

.input-row input:focus {
  outline: none;
  border-color: #e94560;
}
</style>
