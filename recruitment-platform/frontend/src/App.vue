<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>招聘平台</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" active-class="active">
          <span class="nav-icon">📊</span>仪表盘
        </router-link>
        <router-link to="/jobs" class="nav-item" active-class="active">
          <span class="nav-icon">💼</span>职位管理
        </router-link>
        <router-link to="/applications" class="nav-item" active-class="active">
          <span class="nav-icon">📝</span>投递管理
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <p v-if="lastRefresh" class="last-refresh">数据更新: {{ formatTime(lastRefresh) }}</p>
      </div>
    </aside>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <keep-alive :include="keepAliveComponents">
            <component :is="Component" :key="$route.fullPath" />
          </keep-alive>
        </transition>
      </router-view>
    </main>
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import ToastContainer from './components/ToastContainer.vue'
import { useToast } from './composables/useToast'

const keepAliveComponents = ['DashboardView', 'JobListView', 'ApplicationListView']
const toast = useToast()
const lastRefresh = ref('')

provide('toast', toast)

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

provide('markRefreshed', () => {
  lastRefresh.value = new Date().toISOString()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f0f2f5;
  color: #333;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 22px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #e94560;
  letter-spacing: 1px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.nav-item.active {
  color: #fff;
  background: rgba(233, 69, 96, 0.2);
  border-left: 3px solid #e94560;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.last-refresh {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.btn {
  display: inline-block;
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  line-height: 1.5;
  font-family: inherit;
}

.btn-primary {
  background: #e94560;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #d63851;
  box-shadow: 0 2px 8px rgba(233, 69, 96, 0.3);
}

.btn-primary:disabled {
  background: #f7b6c1;
  cursor: not-allowed;
}

.btn-secondary {
  background: #fff;
  color: #333;
  border: 1px solid #d9d9d9;
}

.btn-secondary:hover:not(:disabled) {
  color: #e94560;
  border-color: #e94560;
}

.btn-danger {
  background: #fff;
  color: #f5222d;
  border: 1px solid #ffccc7;
}

.btn-danger:hover:not(:disabled) {
  background: #fff1f0;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 13px;
}

.card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #e94560;
  box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group input[required] + label::after,
.form-group label.has-required::after {
  content: '';
  margin-left: 4px;
}

.form-group label.required::after {
  content: ' *';
  color: #f5222d;
}

.tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 14px;
  font-size: 12px;
  margin: 2px;
  line-height: 1.4;
}

.tag-blue {
  background: #e6f7ff;
  color: #1890ff;
}

.tag-green {
  background: #f6ffed;
  color: #52c41a;
}

.tag-orange {
  background: #fff7e6;
  color: #fa8c16;
}

.tag-red {
  background: #fff1f0;
  color: #f5222d;
}

.tag-purple {
  background: #f9f0ff;
  color: #722ed1;
}

.status-pending {
  color: #d46b08;
  background: #fff7e6;
  border: 1px solid #ffd591;
}

.status-contacted {
  color: #096dd9;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
}

.status-interviewing {
  color: #531dab;
  background: #f9f0ff;
  border: 1px solid #d3adf7;
}

.status-rejected {
  color: #cf1322;
  background: #fff1f0;
  border: 1px solid #ffa39e;
}

.status-open {
  color: #389e0d;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.status-closed {
  color: #595959;
  background: #fafafa;
  border: 1px solid #d9d9d9;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.empty {
  text-align: center;
  padding: 48px 20px;
  color: #999;
  font-size: 14px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.4;
}

.loading {
  text-align: center;
  padding: 48px 20px;
  color: #999;
  font-size: 14px;
}

.loading::before {
  content: '';
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #e94560;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 10px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
