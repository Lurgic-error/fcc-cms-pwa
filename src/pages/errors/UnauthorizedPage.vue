<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <section class="error-card">
    <p class="code">403</p>
    <h1>{{ t('errors.unauthorizedTitle') }}</h1>
    <p>{{ t('errors.unauthorizedDescription') }}</p>

    <div class="actions">
      <BaseButton variant="secondary" @click="router.back()">
        {{ t('common.goBack') }}
      </BaseButton>
      <BaseButton @click="router.push({ name: 'dashboard.overview' })">
        {{ t('common.goToDashboard') }}
      </BaseButton>
    </div>
  </section>
</template>

<style scoped>
.error-card {
  width: min(520px, 100%);
  border: 1px solid var(--color-fcc-border);
  border-radius: 0.95rem;
  background: var(--color-surface);
  padding: 1.5rem;
  text-align: center;
  display: grid;
  gap: 0.7rem;
}

.code {
  color: var(--color-primary-600);
  font-weight: 800;
  letter-spacing: 0.08em;
}

h1 {
  font-size: 1.35rem;
  color: var(--color-fcc-text);
}

p {
  color: var(--color-fcc-text-muted);
}

.actions {
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}
</style>
