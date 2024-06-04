import React, { createContext, useContext } from 'react'
import { MarginPositionDetails } from 'types/lmtv2position'

interface LeveragedPositionsContextType {
  positions: MarginPositionDetails[] | undefined
  loading: boolean
  error: unknown // Adjust type as needed
  syncing: boolean
  refetchPositions: () => void
}

const LeveragedPositionsContext = createContext<LeveragedPositionsContextType>({
  positions: undefined,
  loading: false,
  error: undefined,
  syncing: false,
  refetchPositions: () => {}, // Placeholder
})

export const useLeveragedPositions = () => useContext(LeveragedPositionsContext)

interface LeveragedPositionsProviderProps {
  children: React.ReactNode
}
