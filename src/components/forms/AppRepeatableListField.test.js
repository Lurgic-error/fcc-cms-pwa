import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppRepeatableListField from './AppRepeatableListField.vue'

const ElButtonStub = defineComponent({
  props: {
    disabled: { type: Boolean, default: false },
  },
  emits: ['click'],
  template: `
    <button :disabled="disabled" @click="$emit('click', $event)">
      <slot />
    </button>
  `,
})

const ElDialogStub = defineComponent({
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
  },
  template: `
    <section v-if="modelValue" class="el-dialog">
      <header>{{ title }}</header>
      <div class="el-dialog__body">
        <slot />
      </div>
      <footer class="el-dialog__footer">
        <slot name="footer" />
      </footer>
    </section>
  `,
})

const ElFormStub = defineComponent({
  template: '<form><slot /></form>',
})

const ElFormItemStub = defineComponent({
  props: {
    label: { type: String, default: '' },
    error: { type: String, default: '' },
    required: { type: Boolean, default: false },
  },
  template: `
    <label class="el-form-item">
      <span class="el-form-item__label">{{ label }}</span>
      <slot />
      <span v-if="error" class="el-form-item__error">{{ error }}</span>
    </label>
  `,
})

const ElInputStub = defineComponent({
  props: {
    modelValue: { type: [String, Number], default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    size: { type: String, default: '' },
    rows: { type: Number, default: 3 },
  },
  emits: ['update:modelValue'],
  template: `
    <textarea
      v-if="type === 'textarea'"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <input
      v-else
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  `,
})

const passthroughStub = defineComponent({
  template: '<div><slot /></div>',
})

describe('AppRepeatableListField', () => {
  it('saves dotted-path item values through the shared schema field renderer', async () => {
    const wrapper = mount(AppRepeatableListField, {
      props: {
        modelValue: [],
        field: {
          itemTitle: 'core function',
          addLabel: 'Add Core Function',
          itemSchema: [
            {
              key: 'name.en',
              label: 'Name (English)',
              required: true,
              placeholder: 'Write the core function name in English.',
            },
            {
              key: 'description.en',
              label: 'Description (English)',
              component: 'textarea',
              rows: 4,
              required: true,
              placeholder: 'Explain the core function in English.',
            },
          ],
        },
      },
      global: {
        stubs: {
          'el-button': ElButtonStub,
          'el-dialog': ElDialogStub,
          'el-form': ElFormStub,
          'el-form-item': ElFormItemStub,
          'el-input': ElInputStub,
          'el-empty': passthroughStub,
          'el-icon': passthroughStub,
          'el-alert': passthroughStub,
          'el-select': passthroughStub,
          'el-option': passthroughStub,
          'el-switch': passthroughStub,
          'el-date-picker': ElInputStub,
          'el-table': passthroughStub,
          'el-table-column': passthroughStub,
          'el-popconfirm': passthroughStub,
          teleport: true,
        },
      },
    })

    await wrapper.get('.repeatable-table-field__header button').trigger('click')
    await nextTick()

    await wrapper.get('input').setValue('Market Oversight')
    await wrapper.get('textarea').setValue('Monitor competition and enforce market fairness.')

    const addItemButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Add Item'))

    expect(addItemButton).toBeDefined()

    await addItemButton.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([
      [
        [
          {
            name: {
              en: 'Market Oversight',
            },
            description: {
              en: 'Monitor competition and enforce market fairness.',
            },
          },
        ],
      ],
    ])

    wrapper.unmount()
  })
})
