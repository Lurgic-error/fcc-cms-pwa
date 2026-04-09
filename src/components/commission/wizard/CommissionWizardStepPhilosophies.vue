<script setup>
import { computed, ref } from 'vue'

import AppFormRow from '@/components/forms/AppFormRow.vue'

import CommissionWizardSectionCard from './CommissionWizardSectionCard.vue'

const props = defineProps({
  form: { type: Object, required: true },
})

const formRef = ref(null)
const model = computed(() => props.form)

function requiredRule(message) {
  return [{ required: true, message, trigger: 'blur' }]
}

function addPhilosophy() {
  model.value.philosophies.push({
    philosophyId: '',
    title: { en: '', sw: '' },
    description: { en: '', sw: '' },
  })
}

function removePhilosophy(index) {
  if (model.value.philosophies.length === 1) return
  model.value.philosophies.splice(index, 1)
}

async function validate() {
  if (!formRef.value) return true

  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

defineExpose({ validate })
</script>

<template>
  <el-form ref="formRef" :model="model" label-position="top" scroll-to-error>
    <CommissionWizardSectionCard
      title="Commission philosophies"
      description="Manage the repeatable philosophy cards that communicate the commission principles."
    >
      <div class="commission-step-list-header">
        <div>
          <h4>Philosophy collection</h4>
          <p>Every philosophy should have a clear title and a supporting bilingual description.</p>
        </div>
        <el-button type="primary" plain @click="addPhilosophy">Add Philosophy</el-button>
      </div>

      <div class="commission-step-stack">
        <CommissionWizardSectionCard
          v-for="(item, index) in model.philosophies"
          :key="item.philosophyId || `philosophy-${index}`"
          compact
        >
          <template #header>
            <div class="commission-step-item-header">
              <div>
                <h4>Philosophy {{ index + 1 }}</h4>
                <p>Use a short, principle-led title and an explanatory description.</p>
              </div>
              <el-button text type="danger" @click="removePhilosophy(index)">Remove</el-button>
            </div>
          </template>

          <AppFormRow :columns="2">
            <el-form-item
              :label="`Title ${index + 1} (English)`"
              :prop="`philosophies.${index}.title.en`"
              :rules="requiredRule('Enter the English philosophy title.')"
            >
              <el-input
                v-model="item.title.en"
                placeholder="Write the philosophy title in English."
              />
            </el-form-item>

            <el-form-item
              :label="`Title ${index + 1} (Swahili)`"
              :prop="`philosophies.${index}.title.sw`"
              :rules="requiredRule('Enter the Swahili philosophy title.')"
            >
              <el-input
                v-model="item.title.sw"
                placeholder="Andika kichwa cha falsafa kwa Kiswahili."
              />
            </el-form-item>

            <el-form-item
              :label="`Description ${index + 1} (English)`"
              :prop="`philosophies.${index}.description.en`"
              :rules="requiredRule('Enter the English philosophy description.')"
              class="md:col-span-2"
            >
              <el-input
                v-model="item.description.en"
                type="textarea"
                :rows="4"
                placeholder="Explain the philosophy in English."
              />
            </el-form-item>

            <el-form-item
              :label="`Description ${index + 1} (Swahili)`"
              :prop="`philosophies.${index}.description.sw`"
              :rules="requiredRule('Enter the Swahili philosophy description.')"
              class="md:col-span-2"
            >
              <el-input
                v-model="item.description.sw"
                type="textarea"
                :rows="4"
                placeholder="Elezea falsafa kwa Kiswahili."
              />
            </el-form-item>
          </AppFormRow>
        </CommissionWizardSectionCard>
      </div>
    </CommissionWizardSectionCard>
  </el-form>
</template>

<style scoped>
.commission-step-stack {
  display: grid;
  gap: 1rem;
}

.commission-step-list-header,
.commission-step-item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.commission-step-list-header h4,
.commission-step-item-header h4 {
  margin: 0;
  font-size: 0.94rem;
  font-weight: 700;
  color: rgb(15 23 42);
}

.commission-step-list-header p,
.commission-step-item-header p {
  margin: 0.25rem 0 0;
  font-size: 0.86rem;
  line-height: 1.55;
  color: rgb(71 85 105);
}

@media (max-width: 767px) {
  .commission-step-list-header,
  .commission-step-item-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
