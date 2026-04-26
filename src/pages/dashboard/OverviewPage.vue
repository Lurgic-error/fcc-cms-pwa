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
import EnterprisePageHeader from '@/components/common/EnterprisePageHeader.vue'
import PageWrapper from '@/components/common/PageWrapper.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import WorkspacePanel from '@/components/common/WorkspacePanel.vue'
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
const headerActions = Object.freeze([
  { key: 'refresh', label: 'Refresh overview' },
  { key: 'analytics', label: 'Open analytics' },
])

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

async function onHeaderAction(action) {
  if (action?.key === 'refresh') {
    await loadOverview()
    return
  }

  if (action?.key === 'analytics') {
    open({ name: 'dashboard.analytics' })
  }
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
  <PageWrapper>
    <template #header>
      <EnterprisePageHeader
        eyebrow="Editorial Control Center"
        title="Dashboard"
        description="A calm overview of what is ready for the website, what still needs attention, and where your editorial team should work next."
        :actions="headerActions"
        :loading="loading"
        :show-back="false"
        @select="onHeaderAction"
      />
    </template>

    <div class="dashboard-shell">
      <el-alert v-if="loadError" type="warning" show-icon :closable="false" :title="loadError" />

      <WorkspacePanel class="dashboard-hero" eyebrow="Editorial control center">
        <template #title>
          <h2 class="dashboard-hero__title">Welcome back, {{ userName }}</h2>
        </template>
        <template #description>
          <p class="dashboard-hero__description">
            Use this view to monitor the website, the CMS, and the publication workflow without
            digging through technical screens. Your current role is {{ roleName }}.
          </p>
        </template>
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
      </WorkspacePanel>

      <OverviewStatsGrid :stats="headlineStats" />

      <div class="dashboard-grid">
        <WorkspacePanel
          tag="article"
          class="dashboard-card dashboard-panel dashboard-card--publication"
          eyebrow="Publication workspace"
          title="Categories and publications are moving together"
          heading-level="h3"
        >
          <template #aside>
            <div class="dashboard-panel__badges">
              <StatusBadge value="published" :label="`${categorySummary.live} live categories`" />
              <StatusBadge
                value="approved"
                :label="`${publicationSummary.published} public publications`"
              />
            </div>
          </template>

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
        </WorkspacePanel>

        <WorkspacePanel
          tag="article"
          class="dashboard-card dashboard-panel dashboard-card--pulse"
          eyebrow="Website pulse"
          title="Content mix on hand"
          heading-level="h3"
        >
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
        </WorkspacePanel>

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

        <WorkspacePanel
          tag="article"
          class="dashboard-card dashboard-panel dashboard-card--attention"
          eyebrow="Needs attention"
          title="What to work on next"
          heading-level="h3"
        >
          <div class="dashboard-attention-list">
            <el-button
              v-for="item in attentionItems"
              :key="item.title"
              text
              class="dashboard-attention-card"
              @click="open(item.route)"
            >
              <div>
                <p class="dashboard-attention-card__value">{{ formatNumber(item.value) }}</p>
                <h4>{{ item.title }}</h4>
                <p>{{ item.helper }}</p>
              </div>
              <span class="dashboard-attention-card__action">{{ item.action }}</span>
            </el-button>
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          tag="article"
          class="dashboard-card dashboard-panel dashboard-card--activity"
          eyebrow="Recent activity"
          title="Recently updated records"
          heading-level="h3"
        >
          <template #aside>
            <el-button plain :loading="loading" @click="loadOverview">Refresh overview</el-button>
          </template>

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
        </WorkspacePanel>
      </div>
    </div>
  </PageWrapper>
</template>
