<script setup>
import ThemeModeSelector from '@/components/layout/ThemeModeSelector.vue'
import loginBackground from '@/assets/imgs/ushindani-house.png'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="auth-layout" :style="{ backgroundImage: `url(${loginBackground})` }">
    <div class="auth-layout__mesh" />
    <div class="auth-layout__overlay" />

    <div class="auth-layout__theme">
      <ThemeModeSelector />
    </div>

    <main class="auth-main">
      <section class="auth-layout__intro">
        <p class="auth-layout__eyebrow">{{ t('app.workspace') }}</p>
        <h1>{{ t('app.title') }}</h1>
        <p>{{ t('app.description') }}</p>

        <div class="auth-layout__intro-cards">
          <article>
            <p class="auth-layout__intro-card-title">{{ t('auth.trustedAccessTitle') }}</p>
            <p>{{ t('auth.trustedAccessBody') }}</p>
          </article>
          <article>
            <p class="auth-layout__intro-card-title">{{ t('auth.unifiedWorkspaceTitle') }}</p>
            <p>{{ t('auth.unifiedWorkspaceBody') }}</p>
          </article>
        </div>
      </section>

      <section class="auth-layout__panel">
        <router-view />
      </section>
    </main>
  </div>
</template>
