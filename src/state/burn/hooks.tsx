import { useAppSelector } from 'state/hooks'

import { AppState } from '../types'

export function useBurnState(): AppState['burn'] {
  return useAppSelector((state) => state.burn)
}
