import { computed, ref } from 'vue'

export function useEntityState() {
  const entity = ref({})
  const entities = ref([])

  const hasEntity = computed(() => entity.value && Object.keys(entity.value).length > 0)

  function clearEntity() {
    entity.value = {}
  }

  return {
    entity,
    entities,
    hasEntity,
    clearEntity,
  }
}
