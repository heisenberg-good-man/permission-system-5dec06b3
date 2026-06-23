<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>招聘平台</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" active-class="active">仪表盘</router-link>
        <router-link to="/jobs" class="nav-item" active-class="active">职位管理</router-link>
        <router-link to="/applications" class="nav-item" active-class="active">投递管理</router-link>
      </nav>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
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
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #e94560;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.nav-item {
  display: block;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
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
}

.btn-primary {
  background: #e94560;
  color: #fff;
}

.btn-primary:hover {
  background: #d63851;
}

.btn-secondary {
  background: #fff;
  color: #333;
  border: 1px solid #d9d9d9;
}

.btn-secondary:hover {
  color: #e94560;
  border-color: #e94560;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 13px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 600;
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
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #e94560;
  box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  margin: 2px;
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
  color: #fa8c16;
  background: #fff7e6;
}

.status-contacted {
  color: #1890ff;
  background: #e6f7ff;
}

.status-interviewing {
  color: #722ed1;
  background: #f9f0ff;
}

.status-rejected {
  color: #f5222d;
  background: #fff1f0;
}

.status-open {
  color: #52c41a;
  background: #f6ffed;
}

.status-closed {
  color: #999;
  background: #f5f5f5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
