<script setup>
import { useAuthStore } from '@/stores/useAuthStore'
import logo from '@/assets/imgs/logo-2-removebg-preview.png'
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const canSubmit = computed(() => form.email.trim() && form.password.trim())
const redirectTarget = computed(() => {
  return typeof route.query.redirect === 'string' ? route.query.redirect : ''
})

async function submit() {
  if (!canSubmit.value || authStore.loading) return

  try {
    await authStore.login({
      email: form.email.trim(),
      password: form.password,
    })

    await router.push(redirectTarget.value || { name: 'dashboard.overview' })
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
      <h2 class="auth-form-title">{{ t('auth.loginTitle') }}</h2>
      <p class="auth-form-subtitle">{{ t('auth.loginSubtitle') }}</p>
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
          :placeholder="t('auth.emailPlaceholder')"
          size="large"
          class="base-input__control"
        />
      </label>

      <label class="base-input">
        <span class="label form-label">
          {{ t('auth.password') }}
          <span class="required">*</span>
        </span>
        <el-input
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="current-password"
          :placeholder="t('auth.passwordPlaceholder')"
          size="large"
          show-password
          class="base-input__control"
        />
      </label>

      <p v-if="authStore.error" class="auth-status auth-status--error">{{ authStore.error }}</p>

      <el-button
        native-type="submit"
        type="primary"
        size="large"
        class="base-button block auth-primary-button"
        :loading="authStore.loading"
        :disabled="!canSubmit"
      >
        {{ t('auth.signIn') }}
      </el-button>
    </form>

    <div class="auth-form-footer">
      <router-link class="auth-link" :to="{ name: 'forgotPassword' }">
        {{ t('auth.forgotPassword') }}
      </router-link>
    </div>
  </section>
</template>
