<template>
  <div class="apply-form">
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary btn-sm" @click="$router.back()">← 返回</button>
        <h1>投递简历</h1>
      </div>
    </div>

    <div v-if="job" class="card apply-job-info">
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
            <label>姓名 *</label>
            <input v-model="form.applicantName" type="text" placeholder="请输入姓名" required />
          </div>
          <div class="form-group">
            <label>联系方式 *</label>
            <input v-model="form.contact" type="text" placeholder="手机号或邮箱" required />
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
        </div>

        <div class="form-group">
          <label>技能标签（用逗号分隔）</label>
          <input v-model="skillInput" type="text" placeholder="如：Vue, React, TypeScript" />
          <div v-if="parsedTags.length" class="tags-preview">
            <span v-for="tag in parsedTags" :key="tag" class="tag tag-blue">{{ tag }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$router.back()">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交投递' }}
          </button>
        </div>

        <div v-if="error" class="form-error">{{ error }}</div>
        <div v-if="success" class="form-success">{{ success }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jobApi, applicationApi } from '../services/api'

const route = useRoute()
const router = useRouter()
const job = ref(null)
const submitting = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  applicantName: '',
  contact: '',
  targetPosition: '',
  resumeSummary: '',
  workYears: 0
})

const skillInput = ref('')

const parsedTags = computed(() => {
  return skillInput.value
    .split(/[,，、]/)
    .map(s => s.trim())
    .filter(Boolean)
})

async function loadJob() {
  try {
    job.value = await jobApi.get(route.params.jobId)
    form.value.targetPosition = job.value.title
  } catch (e) {
    error.value = '加载职位失败: ' + e.message
  }
}

async function submit() {
  error.value = ''
  success.value = ''
  submitting.value = true
  try {
    await applicationApi.create({
      jobId: route.params.jobId,
      ...form.value,
      skillTags: parsedTags.value
    })
    success.value = '投递成功！'
    setTimeout(() => router.push('/applications'), 800)
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}

onMounted(loadJob)
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

.form-error {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fff1f0;
  color: #f5222d;
  border-radius: 6px;
  font-size: 13px;
}

.form-success {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f6ffed;
  color: #52c41a;
  border-radius: 6px;
  font-size: 13px;
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
