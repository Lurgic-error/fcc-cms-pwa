<script setup>
import AppSidebarItem from '@/components/layout/AppSidebarItem.vue'

defineProps({
  section: {
    type: Object,
    required: true,
  },
  expandedState: {
    type: Object,
    required: true,
  },
  isItemActive: {
    type: Function,
    required: true,
  },
  activeChildRouteName: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['navigate', 'navigate-child', 'toggle'])
</script>

<template>
  <section class="sidebar-section">
    <p v-if="section.title" class="sidebar-section__title">{{ section.title }}</p>

    <AppSidebarItem
      v-for="item in section.items"
      :key="item.id"
      :item="item"
      :open="Boolean(expandedState[item.id])"
      :active="isItemActive(item)"
      :active-child-route-name="activeChildRouteName(item)"
      @navigate="emit('navigate', $event)"
      @navigate-child="emit('navigate-child', $event)"
      @toggle="emit('toggle', $event)"
    />
  </section>
</template>

<style scoped>
.sidebar-section {
  margin-top: 1.8rem;
}

.sidebar-section:first-child {
  margin-top: 0;
}

.sidebar-section__title {
  margin-bottom: 0.8rem;
  padding-inline: 0.85rem;
  color: var(--fcc-sidebar-text);
  opacity: 0.5;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
</style>
