<template>
  <div class="feedback-form">
    <h4 class="fb-title">📝 提交面试反馈</h4>
    <div v-if="errorMsg" class="form-error">{{ errorMsg }}</div>
    <div class="form-group">
      <label class="required">面试结果</label>
      <div class="result-options">
        <label v-for="r in results" :key="r.value" class="result-opt" :class="{ active: form.result === r.value }">
          <input type="radio" v-model="form.result" :value="r.value" />
          <span class="opt-icon">{{ r.icon }}</span>
          <span class="opt-label">{{ r.label }}</span>
        </label>
      </div>
    </div>
    <div class="form-group">
      <label class="required">反馈内容</label>
      <textarea v-model="form.content" rows="4" placeholder="请详细描述候选人表现、技术评估、综合结论等（不少于10字）"></textarea>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" @click="$emit('cancel')">取消</button>
      <button class="btn btn-primary" @click="submit" :disabled="submitting">
        <span v-if="submitting">提交中...</span>
        <span v-else>提交反馈</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, inject } from 'vue'
import { interviewApi } from '../services/api'

defineOptions({ name: 'InterviewFeedbackForm' })

const props = defineProps({
  interviewId: { type: String, required: true }
})
const emit = defineEmits(['cancel', 'success'])
const toast = inject('toast')

const results = [
  { value: 'pass', label: '通过', icon: '✅' },
  { value: 'pending', label: '待定', icon: '⏳' },
  { value: 'fail', label: '不通过', icon: '❌' }
]

const form = reactive({
  result: '',
  content: ''
})
const submitting = ref(false)
const errorMsg = ref('')

function validate() {
  errorMsg.value = ''
  if (!form.result) { errorMsg.value = '请选择面试结果'; return false }
  if (!form.content.trim() || form.content.trim().length < 10) {
    errorMsg.value = '反馈内容不能少于10字'; return false
  }
  return true
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  try {
    const result = await interviewApi.submitFeedback(props.interviewId, {
      feedbackResult: form.result,
      feedbackContent: form.content
    })
    toast.success('面试反馈已提交')
    emit('success', result)
  } catch (e) {
    errorMsg.value = e.message
    toast.error('提交失败：' + e.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.feedback-form {
  padding: 16px;
  background: #fafbff;
  border: 1px solid #eef0f8;
  border-radius: 8px;
  margin-top: 12px;
}
.fb-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #333;
}
.result-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.result-opt {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  background: #fff;
}
.result-opt input { display: none; }
.result-opt:hover { border-color: #e94560; }
.result-opt.active {
  background: #fff0f3;
  border-color: #e94560;
  color: #e94560;
  font-weight: 500;
}
.opt-icon { font-size: 15px; }
.form-error {
  background: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffa39e;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 12px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
</style>
