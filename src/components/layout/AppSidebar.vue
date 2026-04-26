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

        <el-button text class="app-sidebar__logout" aria-label="Logout" @click="handleLogout">
          <font-awesome-icon :icon="faRightFromBracket" />
        </el-button>
      </div>
    </footer>
  </aside>
</template>
