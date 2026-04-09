<script setup>
import { faChevronDown } from '@/plugins/fontAwesome'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  open: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
  activeChildRouteName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['navigate', 'navigate-child', 'toggle'])

function handleClick() {
  if (props.item.children?.length) {
    emit('toggle', props.item.id)
  }

  emit('navigate', props.item)
}

function handleChildNavigate(child) {
  emit('navigate-child', child)
}
</script>

<template>
  <article class="sidebar-item">
    <button type="button" class="sidebar-item__button" :class="{ active }" @click="handleClick">
      <span class="sidebar-item__content">
        <font-awesome-icon :icon="item.icon" class="sidebar-item__icon" />
        <span class="sidebar-item__label">{{ item.label }}</span>
        <span v-if="item.badge" class="sidebar-item__badge">{{ item.badge }}</span>
      </span>

      <font-awesome-icon
        v-if="item.children?.length"
        :icon="faChevronDown"
        class="sidebar-item__chevron"
        :class="{ open }"
      />
    </button>

    <div v-if="item.children?.length && open" class="sidebar-item__children">
      <button
        v-for="child in item.children"
        :key="child.id"
        type="button"
        class="sidebar-item__child"
        :class="{ active: activeChildRouteName === child.routeName }"
        @click="handleChildNavigate(child)"
      >
        {{ child.label }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.sidebar-item {
  margin-bottom: 0.3rem;
}

.sidebar-item__button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.72rem 0.85rem;
  border: 0;
  border-radius: var(--fcc-radius-md);
  background: transparent;
  color: var(--fcc-sidebar-text);
  opacity: 0.85;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.sidebar-item__button:hover {
  background: var(--fcc-sidebar-hover-bg);
  opacity: 1;
  color: var(--fcc-sidebar-text-active);
}

.sidebar-item__button.active {
  background: var(--fcc-sidebar-active-bg);
  color: var(--fcc-sidebar-text-active);
  opacity: 1;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.sidebar-item__content {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
}

.sidebar-item__icon {
  flex: none;
  font-size: 0.98rem;
}

.sidebar-item__label {
  min-width: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.sidebar-item__badge {
  margin-left: auto;
  padding: 0.14rem 0.45rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.sidebar-item__button.active .sidebar-item__badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.sidebar-item__chevron {
  flex: none;
  font-size: 0.74rem;
  opacity: 0.55;
  transition: transform 0.2s ease;
}

.sidebar-item__chevron.open {
  transform: rotate(180deg);
}

.sidebar-item__children {
  margin-left: 1rem;
  margin-top: 0.35rem;
  padding-left: 0.9rem;
  border-left: 1px solid var(--fcc-sidebar-border);
  display: grid;
  gap: 0.2rem;
}

.sidebar-item__child {
  width: 100%;
  border: 0;
  background: transparent;
  border-radius: var(--fcc-radius-sm);
  padding: 0.45rem 0.75rem;
  color: var(--fcc-sidebar-text);
  opacity: 0.75;
  font-size: 0.78rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-item__child:hover,
.sidebar-item__child.active {
  color: var(--fcc-sidebar-text-active);
  opacity: 1;
  background: var(--fcc-sidebar-open-bg);
}
</style>
