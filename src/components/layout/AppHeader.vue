<script setup>
import { flattenAdminShellNavigation } from '@/navigation/adminShell'
import ThemeModeSelector from '@/components/layout/ThemeModeSelector.vue'
import LocaleSelector from '@/components/layout/LocaleSelector.vue'
import {
  faArrowUpRightFromSquare,
  faBars,
  faBell,
  faCircleCheck,
  faMagnifyingGlass,
} from '@/plugins/fontAwesome'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
  isDesktop: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const { t, te } = useI18n()

const searchWrapper = ref(null)
const alertsWrapper = ref(null)
const searchQuery = ref('')
const isSearchOpen = ref(false)
const isAlertsOpen = ref(false)

function translate(key, fallback) {
  if (!key || !te(key)) return fallback
  return t(key)
}

const searchIndex = computed(() => flattenAdminShellNavigation(props.sections))

const searchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return searchIndex.value.slice(0, 8)
  }

  return searchIndex.value
    .filter((entry) =>
      `${entry.label} ${entry.parentLabel} ${entry.sectionTitle} ${entry.description}`
        .toLowerCase()
        .includes(query),
    )
    .slice(0, 8)
})

const alertItems = computed(() => {
  return searchIndex.value.filter((entry) =>
    [
      'publications.reviewQueue',
      'publicationCategories.reviewQueue',
      'events.reviewQueue',
      'questions.reviewQueue',
      'videos.reviewQueue',
      'system.workflowMonitor',
    ].includes(entry.routeName),
  )
})

const notificationCount = computed(() => alertItems.value.length)

function openSearch() {
  isSearchOpen.value = true
}

function clearSearch() {
  searchQuery.value = ''
  isSearchOpen.value = false
}

async function goToRoute(routeName) {
  if (!routeName) return
  await router.push({ name: routeName })
  clearSearch()
  isAlertsOpen.value = false
}

function handleDocumentPointerDown(event) {
  if (searchWrapper.value && !searchWrapper.value.contains(event.target)) {
    isSearchOpen.value = false
  }

  if (alertsWrapper.value && !alertsWrapper.value.contains(event.target)) {
    isAlertsOpen.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    isSearchOpen.value = false
    isAlertsOpen.value = false
    searchQuery.value = ''
  },
)

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
})
</script>

<template>
  <header class="app-header">
    <div class="app-header__left">
      <el-button
        v-if="!isDesktop"
        text
        class="app-header__menu"
        :aria-label="translate('shell.header.navigation', 'Open navigation')"
        @click="emit('toggle-sidebar')"
      >
        <font-awesome-icon :icon="faBars" />
      </el-button>

      <div ref="searchWrapper" class="app-header__search">
        <el-input
          v-model="searchQuery"
          type="search"
          clearable
          class="app-header__search-input"
          :placeholder="
            translate(
              'shell.header.searchPlaceholder',
              'Search records, publications, or users...',
            )
          "
          @focus="openSearch"
          @clear="clearSearch"
        >
          <template #prefix>
            <font-awesome-icon :icon="faMagnifyingGlass" class="app-header__search-icon" />
          </template>
        </el-input>

        <div v-if="isSearchOpen" class="app-header__search-panel">
          <el-button
            v-for="result in searchResults"
            :key="result.routeName"
            text
            class="app-header__search-result"
            @click="goToRoute(result.routeName)"
          >
            <span class="app-header__search-result-label">{{ result.label }}</span>
            <span class="app-header__search-result-meta">
              {{ result.parentLabel }} · {{ result.sectionTitle }}
            </span>
          </el-button>

          <p v-if="searchResults.length === 0" class="app-header__search-empty">
            {{ translate('shell.header.searchEmpty', 'No matching workspaces found.') }}
          </p>
        </div>
      </div>
    </div>

    <div class="app-header__right">
      <el-link
        href="https://fcc.go.tz"
        target="_blank"
        rel="noopener noreferrer"
        :underline="false"
        class="app-header__website-link"
      >
        <font-awesome-icon :icon="faArrowUpRightFromSquare" />
        <span>{{ translate('shell.header.visitWebsite', 'Visit Website') }}</span>
      </el-link>

      <span class="app-header__divider" />

      <div class="app-header__control-group">
        <ThemeModeSelector />
        <LocaleSelector />
      </div>

      <div ref="alertsWrapper" class="app-header__alerts">
        <el-button
          text
          class="app-header__icon-button"
          aria-label="Open alerts"
          @click="isAlertsOpen = !isAlertsOpen"
        >
          <font-awesome-icon :icon="faBell" />
          <span v-if="notificationCount" class="app-header__icon-badge">{{
            notificationCount
          }}</span>
        </el-button>

        <div v-if="isAlertsOpen" class="app-header__alerts-panel">
          <el-button
            v-for="item in alertItems"
            :key="item.routeName"
            text
            class="app-header__alert-item"
            @click="goToRoute(item.routeName)"
          >
            {{ item.label }}
          </el-button>
        </div>
      </div>

      <div class="app-header__status">
        <font-awesome-icon :icon="faCircleCheck" class="app-header__status-icon" />
        <span>{{ translate('shell.header.secureSession', 'Secure session') }}</span>
      </div>
    </div>
  </header>
</template>
