<template>
  <div class="status-selector">
    <button
      v-for="s in statusList"
      :key="s.value"
      class="status-btn"
      :class="[`status-${s.value}`, { active: modelValue === s.value }]"
      @click="select(s.value)"
    >
      {{ s.label }}
    </button>
  </div>
</template>

<script setup>
const statusList = [
  { value: 'pending', label: '待筛选' },
  { value: 'contacted', label: '已沟通' },
  { value: 'interviewing', label: '面试中' },
  { value: 'rejected', label: '不合适' }
]

const props = defineProps({
  modelValue: { type: String, default: 'pending' }
})

const emit = defineEmits(['update:modelValue'])

function select(val) {
  emit('update:modelValue', val)
}
</script>

<style scoped>
.status-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-btn {
  padding: 4px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;
}

.status-btn.active {
  font-weight: 600;
}

.status-btn.status-pending.active {
  background: #fff7e6;
  color: #fa8c16;
  border-color: #fa8c16;
}

.status-btn.status-contacted.active {
  background: #e6f7ff;
  color: #1890ff;
  border-color: #1890ff;
}

.status-btn.status-interviewing.active {
  background: #f9f0ff;
  color: #722ed1;
  border-color: #722ed1;
}

.status-btn.status-rejected.active {
  background: #fff1f0;
  color: #f5222d;
  border-color: #f5222d;
}
</style>
