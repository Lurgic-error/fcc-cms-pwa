import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResolver } from './useResolver'

export function useBreadcrumbs() {
  const route = useRoute()
  const { resolveDynamicLabel } = useResolver()

  const breadcrumbs = ref([])

  async function build() {
    const crumbs = []

    for (const record of route.matched) {
      const meta = record.meta?.breadcrumb
      if (!meta || meta.hidden) continue

      let label = meta.label
      let i18nKey = meta.i18nKey

      if (meta.dynamic && meta.resolver) {
        try {
          label = await resolveDynamicLabel(meta.resolver, route.params)
        } catch {
          // fallback — never break UI
          label = meta.label ?? '...'
        }
      }

      crumbs.push({
        label,
        i18nKey,
        routeName: record.name,
        params: route.params,
        clickable: meta.clickable !== false,
      })
    }

    breadcrumbs.value = crumbs
  }

  watch(
    () => route.matched,
    () => {
      build()
    },
    { immediate: true },
  )

  return {
    breadcrumbs,
  }
}
