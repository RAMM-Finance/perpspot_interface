import { formatDateTime } from 'components/ExchangeChart/dateFormatters'
import { LoadingBubble } from 'components/Tokens/loading'
import { CopyText } from 'components/WalletDropdown/AuthenticatedHeader'
import { getChainInfo } from 'constants/chainInfo'
import { useGetPairDetails } from 'hooks/useGetPairDetails'
import { shortenAddress } from 'nft/utils/address'
import React, { ReactNode } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formatDollar } from 'utils/formatNumbers'
import { useChainId } from 'wagmi'

const TokenInfoWrapper = styled.div`
  width: 100%;
  height: fit-content;
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

const TokenInfo = ({ poolAddress }: { poolAddress?: string }) => {
  const chainId = useChainId()
  const info = getChainInfo(chainId)

  const { pairData, loading, error } = useGetPairDetails(poolAddress ?? undefined)

  return (
    <TokenInfoWrapper>
      <Header>
        <ThemedText.DeprecatedSubHeader fontWeight={700} fontSize={14}>
          Overview
        </ThemedText.DeprecatedSubHeader>
      </Header>
      <Stat
        loading={!pairData?.network}
        title={'Network:'}
        info={
          <div style={{ display: 'flex', flexDirection: 'row', gap: '3px', alignItems: 'center' }}>
            <ThemedText.BodySmall fontWeight={700} color={'textSecondary'}>
              {pairData?.network}
            </ThemedText.BodySmall>
            {info && <img width={15} height={15} src={info.logoUrl} alt={info.label} data-testid="chain-logo" />}
          </div>
        }
      />
      <Stat
        loading={!pairData?.poolAddress}
        title={'Address:'}
        info={
          <CopyText toCopy={pairData?.poolAddress}>
            <ThemedText.BodySmall fontWeight={500} color={'textSecondary'}>
              {shortenAddress(pairData?.poolAddress, 10, 4)}
            </ThemedText.BodySmall>
          </CopyText>
        }
      />
      <Stat
        loading={!pairData?.volume24}
        title={'24h Volume:'}
        info={
          <ThemedText.BodySmall fontWeight={700} color={'textSecondary'}>
            {formatDollar({ num: pairData?.volume24, dollarSign: false })}
          </ThemedText.BodySmall>
        }
      />
      <Stat
        loading={!pairData?.liquidity}
        title={'Liquidity:'}
        info={
          <ThemedText.BodySmall fontWeight={700} color={'textSecondary'}>
            {formatDollar({ num: pairData?.liquidity })}
          </ThemedText.BodySmall>
        }
      />
      <Stat
        loading={!pairData?.fdv}
        title={'FDV:'}
        info={
          <ThemedText.BodySmall fontWeight={700} color={'textSecondary'}>
            {formatDollar({ num: pairData?.fdv })}
          </ThemedText.BodySmall>
        }
      />
      <Stat
        loading={!pairData?.creationTime}
        title={'Creation Date:'}
        info={
          <ThemedText.BodySmall fontWeight={700} color={'textSecondary'}>
            {pairData?.creationTime && formatDateTime(pairData.creationTime / 1000)}
          </ThemedText.BodySmall>
        }
      />
    </TokenInfoWrapper>
  )
}

function Stat({ loading, title, info }: { loading: boolean; title: string; info: ReactNode }) {
  return (
    <ItemWrapper>
      <ThemedText.BodySmall fontWeight={500}>{title}</ThemedText.BodySmall>
      {!loading ? (
        info
      ) : (
        <>
          <LoadingBubble height="16px" />{' '}
        </>
      )}
    </ItemWrapper>
  )
}

export default React.memo(TokenInfo)
