<template>
  <div class="notif-center" v-click-outside="close">
    <button class="nc-trigger notif-bell-btn" @click="toggleOpen" :class="{ active: open }">
      <span class="nc-icon">🔔</span>
      <span v-if="unreadCount > 0" class="nc-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <transition name="dropdown">
      <div v-if="open" class="nc-panel card">
        <div class="nc-header">
          <h3>通知中心</h3>
          <div class="nc-header-actions">
            <button v-if="unreadCount > 0" class="link-btn" @click="handleMarkAll">全部已读</button>
            <button class="link-btn" @click="refreshList">🔄 刷新</button>
          </div>
        </div>

        <div v-if="loading" class="nc-loading">加载中...</div>
        <div v-else-if="list.length === 0" class="nc-empty">
          <div class="empty-icon">📭</div>
          <p>暂无通知</p>
        </div>

        <div v-else class="nc-list">
          <div
            v-for="n in list"
            :key="n.id"
            class="nc-item"
            :class="{ unread: !n.read }"
            @click="handleRead(n)"
          >
            <div class="nc-item-icon">{{ getTypeIcon(n.type) }}</div>
            <div class="nc-item-body">
              <div class="nc-item-title">
                <span>{{ n.title }}</span>
                <span v-if="!n.read" class="nc-dot"></span>
              </div>
              <div class="nc-item-content">{{ n.content }}</div>
              <div class="nc-item-meta">
                <span class="nc-type">{{ n.typeLabel }}</span>
                <span class="nc-time">{{ formatTime(n.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, inject, defineDirective, nextTick } from 'vue'
import { useNotifications } from '../composables/useNotifications'

defineOptions({ name: 'NotificationCenter' })

const toast = inject('toast')
const notifications = useNotifications()
const open = ref(false)
const loading = ref(false)
const list = ref([])
const unreadCount = notifications.unreadCount

const TYPE_ICONS = {
  new_application: '📝',
  status_changed: '🔄',
  interview_scheduled: '📅',
  interview_feedback: '📋',
  interview_cancelled: '❌',
  new_message: '💬'
}

function getTypeIcon(t) { return TYPE_ICONS[t] || '🔔' }

async function refreshList() {
  loading.value = true
  try {
    const data = await notifications.listAll()
    list.value = data.list || []
  } catch (e) {
    toast.error('加载通知失败：' + e.message)
  } finally {
    loading.value = false
  }
}

async function handleRead(n) {
  if (!n.read) {
    await notifications.markRead(n.id)
    n.read = true
  }
}

async function handleMarkAll() {
  await notifications.markAllRead()
  list.value.forEach(n => { n.read = true })
  toast.success('已全部标记为已读')
}

function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    refreshList()
    notifications.refresh()
  }
}

function close() { open.value = false }

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

defineDirective('click-outside', {
  mounted(el, binding) {
    el.__vueClickOutside__ = function (e) {
      if (!(el === e.target || el.contains(e.target))) {
        binding.value && binding.value(e)
      }
    }
    document.addEventListener('click', el.__vueClickOutside__)
  },
  unmounted(el) {
    if (el.__vueClickOutside__) {
      document.removeEventListener('click', el.__vueClickOutside__)
      delete el.__vueClickOutside__
    }
  }
})

onMounted(() => { notifications.refresh() })
onActivated(() => { notifications.refresh() })

setInterval(() => { if (!open.value) notifications.refresh() }, 30000)
</script>

<style scoped>
.notif-center {
  position: relative;
  z-index: 100;
}
.nc-trigger {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: #1a1a2e;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s;
}
.nc-trigger:hover { background: #f5f5f5; }
.nc-trigger.active { background: #fff0f3; color: #e94560; }
.nc-icon { font-size: 16px; }
.nc-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #e94560;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  line-height: 1;
}
.nc-panel {
  position: absolute;
  right: 0;
  top: 48px;
  width: 380px;
  max-height: 520px;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.nc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.nc-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}
.nc-header-actions {
  display: flex;
  gap: 10px;
}
.link-btn {
  background: none;
  border: none;
  color: #e94560;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}
.link-btn:hover { text-decoration: underline; }
.nc-loading,
.nc-empty {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
.nc-empty .empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
  opacity: 0.5;
}
.nc-list {
  overflow-y: auto;
  max-height: 440px;
}
.nc-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.15s;
}
.nc-item:hover { background: #fafafa; }
.nc-item.unread { background: #fffafb; }
.nc-item-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.nc-item.unread .nc-item-icon { background: #fff0f3; }
.nc-item-body {
  flex: 1;
  min-width: 0;
}
.nc-item-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}
.nc-item.unread .nc-item-title { color: #1a1a2e; }
.nc-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e94560;
  flex-shrink: 0;
}
.nc-item-content {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.nc-item-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #aaa;
}
.nc-type {
  padding: 1px 8px;
  border-radius: 10px;
  background: #f5f5f5;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.18s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
