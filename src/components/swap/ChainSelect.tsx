import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { useChainId } from 'wagmi'

const ChainListWrapper = styled.div`
  display: flex;
  padding-left: 1.5rem;
  gap: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 1rem;
`

const ChainListItem = styled(ThemedText.DeprecatedSubHeader)<{ active?: boolean }>`
  border-bottom: ${({ theme, active }) => (active ? `2px solid ${theme.accentActive}` : 'none')};
  color: ${({ theme, active }) => (active ? ` ${theme.textSecondary}` : 'gray')};
  &:hover {
    transform: scale(1.05);
    cursor: pointer;
  }
`

export default function ChainSelect() {
  const currentChainId = useChainId()
  const [active, setActive] = useState(currentChainId)

  const supportedChains = [
    { name: 'Base', chainId: 8453 },
    { name: 'Arbitrum', chainId: 42161 },
  ]

  return (
    <ChainListWrapper>
      {supportedChains.map((chain: any) => (
        // <ChainListItem onClick={() => setActive(chain.chainId)} fontWeight={700} active={chain.chainId === active}>
        <>
          <ChainListItem fontSize={13} fontWeight={700} active={chain.chainId === active}>
            {chain.name}
            {chain.chainId !== active && '(Coming Soon)'}
          </ChainListItem>
        </>
      ))}
    </ChainListWrapper>
  )
}
