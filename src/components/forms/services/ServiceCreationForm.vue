<script setup>
import { storeToRefs } from 'pinia'
import { onMounted, reactive, ref } from 'vue'

import { useDirectoratesStore } from '@/stores/useDirectoratesStore'
import { useErrorStore } from '@/stores/useErrorStore'
import { useServicesStore } from '@/stores/useServicesStore'
import { useUnitsStore } from '@/stores/useUnitsStore'
import AppFormRow from '@/components/forms/AppFormRow.vue'

/* =====================
   STORES
===================== */
const directoratesStore = useDirectoratesStore()
const unitsStore = useUnitsStore()
const servicesStore = useServicesStore()
const errorStore = useErrorStore()

const { directorates } = storeToRefs(directoratesStore)
const { units } = storeToRefs(unitsStore)

const { listDirectorates } = directoratesStore
const { listUnits } = unitsStore
const { registerService } = servicesStore

/* =====================
   STATE
===================== */
const loading = ref(false)
const serviceForm = ref(null)

const serviceInfo = reactive({
  title: { en: '', sw: '' },
  description: { en: '', sw: '' },

  processingTime: { en: '', sw: '' },

  steps: [],
  requirements: [],
  faqs: [],

  cta: { en: '', sw: '' },
  ctaRoute: {
    name: '',
    params: {},
  },

  directorate: null,
  unit: null,
})

/* =====================
   VALIDATION RULES
===================== */
const rules = {
  'title.en': [{ required: true, message: 'English title is required' }],
  'title.sw': [{ required: true, message: 'Swahili title is required' }],
  'description.en': [{ required: true, message: 'English description required' }],
  'description.sw': [{ required: true, message: 'Swahili description required' }],
}

/* =====================
   HELPERS
===================== */
const addStep = () =>
  serviceInfo.steps.push({
    title: { en: '', sw: '' },
    description: { en: '', sw: '' },
  })

const addRequirement = () => serviceInfo.requirements.push({ en: '', sw: '' })

const addFaq = () =>
  serviceInfo.faqs.push({
    question: { en: '', sw: '' },
    answer: { en: '', sw: '' },
  })

const removeItem = (arr, i) => arr.splice(i, 1)

/* =====================
   ACTIONS
===================== */
const save = async () => {
  try {
    loading.value = true
    await serviceForm.value.validate()
    await registerService(serviceInfo)
  } catch (err) {
    errorStore.setError(err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await listDirectorates()
  await listUnits()
})
</script>

<template>
  <component-wrapper>
    <el-form
      ref="serviceForm"
      :model="serviceInfo"
      :rules="rules"
      label-position="top"
      :hide-required-asterisk="true"
      class="space-y-8"
    >
      <!-- ================= BASIC INFO ================= -->
      <AppFormRow :columns="2">
        <el-form-item label="Title (English)" prop="title.en">
          <el-input v-model="serviceInfo.title.en" />
        </el-form-item>

        <el-form-item label="Title (Swahili)" prop="title.sw">
          <el-input v-model="serviceInfo.title.sw" />
        </el-form-item>
      </AppFormRow>

      <el-form-item label="Description (English)" prop="description.en">
        <el-input v-model="serviceInfo.description.en" type="textarea" :rows="4" />
      </el-form-item>

      <el-form-item label="Description (Swahili)" prop="description.sw">
        <el-input v-model="serviceInfo.description.sw" type="textarea" :rows="4" />
      </el-form-item>

      <!-- ================= OWNERSHIP ================= -->
      <AppFormRow :columns="2">
        <!-- Directorate -->
        <el-form-item label="Directorate" prop="directorate">
          <el-select v-model="serviceInfo.directorate" placeholder="Select Directorate" clearable>
            <el-option
              v-for="item in directorates"
              :key="item.directorateId"
              :label="item.name.en"
              :value="item.directorateId"
            />
          </el-select>
        </el-form-item>

        <!-- Unit (only if no directorate) -->
        <el-form-item v-if="!serviceInfo.directorate" label="Unit" prop="unit">
          <el-select v-model="serviceInfo.unit" placeholder="Select Unit" clearable>
            <el-option
              v-for="item in units"
              :key="item.unitId"
              :label="item.name.en"
              :value="item.unitId"
            />
          </el-select>
        </el-form-item>
      </AppFormRow>

      <!-- ================= PROCESSING TIME ================= -->
      <AppFormRow :columns="2">
        <el-form-item label="Processing Time (English)">
          <el-input v-model="serviceInfo.processingTime.en" />
        </el-form-item>

        <el-form-item label="Processing Time (Swahili)">
          <el-input v-model="serviceInfo.processingTime.sw" />
        </el-form-item>
      </AppFormRow>

      <!-- ================= STEPS ================= -->
      <section>
        <h3 class="font-semibold text-lg mb-4">Service Steps</h3>

        <div v-for="(step, i) in serviceInfo.steps" :key="i" class="border p-4 rounded-xl mb-4">
          <el-input v-model="step.title.en" placeholder="Step title (EN)" />
          <el-input v-model="step.title.sw" placeholder="Step title (SW)" class="mt-2" />
          <el-input
            v-model="step.description.en"
            type="textarea"
            placeholder="Description (EN)"
            class="mt-2"
          />
          <el-input
            v-model="step.description.sw"
            type="textarea"
            placeholder="Description (SW)"
            class="mt-2"
          />

          <el-button type="danger" link @click="removeItem(serviceInfo.steps, i)">
            Remove step
          </el-button>
        </div>

        <el-button type="primary" plain @click="addStep"> + Add Step </el-button>
      </section>

      <!-- ================= REQUIREMENTS ================= -->
      <section>
        <h3 class="font-semibold text-lg mb-4">Requirements</h3>

        <div v-for="(req, i) in serviceInfo.requirements" :key="i" class="flex gap-4 mb-3">
          <el-input v-model="req.en" placeholder="Requirement (EN)" />
          <el-input v-model="req.sw" placeholder="Requirement (SW)" />
          <el-button type="danger" link @click="removeItem(serviceInfo.requirements, i)"
            >✕</el-button
          >
        </div>

        <el-button type="primary" plain @click="addRequirement"> + Add Requirement </el-button>
      </section>

      <!-- ================= FAQ ================= -->
      <section>
        <h3 class="font-semibold text-lg mb-4">FAQs</h3>

        <div v-for="(faq, i) in serviceInfo.faqs" :key="i" class="border p-4 rounded-xl mb-4">
          <el-input v-model="faq.question.en" placeholder="Question (EN)" />
          <el-input v-model="faq.question.sw" placeholder="Question (SW)" class="mt-2" />
          <el-input
            v-model="faq.answer.en"
            type="textarea"
            placeholder="Answer (EN)"
            class="mt-2"
          />
          <el-input
            v-model="faq.answer.sw"
            type="textarea"
            placeholder="Answer (SW)"
            class="mt-2"
          />

          <el-button type="danger" link @click="removeItem(serviceInfo.faqs, i)">
            Remove FAQ
          </el-button>
        </div>

        <el-button type="primary" plain @click="addFaq"> + Add FAQ </el-button>
      </section>

      <!-- ================= CTA ================= -->
      <AppFormRow :columns="2">
        <el-form-item label="CTA Label (English)">
          <el-input v-model="serviceInfo.cta.en" />
        </el-form-item>

        <el-form-item label="CTA Label (Swahili)">
          <el-input v-model="serviceInfo.cta.sw" />
        </el-form-item>

        <el-form-item label="CTA Route Name">
          <el-input v-model="serviceInfo.ctaRoute.name" />
        </el-form-item>

        <el-form-item label="CTA Route Params (JSON)">
          <el-input
            v-model="serviceInfo.ctaRoute.params"
            placeholder="{ serviceId: 'merger-clearance' }"
          />
        </el-form-item>
      </AppFormRow>

      <!-- ================= SAVE ================= -->
      <el-form-item>
        <the-button :isLoading="loading" text="Save Service" @click.prevent="save" />
      </el-form-item>
    </el-form>
  </component-wrapper>
</template>
