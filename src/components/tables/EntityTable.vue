<script setup>
import AppSearchField from '@/components/common/AppSearchField.vue'
import AppDetailGrid from '@/components/common/detail/AppDetailGrid.vue'
import { computed } from 'vue'

import StatusBadge from '@/components/common/StatusBadge.vue'
import EntityActionsDropdown from '@/components/workflow/EntityActionsDropdown.vue'
import { useLocale } from '@/composables/useLocale'
import { formatDisplayValue, isDateLikeField, resolveFieldValue } from '@/utils/adminPresentation'

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  records: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  emptyText: { type: String, default: 'No records found.' },
  searchQuery: { type: String, default: '' },
  searchLabel: { type: String, default: 'Search' },
  searchPlaceholder: { type: String, default: 'Search records' },
  createLabel: { type: String, default: 'Create' },
  showCreate: { type: Boolean, default: true },
  showRefresh: { type: Boolean, default: true },
  showSearch: { type: Boolean, default: true },
  actions: { type: [Array, Function], default: () => [] },
  selectable: { type: Boolean, default: false },
  selectedRowKeys: { type: Array, default: () => [] },
  framed: { type: Boolean, default: true },
})

const emit = defineEmits([
  'update:searchQuery',
  'create',
  'refresh',
  'row-click',
  'action',
  'view',
  'edit',
  'selection-change',
])

const { locale } = useLocale()

const resolvedColumns = computed(() => props.columns || [])

function getRowActions(row) {
  return typeof props.actions === 'function' ? props.actions(row) : props.actions || []
}

function cellValue(row, column) {
  if (!column) return '-'
  const rawValue = resolveFieldValue(row, column)
  const formattedValue =
    typeof column.formatter === 'function'
      ? column.formatter(row)
      : formatDisplayValue(rawValue, column, locale.value)

  return {
    rawValue,
    formattedValue,
    isStatus:
      column?.type === 'status' ||
      column?.badge === 'status' ||
      ['status', 'publicationStatus', 'effectiveStatus'].includes(column?.key),
    isDate: isDateLikeField(column),
  }
}

function getRowKey(row) {
  return row?.[props.rowKey] || row?._id || JSON.stringify(row)
}

function onRowClick(row) {
  emit('row-click', row)
}

function onAction(action, row) {
  emit('action', { action, row })

  if (action.key === 'view') {
    emit('view', row)
  }

  if (action.key === 'edit') {
    emit('edit', row)
  }
}

function onSelectionChange(selection = []) {
  emit('selection-change', selection)
}

function isSelected(row) {
  return props.selectedRowKeys.includes(getRowKey(row))
}

function onMobileSelectionChange(row, checked) {
  const nextKeys = new Set(props.selectedRowKeys)
  const rowKey = getRowKey(row)

  if (checked) {
    nextKeys.add(rowKey)
  } else {
    nextKeys.delete(rowKey)
  }

  emit(
    'selection-change',
    props.records.filter((item) => nextKeys.has(getRowKey(item))),
  )
}
</script>

<template>
  <section class="entity-table-shell" :class="{ 'surface-card': framed }">
    <header class="entity-table__header">
      <div class="entity-table__copy">
        <h2 class="entity-table__title">{{ title }}</h2>
        <p v-if="description" class="entity-table__description">{{ description }}</p>
      </div>

      <div class="entity-table__toolbar">
        <AppSearchField
          v-if="showSearch"
          :label="searchLabel"
          :placeholder="searchPlaceholder"
          :model-value="searchQuery"
          @update:model-value="$emit('update:searchQuery', $event)"
        />
        <el-button v-if="showRefresh" size="large" plain :loading="loading" @click="$emit('refresh')">
          Refresh
        </el-button>
        <el-button
          v-if="showCreate"
          size="large"
          type="primary"
          :disabled="loading"
          @click="$emit('create')"
        >
          {{ createLabel }}
        </el-button>
      </div>
    </header>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      class="app-inline-alert app-inline-alert--compact"
    />

    <div class="workspace-table workspace-table--scroll entity-table__desktop-shell">
      <el-table
        :data="records"
        :row-key="getRowKey"
        stripe
        v-loading="loading"
        class="entity-table__desktop"
        @selection-change="onSelectionChange"
        @row-click="onRowClick"
      >
        <el-table-column v-if="selectable" type="selection" width="52" reserve-selection />

        <el-table-column
          v-for="column in resolvedColumns"
          :key="column.key"
          :prop="column.key"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth || 140"
        >
          <template #default="{ row }">
            <StatusBadge
              v-if="cellValue(row, column).isStatus"
              :value="cellValue(row, column).rawValue || cellValue(row, column).formattedValue"
              :label="cellValue(row, column).formattedValue"
            />
            <span v-else>{{ cellValue(row, column).formattedValue }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="actions.length || typeof actions === 'function'"
          label="Actions"
          min-width="180"
          fixed="right"
        >
          <template #default="{ row }">
            <EntityActionsDropdown
              :actions="getRowActions(row)"
              label="Actions"
              size="small"
              plain
              :disabled="loading"
              :loading="loading"
              @select="onAction($event, row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="entity-table__mobile entity-table__mobile-shell">
      <div class="entity-table__mobile-list">
        <AppDetailGrid columns="1">
        <article
          v-for="row in records"
          :key="getRowKey(row)"
          class="enterprise-mobile-record-card"
          @click="onRowClick(row)"
        >
          <div v-if="selectable" class="entity-table__mobile-select">
            <el-checkbox
              :model-value="isSelected(row)"
              @click.stop
              @change="onMobileSelectionChange(row, $event)"
            >
              Select
            </el-checkbox>
          </div>

          <div class="entity-table__mobile-grid">
            <div
              v-for="column in resolvedColumns"
              :key="`${getRowKey(row)}-${column.key}`"
              class="entity-table__mobile-row"
            >
              <span class="entity-table__mobile-label">{{ column.label }}</span>
              <StatusBadge
                v-if="cellValue(row, column).isStatus"
                :value="cellValue(row, column).rawValue || cellValue(row, column).formattedValue"
                :label="cellValue(row, column).formattedValue"
              />
              <span v-else class="entity-table__mobile-value">
                {{ cellValue(row, column).formattedValue }}
              </span>
            </div>
          </div>

          <div v-if="getRowActions(row).length" class="entity-table__mobile-actions">
            <EntityActionsDropdown
              :actions="getRowActions(row)"
              label="Actions"
              size="small"
              plain
              :disabled="loading"
              :loading="loading"
              @select="onAction($event, row)"
            />
          </div>
        </article>
        </AppDetailGrid>
      </div>
    </div>

    <p v-if="!loading && records.length === 0" class="entity-table__empty">
      {{ emptyText }}
    </p>
  </section>
</template>
