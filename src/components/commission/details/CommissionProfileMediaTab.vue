<script setup>
import AppDetailCard from '@/components/common/detail/AppDetailCard.vue'
import AppDetailGrid from '@/components/common/detail/AppDetailGrid.vue'
import AppDetailItem from '@/components/common/detail/AppDetailItem.vue'

defineProps({
  profileRows: {
    type: Array,
    default: () => [],
  },
  coverImageUrl: {
    type: String,
    default: '',
  },
  galleryItems: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="enterprise-stack enterprise-stack--spacious">
    <AppDetailCard title="Basic Profile" subtitle="General identity and welcome information">
      <AppDetailGrid :columns="2">
        <AppDetailItem
          v-for="row in profileRows"
          :key="row.label"
          :label="row.label"
          :value="row.value"
          :col-span="row.colSpan || 1"
        />
      </AppDetailGrid>
    </AppDetailCard>

    <AppDetailCard title="Featured Media" subtitle="Cover image and gallery">
      <AppDetailGrid :columns="1">
        <AppDetailItem label="Cover Image">
          <div v-if="coverImageUrl" class="enterprise-media-frame">
            <img
              :src="coverImageUrl"
              alt="Commission cover"
              class="enterprise-media-frame__image enterprise-media-frame__image--cover"
            />
          </div>
          <span v-else class="enterprise-empty-note enterprise-empty-note--block">
            No cover image
          </span>
        </AppDetailItem>

        <AppDetailItem label="Gallery Images">
          <div v-if="galleryItems.length" class="enterprise-media-gallery">
            <div
              v-for="image in galleryItems"
              :key="image.key"
              class="enterprise-media-gallery__item"
            >
              <img
                :src="image.url"
                :alt="image.alt"
                class="enterprise-media-gallery__image"
              />
            </div>
          </div>
          <span v-else class="enterprise-empty-note enterprise-empty-note--block">
            No gallery images
          </span>
        </AppDetailItem>
      </AppDetailGrid>
    </AppDetailCard>
  </div>
</template>
