import { useWeb3React } from '@web3-react/core'
import { useLeveragedLMTPositions } from 'hooks/useLMTV2Positions'
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

export function LeveragedPositionsProvider({ children }: LeveragedPositionsProviderProps) {
  const { account } = useWeb3React()
  const { positions, loading, error, syncing, refetch } = useLeveragedLMTPositions(account)
  return (
    <LeveragedPositionsContext.Provider value={{ positions, loading, error, syncing, refetchPositions: refetch }}>
      {children}
    </LeveragedPositionsContext.Provider>
  )
}
