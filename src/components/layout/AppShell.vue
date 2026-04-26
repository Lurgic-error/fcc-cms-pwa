<script setup>
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { buildAdminShellNavigation } from '@/navigation/adminShell'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const MOBILE_BREAKPOINT = 1024

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const contentRef = ref(null)
const isDesktop = ref(false)
const isSidebarOpen = ref(false)

const navigationSections = computed(() =>
  buildAdminShellNavigation(router.options?.routes || [], {
    canAccess: authStore.canAccess,
  }),
)

function syncViewport() {
  const desktop = window.innerWidth >= MOBILE_BREAKPOINT
  isDesktop.value = desktop
  isSidebarOpen.value = desktop
}

function toggleSidebar() {
  if (isDesktop.value) return
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  if (!isDesktop.value) {
    isSidebarOpen.value = false
  }
}

function scrollContentToTop() {
  if (!contentRef.value) return
  contentRef.value.scrollTo({ top: 0, behavior: 'auto' })
}

onMounted(() => {
  syncViewport()
  window.addEventListener('resize', syncViewport)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewport)
})

watch(
  () => route.fullPath,
  () => {
    closeSidebar()
    scrollContentToTop()
  },
)
</script>

<template>
  <div class="app-shell">
    <transition name="app-shell-backdrop">
      <el-button
        v-if="!isDesktop && isSidebarOpen"
        text
        class="app-shell__backdrop"
        aria-label="Close navigation"
        @click="closeSidebar"
      />
    </transition>

    <aside class="app-shell__sidebar" :class="{ 'is-open': isDesktop || isSidebarOpen }">
      <AppSidebar :sections="navigationSections" @close-sidebar="closeSidebar" />
    </aside>

    <div class="app-shell__header">
      <AppHeader
        :sections="navigationSections"
        :is-desktop="isDesktop"
        @toggle-sidebar="toggleSidebar"
      />
    </div>

    <main ref="contentRef" class="app-shell__content">
      <div class="app-shell__content-inner">
        <router-view v-slot="{ Component }">
          <transition name="app-shell-page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <div class="app-shell__footer">
      <AppFooter />
    </div>
  </div>
</template>
