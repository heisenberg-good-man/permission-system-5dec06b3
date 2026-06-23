<template>
  <div class="not-found">
    <div class="card nf-card">
      <div class="nf-code">404</div>
      <h1>页面不存在</h1>
      <p class="nf-desc">您访问的页面可能已被删除、地址错误，或者暂时不可用。</p>
      <div class="nf-actions">
        <router-link to="/" class="btn btn-primary">返回首页</router-link>
        <button class="btn btn-secondary" @click="$router.back()">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'NotFoundView' })
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.nf-card {
  text-align: center;
  max-width: 480px;
  padding: 48px 32px;
}

.nf-code {
  font-size: 96px;
  font-weight: 800;
  color: #e94560;
  line-height: 1;
  margin-bottom: 16px;
  letter-spacing: -4px;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

.nf-desc {
  color: #888;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 28px;
}

.nf-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
