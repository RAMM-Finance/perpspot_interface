import { MarginPositionDetails } from 'types/lmtv2position'

interface LeveragedPositionsContextType {
  positions: MarginPositionDetails[] | undefined
  loading: boolean
  error: unknown // Adjust type as needed
  syncing: boolean
  refetchPositions: () => void
}
