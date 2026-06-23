import { ref, computed, watch } from 'vue'

const ROLES = {
  APPLICANT: 'applicant',
  RECRUITER: 'recruiter',
  MANAGER: 'manager'
}

const ROLE_LABELS = {
  [ROLES.APPLICANT]: '应聘方',
  [ROLES.RECRUITER]: '招聘方',
  [ROLES.MANAGER]: '招聘负责人'
}

const ROLE_ICONS = {
  [ROLES.APPLICANT]: '👤',
  [ROLES.RECRUITER]: '💼',
  [ROLES.MANAGER]: '👔'
}

const STORAGE_KEY = 'currentRole'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && Object.values(ROLES).includes(saved)) {
      return saved
    }
  } catch (e) {}
  return ROLES.MANAGER
}

const currentRole = ref(loadFromStorage())

watch(currentRole, (newRole) => {
  try {
    localStorage.setItem(STORAGE_KEY, newRole)
  } catch (e) {}
})

export function useRole() {
  const role = computed(() => currentRole.value)
  const roleLabel = computed(() => ROLE_LABELS[currentRole.value] || currentRole.value)
  const roleIcon = computed(() => ROLE_ICONS[currentRole.value] || '👤')

  const isApplicant = computed(() => currentRole.value === ROLES.APPLICANT)
  const isRecruiter = computed(() => currentRole.value === ROLES.RECRUITER)
  const isManager = computed(() => currentRole.value === ROLES.MANAGER)

  const canViewDashboard = computed(() => isManager.value)
  const canViewJobList = computed(() => true)
  const canViewJobDetail = computed(() => true)
  const canCreateJob = computed(() => isRecruiter.value || isManager.value)
  const canEditJob = computed(() => isRecruiter.value || isManager.value)
  const canApply = computed(() => isApplicant.value)
  const canViewApplications = computed(() => isRecruiter.value || isManager.value)
  const canViewApplicationDetail = computed(() => isRecruiter.value || isManager.value)
  const canUpdateStatus = computed(() => isRecruiter.value || isManager.value)
  const canSendMessage = computed(() => true)

  function setRole(newRole) {
    if (Object.values(ROLES).includes(newRole)) {
      currentRole.value = newRole
    }
  }

  function switchToApplicant() { setRole(ROLES.APPLICANT) }
  function switchToRecruiter() { setRole(ROLES.RECRUITER) }
  function switchToManager() { setRole(ROLES.MANAGER) }

  function hasPermission(perm) {
    switch (perm) {
      case 'dashboard': return canViewDashboard.value
      case 'job:list': return canViewJobList.value
      case 'job:detail': return canViewJobDetail.value
      case 'job:create': return canCreateJob.value
      case 'job:edit': return canEditJob.value
      case 'apply': return canApply.value
      case 'application:list': return canViewApplications.value
      case 'application:detail': return canViewApplicationDetail.value
      case 'application:status': return canUpdateStatus.value
      case 'message:send': return canSendMessage.value
      default: return false
    }
  }

  return {
    role,
    roleLabel,
    roleIcon,
    isApplicant,
    isRecruiter,
    isManager,
    canViewDashboard,
    canViewJobList,
    canViewJobDetail,
    canCreateJob,
    canEditJob,
    canApply,
    canViewApplications,
    canViewApplicationDetail,
    canUpdateStatus,
    canSendMessage,
    setRole,
    switchToApplicant,
    switchToRecruiter,
    switchToManager,
    hasPermission,
    ROLES
  }
}

export { ROLES, ROLE_LABELS, ROLE_ICONS }
