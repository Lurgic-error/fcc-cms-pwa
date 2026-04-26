<script setup>
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
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
const headerActions = Object.freeze([{ key: 'refresh', label: 'Refresh inquiry' }])

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

async function onHeaderAction(action) {
  if (action?.key === 'refresh') {
    await loadInquiry()
  }
}

onMounted(loadInquiry)
</script>

<template>
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Inquiry Workspace"
        title="Respond to Inquiry"
        description="Review the inquiry context and capture the official response."
        :actions="headerActions"
        :loading="loading || submitting"
        back-label="Back to inquiry"
        @select="onHeaderAction"
        @back="goToDetails"
      />
    </template>

    <div class="workspace-shell">
      <WorkspacePanel
        eyebrow="Inquiry workspace"
        title="Review the request and prepare the official response"
      >
        <el-alert
          v-if="loading"
          type="info"
          show-icon
          :closable="false"
          title="Loading inquiry..."
        />
        <el-alert
          v-else-if="errorMessage && !inquiry"
          type="error"
          show-icon
          :closable="false"
          :title="errorMessage"
        />
      </WorkspacePanel>

      <template v-if="inquiry">
        <section class="workspace-grid">
          <WorkspacePanel
            tag="article"
            eyebrow="Inquiry summary"
            :title="inquiry.inquiryId || 'Active inquiry'"
          >
            <div class="workspace-summary">
              <div class="workspace-summary__row">
                <span>Status</span>
                <strong>{{ currentStatus }}</strong>
              </div>
              <div class="workspace-summary__row">
                <span>Sender</span>
                <strong>{{ senderName }}</strong>
              </div>
              <div class="workspace-summary__row">
                <span>Email</span>
                <strong>{{ senderEmail }}</strong>
              </div>
              <div class="workspace-summary__row">
                <span>Phone</span>
                <strong>{{ senderPhone }}</strong>
              </div>
              <div class="workspace-summary__row">
                <span>Updated</span>
                <strong>{{
                  formatDate(inquiry.lastModifiedAt || inquiry.updatedAt || inquiry.createdAt)
                }}</strong>
              </div>
            </div>
          </WorkspacePanel>

          <WorkspacePanel
            tag="article"
            eyebrow="Original message"
            title="What the requester sent"
          >
            <p class="workspace-message">{{ inquiry.message || '-' }}</p>
          </WorkspacePanel>
        </section>

        <WorkspacePanel eyebrow="Official response" title="Write and save the answer">
          <p v-if="inquiry.respondedAt" class="workspace-hint">
            Last responded {{ formatDate(inquiry.respondedAt) }}
          </p>

          <el-form label-position="top" class="workspace-form" @submit.prevent="submitResponse">
            <el-form-item label="Response" class="form-item-flush">
              <el-input
                v-model="responseText"
                type="textarea"
                :rows="10"
                placeholder="Write the official FCC response here."
              />
            </el-form-item>

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

            <div class="workspace-form__actions">
              <el-button size="large" plain @click="goToDetails">View inquiry details</el-button>
              <el-button size="large" type="primary" native-type="submit" :loading="submitting">
                Save response
              </el-button>
            </div>
          </el-form>
        </WorkspacePanel>
      </template>
    </div>
  </PageWrapper>
</template>
