<script setup>
import { computed } from 'vue'
import AppSearchField from '@/components/common/AppSearchField.vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  searchLabel: { type: String, default: 'Search' },
  searchPlaceholder: { type: String, default: 'Search records' },
  filterFields: { type: Array, default: () => [] },
  filterValues: { type: Object, default: () => ({}) },
  applyLabel: { type: String, default: 'Apply' },
  resetLabel: { type: String, default: 'Clear filters' },
  error: { type: String, default: '' },
  framed: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:searchQuery', 'update:filterValues', 'apply', 'reset'])

function updateFilter(key, value) {
  emit('update:filterValues', {
    ...(props.filterValues || {}),
    [key]: value,
  })
}

const layoutStyle = computed(() => {
  const fieldCount = Array.isArray(props.filterFields) ? props.filterFields.length : 0

  return {
    '--overview-filter-template':
      fieldCount > 0
        ? `minmax(0, 1.5fr) repeat(${fieldCount}, minmax(11rem, 1fr)) auto`
        : 'minmax(0, 1fr) auto',
  }
})
</script>

<template>
  <section
    class="overview-filter-bar"
    :class="{
      'surface-card': framed,
      'overview-filter-bar--bare': !framed,
    }"
  >
    <div class="overview-filter-bar__grid" :style="layoutStyle">
      <div class="overview-filter-bar__search">
        <AppSearchField
          :model-value="searchQuery"
          :label="searchLabel"
          :placeholder="searchPlaceholder"
          :disabled="loading"
          @update:model-value="$emit('update:searchQuery', $event)"
        />
      </div>

      <template v-for="field in filterFields" :key="field.key">
        <label class="overview-filter-bar__field">
          <span class="overview-filter-bar__label">{{ field.label }}</span>

          <el-select
            v-if="field.type === 'select'"
            :model-value="filterValues[field.key]"
            :placeholder="field.placeholder || field.label"
            clearable
            size="large"
            @update:model-value="updateFilter(field.key, $event)"
          >
            <el-option
              v-for="option in field.options || []"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <el-date-picker
            v-else-if="field.type === 'date'"
            :model-value="filterValues[field.key]"
            type="date"
            value-format="YYYY-MM-DD"
            size="large"
            :placeholder="field.placeholder || field.label"
            @update:model-value="updateFilter(field.key, $event)"
          />

          <el-input
            v-else
            :model-value="filterValues[field.key]"
            :placeholder="field.placeholder || field.label"
            size="large"
            @update:model-value="updateFilter(field.key, $event)"
          />
        </label>
      </template>

      <div class="overview-filter-bar__actions">
        <el-button size="large" plain :disabled="loading" @click="$emit('reset')">
          {{ resetLabel }}
        </el-button>
        <el-button size="large" type="primary" :loading="loading" @click="$emit('apply')">
          {{ applyLabel }}
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      class="overview-filter-bar__alert"
    />
  </section>
</template>
