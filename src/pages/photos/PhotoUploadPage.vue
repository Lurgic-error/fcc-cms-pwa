<script setup>
import { photosAPI } from '@/api'
import MediaUploadWorkspace from '@/components/enterprise/MediaUploadWorkspace.vue'
</script>

<template>
  <MediaUploadWorkspace
    title="Upload Photos"
    description="Add website-ready images with captions, tags, ordering, and placement guidance for the public media center."
    resource-label="photo"
    :library-route="{ name: 'photos.list' }"
    :submit-upload="photosAPI.createPhoto"
  />
</template>
