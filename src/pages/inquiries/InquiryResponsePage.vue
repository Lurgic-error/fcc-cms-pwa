<script setup>
import PageWrapper from '@/components/common/PageWrapper.vue'
import AppDetailCard from '@/components/common/detail/AppDetailCard.vue'
import AppDetailGrid from '@/components/common/detail/AppDetailGrid.vue'
import AppDetailItem from '@/components/common/detail/AppDetailItem.vue'
import { inquiriesAPI } from '@/api'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const inquiry = ref(null)
const responseText = ref('')
const loading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const inquiryId = computed(() => String(route.params?.inquiryId || ''))
const senderName = computed(() => inquiry.value?.sender?.fullName || 'Unknown sender')
const senderEmail = computed(() => inquiry.value?.sender?.email || '-')
const senderPhone = computed(() => inquiry.value?.sender?.phoneNumber || '-')
const currentStatus = computed(() => inquiry.value?.status || 'pending')

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

async function loadInquiry() {
  if (!inquiryId.value) {
    errorMessage.value = 'Inquiry ID is missing.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  const response = await inquiriesAPI.findInquiry({ inquiryId: inquiryId.value })
  loading.value = false

  if (response?.error) {
    errorMessage.value =
      response.error?.response?.data?.error || response.error?.message || 'Failed to load inquiry.'
    return
  }

  inquiry.value = response?.inquiry || response || null
  responseText.value = inquiry.value?.response || ''
}

async function submitResponse() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!responseText.value.trim()) {
    errorMessage.value = 'Response is required.'
    return
  }

  submitting.value = true
  const response = await inquiriesAPI.respondToInquiry({
    inquiryId: inquiryId.value,
    response: responseText.value.trim(),
  })
  submitting.value = false

  if (response?.error) {
    errorMessage.value =
      response.error?.response?.data?.error || response.error?.message || 'Failed to send response.'
    return
  }

  inquiry.value = response?.inquiry || response || inquiry.value
  responseText.value = inquiry.value?.response || responseText.value.trim()
  successMessage.value = 'Inquiry response saved successfully.'
}

async function goToDetails() {
  await router.push({ name: 'inquiries.details', params: { inquiryId: inquiryId.value } })
}

onMounted(loadInquiry)
</script>

<template>
  <PageWrapper
    title="Respond to Inquiry"
    description="Review the inquiry context and capture the official response."
  >
    <div class="page">
      <div class="toolbar">
        <button class="btn btn-muted" type="button" @click="goToDetails">View Details</button>
        <button class="btn btn-muted" type="button" :disabled="loading" @click="loadInquiry">
          Refresh
        </button>
      </div>

      <p v-if="loading">Loading inquiry...</p>
      <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>

      <template v-else-if="inquiry">
        <AppDetailCard title="Inquiry Summary">
          <AppDetailGrid columns="3">
            <AppDetailItem label="Inquiry ID" :value="inquiry.inquiryId" />
            <AppDetailItem label="Status" :value="currentStatus" />
            <AppDetailItem label="Sender" :value="senderName" />
            <AppDetailItem label="Email" :value="senderEmail" />
            <AppDetailItem label="Phone" :value="senderPhone" />
            <AppDetailItem
              label="Updated"
              :value="formatDate(inquiry.lastModifiedAt || inquiry.updatedAt || inquiry.createdAt)"
            />
          </AppDetailGrid>
        </AppDetailCard>

        <section class="card mt-4">
          <h2>Original Message</h2>
          <p class="message">{{ inquiry.message || '-' }}</p>
        </section>

        <section class="card">
          <div class="section-header">
            <h2>Official Response</h2>
            <span v-if="inquiry.respondedAt" class="muted"
              >Last responded {{ formatDate(inquiry.respondedAt) }}</span
            >
          </div>

          <textarea
            v-model="responseText"
            rows="10"
            class="response-input"
            placeholder="Write the official FCC response here."
          />

          <p v-if="successMessage" class="success">{{ successMessage }}</p>

          <div class="actions">
            <button
              class="btn btn-primary"
              type="button"
              :disabled="submitting"
              @click="submitResponse"
            >
              {{ submitting ? 'Saving...' : 'Save Response' }}
            </button>
          </div>
        </section>
      </template>
    </div>
  </PageWrapper>
</template>

<style scoped>
.page {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.card {
  border: 1px solid var(--color-fcc-border);
  border-radius: 0.5rem;
  padding: 1rem;
  background: var(--color-surface);
}

.label {
  color: var(--color-fcc-text-muted);
  font-size: 0.82rem;
  margin-bottom: 0.2rem;
}

.message {
  white-space: pre-wrap;
  line-height: 1.5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.response-input {
  width: 100%;
  border: 1px solid var(--color-secondary-300);
  border-radius: 0.5rem;
  padding: 0.8rem;
  resize: vertical;
  min-height: 12rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.9rem;
}

.btn {
  border: 1px solid var(--color-secondary-300);
  border-radius: 0.375rem;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}

.btn-primary {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
  color: var(--color-surface);
}

.btn-muted {
  background: var(--color-surface-muted);
}

.muted {
  color: var(--color-fcc-text-muted);
  font-size: 0.85rem;
}

.success {
  color: var(--color-success);
  margin-top: 0.75rem;
}

.error {
  color: var(--color-danger);
}
</style>
