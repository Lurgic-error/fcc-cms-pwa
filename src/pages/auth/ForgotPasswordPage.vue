<script setup>
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
    <div class="auth-form-header">
      <div class="auth-form-logo-shell">
        <img :src="logo" alt="Fair Competition Commission Logo" class="auth-form-logo" />
      </div>
      <h2 class="auth-form-title">{{ t('auth.forgotPassword') }}</h2>
      <p class="auth-form-subtitle">{{ t('auth.forgotPasswordSubtitle') }}</p>
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

      <p v-if="authStore.error" class="auth-status auth-status--error">{{ authStore.error }}</p>
      <p v-if="statusMessage" class="auth-status auth-status--success">{{ statusMessage }}</p>

      <el-button
        native-type="submit"
        type="primary"
        size="large"
        class="base-button block auth-primary-button"
        :loading="authStore.loading"
        :disabled="!form.email.trim()"
      >
        {{ t('auth.sendResetToken') }}
      </el-button>

      <el-button
        v-if="statusMessage"
        type="default"
        plain
        size="large"
        class="base-button block"
        @click="goToReset"
      >
        {{ t('auth.continueToReset') }}
      </el-button>
    </form>

    <div class="auth-form-footer">
      <router-link class="auth-link" :to="{ name: 'login' }">
        {{ t('auth.backToLogin') }}
      </router-link>
    </div>
  </section>
</template>
