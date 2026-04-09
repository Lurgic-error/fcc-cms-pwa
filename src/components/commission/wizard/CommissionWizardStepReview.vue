<script setup>
import CommissionWizardSectionCard from './CommissionWizardSectionCard.vue'

defineProps({
  reviewSections: { type: Array, default: () => [] },
  missingSteps: { type: Array, default: () => [] },
  stepStates: { type: Array, default: () => [] },
})

const emit = defineEmits(['jump'])

function validate() {
  return true
}

defineExpose({ validate })
</script>

<template>
  <div class="commission-review">
    <el-alert
      v-if="missingSteps.length"
      type="warning"
      show-icon
      :closable="false"
      title="Some sections are still incomplete."
    >
      <template #default>
        <div class="commission-review__missing">
          <span v-for="step in missingSteps" :key="step.key">{{ step.title }}</span>
        </div>
      </template>
    </el-alert>

    <CommissionWizardSectionCard
      title="Review commission sections"
      description="Use the summary below to confirm what is complete, what still needs work, and where to jump back."
    >
      <div class="commission-review__grid">
        <article
          v-for="section in reviewSections"
          :key="section.key"
          class="commission-review__card"
          :class="{
            'is-missing': stepStates.find((step) => step.key === section.key)?.complete === false,
          }"
        >
          <div class="commission-review__card-header">
            <div>
              <h3>{{ section.title }}</h3>
              <p>{{ section.summary }}</p>
            </div>
            <el-tag
              :type="
                stepStates.find((step) => step.key === section.key)?.complete
                  ? 'success'
                  : 'warning'
              "
              effect="light"
              round
            >
              {{
                stepStates.find((step) => step.key === section.key)?.complete
                  ? 'Ready'
                  : 'Needs work'
              }}
            </el-tag>
          </div>

          <ul v-if="section.details.length" class="commission-review__details">
            <li v-for="detail in section.details" :key="detail">{{ detail }}</li>
          </ul>

          <el-button
            plain
            @click="emit('jump', stepStates.find((step) => step.key === section.key)?.index)"
          >
            Edit {{ section.title }}
          </el-button>
        </article>
      </div>
    </CommissionWizardSectionCard>
  </div>
</template>

<style scoped>
.commission-review {
  display: grid;
  gap: 1rem;
}

.commission-review__missing {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.commission-review__missing span {
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgb(254 240 138 / 0.55);
  color: rgb(133 77 14);
  font-size: 0.82rem;
  font-weight: 600;
}

.commission-review__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.commission-review__card {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid rgb(226 232 240 / 0.95);
  background: rgb(255 255 255 / 0.92);
}

.commission-review__card.is-missing {
  border-color: rgb(245 158 11 / 0.4);
  background: rgb(255 251 235 / 0.92);
}

.commission-review__card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.commission-review__card h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: rgb(15 23 42);
}

.commission-review__card p {
  margin: 0.35rem 0 0;
  color: rgb(71 85 105);
  line-height: 1.55;
}

.commission-review__details {
  margin: 0;
  padding-left: 1rem;
  color: rgb(51 65 85);
  display: grid;
  gap: 0.35rem;
}
</style>
