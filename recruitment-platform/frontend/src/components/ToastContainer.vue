<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="`toast-${toast.type}`"
        @click="remove(toast.id)"
      >
        <span class="toast-icon">
          {{ icons[toast.type] }}
        </span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { toasts, remove } = useToast()

const icons = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'ℹ'
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 240px;
  max-width: 360px;
  cursor: pointer;
  font-size: 14px;
  background: #fff;
  animation: toastSlide 0.25s ease-out;
}

.toast-success {
  background: #f6ffed;
  border-left: 4px solid #52c41a;
  color: #237804;
}

.toast-error {
  background: #fff1f0;
  border-left: 4px solid #f5222d;
  color: #a8071a;
}

.toast-warning {
  background: #fffbe6;
  border-left: 4px solid #faad14;
  color: #ad6800;
}

.toast-info {
  background: #e6f7ff;
  border-left: 4px solid #1890ff;
  color: #0050b3;
}

.toast-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  background: #52c41a;
  color: #fff;
}

.toast-error .toast-icon {
  background: #f5222d;
  color: #fff;
}

.toast-warning .toast-icon {
  background: #faad14;
  color: #fff;
}

.toast-info .toast-icon {
  background: #1890ff;
  color: #fff;
}

.toast-message {
  line-height: 1.5;
  flex: 1;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

@keyframes toastSlide {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
