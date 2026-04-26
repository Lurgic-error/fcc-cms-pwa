<script setup>
import AppDetailCard from '@/components/common/detail/AppDetailCard.vue'
import AppDetailGrid from '@/components/common/detail/AppDetailGrid.vue'
import AppDetailItem from '@/components/common/detail/AppDetailItem.vue'

defineProps({
  mandateOverview: {
    type: String,
    default: '-',
  },
  mandateItems: {
    type: Array,
    default: () => [],
  },
  commissionerStatement: {
    type: String,
    default: '-',
  },
  commissionFunctions: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="enterprise-stack enterprise-stack--spacious">
    <AppDetailCard title="Mandate" subtitle="Commission mandate and items">
      <AppDetailGrid :columns="1">
        <AppDetailItem label="Overview" :value="mandateOverview" />
        <AppDetailItem label="Mandate Items">
          <ul v-if="mandateItems.length" class="enterprise-bullet-list">
            <li v-for="(item, index) in mandateItems" :key="index" class="leading-relaxed">
              {{ item }}
            </li>
          </ul>
          <span v-else class="enterprise-empty-note enterprise-empty-note--block">
            No mandate items listed
          </span>
        </AppDetailItem>
      </AppDetailGrid>
    </AppDetailCard>

    <AppDetailCard title="Public Functions" subtitle="Commissioner statements and public functions">
      <AppDetailGrid :columns="1">
        <AppDetailItem label="Commissioner Statement" :value="commissionerStatement" />
        <AppDetailItem label="Commission Functions">
          <ul v-if="commissionFunctions.length" class="enterprise-bullet-list">
            <li
              v-for="(item, index) in commissionFunctions"
              :key="index"
              class="leading-relaxed"
            >
              {{ item }}
            </li>
          </ul>
          <span v-else class="enterprise-empty-note enterprise-empty-note--block">
            No functions listed
          </span>
        </AppDetailItem>
      </AppDetailGrid>
    </AppDetailCard>
  </div>
</template>
