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
    <el-button text class="sidebar-item__button" :class="{ active }" @click="handleClick">
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
    </el-button>

    <div v-if="item.children?.length && open" class="sidebar-item__children">
      <el-button
        v-for="child in item.children"
        :key="child.id"
        text
        class="sidebar-item__child"
        :class="{ active: activeChildRouteName === child.routeName }"
        @click="handleChildNavigate(child)"
      >
        {{ child.label }}
      </el-button>
    </div>
  </article>
</template>
