<script setup>
import AppSurfaceSection from '@/components/common/AppSurfaceSection.vue'

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

    <AppSurfaceSection class="commission-wizard-section" title-tag="h3"
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
    </AppSurfaceSection>
  </div>
</template>
