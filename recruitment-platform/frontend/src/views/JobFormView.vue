<template>
  <div class="job-form">
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary btn-sm" @click="$router.back()">← 返回</button>
        <h1>{{ isEdit ? '编辑职位' : '发布职位' }}</h1>
      </div>
    </div>

    <div class="card form-card">
      <form @submit.prevent="submit">
        <div class="form-row">
          <div class="form-group">
            <label>职位名称 *</label>
            <input v-model="form.title" type="text" placeholder="如：高级前端工程师" required />
          </div>
          <div class="form-group">
            <label>公司名称 *</label>
            <input v-model="form.company" type="text" placeholder="如：星辰科技有限公司" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>部门</label>
            <input v-model="form.department" type="text" placeholder="如：技术部" />
          </div>
          <div class="form-group">
            <label>工作地点</label>
            <select v-model="form.location">
              <option value="">请选择</option>
              <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>最低薪资（元/月）</label>
            <input v-model.number="form.salaryMin" type="number" min="0" placeholder="如：15000" />
          </div>
          <div class="form-group">
            <label>最高薪资（元/月）</label>
            <input v-model.number="form.salaryMax" type="number" min="0" placeholder="如：25000" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>招聘人数</label>
            <input v-model.number="form.headcount" type="number" min="1" placeholder="如：3" />
          </div>
          <div class="form-group">
            <label>招聘状态</label>
            <select v-model="form.status">
              <option value="open">招聘中</option>
              <option value="closed">已关闭</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>岗位要求</label>
          <textarea v-model="form.requirements" rows="5" placeholder="请输入岗位要求..."></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$router.back()">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '提交中...' : (isEdit ? '保存修改' : '发布职位') }}
          </button>
        </div>

        <div v-if="error" class="form-error">{{ error }}</div>
        <div v-if="success" class="form-success">{{ success }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jobApi } from '../services/api'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const error = ref('')
const success = ref('')

const locations = ['北京', '上海', '深圳', '广州', '杭州', '成都']

const form = ref({
  title: '',
  company: '',
  department: '',
  location: '',
  salaryMin: null,
  salaryMax: null,
  headcount: 1,
  requirements: '',
  status: 'open'
})

async function loadJob() {
  if (!isEdit.value) return
  try {
    const job = await jobApi.get(route.params.id)
    form.value = {
      title: job.title,
      company: job.company,
      department: job.department,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      headcount: job.headcount,
      requirements: job.requirements,
      status: job.status
    }
  } catch (e) {
    error.value = '加载职位失败: ' + e.message
  }
}

async function submit() {
  error.value = ''
  success.value = ''
  submitting.value = true
  try {
    if (isEdit.value) {
      await jobApi.update(route.params.id, form.value)
      success.value = '职位更新成功！'
    } else {
      const created = await jobApi.create(form.value)
      success.value = '职位发布成功！'
      setTimeout(() => router.push(`/jobs/${created.id}`), 800)
    }
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
