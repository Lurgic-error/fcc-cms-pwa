<script setup>
import { computed, ref } from 'vue'

import AppFileUploadField from '@/components/forms/AppFileUploadField.vue'
import AppFormRow from '@/components/forms/AppFormRow.vue'

import CommissionWizardImagePreview from './CommissionWizardImagePreview.vue'
import CommissionWizardSectionCard from './CommissionWizardSectionCard.vue'

const props = defineProps({
  form: { type: Object, required: true },
})

const formRef = ref(null)
const model = computed(() => props.form)
const profileImageField = Object.freeze({
  accept: 'image/*',
  multiple: false,
  limit: 1,
  uploadTitle: 'Drop the Director General profile image here or click to choose one',
  uploadHint: 'Use a portrait image for leadership cards, profile pages, and statement panels.',
  tip: 'PNG and JPG files are accepted.',
})

const fullName = computed(() =>
  [
    model.value.directorGeneral.prefix,
    model.value.directorGeneral.firstName,
    model.value.directorGeneral.middleName,
    model.value.directorGeneral.surname,
  ]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' '),
)

function requiredRule(message) {
  return [{ required: true, message, trigger: 'blur' }]
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
        title="Director General identity"
        description="Use the legal/public-facing name fields below. The display name is generated automatically."
      >
        <AppFormRow :columns="2">
          <el-form-item label="Prefix">
            <el-input v-model="model.directorGeneral.prefix" placeholder="Dr., Hon., Mr., Ms." />
          </el-form-item>

          <el-form-item label="Computed Full Name">
            <el-input :model-value="fullName || 'Generated from the name fields below'" disabled />
          </el-form-item>

          <el-form-item
            label="First Name"
            prop="directorGeneral.firstName"
            :rules="requiredRule('Enter the Director General first name.')"
          >
            <el-input
              v-model="model.directorGeneral.firstName"
              placeholder="Director General first name"
            />
          </el-form-item>

          <el-form-item label="Middle Name">
            <el-input
              v-model="model.directorGeneral.middleName"
              placeholder="Director General middle name"
            />
          </el-form-item>

          <el-form-item
            label="Surname"
            prop="directorGeneral.surname"
            :rules="requiredRule('Enter the Director General surname.')"
          >
            <el-input
              v-model="model.directorGeneral.surname"
              placeholder="Director General surname"
            />
          </el-form-item>

          <el-form-item label="Email">
            <el-input
              v-model="model.directorGeneral.email"
              type="email"
              placeholder="director.general@fcc.go.tz"
            />
          </el-form-item>

          <el-form-item label="Phone Number">
            <el-input v-model="model.directorGeneral.phoneNumber" placeholder="+255..." />
          </el-form-item>
        </AppFormRow>
      </CommissionWizardSectionCard>

      <CommissionWizardSectionCard
        title="Role and profile image"
        description="Maintain the bilingual role title and the lead profile image shown on DG surfaces."
      >
        <AppFormRow :columns="2">
          <el-form-item
            label="Job Title (English)"
            prop="directorGeneral.job.en"
            :rules="requiredRule('Enter the Director General job title in English.')"
          >
            <el-input v-model="model.directorGeneral.job.en" placeholder="Director General" />
          </el-form-item>

          <el-form-item
            label="Job Title (Swahili)"
            prop="directorGeneral.job.sw"
            :rules="requiredRule('Enter the Director General job title in Swahili.')"
          >
            <el-input v-model="model.directorGeneral.job.sw" placeholder="Mkurugenzi Mkuu" />
          </el-form-item>
        </AppFormRow>

        <AppFormRow :columns="1">
          <el-form-item label="Profile Image">
            <AppFileUploadField
              v-model="model.directorGeneral.profilePicture"
              :field="profileImageField"
            />
          </el-form-item>
        </AppFormRow>

        <CommissionWizardImagePreview
          :value="model.directorGeneral.profilePicture"
          label="Director General profile preview"
          empty-label="Upload a Director General profile image to preview it here."
        />
      </CommissionWizardSectionCard>

      <CommissionWizardSectionCard
        title="Statements"
        description="Keep the Director General profile statement distinct from the commission-level DG featured message."
      >
        <AppFormRow :columns="2">
          <el-form-item
            label="Profile Statement (English)"
            prop="directorGeneral.statement.en"
            :rules="requiredRule('Enter the English Director General profile statement.')"
            class="md:col-span-2"
          >
            <el-input
              v-model="model.directorGeneral.statement.en"
              type="textarea"
              :rows="5"
              placeholder="Write the Director General profile statement in English."
            />
          </el-form-item>

          <el-form-item
            label="Profile Statement (Swahili)"
            prop="directorGeneral.statement.sw"
            :rules="requiredRule('Enter the Swahili Director General profile statement.')"
            class="md:col-span-2"
          >
            <el-input
              v-model="model.directorGeneral.statement.sw"
              type="textarea"
              :rows="5"
              placeholder="Andika taarifa ya Mkurugenzi Mkuu kwa Kiswahili."
            />
          </el-form-item>

          <el-form-item
            label="Featured DG Message (English)"
            prop="dgStatement.en"
            :rules="requiredRule('Enter the English featured DG message.')"
            class="md:col-span-2"
          >
            <el-input
              v-model="model.dgStatement.en"
              type="textarea"
              :rows="5"
              placeholder="Write the commission-level DG featured message in English."
            />
          </el-form-item>

          <el-form-item
            label="Featured DG Message (Swahili)"
            prop="dgStatement.sw"
            :rules="requiredRule('Enter the Swahili featured DG message.')"
            class="md:col-span-2"
          >
            <el-input
              v-model="model.dgStatement.sw"
              type="textarea"
              :rows="5"
              placeholder="Andika neno kuu la Mkurugenzi Mkuu kwa Kiswahili."
            />
          </el-form-item>
        </AppFormRow>
      </CommissionWizardSectionCard>

      <CommissionWizardSectionCard
        title="Biography"
        description="Use this longer bilingual text for the Director General biography page."
      >
        <AppFormRow :columns="2">
          <el-form-item label="Biography (English)" class="md:col-span-2">
            <el-input
              v-model="model.directorGeneral.biography.en"
              type="textarea"
              :rows="7"
              placeholder="Write the Director General biography in English."
            />
          </el-form-item>

          <el-form-item label="Biography (Swahili)" class="md:col-span-2">
            <el-input
              v-model="model.directorGeneral.biography.sw"
              type="textarea"
              :rows="7"
              placeholder="Andika wasifu wa Mkurugenzi Mkuu kwa Kiswahili."
            />
          </el-form-item>
        </AppFormRow>
      </CommissionWizardSectionCard>
    </div>
  </el-form>
</template>

<style scoped>
.commission-step-grid {
  display: grid;
  gap: 1rem;
}
</style>
