<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { useLocale } from '@/composables/useLocale'
import { useAuthStore } from '@/stores/useAuthStore'
import logo from '@/assets/imgs/logo-2-removebg-preview.png'
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { locale, locales, setLocale } = useLocale()

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
      <h2 class="auth-form-title mt-2 text-2xl font-bold">{{ t('auth.loginTitle') }}</h2>
      <p class="auth-form-subtitle mt-2">{{ t('auth.loginSubtitle') }}</p>
    </div>

    <form class="auth-form" @submit.prevent="submit">
      <label class="locale-switcher">
        <span>{{ t('common.language') }}</span>
        <select :value="locale" @change="setLocale($event.target.value)">
          <option v-for="item in locales" :key="item.code" :value="item.code">
            {{ item.label }}
          </option>
        </select>
      </label>

      <BaseInput
        v-model="form.email"
        name="email"
        type="email"
        autocomplete="email"
        :label="t('auth.email')"
        :placeholder="t('auth.emailPlaceholder')"
        :required="true"
      />

      <BaseInput
        v-model="form.password"
        name="password"
        type="password"
        autocomplete="current-password"
        :label="t('auth.password')"
        :placeholder="t('auth.passwordPlaceholder')"
        :required="true"
      />

      <p v-if="authStore.error" class="error">{{ authStore.error }}</p>

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        class="auth-primary-button"
        :loading="authStore.loading"
        :disabled="!canSubmit"
        :block="true"
      >
        {{ t('auth.signIn') }}
      </BaseButton>
    </form>

    <router-link class="auth-form-link auth-link" :to="{ name: 'forgotPassword' }">
      {{ t('auth.forgotPassword') }}
    </router-link>
  </section>
</template>

<style scoped>
.auth-form-title {
  font-size: 1.2rem;
}

.auth-form {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.2rem;
}

.locale-switcher {
  display: inline-grid;
  gap: 0.2rem;
  font-size: 0.7rem;
  color: var(--fcc-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.locale-switcher select {
  border: 1px solid var(--fcc-border);
  border-radius: var(--fcc-radius-sm);
  padding: 0.28rem 0.42rem;
  color: var(--fcc-text);
  background: var(--fcc-surface);
}

.error {
  color: var(--color-danger);
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
