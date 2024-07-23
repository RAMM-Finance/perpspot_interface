import { SupportedChainId } from 'constants/chains'
import useSelectChain from 'hooks/useSelectChain'
import useSyncChainQuery from 'hooks/useSyncChainQuery'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import { useChainId } from 'wagmi'

import ChainListItem from './ChainListItem'

const ChainListWrapper = styled.div`
  display: flex;
  padding-left: 1.5rem;
  gap: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 1rem;
`

export default function ChainSelect() {
  const chainId = useChainId()

  const selectChain = useSelectChain()
  useSyncChainQuery()

  const [pendingChainId, setPendingChainId] = useState<SupportedChainId | undefined>(undefined)

  const onSelectChain = useCallback(
    async (targetChainId: SupportedChainId) => {
      setPendingChainId(targetChainId)
      await selectChain(targetChainId)
      setPendingChainId(undefined)
    },
    [selectChain]
  )

  const supportedChains = [
    { name: 'Base', chainId: 8453 },
    { name: 'Arbitrum', chainId: 42161 },
  ]

  return (
    <ChainListWrapper>
      {supportedChains.map((chain: any) => (
        <ChainListItem onSelectChain={onSelectChain} targetChain={chain.chainId} name={chain.name} key={chain.name} />
      ))}
    </ChainListWrapper>
  )
}
