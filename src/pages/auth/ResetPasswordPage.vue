<script setup>
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
    <div class="auth-form-header">
      <div class="auth-form-logo-shell">
        <img :src="logo" alt="Fair Competition Commission Logo" class="auth-form-logo" />
      </div>
      <h2 class="auth-form-title">{{ t('auth.resetPassword') }}</h2>
      <p class="auth-form-subtitle">{{ t('auth.resetPasswordSubtitle') }}</p>
    </div>

    <form class="auth-form" @submit.prevent="submit">
      <label class="base-input">
        <span class="label form-label">
          {{ t('auth.email') }}
          <span class="required">*</span>
        </span>
        <el-input
          v-model="form.email"
          name="email"
          type="email"
          autocomplete="email"
          size="large"
          class="base-input__control"
        />
      </label>

      <label class="base-input">
        <span class="label form-label">
          {{ t('auth.recoveryToken') }}
          <span class="required">*</span>
        </span>
        <el-input
          v-model="form.token"
          name="token"
          type="text"
          autocomplete="one-time-code"
          :placeholder="t('auth.recoveryTokenPlaceholder')"
          size="large"
          class="base-input__control"
        />
      </label>

      <label class="base-input">
        <span class="label form-label">
          {{ t('auth.newPassword') }}
          <span class="required">*</span>
        </span>
        <el-input
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="new-password"
          size="large"
          show-password
          class="base-input__control"
        />
        <span class="hint">{{ passwordHint }}</span>
      </label>

      <label class="base-input">
        <span class="label form-label">
          {{ t('auth.confirmPassword') }}
          <span class="required">*</span>
        </span>
        <el-input
          v-model="form.confirmedPassword"
          name="confirmedPassword"
          type="password"
          autocomplete="new-password"
          size="large"
          show-password
          class="base-input__control"
        />
      </label>

      <p v-if="authStore.error" class="auth-status auth-status--error">{{ authStore.error }}</p>
      <p v-if="statusMessage" class="auth-status auth-status--success">{{ statusMessage }}</p>

      <el-button
        native-type="submit"
        type="primary"
        size="large"
        class="base-button block auth-primary-button"
        :loading="authStore.loading"
        :disabled="!canSubmit"
      >
        {{ t('auth.resetPasswordAction') }}
      </el-button>
    </form>

    <div class="auth-form-footer">
      <router-link class="auth-link" :to="{ name: 'login' }">
        {{ t('auth.backToLogin') }}
      </router-link>
    </div>
  </section>
</template>
