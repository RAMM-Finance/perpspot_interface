import { SupportedChainId } from 'constants/chains'
import React from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { useChainId } from 'wagmi'

const ChainItem = styled(ThemedText.DeprecatedSubHeader)<{ active?: boolean }>`
  border-bottom: ${({ theme, active }) => (active ? `2px solid ${theme.accentActive}` : 'none')};
  color: ${({ theme, active }) => (active ? ` ${theme.textSecondary}` : 'gray')};
  &:hover {
    transform: scale(1.05);
    cursor: pointer;
  }
`
interface ChainSelectorRowProps {
  targetChain: SupportedChainId
  onSelectChain: (targetChain: number) => void
  name: string
}

const ChainListItem = ({ targetChain, onSelectChain, name }: ChainSelectorRowProps) => {
  const chainId = useChainId()
  const active = chainId === targetChain

  return (
    <ChainItem onClick={() => onSelectChain(targetChain)} fontSize={13} fontWeight={700} active={active}>
      {name}
    </ChainItem>
  )
}

export default ChainListItem
