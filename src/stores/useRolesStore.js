import { getResourceConfig } from '@/modules/crud/resourceConfigs'
import { defineStore } from 'pinia'
import { useEntityCrud } from '@/composables/useEntityCrud'

const rolesConfig = getResourceConfig('roles')

export const useRolesStore = defineStore('roles', () => {
  const crud = useEntityCrud(rolesConfig.adapter)

  return {
    ...crud,
    config: rolesConfig,
  }
})
