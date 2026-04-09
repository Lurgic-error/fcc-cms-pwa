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
  faXmark,
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
      <button
        v-if="!isDesktop"
        type="button"
        class="app-header__menu"
        aria-label="Open navigation"
        @click="emit('toggle-sidebar')"
      >
        <font-awesome-icon :icon="faBars" />
      </button>

      <div ref="searchWrapper" class="app-header__search">
        <label class="app-header__search-shell">
          <font-awesome-icon :icon="faMagnifyingGlass" class="app-header__search-icon" />
          <input
            v-model="searchQuery"
            type="search"
            class="app-header__search-input"
            :placeholder="
              translate(
                'shell.header.searchPlaceholder',
                'Search records, publications, or users...',
              )
            "
            @focus="openSearch"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="app-header__search-clear"
            aria-label="Clear search"
            @click.prevent="clearSearch"
          >
            <font-awesome-icon :icon="faXmark" />
          </button>
        </label>

        <div v-if="isSearchOpen" class="app-header__search-panel">
          <button
            v-for="result in searchResults"
            :key="result.routeName"
            type="button"
            class="app-header__search-result"
            @click="goToRoute(result.routeName)"
          >
            <span class="app-header__search-result-label">{{ result.label }}</span>
            <span class="app-header__search-result-meta">
              {{ result.parentLabel }} · {{ result.sectionTitle }}
            </span>
          </button>

          <p v-if="searchResults.length === 0" class="app-header__search-empty">
            {{ translate('shell.header.searchEmpty', 'No matching workspaces found.') }}
          </p>
        </div>
      </div>
    </div>

    <div class="app-header__right">
      <a
        href="https://fcc.go.tz"
        target="_blank"
        rel="noopener noreferrer"
        class="app-header__website-link"
      >
        <font-awesome-icon :icon="faArrowUpRightFromSquare" />
        <span>Visit Website</span>
      </a>

      <span class="app-header__divider" />

      <div class="flex items-center gap-2">
        <ThemeModeSelector />
        <LocaleSelector />
      </div>

      <div ref="alertsWrapper" class="app-header__alerts">
        <button
          type="button"
          class="app-header__icon-button"
          aria-label="Open alerts"
          @click="isAlertsOpen = !isAlertsOpen"
        >
          <font-awesome-icon :icon="faBell" />
          <span v-if="notificationCount" class="app-header__icon-badge">{{
            notificationCount
          }}</span>
        </button>

        <div v-if="isAlertsOpen" class="app-header__alerts-panel">
          <button
            v-for="item in alertItems"
            :key="item.routeName"
            type="button"
            class="app-header__alert-item"
            @click="goToRoute(item.routeName)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="app-header__status">
        <font-awesome-icon :icon="faCircleCheck" class="app-header__status-icon" />
        <span>System Status:</span>
        <span class="app-header__status-value">Healthy</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 0 2rem;
  background: color-mix(in srgb, var(--fcc-surface) 82%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--fcc-border);
}

.app-header__left,
.app-header__right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-header__left {
  min-width: 0;
  flex: 1;
}

.app-header__menu,
.app-header__icon-button {
  position: relative;
  width: 2.35rem;
  height: 2.35rem;
  border: 0;
  border-radius: var(--fcc-radius-md);
  background: transparent;
  color: var(--fcc-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-header__menu:hover,
.app-header__icon-button:hover {
  background: var(--fcc-primary-50);
  color: var(--fcc-primary-600);
}

.app-header__icon-badge {
  position: absolute;
  top: 0.28rem;
  right: 0.28rem;
  min-width: 0.95rem;
  height: 0.95rem;
  border-radius: 999px;
  padding-inline: 0.18rem;
  background: #ef4444;
  border: 2px solid var(--fcc-surface);
  color: #ffffff;
  font-size: 0.58rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.app-header__search {
  position: relative;
  min-width: 0;
  width: min(28rem, 100%);
}

.app-header__search-shell {
  min-height: 2.6rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0 1.25rem;
  border-radius: var(--fcc-radius-pill);
  background: var(--fcc-surface-muted);
  border: 1px solid var(--fcc-border);
  transition: all 0.2s ease;
}

.app-header__search-shell:focus-within {
  border-color: var(--fcc-primary-400);
  background: var(--fcc-surface);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--fcc-primary-500) 10%, transparent);
}

.app-header__search-icon {
  color: var(--fcc-text-muted);
}

.app-header__search-input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--fcc-text);
  font-size: 0.92rem;
}

.app-header__search-input::placeholder {
  color: var(--fcc-text-muted);
  opacity: 0.6;
}

.app-header__search-clear {
  width: 1.55rem;
  height: 1.55rem;
  border: 0;
  border-radius: var(--fcc-radius-pill);
  background: color-mix(in srgb, var(--fcc-text-muted) 15%, transparent);
  color: var(--fcc-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.app-header__search-panel,
.app-header__alerts-panel {
  position: absolute;
  top: calc(100% + 0.65rem);
  right: 0;
  left: 0;
  z-index: 10;
  background: var(--fcc-surface);
  border: 1px solid var(--fcc-border-strong);
  border-radius: var(--fcc-radius-lg);
  box-shadow: var(--fcc-shadow-soft);
  padding: 0.45rem;
  display: grid;
  gap: 0.25rem;
}

.app-header__search-result,
.app-header__alert-item {
  width: 100%;
  border: 0;
  background: transparent;
  border-radius: var(--fcc-radius-md);
  padding: 0.7rem 0.8rem;
  display: grid;
  text-align: left;
  cursor: pointer;
}

.app-header__search-result:hover,
.app-header__alert-item:hover {
  background: var(--fcc-primary-50);
}

.app-header__search-result-label {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--fcc-text);
}

.app-header__search-result-meta,
.app-header__search-empty {
  font-size: 0.72rem;
  color: var(--fcc-text-muted);
}

.app-header__alerts {
  position: relative;
}

.app-header__alerts-panel {
  left: auto;
  width: 14rem;
}

.app-header__website-link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.7rem 1.25rem;
  border-radius: var(--fcc-radius-pill);
  background: var(--fcc-primary-50);
  border: 1px solid color-mix(in srgb, var(--fcc-primary-200) 50%, transparent);
  color: var(--fcc-primary-600);
  text-decoration: none;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.app-header__divider {
  width: 1px;
  height: 1.5rem;
  background: var(--fcc-border);
}

.app-header__status {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.6rem 1.25rem;
  border-radius: var(--fcc-radius-pill);
  border: 1px solid var(--fcc-border);
  background: var(--fcc-surface);
  color: var(--fcc-text);
  font-size: 0.9rem;
  font-weight: 700;
}

.app-header__status-icon {
  color: var(--fcc-primary-500);
}

.app-header__status-value {
  color: #10b981;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

@media (max-width: 980px) {
  .app-header {
    padding-inline: 1rem;
  }

  .app-header__website-link span,
  .app-header__status {
    display: none;
  }
}

@media (max-width: 720px) {
  .app-header {
    gap: 0.75rem;
  }

  .app-header__right {
    gap: 0.4rem;
  }

  .app-header__search {
    width: 100%;
  }

  .app-header__website-link {
    padding-inline: 0.8rem;
  }

  .app-header__divider {
    display: none;
  }
}
</style>
