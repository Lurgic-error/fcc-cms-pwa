<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'

import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import { useAuditLogStore } from '@/stores/useAuditLogStore'

const route = useRoute()
const auditStore = useAuditLogStore()

const form = reactive({
  userId: '',
  action: '',
  resourceType: '',
  resourceId: '',
  startDate: '',
  endDate: '',
})

const pageLimit = computed({
  get: () => auditStore.pagination.limit,
  set: (value) => {
    auditStore.pagination.limit = Number(value || 20)
  },
})

const rows = computed(() => auditStore.entries)
const pagination = computed(() => auditStore.pagination)
const hasRows = computed(() => rows.value.length > 0)

const headerActions = Object.freeze([{ key: 'refresh', label: 'Refresh' }])

function syncRoutePreset() {
  if (route.meta?.auditPreset === 'users') {
    form.userId = route.params.userId || ''
  }

  if (route.meta?.auditPreset === 'resources') {
    form.resourceType = route.params.resourceType || ''
    form.resourceId = route.params.resourceId || ''
  }

  if (route.meta?.auditPreset === 'actions') {
    form.action = route.params.action || ''
  }
}

function applyFilters() {
  auditStore.setFilters(form)
  return auditStore.fetchAuditLogs({ page: 1, limit: pageLimit.value })
}

function resetFilters() {
  Object.assign(form, {
    userId: '',
    action: '',
    resourceType: '',
    resourceId: '',
    startDate: '',
    endDate: '',
  })
  syncRoutePreset()
  auditStore.resetFilters()
  return applyFilters()
}

function handleHeaderAction(action) {
  if (action?.key === 'refresh') {
    auditStore.fetchAuditLogs()
  }
}

function goToPage(nextPage) {
  auditStore.fetchAuditLogs({
    page: Math.max(1, nextPage),
    limit: pageLimit.value,
  })
}

function actorLabel(entry = {}) {
  return entry.actor?.email || entry.actor?.userId || entry.userId || '-'
}

function resourceLabel(entry = {}) {
  const type = entry.resource?.type || entry.resourceType || '-'
  const id = entry.resource?.id || entry.resourceId || ''
  return id ? `${type}:${id}` : type
}

function occurredAt(entry = {}) {
  const raw = entry.createdAt || entry.timestamp || entry.occurredAt
  if (!raw) return '-'

  const value = new Date(raw)
  if (Number.isNaN(value.getTime())) return raw
  return value.toLocaleString()
}

watch(
  () => route.fullPath,
  () => {
    syncRoutePreset()
    applyFilters()
  },
)

onMounted(() => {
  syncRoutePreset()
  applyFilters()
})
</script>

<template>
  <PageWrapper dense>
    <template #header>
      <EnterprisePageHeader
        eyebrow="System"
        title="Audit"
        description="Filtered administrative activity from the server audit log."
        :actions="headerActions"
        :loading="auditStore.loading"
        :show-back="false"
        @select="handleHeaderAction"
      />
    </template>

    <section class="audit-panel">
      <form class="audit-filters" @submit.prevent="applyFilters">
        <label>
          <span>Actor / User ID</span>
          <input v-model="form.userId" type="search" autocomplete="off" />
        </label>
        <label>
          <span>Action</span>
          <input v-model="form.action" type="search" autocomplete="off" />
        </label>
        <label>
          <span>Resource Type</span>
          <input v-model="form.resourceType" type="search" autocomplete="off" />
        </label>
        <label>
          <span>Resource ID</span>
          <input v-model="form.resourceId" type="search" autocomplete="off" />
        </label>
        <label>
          <span>From</span>
          <input v-model="form.startDate" type="date" />
        </label>
        <label>
          <span>To</span>
          <input v-model="form.endDate" type="date" />
        </label>
        <label>
          <span>Limit</span>
          <select v-model="pageLimit">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </label>
        <div class="audit-filters__actions">
          <button type="submit" :disabled="auditStore.loading">Apply</button>
          <button type="button" :disabled="auditStore.loading" @click="resetFilters">Reset</button>
        </div>
      </form>

      <p v-if="auditStore.error" class="audit-error">{{ auditStore.error }}</p>

      <div class="audit-table-wrap">
        <table class="audit-table">
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Action</th>
              <th scope="col">Actor</th>
              <th scope="col">Resource</th>
              <th scope="col">Result</th>
              <th scope="col">IP</th>
              <th scope="col">User Agent</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="auditStore.loading">
              <td colspan="7">Loading audit events...</td>
            </tr>
            <tr v-else-if="!hasRows">
              <td colspan="7">No audit events found.</td>
            </tr>
            <tr v-for="entry in rows" v-else :key="entry.auditLogId || entry._id || entry.id">
              <td>{{ occurredAt(entry) }}</td>
              <td>{{ entry.action || '-' }}</td>
              <td>{{ actorLabel(entry) }}</td>
              <td>{{ resourceLabel(entry) }}</td>
              <td>{{ entry.result || '-' }}</td>
              <td>{{ entry.ip || entry.ipAddress || '-' }}</td>
              <td class="audit-table__user-agent">{{ entry.userAgent || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="audit-pagination">
        <button
          type="button"
          :disabled="auditStore.loading || pagination.page <= 1"
          @click="goToPage(pagination.page - 1)"
        >
          Previous
        </button>
        <span>Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
        <button
          type="button"
          :disabled="auditStore.loading || pagination.page >= pagination.totalPages"
          @click="goToPage(pagination.page + 1)"
        >
          Next
        </button>
      </footer>
    </section>
  </PageWrapper>
</template>

<style scoped>
.audit-panel {
  display: grid;
  gap: 1rem;
}

.audit-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.875rem;
  align-items: end;
}

.audit-filters label {
  display: grid;
  gap: 0.375rem;
  color: #334155;
  font-size: 0.8125rem;
  font-weight: 600;
}

.audit-filters input,
.audit-filters select {
  min-height: 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  padding: 0.5rem 0.625rem;
  background: #fff;
  color: #0f172a;
}

.audit-filters__actions {
  display: flex;
  gap: 0.5rem;
}

.audit-filters__actions button,
.audit-pagination button {
  min-height: 2.5rem;
  border: 1px solid #0f172a;
  border-radius: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: #0f172a;
  color: #fff;
  font-weight: 700;
}

.audit-filters__actions button + button,
.audit-pagination button {
  background: #fff;
  color: #0f172a;
}

.audit-filters__actions button:disabled,
.audit-pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.audit-error {
  margin: 0;
  border-left: 4px solid #b91c1c;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  color: #7f1d1d;
  font-weight: 600;
}

.audit-table-wrap {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.audit-table {
  width: 100%;
  min-width: 58rem;
  border-collapse: collapse;
  background: #fff;
}

.audit-table th,
.audit-table td {
  border-bottom: 1px solid #e2e8f0;
  padding: 0.75rem;
  text-align: left;
  vertical-align: top;
}

.audit-table th {
  background: #f8fafc;
  color: #334155;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.audit-table__user-agent {
  max-width: 18rem;
  overflow-wrap: anywhere;
}

.audit-pagination {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: flex-end;
  color: #334155;
  font-weight: 600;
}
</style>
