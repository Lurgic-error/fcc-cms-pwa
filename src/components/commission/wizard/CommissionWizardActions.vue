<script setup>
defineProps({
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
})

defineEmits(['previous', 'next', 'save', 'save-and-continue', 'finish'])
</script>

<template>
  <footer class="commission-wizard-actions">
    <div class="commission-wizard-actions__start">
      <el-button v-if="!isFirst" @click="$emit('previous')">Previous</el-button>
      <el-button v-if="!isLast" @click="$emit('next')">Next</el-button>
    </div>

    <div class="commission-wizard-actions__end">
      <el-button v-if="!isLast" plain :loading="saving" @click="$emit('save')"
        >Save Section</el-button
      >
      <el-button
        v-if="!isLast"
        type="primary"
        :loading="saving"
        @click="$emit('save-and-continue')"
      >
        Save and Continue
      </el-button>
      <el-button v-else type="primary" :loading="saving" @click="$emit('finish')">
        Save All and Finish
      </el-button>
    </div>
  </footer>
</template>

<style scoped>
.commission-wizard-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.4rem;
  border-top: 1px solid rgb(226 232 240 / 0.95);
}

.commission-wizard-actions__start,
.commission-wizard-actions__end {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (max-width: 767px) {
  .commission-wizard-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .commission-wizard-actions__start,
  .commission-wizard-actions__end {
    width: 100%;
  }

  .commission-wizard-actions :deep(.el-button) {
    flex: 1 1 0;
    margin-left: 0;
  }
}
</style>
