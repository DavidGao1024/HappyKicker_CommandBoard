import { ref } from 'vue'
import { FORMATIONS } from '@/types/formation'

const homeFormation = ref(FORMATIONS[0].name)
const awayFormation = ref(FORMATIONS[0].name)

export function useFormations() {
  return {
    formations: FORMATIONS,
    homeFormation,
    awayFormation,
  }
}
