<script setup>
import StatusBadge from '@/components/common/StatusBadge.vue'
import AppDetailCard from '@/components/common/detail/AppDetailCard.vue'
import AppDetailGrid from '@/components/common/detail/AppDetailGrid.vue'
import AppDetailItem from '@/components/common/detail/AppDetailItem.vue'
import { useLocale } from '@/composables/useLocale'
import { formatDisplayValue, resolveFieldValue } from '@/utils/adminPresentation'

defineProps({
  title: { type: String, default: 'Details' },
  subtitle: { type: String, default: '' },
  record: { type: Object, default: null },
  fields: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const { locale } = useLocale()

function readValue(field, record = {}) {
  const rawValue = resolveFieldValue(record, field)
  const formattedValue =
    typeof field.formatter === 'function'
      ? field.formatter(record)
      : formatDisplayValue(rawValue, field, locale.value)

  return {
    rawValue,
    formattedValue,
    isStatus: ['status', 'publicationStatus', 'effectiveStatus'].includes(field?.key),
    isImage: field?.kind === 'image',
  }
}
</script>

<template>
  <AppDetailCard :title="title" :subtitle="subtitle">
    <template #header-actions>
      <slot name="header-actions" />
    </template>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb-4" />

    <div v-loading="loading">
      <AppDetailGrid :columns="2">
        <AppDetailItem
          v-for="field in fields"
          :key="`${field.key}-${field.label}`"
          :label="field.label"
        >
          <slot
            :name="`field-${field.key}`"
            :field="field"
            :record="record"
            :value="readValue(field, record || {})"
          >
            <StatusBadge
              v-if="readValue(field, record || {}).isStatus"
              :value="
                readValue(field, record || {}).rawValue ||
                readValue(field, record || {}).formattedValue
              "
              :label="readValue(field, record || {}).formattedValue"
            />
            <img
              v-else-if="
                readValue(field, record || {}).isImage &&
                readValue(field, record || {}).formattedValue
              "
              :src="readValue(field, record || {}).formattedValue"
              :alt="field.label"
              class="h-32 w-full max-w-xs border object-cover"
              style="border-radius: var(--fcc-radius-lg); border-color: var(--fcc-border)"
            />
            <template v-else>
              {{ readValue(field, record || {}).formattedValue }}
            </template>
          </slot>
        </AppDetailItem>
      </AppDetailGrid>
    </div>
  </AppDetailCard>
</template>
