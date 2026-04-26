<script setup>
import EntitySchemaForm from '@/components/forms/EntitySchemaForm.vue'
import { useEntityCrud } from '@/composables/useEntityCrud'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
  mode: {
    type: String,
    default: 'create',
    validator: (value) => ['create', 'edit'].includes(value),
  },
})

const route = useRoute()
const router = useRouter()
const { entity, loading, error, fetchOne, createOne, updateOne } = useEntityCrud(
  props.config.adapter,
)

const isEditMode = computed(() => props.mode === 'edit')
const formModel = ref(props.config.defaultForm())

onMounted(() => {
  if (!isEditMode.value) {
    const defaultModel = props.config.defaultForm()
    // Pre-fill fields from route query if they match the schema keys
    if (route.query) {
      for (const [key, value] of Object.entries(route.query)) {
        if (key in defaultModel) {
          defaultModel[key] = value
        }
      }
    }
    formModel.value = defaultModel
  } else {
    loadRecordForEdit()
  }
})
const recordId = computed(() => route.params?.[props.config.routeParam] || '')
const isSingleton = computed(() => Boolean(props.config.singleton))

const schema = computed(() => {
  const baseSchema = Array.isArray(props.config.formSchema) ? props.config.formSchema : []

  if (!isEditMode.value) return baseSchema
  return baseSchema.map((field) => {
    if (field.key === 'password') {
      return { ...field, required: false }
    }
    return field
  })
})

const formTitle = computed(() =>
  isEditMode.value ? `Edit ${props.config.singular}` : `Create ${props.config.singular}`,
)

const formSubtitle = computed(() =>
  isEditMode.value
    ? `Update ${props.config.singular.toLowerCase()} details with reusable schema form`
    : `Create a new ${props.config.singular.toLowerCase()} using reusable schema form`,
)
const submitLabel = computed(() => (isEditMode.value ? 'Save Changes' : 'Create'))

async function loadRecordForEdit() {
  if (!isEditMode.value || (!recordId.value && !isSingleton.value)) return

  try {
    const loaded = recordId.value ? await fetchOne(recordId.value) : await fetchOne()
    if (loaded && typeof props.config.mapRecordToForm === 'function') {
      formModel.value = props.config.mapRecordToForm(loaded)
    }
  } catch {
    // Error state is rendered in component.
  }
}

function buildPayload(model) {
  if (typeof props.config.mapFormToPayload === 'function') {
    return props.config.mapFormToPayload(model, props.mode)
  }
  return { ...model }
}

function resolveSavedId(savedEntity) {
  return (
    props.config.adapter?.getId?.(savedEntity) ||
    savedEntity?.[props.config.idKey] ||
    recordId.value ||
    ''
  )
}

function buildReturnTarget(savedId) {
  const returnTo = typeof route.query?.returnTo === 'string' ? route.query.returnTo : ''
  if (!returnTo) return null

  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    const parsed = new URL(returnTo, baseUrl)
    const query = Object.fromEntries(parsed.searchParams.entries())
    const returnField = typeof route.query?.returnField === 'string' ? route.query.returnField : ''

    if (returnField && savedId) {
      query[returnField] = savedId
    }

    return {
      path: parsed.pathname,
      query,
      hash: parsed.hash || undefined,
    }
  } catch {
    return null
  }
}

async function submit(model) {
  const payload = buildPayload(model)

  try {
    let saved = null
    if (isEditMode.value) {
      saved = await updateOne(recordId.value, payload)
    } else {
      saved = await createOne(payload)
    }

    const savedId = resolveSavedId(saved)
    if (savedId) {
      if (!isEditMode.value) {
        const returnTarget = buildReturnTarget(savedId)
        if (returnTarget) {
          await router.push(returnTarget)
          return
        }
      }

      await router.push({
        name: props.config.routes.details,
        params: { [props.config.routeParam]: savedId },
      })
      return
    }

    await router.push({ name: props.config.routes.list })
  } catch {
    // Error state is rendered in component.
  }
}

async function cancel() {
  if (isEditMode.value && recordId.value) {
    await router.push({
      name: props.config.routes.details,
      params: { [props.config.routeParam]: recordId.value },
    })
    return
  }

  await router.push({ name: props.config.routes.list })
}
</script>

<template>
  <div class="enterprise-stack">
    <EntitySchemaForm
      :title="formTitle"
      :subtitle="formSubtitle"
      :schema="schema"
      :wizard="config.wizard || false"
      :model-value="formModel"
      :loading="loading"
      :error="error"
      :submit-label="submitLabel"
      @update:model-value="formModel = $event"
      @submit="submit"
      @cancel="cancel"
    />

    <el-alert
      v-if="isEditMode && entity"
      type="info"
      show-icon
      :closable="false"
      title="Editing an existing record"
      description="Update the content fields below. Technical payloads and raw JSON are intentionally hidden from this workspace."
    />
  </div>
</template>
