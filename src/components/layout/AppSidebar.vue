<script setup>
import AppSidebarSection from '@/components/layout/AppSidebarSection.vue'
import logo from '@/assets/imgs/logo-2-removebg-preview.png'
import { faRightFromBracket } from '@/plugins/fontAwesome'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUsersStore } from '@/stores/useUsersStore'
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close-sidebar'])

const authStore = useAuthStore()
const usersStore = useUsersStore()
const router = useRouter()
const route = useRoute()

const expandedState = reactive({})

function formatRole(value = '') {
  return String(value || '')
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function isRouteMatch(matcher, routeName) {
  if (!matcher || !routeName) return false
  return matcher.endsWith('.') ? routeName.startsWith(matcher) : routeName === matcher
}

function isItemActive(item) {
  const currentRouteName = typeof route.name === 'string' ? route.name : ''
  return (item.matchRoutes || []).some((matcher) => isRouteMatch(matcher, currentRouteName))
}

function activeChildRouteName(item) {
  const currentRouteName = typeof route.name === 'string' ? route.name : ''
  return (
    item.children?.find((child) =>
      (child.matchRoutes || [child.routeName]).some((matcher) =>
        isRouteMatch(matcher, currentRouteName),
      ),
    )?.routeName || ''
  )
}

function syncExpandedState() {
  for (const section of props.sections) {
    for (const item of section.items) {
      if (!item.children?.length) continue

      if (isItemActive(item)) {
        expandedState[item.id] = true
      } else if (!(item.id in expandedState)) {
        expandedState[item.id] = false
      }
    }
  }
}

watch(() => [props.sections, route.fullPath], syncExpandedState, { immediate: true, deep: true })

const userDisplayName = computed(() => {
  return usersStore.profile?.fullName || usersStore.profile?.name || 'PR Officer'
})

const userSecondary = computed(() => {
  return formatRole(usersStore.role || usersStore.roles?.[0]) || 'Digital Content'
})

const userInitials = computed(() => {
  const source = usersStore.profile?.fullName || usersStore.profile?.name || 'PR'
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
})

async function navigateTo(item) {
  if (!item?.routeName) return
  await router.push({ name: item.routeName })
  emit('close-sidebar')
}

function toggleItem(itemId) {
  expandedState[itemId] = !expandedState[itemId]
}

async function handleLogout() {
  await authStore.logout()
  await router.push({ name: 'login' })
  emit('close-sidebar')
}
</script>

<template>
  <aside class="app-sidebar">
    <header class="app-sidebar__brand">
      <div class="app-sidebar__brand-logo">
        <img :src="logo" alt="FCC Logo" />
      </div>

      <div class="app-sidebar__brand-copy">
        <h1 class="app-sidebar__brand-title">FCC <span>CMS</span></h1>
        <p class="app-sidebar__brand-subtitle">PR &amp; Admin Suite</p>
      </div>
    </header>

    <div class="app-sidebar__scroll">
      <AppSidebarSection
        v-for="section in sections"
        :key="section.id"
        :section="section"
        :expanded-state="expandedState"
        :is-item-active="isItemActive"
        :active-child-route-name="activeChildRouteName"
        @navigate="navigateTo"
        @navigate-child="navigateTo"
        @toggle="toggleItem"
      />
    </div>

    <footer class="app-sidebar__footer">
      <div class="app-sidebar__account">
        <div class="app-sidebar__account-avatar">{{ userInitials }}</div>

        <div class="app-sidebar__account-copy">
          <p class="app-sidebar__account-name">{{ userDisplayName }}</p>
          <p class="app-sidebar__account-role">{{ userSecondary }}</p>
        </div>

        <button type="button" class="app-sidebar__logout" aria-label="Logout" @click="handleLogout">
          <font-awesome-icon :icon="faRightFromBracket" />
        </button>
      </div>
    </footer>
  </aside>
</template>

<style scoped>
.app-sidebar {
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  background: var(--fcc-sidebar-bg);
  color: var(--fcc-sidebar-text);
  border-right: 1px solid var(--fcc-sidebar-border);
}

.app-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.5rem 1.4rem;
  border-bottom: 1px solid var(--fcc-sidebar-border);
}

.app-sidebar__brand-logo {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: var(--fcc-radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 0.35rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.app-sidebar__brand-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.app-sidebar__brand-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.1;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.app-sidebar__brand-title span {
  color: var(--fcc-primary-400);
  font-weight: 600;
}

.app-sidebar__brand-subtitle {
  margin: 0.2rem 0 0;
  color: var(--fcc-sidebar-text);
  opacity: 0.7;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.app-sidebar__scroll {
  overflow-y: auto;
  padding: 1.25rem 0.75rem;
}

.app-sidebar__footer {
  padding: 1.25rem 1rem;
  border-top: 1px solid var(--fcc-sidebar-border);
}

.app-sidebar__account {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem;
  border-radius: var(--fcc-radius-lg);
  background: var(--fcc-sidebar-hover-bg);
  border: 1px solid var(--fcc-sidebar-border);
}

.app-sidebar__account-avatar {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: var(--fcc-radius-pill);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--fcc-primary-500);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
}

.app-sidebar__account-copy {
  min-width: 0;
  flex: 1;
}

.app-sidebar__account-name {
  margin: 0;
  color: #ffffff;
  font-size: 0.84rem;
  font-weight: 700;
}

.app-sidebar__account-role {
  margin: 0.15rem 0 0;
  color: var(--fcc-sidebar-text);
  opacity: 0.8;
  font-size: 0.68rem;
  font-weight: 500;
}

.app-sidebar__logout {
  border: 0;
  background: transparent;
  color: var(--fcc-sidebar-text);
  width: 2rem;
  height: 2rem;
  border-radius: var(--fcc-radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-sidebar__logout:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}
</style>
