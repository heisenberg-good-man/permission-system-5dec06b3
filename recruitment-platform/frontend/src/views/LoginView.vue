<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">🎯</div>
        <h1>招聘平台</h1>
        <p class="login-sub">本地 Mock 环境 · 快速选择角色进入</p>
      </div>

      <div class="role-selector">
        <div
          v-for="r in roles"
          :key="r.value"
          class="role-card"
          :class="{ active: currentRole === r.value }"
          @click="selectRole(r.value)"
        >
          <div class="role-icon">{{ r.icon }}</div>
          <div class="role-info">
            <div class="role-name">{{ r.label }}</div>
            <div class="role-desc">{{ r.desc }}</div>
          </div>
          <div class="role-check" v-if="currentRole === r.value">✓</div>
        </div>
      </div>

      <div class="login-actions">
        <button class="btn btn-primary btn-lg" @click="enter">
          进入平台 →
        </button>
        <p class="login-tip">
          ⚡ 提示：此页面用于本地环境快速切换角色，无需账号密码。
          侧边栏也可以随时切换视角。
        </p>
      </div>

      <div class="quick-links">
        <div class="ql-title">快速进入业务：</div>
        <div class="ql-btns">
          <button v-for="link in quickLinks[currentRole]" :key="link.path" class="btn btn-secondary btn-sm" @click="goLink(link.path)">
            {{ link.icon }} {{ link.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRole } from '../composables/useRole'

defineOptions({ name: 'LoginView' })

const router = useRouter()
const toast = inject('toast')
const role = useRole()

const roles = [
  { value: 'applicant', label: '应聘方', icon: '👤', desc: '浏览职位、投递简历、查看面试安排' },
  { value: 'recruiter', label: '招聘方', icon: '💼', desc: '管理职位、候选人处理、安排面试' },
  { value: 'manager', label: '招聘负责人', icon: '📊', desc: '全局统计、面试管理、数据概览' }
]

const currentRole = ref(role.role.value || 'manager')

const quickLinks = computed(() => ({
  applicant: [
    { path: '/jobs', label: '职位大厅', icon: '🔍' },
    { path: '/applications', label: '我的投递', icon: '📝' },
    { path: '/interviews', label: '我的面试', icon: '📅' }
  ],
  recruiter: [
    { path: '/applications', label: '投递管理', icon: '📝' },
    { path: '/jobs', label: '职位管理', icon: '💼' },
    { path: '/interviews', label: '面试安排', icon: '📅' }
  ],
  manager: [
    { path: '/', label: '仪表盘', icon: '📊' },
    { path: '/interviews', label: '面试安排', icon: '📅' },
    { path: '/applications', label: '候选人', icon: '👥' }
  ]
}))

function selectRole(val) {
  currentRole.value = val
}

function enter() {
  role.setRole(currentRole.value)
  let target = '/'
  if (currentRole.value === 'applicant') target = '/jobs'
  if (currentRole.value === 'recruiter') target = '/applications'
  toast?.success?.(`已切换到${roles.find(r => r.value === currentRole.value)?.label}视角`)
  router.push(target)
}

function goLink(path) {
  role.setRole(currentRole.value)
  router.push(path)
}

onMounted(() => {
  currentRole.value = role.role.value || 'manager'
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-logo {
  font-size: 56px;
  margin-bottom: 8px;
}

.login-header h1 {
  font-size: 28px;
  color: #1a1a2e;
  font-weight: 700;
}

.login-sub {
  color: #888;
  margin-top: 6px;
  font-size: 13px;
}

.role-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.role-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.role-card:hover {
  border-color: #e94560;
  background: #fff5f6;
}

.role-card.active {
  border-color: #e94560;
  background: #fff5f6;
  box-shadow: 0 2px 8px rgba(233, 69, 96, 0.15);
}

.role-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  background: #f5f7fa;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-card.active .role-icon {
  background: #ffe8ec;
}

.role-info {
  flex: 1;
}

.role-name {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 15px;
}

.role-desc {
  color: #888;
  font-size: 12px;
  margin-top: 2px;
}

.role-check {
  width: 24px;
  height: 24px;
  background: #e94560;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.login-actions {
  margin-bottom: 24px;
}

.btn-lg {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
}

.login-tip {
  margin-top: 10px;
  text-align: center;
  color: #999;
  font-size: 12px;
  line-height: 1.6;
}

.quick-links {
  padding-top: 20px;
  border-top: 1px dashed #eee;
}

.ql-title {
  color: #666;
  font-size: 12px;
  margin-bottom: 10px;
}

.ql-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
