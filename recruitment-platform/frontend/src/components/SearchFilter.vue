<template>
  <div class="search-filter">
    <div class="sf-search">
      <span class="sf-icon">🔍</span>
      <input
        v-model="keyword"
        type="text"
        :placeholder="placeholder"
        class="filter-input"
        @input="onFilter"
      />
      <span v-if="keyword" class="sf-clear" @click="clearKeyword" title="清除">✕</span>
    </div>
    <select v-if="showLocation" v-model="location" class="filter-select" @change="onFilter">
      <option value="">全部地点</option>
      <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
    </select>
    <select v-if="showStatus" v-model="status" class="filter-select" @change="onFilter">
      <option value="">全部状态</option>
      <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
    </select>
    <button v-if="hasAnyFilter" class="filter-reset" @click="resetAll">重置筛选</button>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  placeholder: { type: String, default: '搜索...' },
  showLocation: { type: Boolean, default: false },
  showStatus: { type: Boolean, default: false },
  locations: { type: Array, default: () => [] },
  statuses: { type: Array, default: () => [] },
  initKeyword: { type: String, default: '' },
  initLocation: { type: String, default: '' },
  initStatus: { type: String, default: '' }
})

const emit = defineEmits(['filter', 'reset'])

const keyword = ref(props.initKeyword)
const location = ref(props.initLocation)
const status = ref(props.initStatus)

watch(() => props.initKeyword, v => { keyword.value = v })
watch(() => props.initLocation, v => { location.value = v })
watch(() => props.initStatus, v => { status.value = v })

const hasAnyFilter = computed(() => {
  return !!keyword.value || !!location.value || !!status.value
})

function onFilter() {
  emit('filter', {
    keyword: keyword.value,
    location: location.value,
    status: status.value
  })
}

function clearKeyword() {
  keyword.value = ''
  onFilter()
}

function resetAll() {
  keyword.value = ''
  location.value = ''
  status.value = ''
  emit('reset')
  emit('filter', { keyword: '', location: '', status: '' })
}
</script>

<style scoped>
.search-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.sf-search {
  position: relative;
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
}

.sf-icon {
  position: absolute;
  left: 12px;
  font-size: 13px;
  opacity: 0.5;
  pointer-events: none;
  z-index: 1;
}

.filter-input {
  width: 100%;
  padding: 9px 30px 9px 34px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  transition: all 0.2s;
}

.filter-input:focus {
  outline: none;
  border-color: #e94560;
  box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.1);
}

.sf-clear {
  position: absolute;
  right: 10px;
  width: 18px;
  height: 18px;
  line-height: 16px;
  text-align: center;
  font-size: 11px;
  color: #999;
  border-radius: 50%;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s;
}

.sf-clear:hover {
  background: #e94560;
  color: #fff;
}

.filter-select {
  padding: 9px 30px 9px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
  min-width: 130px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 34px;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #e94560;
}

.filter-reset {
  padding: 9px 14px;
  border: 1px dashed #d9d9d9;
  background: #fff;
  color: #888;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-reset:hover {
  color: #e94560;
  border-color: #e94560;
  background: #fff1f0;
}
</style>
