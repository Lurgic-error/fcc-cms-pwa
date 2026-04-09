<script setup>
import { faChevronDown, faGlobe } from '@/plugins/fontAwesome'
import { useLocale } from '@/composables/useLocale'

const { locale, locales, setLocale } = useLocale()
</script>

<template>
  <el-dropdown trigger="click">
    <el-button class="locale-selector-trigger" plain>
      <font-awesome-icon :icon="faGlobe" />
      <span class="ml-2 hidden sm:inline">{{ locale.toUpperCase() }}</span>
      <font-awesome-icon :icon="faChevronDown" class="ml-2 text-[0.72rem]" />
    </el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="option in locales"
          :key="option.code"
          class="locale-selector-option"
          @click="setLocale(option.code)"
        >
          <div class="locale-selector-option-content">
            <span class="font-bold w-6">{{ option.code.toUpperCase() }}</span>
            <span>{{ option.label }}</span>
            <span v-if="locale === option.code" class="locale-selector-check">Active</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped>
.locale-selector-trigger {
  border-radius: 999px !important;
  padding: 0.45rem 0.75rem !important;
  border-color: var(--fcc-border) !important;
  color: var(--fcc-text) !important;
  background: var(--fcc-surface) !important;
}

.locale-selector-option {
  min-width: 10rem;
}

.locale-selector-option-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.locale-selector-check {
  margin-left: auto;
  color: var(--fcc-primary-700);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
