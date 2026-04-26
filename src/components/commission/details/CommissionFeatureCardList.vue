<script setup>
import AppDetailCard from '@/components/common/detail/AppDetailCard.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  cards: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: 'No items added',
  },
})
</script>

<template>
  <AppDetailCard :title="title" :subtitle="subtitle">
    <div class="commission-feature-list">
      <div
        v-for="card in cards"
        :key="card.key"
        class="commission-feature-card"
      >
        <div
          class="commission-feature-card__media"
          :class="{ 'commission-feature-card__media--placeholder': !card.mediaUrl }"
        >
          <img
            v-if="card.mediaUrl"
            :src="card.mediaUrl"
            :alt="card.title"
            class="commission-feature-card__image"
          />
          <span v-else class="commission-feature-card__fallback">{{ card.fallback }}</span>
        </div>
        <div class="commission-feature-card__body">
          <h4 class="commission-feature-card__title">{{ card.title }}</h4>
          <p class="commission-feature-card__description">{{ card.description }}</p>
        </div>
      </div>

      <p v-if="!cards.length" class="enterprise-empty-note">{{ emptyText }}</p>
    </div>
  </AppDetailCard>
</template>
