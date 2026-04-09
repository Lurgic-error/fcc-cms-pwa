<script setup>
import { useBreadcrumbs } from './useBreadcrumbs'

const { breadcrumbs } = useBreadcrumbs()
</script>

<template>
  <nav class="flex gap-2 text-sm text-gray-600">
    <template v-for="(crumb, index) in breadcrumbs" :key="index">
      <router-link
        v-if="index < breadcrumbs.length - 1"
        :to="{ name: crumb.routeName, params: crumb.params }"
        class="hover:underline"
      >
        {{ crumb.label }}
      </router-link>
      <span v-else class="font-medium text-gray-900">
        {{ crumb.label }}
      </span>
      <span v-if="index < breadcrumbs.length - 1">/</span>
    </template>
  </nav>
</template>
