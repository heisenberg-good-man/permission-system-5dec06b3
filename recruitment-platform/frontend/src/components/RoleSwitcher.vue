<template>
  <div class="role-switcher">
    <div class="role-label">
      <span class="role-icon">{{ roleIcon }}</span>
      <span class="role-text">当前视角：{{ roleLabel }}</span>
    </div>
    <div class="role-buttons">
      <button
        v-for="r in roles"
        :key="r.value"
        :class="['role-btn', { active: role === r.value }]"
        :title="r.title"
        @click="handleSwitch(r.value)"
      >
        <span class="btn-icon">{{ r.icon }}</span>
        <span class="btn-label">{{ r.label }}</span>
      </button>
    </div>
    <div class="role-desc">
      <template v-if="isApplicant">
        可浏览职位、投递简历、查看沟通消息
      </template>
      <template v-else-if="isRecruiter">
        可管理候选人、处理状态、回复消息
      </template>
      <template v-else-if="isManager">
        可查看全局统计、管理职位、掌握招聘进度
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRole, ROLES, ROLE_LABELS, ROLE_ICONS } from '../composables/useRole'

const emit = defineEmits(['change'])
const toast = inject('toast')

const {
  role,
  roleLabel,
  roleIcon,
  isApplicant,
  isRecruiter,
  isManager,
  setRole
} = useRole()

const roles = computed(() => [
  { value: ROLES.APPLICANT, label: ROLE_LABELS[ROLES.APPLICANT], icon: ROLE_ICONS[ROLES.APPLICANT], title: '切换到应聘方视角' },
  { value: ROLES.RECRUITER, label: ROLE_LABELS[ROLES.RECRUITER], icon: ROLE_ICONS[ROLES.RECRUITER], title: '切换到招聘方视角' },
  { value: ROLES.MANAGER, label: ROLE_LABELS[ROLES.MANAGER], icon: ROLE_ICONS[ROLES.MANAGER], title: '切换到招聘负责人视角' }
])

function handleSwitch(newRole) {
  if (newRole === role.value) {
    toast.info('已处于该视角')
    return
  }
  setRole(newRole)
  const newLabel = ROLE_LABELS[newRole]
  toast.success(`已切换到${newLabel}视角`)
  emit('change', newRole)
}
</script>

<style scoped>
.role-switcher {
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  margin: 0 12px 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.role-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.role-icon {
  font-size: 14px;
}

.role-text {
  font-weight: 500;
}

.role-buttons {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.role-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.5);
}

.role-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
}

.role-btn.active {
  background: rgba(233, 69, 96, 0.25);
  border-color: #e94560;
  color: #fff;
}

.btn-icon {
  font-size: 16px;
}

.btn-label {
  font-size: 11px;
}

.role-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.5;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
