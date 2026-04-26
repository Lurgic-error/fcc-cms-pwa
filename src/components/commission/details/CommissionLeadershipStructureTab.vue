<script setup>
import AppDetailCard from '@/components/common/detail/AppDetailCard.vue'
import AppDetailGrid from '@/components/common/detail/AppDetailGrid.vue'
import AppDetailItem from '@/components/common/detail/AppDetailItem.vue'

defineProps({
  directorGeneralName: {
    type: String,
    default: 'No Name Provided',
  },
  directorGeneralRole: {
    type: String,
    default: 'Director General',
  },
  directorGeneralContacts: {
    type: Array,
    default: () => [],
  },
  directorGeneralImageUrl: {
    type: String,
    default: '',
  },
  featuredMessage: {
    type: String,
    default: '-',
  },
  profileStatement: {
    type: String,
    default: '-',
  },
  biography: {
    type: String,
    default: '-',
  },
  structureImageUrl: {
    type: String,
    default: '',
  },
  structureImageAlt: {
    type: String,
    default: '-',
  },
})
</script>

<template>
  <div class="enterprise-stack enterprise-stack--spacious">
    <section class="commission-leadership-card">
      <div class="commission-leadership-card__hero">
        <div class="commission-leadership-card__portrait">
          <img
            v-if="directorGeneralImageUrl"
            :src="directorGeneralImageUrl"
            :alt="directorGeneralName"
            class="commission-leadership-card__portrait-image"
          />
          <div v-else class="commission-leadership-card__portrait-fallback">DG</div>
        </div>
        <div class="commission-leadership-card__identity">
          <h3 class="commission-leadership-card__name">{{ directorGeneralName }}</h3>
          <p class="commission-leadership-card__role">{{ directorGeneralRole }}</p>

          <div
            v-if="directorGeneralContacts.length"
            class="enterprise-pill-list commission-leadership-card__contacts"
          >
            <div
              v-for="contact in directorGeneralContacts"
              :key="contact"
              class="enterprise-pill"
            >
              {{ contact }}
            </div>
          </div>
        </div>
      </div>

      <div class="commission-leadership-card__body">
        <AppDetailGrid :columns="1">
          <AppDetailItem label="Featured Message" :value="featuredMessage" />
          <AppDetailItem label="Profile Statement" :value="profileStatement" />
          <AppDetailItem label="Biography" :value="biography" />
        </AppDetailGrid>
      </div>
    </section>

    <AppDetailCard title="Organization Structure" subtitle="Hierarchy diagram">
      <AppDetailGrid :columns="1">
        <AppDetailItem label="Image Alt Text" :value="structureImageAlt" />
        <AppDetailItem label="Structure Diagram">
          <div
            v-if="structureImageUrl"
            class="enterprise-media-frame enterprise-media-frame--padded"
          >
            <img
              :src="structureImageUrl"
              :alt="structureImageAlt"
              class="enterprise-media-frame__image enterprise-media-frame__image--contain"
            />
          </div>
          <span v-else class="enterprise-empty-note enterprise-empty-note--block">
            No structure image
          </span>
        </AppDetailItem>
      </AppDetailGrid>
    </AppDetailCard>
  </div>
</template>
