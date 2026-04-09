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
    <el-button class="theme-selector-trigger" plain>
      <font-awesome-icon :icon="mode === 'light' ? faSun : mode === 'dark' ? faMoon : faDesktop" />
      <span class="ml-2 hidden sm:inline">Theme</span>
      <font-awesome-icon :icon="faChevronDown" class="ml-2 text-[0.72rem]" />
    </el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="option in options"
          :key="option.value"
          class="theme-selector-option"
          @click="themeStore.setMode(option.value)"
        >
          <div class="theme-selector-option-content">
            <font-awesome-icon :icon="option.icon" />
            <span>{{ option.label }}</span>
            <span v-if="mode === option.value" class="theme-selector-check">Active</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped>
.theme-selector-trigger {
  border-radius: 999px !important;
  padding: 0.45rem 0.75rem !important;
  border-color: var(--fcc-border) !important;
  color: var(--fcc-text) !important;
  background: var(--fcc-surface) !important;
}

.theme-selector-option {
  min-width: 9rem;
}

.theme-selector-option-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-selector-check {
  margin-left: auto;
  color: var(--fcc-primary-700);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
