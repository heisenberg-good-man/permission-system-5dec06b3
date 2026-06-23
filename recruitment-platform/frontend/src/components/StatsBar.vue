<template>
  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-icon" style="background:#e6f7ff;color:#1890ff;">📋</div>
      <div class="stat-info">
        <div class="stat-value">{{ stats.openPositions }}</div>
        <div class="stat-label">开放职位</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#fff7e6;color:#fa8c16;">📝</div>
      <div class="stat-info">
        <div class="stat-value">{{ stats.todayNewApplications }}</div>
        <div class="stat-label">今日新增投递</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#fff1f0;color:#f5222d;">⏳</div>
      <div class="stat-info">
        <div class="stat-value">{{ stats.pendingCandidates }}</div>
        <div class="stat-label">待筛选候选人</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#f9f0ff;color:#722ed1;">💬</div>
      <div class="stat-info">
        <div class="stat-value">{{ stats.contactedCount }}</div>
        <div class="stat-label">已沟通人数</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#f6ffed;color:#52c41a;">🎯</div>
      <div class="stat-info">
        <div class="stat-value">{{ stats.interviewingCount }}</div>
        <div class="stat-label">面试中</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#f5f5f5;color:#999;">📊</div>
      <div class="stat-info">
        <div class="stat-value">{{ stats.totalApplications }}</div>
        <div class="stat-label">总投递数</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { statsApi } from '../services/api'

const stats = ref({
  openPositions: 0,
  todayNewApplications: 0,
  pendingCandidates: 0,
  contactedCount: 0,
  interviewingCount: 0,
  rejectedCount: 0,
  totalApplications: 0
})

async function loadStats() {
  try {
    stats.value = await statsApi.get()
  } catch (e) {
    console.error('加载统计失败:', e)
  }
}

onMounted(loadStats)

defineExpose({ loadStats })
</script>

<style scoped>
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}
</style>
