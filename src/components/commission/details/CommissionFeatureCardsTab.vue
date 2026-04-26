<script setup>
import AppBentoGrid from '@/components/common/layout/AppBentoGrid.vue'
import CommissionFeatureCardList from '@/components/commission/details/CommissionFeatureCardList.vue'

defineProps({
  philosophyCards: {
    type: Array,
    default: () => [],
  },
  coreFunctionCards: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="enterprise-stack enterprise-stack--spacious">
    <AppBentoGrid columns="2">
      <CommissionFeatureCardList
        title="Philosophies"
        subtitle="Vision, Mission, Core Values"
        :cards="philosophyCards"
        empty-text="No philosophies added"
      />

      <CommissionFeatureCardList
        title="Core Functions"
        subtitle="Main functional areas"
        :cards="coreFunctionCards"
        empty-text="No core functions added"
      />
    </AppBentoGrid>
  </div>
</template>
