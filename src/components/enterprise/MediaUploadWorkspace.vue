<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppFileUploadField from '@/components/forms/AppFileUploadField.vue'
import AppTagInputField from '@/components/forms/AppTagInputField.vue'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  resourceLabel: { type: String, default: 'image' },
  libraryRoute: { type: Object, required: true },
  submitUpload: { type: Function, required: true },
})

const router = useRouter()
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const USAGE_GUIDES = Object.freeze({
  'media-center': {
    label: 'Media center gallery',
    ratio: '16:10',
    width: 1600,
    height: 1000,
    note: 'Use crisp horizontal images that still read well when cropped on tablets.',
  },
  'hero-banner': {
    label: 'Hero banner',
    ratio: '16:9',
    width: 1920,
    height: 1080,
    note: 'Choose wide imagery with a clear focal point and safe text space.',
  },
  'news-card': {
    label: 'News card',
    ratio: '4:3',
    width: 1200,
    height: 900,
    note: 'Strong subject framing works best because cards crop tighter on smaller screens.',
  },
  portrait: {
    label: 'Portrait or profile',
    ratio: '3:4',
    width: 900,
    height: 1200,
    note: 'Ideal for people-focused imagery and commissioner or staff profiles.',
  },
})

const form = reactive({
  files: [],
  caption: '',
  altText: '',
  usageArea: 'media-center',
  placement: '',
  tags: [],
  credit: '',
  sortOrder: 0,
  status: 'draft',
})

const uploadField = computed(() => ({
  multiple: true,
  limit: 12,
  accept: '.jpg,.jpeg,.png,image/jpeg,image/png',
  uploadTitle: 'Drop images here or click to choose them',
  uploadHint: 'Upload responsive website-ready images for the FCC public website.',
  tip: 'JPEG and PNG images only. Use the guidance card to choose the right format for each page area.',
}))

const selectedGuide = computed(() => USAGE_GUIDES[form.usageArea] || USAGE_GUIDES['media-center'])

async function submit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!Array.isArray(form.files) || !form.files.length) {
    errorMessage.value = 'Choose at least one image before saving.'
    return
  }

  if (!form.caption.trim()) {
    errorMessage.value = 'Add a caption so editors and visitors understand the image.'
    return
  }

  submitting.value = true

  const response = await props.submitUpload({
    'images[]': form.files,
    caption: form.caption.trim(),
    altText: form.altText.trim(),
    usageArea: form.usageArea,
    placement: form.placement.trim(),
    tags: form.tags,
    credit: form.credit.trim(),
    sortOrder: Number(form.sortOrder || 0),
    status: form.status,
    aspectRatioHint: selectedGuide.value.ratio,
    recommendedWidth: selectedGuide.value.width,
    recommendedHeight: selectedGuide.value.height,
  })

  submitting.value = false

  if (response?.error) {
    errorMessage.value =
      response.error?.response?.data?.error || response.error?.message || response.error
    return
  }

  successMessage.value = `${props.resourceLabel} upload saved successfully.`
  await router.push(props.libraryRoute)
}
</script>

<template>
  <PageWrapper :title="title" :description="description">
    <div class="media-upload-shell">
      <section class="media-upload-panel media-upload-panel--form surface-card">
        <header class="media-upload-panel__header">
          <div>
            <p class="media-upload-eyebrow">Upload workspace</p>
            <h2>Prepare {{ resourceLabel }}s for the website</h2>
          </div>
          <el-button plain @click="router.push(libraryRoute)">Back to library</el-button>
        </header>

        <el-form label-position="top" class="media-upload-form" @submit.prevent="submit">
          <el-form-item label="Image files" required>
            <AppFileUploadField v-model="form.files" :field="uploadField" :disabled="submitting" />
          </el-form-item>

          <div class="media-upload-grid">
            <el-form-item label="Caption" required>
              <el-input
                v-model="form.caption"
                type="textarea"
                :rows="4"
                placeholder="Explain what the image shows and why it matters."
              />
            </el-form-item>

            <el-form-item label="Alternative text">
              <el-input
                v-model="form.altText"
                type="textarea"
                :rows="4"
                placeholder="Describe the image for accessibility and search."
              />
            </el-form-item>

            <el-form-item label="Website usage area">
              <el-select v-model="form.usageArea">
                <el-option
                  v-for="(guide, key) in USAGE_GUIDES"
                  :key="key"
                  :label="guide.label"
                  :value="key"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Placement or collection">
              <el-input
                v-model="form.placement"
                placeholder="Homepage lead, media center, gallery, leadership profile"
              />
            </el-form-item>

            <el-form-item label="Display order">
              <el-input-number v-model="form.sortOrder" :min="0" :step="1" />
            </el-form-item>

            <el-form-item label="Credit">
              <el-input
                v-model="form.credit"
                placeholder="Photographer, FCC archive, external source"
              />
            </el-form-item>
          </div>

          <div class="media-upload-grid">
            <el-form-item label="Tags">
              <AppTagInputField v-model="form.tags" placeholder="Add image tags and press Enter" />
            </el-form-item>

            <el-form-item label="Initial status">
              <el-select v-model="form.status">
                <el-option label="Draft" value="draft" />
                <el-option label="Published" value="published" />
              </el-select>
            </el-form-item>
          </div>

          <div class="media-upload-actions">
            <el-button @click="router.push(libraryRoute)">Cancel</el-button>
            <el-button type="primary" :loading="submitting" native-type="submit">
              Upload {{ resourceLabel }}s
            </el-button>
          </div>

          <el-alert
            v-if="successMessage"
            type="success"
            show-icon
            :closable="false"
            :title="successMessage"
          />
          <el-alert
            v-if="errorMessage"
            type="error"
            show-icon
            :closable="false"
            :title="errorMessage"
          />
        </el-form>
      </section>

      <aside class="media-upload-panel media-upload-panel--guide surface-card">
        <p class="media-upload-eyebrow">Best-practice guide</p>
        <h2>{{ selectedGuide.label }}</h2>
        <p class="media-upload-guide__note">{{ selectedGuide.note }}</p>

        <div class="media-upload-guide__stats">
          <div class="media-upload-guide__stat">
            <span>Recommended ratio</span>
            <strong>{{ selectedGuide.ratio }}</strong>
          </div>
          <div class="media-upload-guide__stat">
            <span>Minimum size</span>
            <strong>{{ selectedGuide.width }} x {{ selectedGuide.height }}</strong>
          </div>
        </div>

        <el-alert
          type="info"
          show-icon
          :closable="false"
          title="Editorial advice"
          description="Avoid blurry crops, text baked into the image, or subjects pressed against the frame edge. Leave enough breathing room for responsive layouts."
        />
      </aside>
    </div>
  </PageWrapper>
</template>

<style scoped>
.media-upload-shell,
.media-upload-form {
  display: grid;
  gap: 1rem;
}

.media-upload-panel {
  padding: 1.25rem;
}

.media-upload-panel__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.media-upload-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fcc-secondary-700);
}

.media-upload-grid {
  display: grid;
  gap: 1rem;
}

.media-upload-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}

.media-upload-guide__note {
  margin-top: 0.5rem;
  color: var(--fcc-text-muted);
}

.media-upload-guide__stats {
  display: grid;
  gap: 0.75rem;
  margin-block: 1rem;
}

.media-upload-guide__stat {
  border: 1px solid var(--fcc-border);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--fcc-surface) 96%, var(--fcc-primary-50));
  padding: 0.9rem 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.media-upload-guide__stat span {
  color: var(--fcc-text-muted);
}

.media-upload-guide__stat strong {
  color: var(--fcc-text);
}

@media (min-width: 1024px) {
  .media-upload-shell {
    grid-template-columns: minmax(0, 1.2fr) minmax(19rem, 0.8fr);
    align-items: start;
  }

  .media-upload-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
