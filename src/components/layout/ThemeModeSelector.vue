<script setup>
import { faChevronDown, faDesktop, faMoon, faSun } from '@/plugins/fontAwesome'
import { useThemeStore } from '@/stores/useThemeStore'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const { mode } = storeToRefs(themeStore)

const options = [
  { label: 'Light', value: 'light', icon: faSun },
  { label: 'Dark', value: 'dark', icon: faMoon },
  { label: 'System', value: 'system', icon: faDesktop },
]
</script>

<template>
  <el-dropdown trigger="click">
    <el-button class="shell-selector-trigger" plain>
      <font-awesome-icon :icon="mode === 'light' ? faSun : mode === 'dark' ? faMoon : faDesktop" />
      <span class="shell-selector-trigger__label">Theme</span>
      <font-awesome-icon :icon="faChevronDown" class="shell-selector-trigger__chevron" />
    </el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="option in options"
          :key="option.value"
          class="shell-selector-option"
          @click="themeStore.setMode(option.value)"
        >
          <div class="shell-selector-option-content">
            <font-awesome-icon :icon="option.icon" />
            <span>{{ option.label }}</span>
            <span v-if="mode === option.value" class="shell-selector-check">Active</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
