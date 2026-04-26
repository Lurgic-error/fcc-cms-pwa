<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <section class="error-card error-card--info">
    <p class="error-card__code">403</p>
    <h1 class="error-card__title">{{ t('errors.unauthorizedTitle') }}</h1>
    <p class="error-card__body">{{ t('errors.unauthorizedDescription') }}</p>

    <div class="error-card__actions">
      <el-button plain size="large" class="base-button" @click="router.back()">
        {{ t('common.goBack') }}
      </el-button>
      <el-button type="primary" size="large" class="base-button" @click="router.push({ name: 'dashboard.overview' })">
        {{ t('common.goToDashboard') }}
      </el-button>
    </div>
  </section>
</template>
