import { getChainInfo } from 'constants/chainInfo'
import React from 'react'
import { Copy } from 'react-feather'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { useChainId } from 'wagmi'

const TokenInfoWrapper = styled.div`
  width: 100%;
  height: 150px;
  border-radius: 10px;
  padding: 10px;
  border: ${({ theme }) => `1px solid ${theme.backgroundOutline}`};
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const Header = styled.div`
  margin-left: 5px;
  margin-top: 5px;
  margin-bottom: 5px;
`
const ItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const CopyWrapper = styled.div`
  &:hover {
    cursor: pointer;
  }
`

const TokenInfo = () => {
  const chainId = useChainId()
  const info = getChainInfo(chainId)

  return (
    <TokenInfoWrapper>
      <Header>
        <ThemedText.DeprecatedSubHeader fontWeight={700} fontSize={14}>
          Overview
        </ThemedText.DeprecatedSubHeader>
      </Header>
      <ItemWrapper>
        <ThemedText.BodySmall fontWeight={500}>Network:</ThemedText.BodySmall>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '3px', alignItems: 'center' }}>
          <ThemedText.BodySmall fontWeight={700} color={'textSecondary'}>
            Base
          </ThemedText.BodySmall>
          {info && <img width={15} height={15} src={info.logoUrl} alt={info.label} data-testid="chain-logo" />}
        </div>
      </ItemWrapper>
      <ItemWrapper>
        <ThemedText.BodySmall fontWeight={500}>Address</ThemedText.BodySmall>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '3px', alignItems: 'center' }}>
          <ThemedText.BodySmall fontWeight={500} color={'textSecondary'}>
            0x2343rrfaFJDF2134132923
          </ThemedText.BodySmall>
          <CopyWrapper>
            <Copy size={15} />
          </CopyWrapper>
        </div>
      </ItemWrapper>
      <ItemWrapper>
        <ThemedText.BodySmall fontWeight={500}>Holders</ThemedText.BodySmall>
        <ThemedText.BodySmall fontWeight={700} color={'textSecondary'}>
          13.2K
        </ThemedText.BodySmall>
      </ItemWrapper>
      <ItemWrapper>
        <ThemedText.BodySmall fontWeight={500}>Supply</ThemedText.BodySmall>
        <ThemedText.BodySmall fontWeight={700} color={'textSecondary'}>
          133,312,953
        </ThemedText.BodySmall>
      </ItemWrapper>
    </TokenInfoWrapper>
  )
}

export default TokenInfo
