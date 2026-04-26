<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import { computed } from 'vue'

const props = defineProps({
  actions: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: 'Actions',
  },
  type: {
    type: String,
    default: 'default',
  },
  size: {
    type: String,
    default: 'large',
  },
  plain: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

const normalizedActions = computed(() => {
  let previousGroup = ''

  return (props.actions || []).map((action) => {
    const group = action?.group || ''
    const divided = Boolean(previousGroup) && Boolean(group) && previousGroup !== group
    previousGroup = group

    return {
      ...action,
      divided,
    }
  })
})

function onCommand(actionKey) {
  const action = normalizedActions.value.find((item) => item.key === actionKey)
  if (!action || action.disabled) return
  emit('select', action)
}
</script>

<template>
  <el-dropdown
    trigger="click"
    placement="bottom-end"
    :disabled="disabled || !normalizedActions.length"
    @command="onCommand"
  >
    <el-button :type="type" :size="size" :plain="plain" :loading="loading">
      {{ label }}
      <el-icon class="entity-actions-dropdown__chevron"><ArrowDown /></el-icon>
    </el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="action in normalizedActions"
          :key="action.key"
          :command="action.key"
          :divided="action.divided"
          :disabled="action.disabled"
        >
          <span :class="{ 'entity-actions-dropdown__label--danger': action.danger }">
            {{ action.label }}
          </span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
