<script setup>
import { assetsAPI } from '@/api'
import MediaUploadWorkspace from '@/components/enterprise/MediaUploadWorkspace.vue'
</script>

<template>
  <MediaUploadWorkspace
    title="Upload Assets"
    description="Prepare reusable FCC images with the right metadata, placement, and ordering for website and campaign use."
    resource-label="asset"
    :library-route="{ name: 'assets.library' }"
    :submit-upload="assetsAPI.createAsset"
  />
</template>
