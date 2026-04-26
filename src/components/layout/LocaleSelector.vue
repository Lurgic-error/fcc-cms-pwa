<script setup>
import { faChevronDown, faGlobe } from '@/plugins/fontAwesome'
import { useLocale } from '@/composables/useLocale'

const { locale, locales, setLocale } = useLocale()
</script>

<template>
  <el-dropdown trigger="click">
    <el-button class="shell-selector-trigger" plain>
      <font-awesome-icon :icon="faGlobe" />
      <span class="shell-selector-trigger__label">{{ locale.toUpperCase() }}</span>
      <font-awesome-icon :icon="faChevronDown" class="shell-selector-trigger__chevron" />
    </el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="option in locales"
          :key="option.code"
          class="shell-selector-option"
          @click="setLocale(option.code)"
        >
          <div class="shell-selector-option-content">
            <span class="shell-selector-option__code">{{ option.code.toUpperCase() }}</span>
            <span>{{ option.label }}</span>
            <span v-if="locale === option.code" class="shell-selector-check">Active</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
