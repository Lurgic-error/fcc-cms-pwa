<script setup>
import AppSearchField from '@/components/common/AppSearchField.vue'

const props = defineProps({
  searchQuery: { type: String, default: '' },
  searchLabel: { type: String, default: 'Search' },
  searchPlaceholder: { type: String, default: 'Search records' },
  filterFields: { type: Array, default: () => [] },
  filterValues: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:searchQuery', 'update:filterValues', 'apply', 'reset'])

function updateFilter(key, value) {
  emit('update:filterValues', {
    ...(props.filterValues || {}),
    [key]: value,
  })
}
</script>

<template>
  <section class="surface-card overview-filter-bar">
    <AppFormRow :columns="Math.max(2, filterFields.length + 2)">
      <AppSearchField
        :model-value="searchQuery"
        :label="searchLabel"
        :placeholder="searchPlaceholder"
        :disabled="loading"
        @update:model-value="$emit('update:searchQuery', $event)"
      />

      <template v-for="field in filterFields" :key="field.key">
        <label class="overview-filter-bar__field">
          <span class="overview-filter-bar__label">{{ field.label }}</span>

          <el-select
            v-if="field.type === 'select'"
            :model-value="filterValues[field.key]"
            :placeholder="field.placeholder || field.label"
            clearable
            size="large"
            class="w-full"
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
            class="w-full"
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
        <el-button plain :disabled="loading" @click="$emit('reset')">Clear filters</el-button>
        <el-button type="primary" :loading="loading" @click="$emit('apply')">Apply</el-button>
      </div>
    </AppFormRow>
  </section>
</template>

<style scoped>
.overview-filter-bar {
  padding: 1rem;
}

.overview-filter-bar__field {
  display: grid;
  gap: 0.45rem;
  min-width: 0;
}

.overview-filter-bar__label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fcc-text-muted);
}

.overview-filter-bar__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  align-items: end;
}

.overview-filter-bar :deep(.el-input__wrapper),
.overview-filter-bar :deep(.el-select__wrapper),
.overview-filter-bar :deep(.el-date-editor.el-input) {
  border-radius: var(--fcc-radius-pill) !important;
}

.overview-filter-bar :deep(.el-input__wrapper) {
  padding-inline: 1.25rem;
}
</style>
