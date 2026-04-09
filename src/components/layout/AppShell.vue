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

const shellStyle = computed(() => ({
  '--shell-sidebar-width': '288px',
  '--shell-header-height': '64px',
  '--shell-footer-height': '48px',
}))

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
  <div class="app-shell" :style="shellStyle">
    <transition name="app-shell-backdrop">
      <button
        v-if="!isDesktop && isSidebarOpen"
        type="button"
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

<style scoped>
.app-shell {
  height: 100dvh;
  overflow: hidden;
  background: var(--fcc-app-bg);
}

.app-shell__sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 50;
  width: var(--shell-sidebar-width);
  background: var(--fcc-sidebar-bg);
  transform: translateX(0);
}

.app-shell__header {
  position: fixed;
  top: 0;
  left: var(--shell-sidebar-width);
  right: 0;
  height: var(--shell-header-height);
  z-index: 40;
}

.app-shell__footer {
  position: fixed;
  left: var(--shell-sidebar-width);
  right: 0;
  bottom: 0;
  height: var(--shell-footer-height);
  z-index: 40;
}

.app-shell__content {
  position: fixed;
  top: var(--shell-header-height);
  right: 0;
  bottom: var(--shell-footer-height);
  left: var(--shell-sidebar-width);
  overflow-y: auto;
  padding: 2rem;
}

.app-shell__backdrop {
  position: fixed;
  inset: 0;
  z-index: 45;
  border: 0;
  background: rgba(2, 6, 23, 0.56);
}

.app-shell-page-enter-active,
.app-shell-page-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.app-shell-page-enter-from,
.app-shell-page-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.app-shell-backdrop-enter-active,
.app-shell-backdrop-leave-active {
  transition: opacity 0.18s ease;
}

.app-shell-backdrop-enter-from,
.app-shell-backdrop-leave-to {
  opacity: 0;
}

@media (max-width: 1023px) {
  .app-shell__sidebar {
    transform: translateX(-100%);
    transition: transform 0.22s ease;
  }

  .app-shell__sidebar.is-open {
    transform: translateX(0);
  }

  .app-shell__header,
  .app-shell__footer,
  .app-shell__content {
    left: 0;
  }

  .app-shell__content {
    padding: 1rem;
  }
}
</style>
