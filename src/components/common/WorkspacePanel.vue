<script setup>
import { Comment, Fragment, Text, computed, useSlots } from 'vue'

const props = defineProps({
  tag: {
    type: String,
    default: 'section',
  },
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  descriptionClass: {
    type: String,
    default: 'workspace-panel__description',
  },
  headingLevel: {
    type: String,
    default: 'h2',
  },
})

const slots = useSlots()

function hasRenderableNodes(nodes = []) {
  return nodes.some((node) => {
    if (!node) return false
    if (node.type === Comment) return false
    if (node.type === Text) {
      return String(node.children || '').trim().length > 0
    }
    if (node.type === Fragment && Array.isArray(node.children)) {
      return hasRenderableNodes(node.children)
    }
    return true
  })
}

const hasAside = computed(() => hasRenderableNodes(slots.aside?.() || []))
const hasActions = computed(() => hasRenderableNodes(slots.actions?.() || []))

const hasHeader = computed(() =>
  Boolean(
    props.eyebrow ||
      props.title ||
      props.description ||
      slots.eyebrow ||
      slots.title ||
      slots.description ||
      hasAside.value ||
      hasActions.value,
  ),
)
</script>

<template>
  <component :is="tag" class="workspace-panel surface-card">
    <header v-if="hasHeader" class="workspace-panel__header">
      <div>
        <p v-if="eyebrow || $slots.eyebrow" class="workspace-eyebrow">
          <slot name="eyebrow">{{ eyebrow }}</slot>
        </p>
        <component :is="headingLevel" v-if="title || $slots.title">
          <slot name="title">{{ title }}</slot>
        </component>
        <p v-if="description || $slots.description" :class="descriptionClass">
          <slot name="description">{{ description }}</slot>
        </p>
      </div>
      <div v-if="hasAside || hasActions" class="workspace-panel__header-side">
        <div v-if="hasAside" class="workspace-panel__aside">
          <slot name="aside" />
        </div>
        <div v-if="hasActions" class="workspace-panel__actions">
          <slot name="actions" />
        </div>
      </div>
    </header>

    <slot />
  </component>
</template>
