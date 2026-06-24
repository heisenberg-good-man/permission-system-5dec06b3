<template>
  <div class="interview-form card">
    <h3 class="form-title">📅 安排面试</h3>
    <p class="form-sub" v-if="applicationSummary">候选人：{{ applicationSummary.applicantName }} · {{ applicationSummary.targetPosition }}</p>

    <div v-if="errorMsg" class="form-error">{{ errorMsg }}</div>

    <div class="form-row">
      <div class="form-group">
        <label class="required">面试方式</label>
        <select v-model="form.interviewType" @change="onTypeChange">
          <option value="">请选择面试方式</option>
          <option v-for="t in types" :key="t.value" :value="t.value">{{ t.icon }} {{ t.label }}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="required">面试时间</label>
        <input type="datetime-local" v-model="form.interviewTime" />
      </div>
    </div>

    <div class="form-group">
      <label class="required">面试官</label>
      <input type="text" v-model="form.interviewer" placeholder="如：技术总监陈工、HR李经理" />
    </div>

    <div class="form-group" v-if="form.interviewType === 'onsite'">
      <label class="required">面试地点</label>
      <input type="text" v-model="form.location" placeholder="如：北京市朝阳区XX大厦A座15层会议室3" />
    </div>

    <div class="form-group" v-if="form.interviewType === 'video'">
      <label class="required">会议链接</label>
      <input type="text" v-model="form.meetingLink" placeholder="请粘贴腾讯会议/Zoom/飞书等视频会议链接" />
    </div>

    <div class="form-group">
      <label>备注（选填）</label>
      <textarea v-model="form.note" placeholder="面试须知、准备材料、时长提示等" rows="3"></textarea>
    </div>

    <div class="form-actions">
      <button class="btn btn-secondary" @click="$emit('cancel')">取消</button>
      <button class="btn btn-primary" @click="submit" :disabled="submitting">
        <span v-if="submitting">提交中...</span>
        <span v-else>确认安排面试</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, inject, watch } from 'vue'
import { interviewApi } from '../services/api'

defineOptions({ name: 'InterviewForm' })

const props = defineProps({
  applicationId: { type: String, required: true },
  applicationSummary: { type: Object, default: null }
})
const emit = defineEmits(['cancel', 'success'])
const toast = inject('toast')

const types = [
  { value: 'onsite', label: '现场面试', icon: '🏢' },
  { value: 'video', label: '视频面试', icon: '📹' },
  { value: 'phone', label: '电话面试', icon: '📞' }
]

const form = reactive({
  interviewType: '',
  interviewTime: '',
  interviewer: '',
  location: '',
  meetingLink: '',
  note: ''
})

const submitting = ref(false)
const errorMsg = ref('')

function onTypeChange() {
  if (form.interviewType !== 'onsite') form.location = ''
  if (form.interviewType !== 'video') form.meetingLink = ''
}

function validate() {
  errorMsg.value = ''
  if (!form.interviewType) { errorMsg.value = '请选择面试方式'; return false }
  if (!form.interviewTime) { errorMsg.value = '请选择面试时间'; return false }
  const t = new Date(form.interviewTime)
  if (isNaN(t.getTime())) { errorMsg.value = '面试时间格式不合法'; return false }
  if (t.getTime() < Date.now() - 60000) { errorMsg.value = '面试时间不能早于当前时间'; return false }
  if (!form.interviewer.trim()) { errorMsg.value = '请填写面试官'; return false }
  if (form.interviewType === 'onsite' && !form.location.trim()) { errorMsg.value = '现场面试请填写地点'; return false }
  if (form.interviewType === 'video' && !form.meetingLink.trim()) { errorMsg.value = '视频面试请填写会议链接'; return false }
  return true
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  errorMsg.value = ''
  try {
    const result = await interviewApi.create({
      applicationId: props.applicationId,
      interviewTime: new Date(form.interviewTime).toISOString(),
      interviewType: form.interviewType,
      interviewer: form.interviewer,
      location: form.location,
      meetingLink: form.meetingLink,
      note: form.note
    })
    toast.success('面试安排成功')
    emit('success', result)
  } catch (e) {
    errorMsg.value = e.message
    toast.error('安排失败：' + e.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.interview-form {
  margin-top: 16px;
}
.form-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #333;
}
.form-sub {
  font-size: 12px;
  color: #888;
  margin: 0 0 16px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
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
  margin-top: 8px;
}
@media (max-width: 600px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
