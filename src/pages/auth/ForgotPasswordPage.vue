<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import logo from '@/assets/imgs/logo-2-removebg-preview.png'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const statusMessage = ref('')

const form = reactive({
  email: '',
})

async function submit() {
  statusMessage.value = ''

  try {
    await authStore.forgotPassword({
      email: form.email.trim(),
    })

    statusMessage.value = t('auth.forgotPasswordSent')
  } catch {
    // Error state is already handled in auth store.
  }
}

function goToReset() {
  router.push({
    name: 'resetPassword',
    query: { email: form.email.trim() },
  })
}
</script>

<template>
  <section class="auth-form-card auth-form-card--compact">
    <div class="text-center">
      <div
        class="auth-form-logo-shell mx-auto mb-4 flex h-20 w-20 items-center justify-center"
        style="border-radius: var(--fcc-radius-lg)"
      >
        <img :src="logo" alt="Fair Competition Commission Logo" class="h-14 w-14 object-contain" />
      </div>
      <p class="auth-form-eyebrow text-xs font-semibold uppercase tracking-[0.2em]">
        Fair Competition Commission
      </p>
      <h2 class="auth-form-title mt-2 text-2xl font-bold">{{ t('auth.forgotPassword') }}</h2>
      <p class="auth-form-subtitle mt-2">{{ t('auth.forgotPasswordSubtitle') }}</p>
    </div>

    <form class="auth-form" @submit.prevent="submit">
      <BaseInput
        v-model="form.email"
        name="email"
        type="email"
        autocomplete="email"
        :label="t('auth.email')"
        :placeholder="t('auth.emailPlaceholder')"
        :required="true"
      />

      <p v-if="authStore.error" class="error">{{ authStore.error }}</p>
      <p v-if="statusMessage" class="success">{{ statusMessage }}</p>

      <BaseButton
        type="submit"
        variant="primary"
        class="auth-primary-button"
        :loading="authStore.loading"
        :disabled="!form.email.trim()"
        :block="true"
      >
        {{ t('auth.sendResetToken') }}
      </BaseButton>

      <BaseButton
        v-if="statusMessage"
        type="button"
        variant="secondary"
        :block="true"
        @click="goToReset"
      >
        {{ t('auth.continueToReset') }}
      </BaseButton>
    </form>

    <router-link class="auth-form-link auth-link" :to="{ name: 'login' }">
      {{ t('auth.backToLogin') }}
    </router-link>
  </section>
</template>

<style scoped>
.auth-form-title {
  font-size: 1.1rem;
}

.auth-form {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.2rem;
}

.error {
  color: var(--color-danger);
  font-size: 0.82rem;
}

.success {
  color: var(--color-primary-600);
  font-size: 0.82rem;
}

.auth-link {
  margin-top: 0.2rem;
  font-size: 0.84rem;
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>
