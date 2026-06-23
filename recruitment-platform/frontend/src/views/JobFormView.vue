<template>
  <div class="job-form">
    <div v-if="!canAccess" class="no-permission card">
      <div class="np-icon">🔒</div>
      <h3>无权限访问</h3>
      <p>该功能需要招聘方或招聘负责人权限，请切换视角后再试。</p>
      <button class="btn btn-primary" @click="switchToRecruiter">切换到招聘方视角</button>
      <router-link to="/jobs" class="btn btn-secondary" style="margin-top:8px">返回职位列表</router-link>
    </div>
    <template v-else>
    <div class="page-header">
      <div class="header-left">
        <button class="btn btn-secondary btn-sm" @click="goBack">← 返回</button>
        <div>
          <h1>{{ isEdit ? '编辑职位' : '发布新职位' }}</h1>
          <p class="page-subtitle" v-if="isEdit">修改职位信息，保存后立即生效</p>
          <p class="page-subtitle" v-else>填写职位信息，发布后应聘者可查看并投递</p>
        </div>
      </div>
    </div>

    <div class="card form-card">
      <form @submit.prevent="submit" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label class="required" for="f_title">职位名称</label>
            <input id="f_title" v-model="form.title" type="text" placeholder="如：高级前端工程师（Vue方向）" maxlength="60" />
            <span v-if="formErrors.title" class="field-error">{{ formErrors.title }}</span>
          </div>
          <div class="form-group">
            <label class="required" for="f_company">公司名称</label>
            <input id="f_company" v-model="form.company" type="text" placeholder="如：星辰科技有限公司" maxlength="60" />
            <span v-if="formErrors.company" class="field-error">{{ formErrors.company }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="f_dept">所属部门</label>
            <input id="f_dept" v-model="form.department" type="text" placeholder="如：技术部 · 前端组" maxlength="40" />
          </div>
          <div class="form-group">
            <label for="f_loc">工作地点</label>
            <select v-model="form.location" id="f_loc">
              <option value="">请选择地点</option>
              <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="f_min">最低薪资（元/月）</label>
            <input id="f_min" v-model.number="form.salaryMin" type="number" min="0" step="500" placeholder="如：15000" />
          </div>
          <div class="form-group">
            <label for="f_max">最高薪资（元/月）</label>
            <input id="f_max" v-model.number="form.salaryMax" type="number" min="0" step="500" placeholder="如：25000" />
            <span v-if="formErrors.salary" class="field-error">{{ formErrors.salary }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="f_cnt">招聘人数</label>
            <input id="f_cnt" v-model.number="form.headcount" type="number" min="1" max="100" placeholder="默认 1" />
          </div>
          <div class="form-group">
            <label for="f_st">招聘状态</label>
            <select v-model="form.status" id="f_st">
              <option value="open">✅ 招聘中（可被投递）</option>
              <option value="closed">🔒 已关闭（暂不招聘）</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="f_req">岗位要求</label>
          <textarea id="f_req" v-model="form.requirements" rows="6" placeholder="请输入岗位要求，建议包含：
1. 工作经验要求
2. 技术栈或能力要求
3. 加分项
4. 工作职责说明"></textarea>
          <p class="field-hint">支持多行，共 {{ form.requirements.length }} 字</p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="goBack">取消</button>
          <div style="flex:1"></div>
          <button type="button" class="btn btn-secondary btn-sm" @click="resetForm" :disabled="submitting">重置</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="submitting">提交中...</span>
            <span v-else-if="isEdit">保存修改</span>
            <span v-else>📢 发布职位</span>
          </button>
        </div>
      </form>
    </div>

    <div v-if="isEdit" class="preview-tip card" style="margin-top:16px">
      <p class="tip-text">💡 提示：保存修改后，应聘者浏览职位页将立即看到最新内容。</p>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jobApi } from '../services/api'
import { ROLES } from '../composables/useRole'

defineOptions({ name: 'JobFormView' })

const route = useRoute()
const router = useRouter()
const toast = inject('toast')
const role = inject('role')

const canAccess = computed(() => (role?.canCreateJob?.value || role?.canEditJob?.value) || false)

function switchToRecruiter() {
  if (role?.setRole) {
    role.setRole(ROLES.RECRUITER)
  }
}

const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const initialForm = {
  title: '',
  company: '',
  department: '',
  location: '',
  salaryMin: null,
  salaryMax: null,
  headcount: 1,
  requirements: '',
  status: 'open'
}

const form = reactive({ ...initialForm })
const formErrors = reactive({ title: '', company: '', salary: '' })

const locations = ['北京', '上海', '深圳', '广州', '杭州', '成都', '南京', '武汉', '西安', '其他']

function resetForm() {
  Object.assign(form, initialForm)
  Object.keys(formErrors).forEach(k => formErrors[k] = '')
}

function validate() {
  let ok = true
  Object.keys(formErrors).forEach(k => formErrors[k] = '')
  if (!form.title.trim()) {
    formErrors.title = '请输入职位名称'
    ok = false
  } else if (form.title.trim().length < 2) {
    formErrors.title = '职位名称至少 2 个字'
    ok = false
  }
  if (!form.company.trim()) {
    formErrors.company = '请输入公司名称'
    ok = false
  }
  if (form.salaryMin && form.salaryMax && form.salaryMin > form.salaryMax) {
    formErrors.salary = '最低薪资不能高于最高薪资'
    ok = false
  }
  return ok
}

async function loadJob() {
  if (!isEdit.value) return
  try {
    const job = await jobApi.get(route.params.id)
    Object.assign(form, {
      title: job.title,
      company: job.company,
      department: job.department || '',
      location: job.location || '',
      salaryMin: job.salaryMin || null,
      salaryMax: job.salaryMax || null,
      headcount: job.headcount || 1,
      requirements: job.requirements || '',
      status: job.status || 'open'
    })
  } catch (e) {
    if (toast) toast.error('加载职位信息失败: ' + e.message)
  }
}

async function submit() {
  if (!validate()) {
    if (toast) toast.warning('请完善表单必填项')
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await jobApi.update(route.params.id, { ...form })
      if (toast) toast.success('职位信息已更新')
      setTimeout(() => router.push(`/jobs/${route.params.id}`), 500)
    } else {
      const created = await jobApi.create({ ...form })
      if (toast) toast.success(`职位「${created.title}」发布成功`)
      setTimeout(() => router.push(`/jobs/${created.id}`), 600)
    }
  } catch (e) {
    if (toast) toast.error('提交失败: ' + e.message)
  } finally {
    submitting.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/jobs')
}

onMounted(loadJob)
</script>

<style scoped>
.header-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.page-subtitle {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.form-card {
  max-width: 760px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field-error {
  display: block;
  font-size: 12px;
  color: #f5222d;
  margin-top: 4px;
}

.field-hint {
  font-size: 11px;
  color: #bbb;
  margin-top: 4px;
  text-align: right;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid #f0f0f0;
}

.preview-tip {
  padding: 12px 16px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
}

.tip-text {
  font-size: 13px;
  color: #ad6800;
  margin: 0;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.no-permission {
  text-align: center;
  padding: 60px 20px;
  max-width: 480px;
  margin: 40px auto;
}

.no-permission .np-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-permission h3 {
  font-size: 20px;
  margin: 0 0 10px;
  color: #333;
}

.no-permission p {
  font-size: 14px;
  color: #888;
  margin: 0 0 20px;
}

.no-permission .btn {
  display: block;
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
}
</style>
