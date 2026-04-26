<script setup>
import AppFileUploadField from './AppFileUploadField.vue'
import AppRepeatableListField from './AppRepeatableListField.vue'
import AppTagInputField from './AppTagInputField.vue'
import EntityRelationshipSelect from './EntityRelationshipSelect.vue'
import SmartFormGrid from './SmartFormGrid.vue'

const props = defineProps({
  fields: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Number,
    default: 2,
  },
  model: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  validationErrors: {
    type: Object,
    default: () => ({}),
  },
  emptyFields: {
    type: Object,
    default: () => ({}),
  },
  valueResolver: {
    type: Function,
    default: (model, key, fallback = undefined) => {
      if (!model || typeof model !== 'object') {
        return fallback
      }

      return model[key] === undefined ? fallback : model[key]
    },
  },
  requiredResolver: {
    type: Function,
    default: (field) => Boolean(field?.required),
  },
})

const emit = defineEmits(['update-field', 'field-empty', 'create-related'])

function resolveFieldValue(key, fallback = '') {
  return props.valueResolver(props.model, key, fallback)
}

function isFieldRequired(field) {
  return Boolean(props.requiredResolver(field, props.model))
}
</script>

<template>
  <SmartFormGrid :fields="fields" :columns="columns">
    <template #default="{ field }">
      <el-form-item
        :label="field.component === 'section' ? '' : field.label"
        :required="isFieldRequired(field)"
        :error="validationErrors[field.key]"
        class="form-item-flush"
      >
        <el-alert
          v-if="field.component === 'entity-select' && emptyFields[field.key]"
          :title="`No ${field.label} available.`"
          type="warning"
          show-icon
          :closable="false"
          class="app-inline-alert app-inline-alert--compact"
        >
          <template #default>
            <div class="enterprise-callout-row">
              <span>
                You need to create at least one {{ field.label.toLowerCase() }} before you can
                continue.
              </span>
              <el-button
                v-if="field.createRoute"
                type="warning"
                plain
                @click="emit('create-related', field.createRoute, field.key)"
              >
                Create {{ field.label }}
              </el-button>
            </div>
          </template>
        </el-alert>

        <div
          v-if="field.component === 'section'"
          class="smart-form-section-card"
        >
          <h3 class="smart-form-section-card__title">
            {{ field.label }}
          </h3>
          <p v-if="field.description" class="smart-form-section-card__description">
            {{ field.description }}
          </p>
        </div>
        <div v-else class="smart-form-grid__control">
          <el-input
            v-if="!field.component || field.component === 'input'"
            :model-value="resolveFieldValue(field.key)"
            size="large"
            :type="field.type || 'text'"
            :placeholder="field.placeholder || ''"
            :rows="field.rows || 3"
            @update:model-value="emit('update-field', field.key, $event)"
          />

          <el-input
            v-else-if="field.component === 'textarea'"
            :model-value="resolveFieldValue(field.key)"
            size="large"
            type="textarea"
            :placeholder="field.placeholder || ''"
            :rows="field.rows || 4"
            @update:model-value="emit('update-field', field.key, $event)"
          />

          <EntityRelationshipSelect
            v-else-if="field.component === 'entity-select'"
            :model-value="resolveFieldValue(field.key)"
            :field="field"
            :model="model"
            :disabled="loading"
            @update:model-value="emit('update-field', field.key, $event)"
            @empty="emit('field-empty', field.key, $event)"
          />

          <AppTagInputField
            v-else-if="field.component === 'tag-input'"
            :model-value="resolveFieldValue(field.key, [])"
            :placeholder="field.placeholder || 'Add tags and press Enter'"
            :disabled="loading"
            :max-collapse-tags="field.maxCollapseTags || 3"
            @update:model-value="emit('update-field', field.key, $event)"
          />

          <AppFileUploadField
            v-else-if="field.component === 'file-upload'"
            :model-value="resolveFieldValue(field.key, field.multiple === false ? null : [])"
            :field="field"
            :disabled="loading"
            @update:model-value="emit('update-field', field.key, $event)"
          />

          <AppRepeatableListField
            v-else-if="field.component === 'repeatable-list'"
            :model-value="resolveFieldValue(field.key, [])"
            :field="field"
            :disabled="loading"
            @update:model-value="emit('update-field', field.key, $event)"
          />

          <el-select
            v-else-if="field.component === 'select'"
            :model-value="resolveFieldValue(field.key)"
            size="large"
            :placeholder="field.placeholder || 'Select option'"
            @update:model-value="emit('update-field', field.key, $event)"
          >
            <el-option
              v-for="option in field.options || []"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <el-switch
            v-else-if="field.component === 'switch'"
            :model-value="Boolean(resolveFieldValue(field.key, false))"
            @update:model-value="emit('update-field', field.key, $event)"
          />

          <el-date-picker
            v-else-if="field.component === 'date'"
            :model-value="resolveFieldValue(field.key)"
            size="large"
            type="date"
            value-format="YYYY-MM-DD"
            @update:model-value="emit('update-field', field.key, $event)"
          />

          <p v-if="field.helpText" class="entity-schema-fields__help">
            {{ field.helpText }}
          </p>
        </div>
      </el-form-item>
    </template>
  </SmartFormGrid>
</template>
