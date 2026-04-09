<script setup>
import ThemeModeSelector from '@/components/layout/ThemeModeSelector.vue'
import loginBackground from '@/assets/imgs/ushindani-house.png'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="auth-layout" :style="{ backgroundImage: `url(${loginBackground})` }">
    <div class="mesh" />
    <div class="atmospheric-overlay" />

    <div class="theme-floating">
      <ThemeModeSelector />
    </div>

    <main class="auth-main">
      <section class="intro">
        <p class="eyebrow">Federal Communications Commission</p>
        <h1>{{ t('app.title') }}</h1>
        <p>{{ t('app.description') }}</p>

        <div class="intro-cards">
          <article>
            <p class="intro-card-title">Trusted Access</p>
            <p>Secure sign in for FCC staff and content teams.</p>
          </article>
          <article>
            <p class="intro-card-title">Unified Workspace</p>
            <p>Manage publication workflows from one secure platform.</p>
          </article>
        </div>
      </section>

      <section class="panel">
        <router-view />
      </section>
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.mesh {
  position: absolute;
  inset: 0;
  background: rgba(2, 6, 23, 0.7);
  pointer-events: none;
}

.atmospheric-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 12% 15%, rgba(30, 64, 175, 0.34), transparent 40%),
    radial-gradient(circle at 86% 82%, rgba(15, 118, 110, 0.32), transparent 44%);
  pointer-events: none;
}

.theme-floating {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

.auth-main {
  width: min(1100px, 100%);
  z-index: 1;
  display: grid;
  grid-template-columns: 1.2fr minmax(320px, 420px);
  border: 1px solid var(--fcc-sidebar-border);
  border-radius: var(--fcc-radius-lg);
  background: var(--fcc-surface);
  box-shadow: 0 20px 48px var(--fcc-shadow-base);
  overflow: hidden;
}

.intro {
  padding: 2rem;
  background: linear-gradient(
    150deg,
    var(--fcc-primary-600) 0%,
    var(--fcc-primary-800) 55%,
    var(--fcc-primary-950) 100%
  );
  color: var(--fcc-primary-50);
  display: grid;
  align-content: center;
  gap: 0.75rem;
}

.eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
}

.intro h1 {
  font-size: 1.7rem;
  line-height: 1.15;
  font-weight: 750;
  color: #ffffff;
}

.intro p {
  max-width: 44ch;
  color: var(--fcc-primary-50);
  opacity: 0.9;
}

.intro-cards {
  margin-top: 0.8rem;
  display: grid;
  gap: 0.7rem;
}

.intro-cards article {
  border-radius: var(--fcc-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  padding: 1rem;
}

.intro-card-title {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ffffff;
}

.panel {
  padding: 1.25rem;
  display: grid;
  align-items: center;
  background: transparent;
}

@media (max-width: 940px) {
  .auth-main {
    grid-template-columns: 1fr;
  }

  .intro {
    padding: 1.15rem;
  }

  .panel {
    padding: 1rem;
  }
}
</style>
