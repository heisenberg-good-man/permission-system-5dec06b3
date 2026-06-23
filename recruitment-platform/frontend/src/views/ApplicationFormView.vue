<template>
  <div class="apply-form">
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary btn-sm" @click="$router.back()">← 返回</button>
        <h1>投递简历</h1>
      </div>
    </div>

    <div v-if="jobError" class="error-box card">
      <p>⚠️ 加载职位信息失败</p>
      <button class="btn btn-secondary btn-sm" @click="loadJob">重新加载</button>
    </div>

    <div v-else-if="job" class="card apply-job-info">
      <h3>目标职位</h3>
      <div class="target-job">
        <span class="job-title">{{ job.title }}</span>
        <span class="job-company">{{ job.company }} · {{ job.location }}</span>
        <span class="salary">{{ job.salaryMin }}-{{ job.salaryMax }}元/月</span>
      </div>
    </div>

    <div class="card form-card">
      <form @submit.prevent="submit">
        <div class="form-row">
          <div class="form-group">
            <label>姓名 <span class="req">*</span></label>
            <input
              v-model="form.applicantName"
              type="text"
              placeholder="请输入姓名"
              :class="{ 'has-error': formErrors.applicantName }"
            />
            <div v-if="formErrors.applicantName" class="field-error">{{ formErrors.applicantName }}</div>
          </div>
          <div class="form-group">
            <label>联系方式 <span class="req">*</span></label>
            <input
              v-model="form.contact"
              type="text"
              placeholder="手机号或邮箱"
              :class="{ 'has-error': formErrors.contact }"
            />
            <div v-if="formErrors.contact" class="field-error">{{ formErrors.contact }}</div>
          </div>
        </div>

        <div class="form-group">
          <label>目标岗位</label>
          <input v-model="form.targetPosition" type="text" :placeholder="job ? job.title : '请输入目标岗位'" />
        </div>

        <div class="form-group">
          <label>工作年限</label>
          <input v-model.number="form.workYears" type="number" min="0" placeholder="如：3" />
        </div>

        <div class="form-group">
          <label>简历摘要</label>
          <textarea v-model="form.resumeSummary" rows="4" placeholder="简要描述您的工作经历和核心优势..."></textarea>
          <div class="hint">建议 20-500 字，突出匹配岗位的核心能力</div>
        </div>

        <div class="form-group">
          <label>技能标签（用逗号分隔）</label>
          <input v-model="skillInput" type="text" placeholder="如：Vue, React, TypeScript" />
          <div v-if="parsedTags.length" class="tags-preview">
            <span v-for="tag in parsedTags" :key="tag" class="tag tag-blue">{{ tag }}</span>
          </div>
          <div v-else class="hint">多个标签用中文或英文逗号、顿号分隔</div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$router.back()">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交投递' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, inject, onMounted, onActivated, defineOptions } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jobApi, applicationApi } from '../services/api'

defineOptions({ name: 'ApplicationFormView' })

const route = useRoute()
const router = useRouter()
const toast = inject('toast')

const job = ref(null)
const jobError = ref(false)
const submitting = ref(false)

const form = ref({
  applicantName: '',
  contact: '',
  targetPosition: '',
  resumeSummary: '',
  workYears: 0
})

const formErrors = reactive({
  applicantName: '',
  contact: ''
})

const skillInput = ref('')

const parsedTags = computed(() => {
  return skillInput.value
    .split(/[,，、]/)
    .map(s => s.trim())
    .filter(Boolean)
})

async function loadJob() {
  jobError.value = false
  try {
    job.value = await jobApi.get(route.params.jobId)
    form.value.targetPosition = job.value.title
  } catch (e) {
    jobError.value = true
    toast.error('加载职位信息失败：' + e.message)
  }
}

function validate() {
  let ok = true
  formErrors.applicantName = ''
  formErrors.contact = ''

  if (!form.value.applicantName || form.value.applicantName.trim().length < 2) {
    formErrors.applicantName = '请输入真实姓名（至少 2 字）'
    ok = false
  }
  if (!form.value.contact || form.value.contact.trim().length < 5) {
    formErrors.contact = '请输入有效的手机号或邮箱（至少 5 位）'
    ok = false
  }
  return ok
}

async function submit() {
  if (!validate()) {
    toast.warning('请先完善必填项')
    return
  }

  submitting.value = true
  try {
    await applicationApi.create({
      jobId: route.params.jobId,
      ...form.value,
      applicantName: form.value.applicantName.trim(),
      contact: form.value.contact.trim(),
      targetPosition: form.value.targetPosition || (job.value ? job.value.title : ''),
      skillTags: parsedTags.value
    })

    try {
      localStorage.setItem('lastApplicantName', form.value.applicantName.trim())
    } catch (e) {}

    toast.success('投递成功！正在跳转到投递管理...')
    setTimeout(() => router.push('/applications'), 900)
  } catch (e) {
    toast.error('投递失败：' + e.message)
  } finally {
    submitting.value = false
  }
}

onMounted(loadJob)
onActivated(loadJob)
</script>

<style scoped>
.form-card {
  max-width: 720px;
  margin-top: 16px;
}

.apply-job-info {
  max-width: 720px;
}

.apply-job-info h3 {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
}

.target-job {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.job-title {
  font-weight: 600;
  font-size: 16px;
}

.job-company {
  font-size: 13px;
  color: #888;
}

.salary {
  font-size: 14px;
  color: #e94560;
  font-weight: 500;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.tags-preview {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.req {
  color: #f5222d;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

.field-error {
  margin-top: 4px;
  font-size: 12px;
  color: #f5222d;
}

.has-error {
  border-color: #ffa39e !important;
  background: #fff1f0;
}

.error-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff1f0;
  color: #f5222d;
}

.error-box p {
  margin: 0;
  font-size: 14px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
