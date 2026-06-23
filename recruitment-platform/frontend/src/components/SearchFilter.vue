<template>
  <div class="search-filter">
    <input
      v-model="keyword"
      type="text"
      :placeholder="placeholder"
      class="filter-input"
      @input="onFilter"
    />
    <select v-if="showLocation" v-model="location" class="filter-select" @change="onFilter">
      <option value="">全部地点</option>
      <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
    </select>
    <select v-if="showStatus" v-model="status" class="filter-select" @change="onFilter">
      <option value="">全部状态</option>
      <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  placeholder: { type: String, default: '搜索...' },
  showLocation: { type: Boolean, default: false },
  showStatus: { type: Boolean, default: false },
  locations: { type: Array, default: () => [] },
  statuses: { type: Array, default: () => [] },
  modelKeyword: { type: String, default: '' },
  modelLocation: { type: String, default: '' },
  modelStatus: { type: String, default: '' }
})

const emit = defineEmits(['filter'])

const keyword = ref(props.modelKeyword)
const location = ref(props.modelLocation)
const status = ref(props.modelStatus)

watch(() => props.modelKeyword, v => { keyword.value = v })
watch(() => props.modelLocation, v => { location.value = v })
watch(() => props.modelStatus, v => { status.value = v })

function onFilter() {
  emit('filter', {
    keyword: keyword.value,
    location: location.value,
    status: status.value
  })
}
</script>

<style scoped>
.search-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-input {
  flex: 1;
  min-width: 200px;
  padding: 8px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
}

.filter-input:focus {
  outline: none;
  border-color: #e94560;
  box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.1);
}

.filter-select {
  padding: 8px 14px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #e94560;
}
</style>
