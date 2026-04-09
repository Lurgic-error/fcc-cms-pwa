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

function addMandateItem() {
  model.value.mandate.items.push({ en: '', sw: '' })
}

function removeMandateItem(index) {
  if (model.value.mandate.items.length === 1) return
  model.value.mandate.items.splice(index, 1)
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
    <div class="commission-step-grid">
      <CommissionWizardSectionCard
        title="Mandate overview"
        description="Start with a short bilingual explanation of the commission mandate before listing specific mandate items."
      >
        <AppFormRow :columns="2">
          <el-form-item
            label="Mandate Description (English)"
            prop="mandate.description.en"
            :rules="requiredRule('Enter the mandate description in English.')"
            class="md:col-span-2"
          >
            <el-input
              v-model="model.mandate.description.en"
              type="textarea"
              :rows="5"
              placeholder="Describe the commission mandate in English."
            />
          </el-form-item>

          <el-form-item
            label="Mandate Description (Swahili)"
            prop="mandate.description.sw"
            :rules="requiredRule('Enter the mandate description in Swahili.')"
            class="md:col-span-2"
          >
            <el-input
              v-model="model.mandate.description.sw"
              type="textarea"
              :rows="5"
              placeholder="Elezea mandate ya tume kwa Kiswahili."
            />
          </el-form-item>
        </AppFormRow>
      </CommissionWizardSectionCard>

      <CommissionWizardSectionCard
        title="Mandate items"
        description="Add the detailed mandate points as a repeatable bilingual list."
      >
        <div class="commission-step-list-header">
          <div>
            <h4>Mandate list</h4>
            <p>Each mandate item should carry the same meaning in English and Swahili.</p>
          </div>
          <el-button type="primary" plain @click="addMandateItem">Add Mandate Item</el-button>
        </div>

        <div class="commission-step-stack">
          <CommissionWizardSectionCard
            v-for="(item, index) in model.mandate.items"
            :key="`mandate-item-${index}`"
            compact
          >
            <template #header>
              <div class="commission-step-item-header">
                <div>
                  <h4>Mandate item {{ index + 1 }}</h4>
                  <p>Use one clear mandate statement per card.</p>
                </div>
                <el-button text type="danger" @click="removeMandateItem(index)">Remove</el-button>
              </div>
            </template>

            <AppFormRow :columns="2">
              <el-form-item
                :label="`Mandate Item ${index + 1} (English)`"
                :prop="`mandate.items.${index}.en`"
                :rules="requiredRule('Enter the English mandate item.')"
              >
                <el-input
                  v-model="item.en"
                  type="textarea"
                  :rows="3"
                  placeholder="Describe the mandate item in English."
                />
              </el-form-item>

              <el-form-item
                :label="`Mandate Item ${index + 1} (Swahili)`"
                :prop="`mandate.items.${index}.sw`"
                :rules="requiredRule('Enter the Swahili mandate item.')"
              >
                <el-input
                  v-model="item.sw"
                  type="textarea"
                  :rows="3"
                  placeholder="Andika kipengele cha mandate kwa Kiswahili."
                />
              </el-form-item>
            </AppFormRow>
          </CommissionWizardSectionCard>
        </div>
      </CommissionWizardSectionCard>
    </div>
  </el-form>
</template>

<style scoped>
.commission-step-grid,
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
