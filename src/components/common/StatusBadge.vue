<script setup>
import { computed } from 'vue'

import { getStatusLabel, getStatusTone } from '@/utils/adminPresentation'

const props = defineProps({
  value: { type: String, default: '' },
  label: { type: String, default: '' },
})

const resolvedLabel = computed(() => props.label || getStatusLabel(props.value))
const resolvedTone = computed(() => getStatusTone(props.value))
</script>

<template>
  <el-tag :type="resolvedTone" effect="plain" round size="small">
    {{ resolvedLabel }}
  </el-tag>
</template>
