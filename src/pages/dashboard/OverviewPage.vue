<script setup>
import {
  articlesAPI,
  eventsAPI,
  photosAPI,
  publicationsAPI,
  servicesAPI,
  videosAPI,
  visitorsAPI,
} from '@/api'
import PageWrapper from '@/components/common/PageWrapper.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import OverviewChartCard from '@/components/enterprise/OverviewChartCard.vue'
import OverviewStatsGrid from '@/components/enterprise/OverviewStatsGrid.vue'
import { useUsersStore } from '@/stores/useUsersStore'
import { formatDisplayDate, formatNumber } from '@/utils/adminPresentation'
import {
  buildReferrerSeries,
  buildSummaryWindowSeries,
  buildTopPagesSeries,
} from '@/utils/visitorAnalytics'
import {
  buildCategorySummary,
  buildPublicationSummary,
  resolveLocalizedLabel,
  sortByRecent,
} from '@/utils/publicationsWorkspace'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const usersStore = useUsersStore()

const loading = ref(false)
const loadError = ref('')
const publications = ref([])
const categories = ref([])
const articles = ref([])
const events = ref([])
const photos = ref([])
const videos = ref([])
const services = ref([])
const visitorSummary = ref({})
const visitorHotspots = ref({
  windowDays: 14,
  generatedAt: null,
  topPages: [],
  topReferrers: [],
  topLocales: [],
  recentActivity: [],
})

function getCollection(response, keys = []) {
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key]
  }

  if (Array.isArray(response?.items)) return response.items
  if (Array.isArray(response?.data)) return response.data
  return []
}

function mapRecentItems(list = [], type) {
  return sortByRecent(list)
    .slice(0, 5)
    .map((item) => ({
      type,
      title:
        resolveLocalizedLabel(item, '') ||
        item?.caption ||
        item?.title ||
        item?.name ||
        'Untitled item',
      status:
        item?.effectiveStatus ||
        item?.publicationStatus ||
        item?.status ||
        (item?.published ? 'published' : 'draft'),
      updatedAt: item?.updatedAt || item?.lastModified || item?.createdAt || item?.dateCreated,
      category:
        item?.category?.name?.en || item?.category?.name || item?.systemKey || item?.type || '',
    }))
}

const userName = computed(() => {
  return usersStore.profile?.fullName || usersStore.profile?.email || 'Editorial workspace'
})

const roleName = computed(() => usersStore.role || 'editor')
const permissionCount = computed(() => usersStore.permissions.length)
const publicationSummary = computed(() => buildPublicationSummary(publications.value))
const categorySummary = computed(() => buildCategorySummary(categories.value, publications.value))

const headlineStats = computed(() => [
  {
    key: 'publications',
    label: 'Publications',
    value: publications.value.length,
    helper: `${publicationSummary.value.published} published`,
  },
  {
    key: 'categories',
    label: 'Publication Categories',
    value: categories.value.length,
    helper: `${categorySummary.value.live} live on website`,
  },
  {
    key: 'news',
    label: 'News Stories',
    value: articles.value.length,
    helper: 'Editorial stories and updates',
  },
  {
    key: 'events',
    label: 'Events',
    value: events.value.length,
    helper: 'Upcoming, ongoing, and archived events',
  },
  {
    key: 'media',
    label: 'Media Items',
    value: photos.value.length + videos.value.length,
    helper: `${photos.value.length} images and ${videos.value.length} videos`,
  },
  {
    key: 'visitors',
    label: 'Website Visits',
    value:
      visitorSummary.value?.totalVisits ||
      visitorSummary.value?.visits ||
      visitorSummary.value?.totalVisitors ||
      0,
    helper: 'Based on current visitor summary',
  },
])

const publicationStatusSeries = computed(() => [
  { label: 'Draft', value: publicationSummary.value.draft },
  { label: 'Review', value: publicationSummary.value.submitted },
  { label: 'Approved', value: publicationSummary.value.approved },
  { label: 'Published', value: publicationSummary.value.published },
  { label: 'Blocked', value: publicationSummary.value.blockedByCategory },
])

const visitorWindowSeries = computed(() => buildSummaryWindowSeries(visitorSummary.value))
const visitorTopPagesSeries = computed(() =>
  buildTopPagesSeries(visitorHotspots.value?.topPages, { limit: 6 }),
)
const visitorReferrerSeries = computed(() =>
  buildReferrerSeries(visitorHotspots.value?.topReferrers, { limit: 5 }),
)
const leadingPageLabel = computed(
  () => visitorTopPagesSeries.value[0]?.fullLabel || 'No tracked page yet',
)
const leadingReferrerLabel = computed(
  () => visitorReferrerSeries.value[0]?.label || 'Direct / unknown',
)

const recentActivity = computed(() => {
  return [
    ...mapRecentItems(publications.value, 'Publication'),
    ...mapRecentItems(categories.value, 'Category'),
    ...mapRecentItems(articles.value, 'News'),
    ...mapRecentItems(photos.value, 'Image'),
  ]
    .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0))
    .slice(0, 8)
})

const attentionItems = computed(() => {
  const items = []

  if (categorySummary.value.empty > 0) {
    items.push({
      title: 'Categories still waiting for their first publication',
      value: categorySummary.value.empty,
      helper: 'Create or assign publications so the archive stays organized.',
      route: { name: 'publicationCategories.list' },
      action: 'Review categories',
    })
  }

  if (publicationSummary.value.submitted > 0) {
    items.push({
      title: 'Publications pending editorial review',
      value: publicationSummary.value.submitted,
      helper: 'Submitted publications need approval before they can be scheduled or published.',
      route: { name: 'publications.list', query: { publicationStatus: 'submitted' } },
      action: 'Open review queue',
    })
  }

  if (publicationSummary.value.blockedByCategory > 0) {
    items.push({
      title: 'Publications blocked by unpublished categories',
      value: publicationSummary.value.blockedByCategory,
      helper: 'Publish the parent category first so the publication can go public.',
      route: { name: 'publications.list' },
      action: 'Fix blockers',
    })
  }

  const unpublishedMedia = photos.value.filter((item) => !item?.published).length
  if (unpublishedMedia > 0) {
    items.push({
      title: 'Images waiting to go live',
      value: unpublishedMedia,
      helper: 'Review captions, ordering, and publish readiness for media-center assets.',
      route: { name: 'photos.list' },
      action: 'Open image library',
    })
  }

  if (!items.length) {
    items.push({
      title: 'No urgent editorial blockers right now',
      value: 0,
      helper: 'The content workspace is clear. Use the shortcuts below to keep momentum.',
      route: { name: 'publications.list' },
      action: 'Go to publications',
    })
  }

  return items
})

async function loadOverview() {
  loading.value = true
  loadError.value = ''

  const [
    categoriesResult,
    publicationsResult,
    articlesResult,
    eventsResult,
    photosResult,
    videosResult,
    servicesResult,
    visitorsResult,
    hotspotsResult,
  ] = await Promise.allSettled([
    publicationsAPI.listPublicationCategories({ page: 1, limit: 120 }),
    publicationsAPI.listPublications({ page: 1, limit: 120 }),
    articlesAPI.listArticles({ page: 1, limit: 120 }),
    eventsAPI.listEvents({ page: 1, limit: 120 }),
    photosAPI.listPhotos({ page: 1, limit: 120 }),
    videosAPI.listVideos({ page: 1, limit: 120 }),
    servicesAPI.listServices({ page: 1, limit: 120 }),
    visitorsAPI.fetchSummary(),
    visitorsAPI.fetchHotspots({ days: 30, limit: 20 }),
  ])

  const fulfilled = (result) => (result.status === 'fulfilled' ? result.value : {})

  const nextCategories = fulfilled(categoriesResult)
  const nextPublications = fulfilled(publicationsResult)
  const nextArticles = fulfilled(articlesResult)
  const nextEvents = fulfilled(eventsResult)
  const nextPhotos = fulfilled(photosResult)
  const nextVideos = fulfilled(videosResult)
  const nextServices = fulfilled(servicesResult)
  const nextVisitors = fulfilled(visitorsResult)
  const nextHotspots = fulfilled(hotspotsResult)

  categories.value = getCollection(nextCategories, ['categories'])
  publications.value = getCollection(nextPublications, ['publications'])
  articles.value = getCollection(nextArticles, ['articles'])
  events.value = getCollection(nextEvents, ['events'])
  photos.value = getCollection(nextPhotos, ['images', 'photos'])
  videos.value = getCollection(nextVideos, ['videos'])
  services.value = getCollection(nextServices, ['services'])
  visitorSummary.value = nextVisitors?.summary || nextVisitors || {}
  visitorHotspots.value = {
    windowDays: 30,
    generatedAt: null,
    topPages: [],
    topReferrers: [],
    topLocales: [],
    recentActivity: [],
    ...(nextHotspots?.hotspots || nextHotspots || {}),
  }

  const failed = [
    categoriesResult,
    publicationsResult,
    articlesResult,
    eventsResult,
    photosResult,
    videosResult,
    servicesResult,
    visitorsResult,
    hotspotsResult,
  ].filter((item) => item.status === 'rejected' || item.value?.error)

  if (failed.length) {
    loadError.value =
      'Some dashboard panels could not be refreshed. The available summaries below still use the data that loaded successfully.'
  }

  loading.value = false
}

function open(route) {
  if (!route) return
  router.push(route)
}

const editorialHealth = computed(() => [
  {
    label: 'Under review',
    value: formatNumber(publicationSummary.value.submitted + categorySummary.value.submitted),
  },
  {
    label: 'Ready for website',
    value: formatNumber(publicationSummary.value.published + categorySummary.value.live),
  },
  {
    label: 'Needs structure',
    value: formatNumber(categorySummary.value.empty),
  },
  {
    label: 'Access profile',
    value: `${formatNumber(permissionCount.value)} permissions`,
  },
])

onMounted(loadOverview)
</script>

<template>
  <PageWrapper
    title="Dashboard"
    description="A calm overview of what is ready for the website, what still needs attention, and where your editorial team should work next."
  >
    <div class="dashboard-shell">
      <el-alert v-if="loadError" type="warning" show-icon :closable="false" :title="loadError" />

      <section class="dashboard-hero surface-card">
        <div class="dashboard-hero__copy">
          <p class="dashboard-eyebrow">Editorial control center</p>
          <h2 class="dashboard-hero__title">Welcome back, {{ userName }}</h2>
          <p class="dashboard-hero__description">
            Use this view to monitor the website, the CMS, and the publication workflow without
            digging through technical screens. Your current role is {{ roleName }}.
          </p>

          <div class="dashboard-hero__meta">
            <div
              v-for="item in editorialHealth"
              :key="item.label"
              class="dashboard-hero__meta-item"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>

        <div class="dashboard-hero__actions">
          <el-button type="primary" @click="open({ name: 'publications.list' })">
            Manage Publications
          </el-button>
          <el-button type="success" plain @click="open({ name: 'publicationCategories.list' })">
            Manage Categories
          </el-button>
          <el-button type="info" plain @click="open({ name: 'photos.list' })">
            Open Image Library
          </el-button>
          <el-button type="warning" plain @click="open({ name: 'contentManagement.pages' })">
            Website Content
          </el-button>
        </div>
      </section>

      <OverviewStatsGrid :stats="headlineStats" />

      <div class="dashboard-grid">
        <article class="dashboard-card dashboard-panel dashboard-card--publication surface-card">
          <header class="dashboard-panel__header">
            <div>
              <p class="dashboard-eyebrow">Publication workspace</p>
              <h3>Categories and publications are moving together</h3>
            </div>
            <div class="flex flex-wrap gap-2">
              <StatusBadge value="published" :label="`${categorySummary.live} live categories`" />
              <StatusBadge
                value="approved"
                :label="`${publicationSummary.published} public publications`"
              />
            </div>
          </header>

          <div class="dashboard-kpi-grid">
            <div class="dashboard-kpi-card">
              <span>Draft publications</span>
              <strong>{{ formatNumber(publicationSummary.draft) }}</strong>
            </div>
            <div class="dashboard-kpi-card">
              <span>Under review</span>
              <strong>{{ formatNumber(publicationSummary.submitted) }}</strong>
            </div>
            <div class="dashboard-kpi-card">
              <span>Approved categories</span>
              <strong>{{ formatNumber(categorySummary.approved) }}</strong>
            </div>
            <div class="dashboard-kpi-card">
              <span>Empty categories</span>
              <strong>{{ formatNumber(categorySummary.empty) }}</strong>
            </div>
          </div>

          <div class="dashboard-panel__footer">
            <el-button type="primary" plain @click="open({ name: 'publications.create' })">
              Create publication
            </el-button>
            <el-button type="success" plain @click="open({ name: 'publicationCategories.create' })">
              Create category first
            </el-button>
            <el-button type="info" plain @click="open({ name: 'publications.list' })">
              Review scheduling
            </el-button>
          </div>
        </article>

        <article class="dashboard-card dashboard-panel dashboard-card--pulse surface-card">
          <header class="dashboard-panel__header">
            <div>
              <p class="dashboard-eyebrow">Website pulse</p>
              <h3>Content mix on hand</h3>
            </div>
          </header>

          <div class="dashboard-summary-list">
            <div class="dashboard-summary-row">
              <span>News stories</span>
              <strong>{{ formatNumber(articles.length) }}</strong>
            </div>
            <div class="dashboard-summary-row">
              <span>Events</span>
              <strong>{{ formatNumber(events.length) }}</strong>
            </div>
            <div class="dashboard-summary-row">
              <span>Services</span>
              <strong>{{ formatNumber(services.length) }}</strong>
            </div>
            <div class="dashboard-summary-row">
              <span>Images</span>
              <strong>{{ formatNumber(photos.length) }}</strong>
            </div>
            <div class="dashboard-summary-row">
              <span>YouTube videos</span>
              <strong>{{ formatNumber(videos.length) }}</strong>
            </div>
            <div class="dashboard-summary-row">
              <span>Tracked visits</span>
              <strong>{{ formatNumber(headlineStats[5]?.value || 0) }}</strong>
            </div>
            <div class="dashboard-summary-row">
              <span>Top page</span>
              <strong class="dashboard-summary-row__text" :title="leadingPageLabel">
                {{ leadingPageLabel }}
              </strong>
            </div>
            <div class="dashboard-summary-row">
              <span>Top source</span>
              <strong class="dashboard-summary-row__text" :title="leadingReferrerLabel">
                {{ leadingReferrerLabel }}
              </strong>
            </div>
          </div>
        </article>

        <OverviewChartCard
          class="dashboard-card dashboard-chart dashboard-card--traffic"
          title="Visitor traffic windows"
          description="Compare live visitor volume across the dashboard reporting windows without leaving the overview."
          type="bar"
          :data="visitorWindowSeries"
        />

        <OverviewChartCard
          class="dashboard-card dashboard-chart dashboard-card--paths"
          title="Top visitor paths"
          description="The strongest tracked destinations from the latest website activity snapshot."
          type="bar"
          :data="visitorTopPagesSeries"
          :chart-options="{
            indexAxis: 'y',
            scales: {
              x: { beginAtZero: true, ticks: { precision: 0 } },
              y: { ticks: { autoSkip: false } },
            },
          }"
        />

        <OverviewChartCard
          class="dashboard-card dashboard-chart dashboard-card--sources"
          title="Visitor acquisition mix"
          description="The channels and sites that are currently sending the strongest visitor flow."
          type="pie"
          :data="visitorReferrerSeries"
        />

        <OverviewChartCard
          class="dashboard-card dashboard-chart dashboard-card--status"
          title="Publication status mix"
          description="This helps PR officers see where content is stuck before it reaches the public website."
          type="bar"
          :data="publicationStatusSeries"
        />

        <article class="dashboard-card dashboard-panel dashboard-card--attention surface-card">
          <header class="dashboard-panel__header">
            <div>
              <p class="dashboard-eyebrow">Needs attention</p>
              <h3>What to work on next</h3>
            </div>
          </header>

          <div class="dashboard-attention-list">
            <button
              v-for="item in attentionItems"
              :key="item.title"
              type="button"
              class="dashboard-attention-card"
              @click="open(item.route)"
            >
              <div>
                <p class="dashboard-attention-card__value">{{ formatNumber(item.value) }}</p>
                <h4>{{ item.title }}</h4>
                <p>{{ item.helper }}</p>
              </div>
              <span class="dashboard-attention-card__action">{{ item.action }}</span>
            </button>
          </div>
        </article>

        <article class="dashboard-card dashboard-panel dashboard-card--activity surface-card">
          <header class="dashboard-panel__header">
            <div>
              <p class="dashboard-eyebrow">Recent activity</p>
              <h3>Recently updated records</h3>
            </div>
            <el-button plain :loading="loading" @click="loadOverview">Refresh overview</el-button>
          </header>

          <div class="dashboard-activity-list">
            <div
              v-for="item in recentActivity"
              :key="`${item.type}-${item.title}-${item.updatedAt}`"
              class="dashboard-activity-item"
            >
              <div>
                <p class="dashboard-activity-item__type">{{ item.type }}</p>
                <h4>{{ item.title }}</h4>
                <p>{{ item.category || 'Editorial workspace item' }}</p>
              </div>

              <div class="dashboard-activity-item__meta">
                <StatusBadge :value="item.status" />
                <span>{{ formatDisplayDate(item.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </PageWrapper>
</template>

<style scoped>
.dashboard-shell {
  display: grid;
  gap: 1rem;
}

.dashboard-hero {
  display: grid;
  gap: 1.2rem;
  padding: 1.35rem;
  background:
    radial-gradient(circle at top right, rgba(0, 151, 218, 0.16), transparent 28%),
    radial-gradient(circle at bottom left, rgba(27, 48, 103, 0.08), transparent 36%),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--fcc-surface) 98%, white),
      var(--fcc-primary-50)
    );
}

.dashboard-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fcc-secondary-700);
}

.dashboard-hero__title {
  margin-top: 0.35rem;
  font-size: clamp(1.5rem, 2.4vw, 2.2rem);
}

.dashboard-hero__description {
  margin-top: 0.45rem;
  max-width: 44rem;
  color: var(--fcc-text-muted);
}

.dashboard-hero__meta {
  display: grid;
  gap: 0.8rem;
  margin-top: 1rem;
}

.dashboard-hero__meta-item {
  border-radius: 1rem;
  border: 1px solid var(--fcc-border);
  background: color-mix(in srgb, var(--fcc-surface) 92%, transparent);
  padding: 0.85rem 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--fcc-text-muted);
}

.dashboard-hero__meta-item strong {
  color: var(--fcc-text);
}

.dashboard-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: start;
}

.dashboard-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr);
  grid-auto-flow: dense;
}

.dashboard-card,
.dashboard-panel,
.dashboard-chart {
  min-height: 100%;
  min-width: 0;
}

.dashboard-summary-row__text {
  max-width: 15rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.dashboard-panel {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-panel__header {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: 0.85rem;
}

.dashboard-panel__header h3 {
  font-size: 1.15rem;
}

.dashboard-kpi-grid {
  display: grid;
  gap: 0.8rem;
}

.dashboard-kpi-card {
  border-radius: 1rem;
  border: 1px solid var(--fcc-border);
  background: color-mix(in srgb, var(--fcc-surface) 96%, var(--fcc-primary-50));
  padding: 0.95rem 1rem;
  display: grid;
  gap: 0.28rem;
}

.dashboard-kpi-card span,
.dashboard-summary-row span,
.dashboard-activity-item p,
.dashboard-attention-card p {
  color: var(--fcc-text-muted);
}

.dashboard-kpi-card strong,
.dashboard-summary-row strong,
.dashboard-attention-card__value {
  font-size: 1.25rem;
  color: var(--fcc-text);
}

.dashboard-panel__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: auto;
}

.dashboard-summary-list,
.dashboard-activity-list,
.dashboard-attention-list {
  display: grid;
  gap: 0.75rem;
}

.dashboard-summary-row,
.dashboard-activity-item {
  border-radius: 1rem;
  border: 1px solid var(--fcc-border);
  padding: 0.9rem 1rem;
  background: color-mix(in srgb, var(--fcc-surface) 97%, transparent);
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.dashboard-attention-card {
  width: 100%;
  text-align: left;
  border-radius: 1rem;
  border: 1px solid var(--fcc-border);
  background: color-mix(in srgb, var(--fcc-surface) 96%, var(--fcc-secondary-50));
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.dashboard-attention-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--fcc-secondary-600) 34%, var(--fcc-border));
  box-shadow: var(--fcc-shadow-soft);
}

.dashboard-attention-card h4,
.dashboard-activity-item h4 {
  margin-top: 0.2rem;
  font-size: 1rem;
}

.dashboard-attention-card__action {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--fcc-primary-800);
}

.dashboard-activity-item__type {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.dashboard-activity-item__meta {
  display: grid;
  justify-items: end;
  gap: 0.45rem;
  font-size: 0.82rem;
}

@media (min-width: 900px) {
  .dashboard-hero {
    grid-template-columns: minmax(0, 1.35fr) minmax(16rem, 0.9fr);
    align-items: start;
  }

  .dashboard-hero__meta,
  .dashboard-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-card--publication,
  .dashboard-card--activity {
    grid-column: span 2;
  }
}

@media (min-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .dashboard-card--publication {
    grid-column: span 8;
  }

  .dashboard-card--pulse {
    grid-column: span 4;
  }

  .dashboard-card--traffic,
  .dashboard-card--paths,
  .dashboard-card--sources,
  .dashboard-card--status {
    grid-column: span 4;
  }

  .dashboard-card--attention {
    grid-column: span 8;
  }

  .dashboard-card--activity {
    grid-column: span 12;
  }
}
</style>
