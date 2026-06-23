<template>
  <div class="status-selector">
    <div class="ss-label">候选人状态流转：</div>
    <div class="ss-buttons">
      <template v-for="(s, idx) in statusList" :key="s.value">
        <button
          class="status-btn"
          :class="[`status-btn-${s.value}`, { active: modelValue === s.value }]"
          :title="s.desc || s.label"
          @click="select(s.value)"
        >
          <span class="sb-icon">{{ s.icon }}</span>
          <span class="ss-text">{{ s.label }}</span>
        </button>
        <span v-if="idx < statusList.length - 1" class="flow-arrow">→</span>
      </template>
    </div>
    <div v-if="modelValue && showTip" class="ss-tip" :class="`ss-tip-${modelValue}`">
      说明：{{ currentDesc(modelValue) }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: 'pending' },
  showTip: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

const statusList = [
  { value: 'pending', label: '待筛选', icon: '⏳', desc: '新投递待初筛，还未被招聘方处理' },
  { value: 'contacted', label: '已沟通', icon: '💬', desc: '已和候选人建立联系并完成初步沟通' },
  { value: 'interviewing', label: '面试中', icon: '🎯', desc: '已安排面试或正在进行面试流程' },
  { value: 'rejected', label: '不合适', icon: '❌', desc: '不进入后续招聘流程' }
]

function currentDesc(v) {
  const s = statusList.find(x => x.value === v)
  return s ? s.desc : v
}

function select(val) {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<style scoped>
.status-selector {
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
}

.ss-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 10px;
}

.ss-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.status-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;
  color: #666;
}

.status-btn:hover:not(.active) {
  background: #f5f5f5;
  transform: translateY(-1px);
}

.status-btn.active {
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.status-btn-pending.active {
  background: #fff7e6;
  color: #d46b08;
  border-color: #ffc069;
}

.status-btn-contacted.active {
  background: #e6f7ff;
  color: #096dd9;
  border-color: #69c0ff;
}

.status-btn-interviewing.active {
  background: #f9f0ff;
  color: #531dab;
  border-color: #b37feb;
}

.status-btn-rejected.active {
  background: #fff1f0;
  color: #cf1322;
  border-color: #ff7875;
}

.flow-arrow {
  font-size: 14px;
  color: #ccc;
  font-weight: 600;
}

.sb-icon {
  font-size: 13px;
}

.ss-tip {
  margin-top: 10px;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 5px;
  display: inline-block;
}

.ss-tip-pending {
  background: #fff7e6;
  color: #d46b08;
}

.ss-tip-contacted {
  background: #e6f7ff;
  color: #096dd9;
}

.ss-tip-interviewing {
  background: #f9f0ff;
  color: #531dab;
}

.ss-tip-rejected {
  background: #fff1f0;
  color: #cf1322;
}
</style>
