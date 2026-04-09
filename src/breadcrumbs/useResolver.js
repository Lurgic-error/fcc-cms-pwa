import { useAssetsStore } from '@/stores/useAssetsStore'
import { useCommissionersStore } from '@/stores/useCommissionersStore'
import { usePhotosStore } from '@/stores/usePhotosStore'
import { useSocialsStore } from '@/stores/useSocialsStore'
import { useSubscribersStore } from '@/stores/useSubscribersStore'
import { useVisitorsStore } from '@/stores/useVisitorsStore'

export function useResolver() {
  const assetsStore = useAssetsStore()
  const commissionersStore = useCommissionersStore()
  const photosStore = usePhotosStore()
  const socialsStore = useSocialsStore()
  const subscribersStore = useSubscribersStore()
  const visitorsStore = useVisitorsStore()

  async function resolveDynamicLabel(type, params) {
    try {
      switch (type) {
        /* ---------- Assets ---------- */
        case 'asset': {
          const asset = await assetsStore.fetchById(params.assetId)
          return asset?.caption || asset?.name || 'Asset'
        }

        case 'photo': {
          const photo = await photosStore.fetchById(params.photoId)
          return photo?.caption || 'Photo'
        }

        /* ---------- Governance ---------- */
        case 'commissioner': {
          const commissioner = await commissionersStore.fetchById(params.commissionerId)
          return commissioner?.fullName || 'Commissioner'
        }

        /* ---------- Social Media ---------- */
        case 'socialAccount': {
          const account = await socialsStore.fetchById(params.socialId)
          return account?.name || account?.username || account?.platform || 'Social Account'
        }

        /* ---------- Subscribers ---------- */
        case 'subscriber': {
          const subscriber = await subscribersStore.fetchById(params.subscriberId)
          return subscriber?.email || 'Subscriber'
        }

        /* ---------- Visitors (optional) ---------- */
        case 'visitor': {
          const visitor = await visitorsStore.fetchById(params.visitorId)
          return visitor?.ipAddress || 'Visitor'
        }

        default:
          return ''
      }
    } catch {
      // Never allow breadcrumb failure to break UI
      return ''
    }
  }

  return {
    resolveDynamicLabel,
  }
}
