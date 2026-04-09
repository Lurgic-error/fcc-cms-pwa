<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import logo from '@/assets/imgs/logo-2-removebg-preview.png'
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const statusMessage = ref('')

const form = reactive({
  email: typeof route.query.email === 'string' ? route.query.email : '',
  token: '',
  password: '',
  confirmedPassword: '',
})

const passwordHint = computed(() => t('auth.passwordRules'))

const canSubmit = computed(() => {
  return (
    form.email.trim() && form.token.trim() && form.password.trim() && form.confirmedPassword.trim()
  )
})

async function submit() {
  statusMessage.value = ''

  try {
    await authStore.resetPassword({
      email: form.email.trim(),
      token: form.token.trim(),
      password: form.password,
      confirmedPassword: form.confirmedPassword,
    })

    statusMessage.value = t('auth.resetPasswordSuccess')

    window.setTimeout(() => {
      router.push({ name: 'login' })
    }, 1200)
  } catch {
    // Error state is already handled in auth store.
  }
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
      <h2 class="auth-form-title mt-2 text-2xl font-bold">{{ t('auth.resetPassword') }}</h2>
      <p class="auth-form-subtitle mt-2">{{ t('auth.resetPasswordSubtitle') }}</p>
    </div>

    <form class="auth-form" @submit.prevent="submit">
      <BaseInput
        v-model="form.email"
        name="email"
        type="email"
        autocomplete="email"
        :label="t('auth.email')"
        :required="true"
      />

      <BaseInput
        v-model="form.token"
        name="token"
        type="text"
        autocomplete="one-time-code"
        :label="t('auth.recoveryToken')"
        :placeholder="t('auth.recoveryTokenPlaceholder')"
        :required="true"
      />

      <BaseInput
        v-model="form.password"
        name="password"
        type="password"
        autocomplete="new-password"
        :label="t('auth.newPassword')"
        :hint="passwordHint"
        :required="true"
      />

      <BaseInput
        v-model="form.confirmedPassword"
        name="confirmedPassword"
        type="password"
        autocomplete="new-password"
        :label="t('auth.confirmPassword')"
        :required="true"
      />

      <p v-if="authStore.error" class="error">{{ authStore.error }}</p>
      <p v-if="statusMessage" class="success">{{ statusMessage }}</p>

      <BaseButton
        type="submit"
        variant="primary"
        class="auth-primary-button"
        :loading="authStore.loading"
        :disabled="!canSubmit"
        :block="true"
      >
        {{ t('auth.resetPasswordAction') }}
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
