import { useEntityCrud } from '@/composables/useEntityCrud'
import { getResourceConfig } from '@/modules/crud/resourceConfigs'
import { defineStore } from 'pinia'

const usersConfig = getResourceConfig('users')

export const useUsersAdminStore = defineStore('usersAdmin', () => {
  const crud = useEntityCrud(usersConfig.adapter)

  return {
    ...crud,
    config: usersConfig,
  }
})
