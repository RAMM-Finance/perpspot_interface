import './chart-react-tabs-style.css'

import { Trans } from '@lingui/macro'
import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { AutoRow } from 'components/Row'
import { ArrowCell } from 'components/Tokens/TokenDetails/PriceChart'
import { getDeltaArrow } from 'components/Tokens/TokenDetails/PriceChart'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { ReactNode } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { textFadeIn } from 'theme/styles'
import { formatDollar } from 'utils/formatNumbers'

const UNSUPPORTED_METADATA_CHAINS = [SupportedChainId.BNB]

// import { UNSUPPORTED_METADATA_CHAINS } from '../constants'

type NumericStat = number | undefined | null

function Stat({
  dataCy,
  value,
  title,
  description,
  baseQuoteSymbol,
  dollar,
}: {
  dataCy: string
  value: NumericStat
  title: ReactNode
  description?: ReactNode
  baseQuoteSymbol?: string
  dollar?: boolean
}) {
  let _value = value ? formatNumber(value, NumberType.FiatTokenPrice).replace(/\$/g, '') : '-'
  if (value && baseQuoteSymbol) {
    _value = `${_value} ${baseQuoteSymbol}`
  }
  if (dollar) {
    return (
      <StatWrapper data-cy={`${dataCy}`}>
        <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
        <StatPrice>
          <ThemedText.BodySmall color="textSecondary">
            {formatDollar({ num: Number(value), digits: 0 })} {baseQuoteSymbol}
          </ThemedText.BodySmall>
        </StatPrice>
      </StatWrapper>
    )
  } else {
    return (
      <StatWrapper data-cy={`${dataCy}`}>
        <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
        <StatPrice>
          <ThemedText.BodySmall color="textSecondary">{_value}</ThemedText.BodySmall>
        </StatPrice>
      </StatWrapper>
    )
  }
}

type StatsSectionProps = {
  chainId: SupportedChainId
  address: string
  // inversePrice: boolean
  token0Symbol?: string
  token1Symbol?: string
  stats?: {
    price: number
    delta: number
    high24h: number
    low24h: number
    token1Reserve: number
    token0Reserve: number
    tvl: number | undefined
    volume: number | undefined
  }
  // priceHigh24H?: NumericStat
  // priceLow24H?: NumericStat
  // delta?: NumericStat
  // price?: NumericStat
  // token0Reserve?: number,
  // token1Reserve?: number
}
export default function StatsSection(props: StatsSectionProps) {
  const { chainId, address, stats, token0Symbol, token1Symbol } = props
  const { label, infoLink } = getChainInfo(chainId) ? getChainInfo(chainId) : { label: null, infoLink: null }

  const arrow = getDeltaArrow(stats?.delta, 18)

  const baseQuoteSymbol =
    Number(stats?.token0Reserve) > Number(stats?.token1Reserve)
      ? `${token1Symbol} / ${token0Symbol}`
      : `${token0Symbol} / ${token1Symbol}`

  return (
    <StatsWrapper data-testid="token-details-stats">
      <Stat
        dataCy="current-price"
        value={stats?.price}
        baseQuoteSymbol={baseQuoteSymbol}
        title={
          <ThemedText.BodySmall>
            <Trans>Oracle Price</Trans>
          </ThemedText.BodySmall>
        }
      />
      <StatWrapper data-cy="delta-24h">
        <ThemedText.BodySmall>
          <Trans>24h Change</Trans>
        </ThemedText.BodySmall>
        <StatPrice>
          <AutoRow>
            <ArrowCell>{arrow}</ArrowCell>
            <DeltaText delta={Number(stats?.delta)}>
              {stats?.delta ? formatNumber(stats.delta, NumberType.SwapTradeAmount) : '-'}%
            </DeltaText>
          </AutoRow>
        </StatPrice>
      </StatWrapper>
      <Stat
        dataCy="24h-low"
        value={stats?.low24h}
        baseQuoteSymbol={baseQuoteSymbol}
        title={
          <ThemedText.BodySmall>
            <Trans>24h low</Trans>
          </ThemedText.BodySmall>
        }
      />
      <Stat
        dataCy="24h-high"
        value={stats?.high24h}
        baseQuoteSymbol={baseQuoteSymbol}
        title={
          <ThemedText.BodySmall>
            <Trans>24h high</Trans>
          </ThemedText.BodySmall>
        }
      />
      <Stat
        dataCy="liq-below"
        value={stats?.tvl}
        baseQuoteSymbol={baseQuoteSymbol}
        dollar={true}
        title={
          <ThemedText.BodySmall>
            <Trans>TVL</Trans>
          </ThemedText.BodySmall>
        }
      />
      <Stat
        dataCy="liq-above"
        value={stats?.volume}
        baseQuoteSymbol={baseQuoteSymbol}
        title={
          <ThemedText.BodySmall>
            <Trans>Volume</Trans>
          </ThemedText.BodySmall>
        }
      />
    </StatsWrapper>
  )
}

const StatWrapper = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  padding: 0 1rem;
  width: 100%;
  font-weight: 900;
  border-rounded: 10px;
  margin-top: 0.3rem;
  margin-bottom: 0.3rem;
  border-left: 1px solid ${({ theme }) => theme.backgroundOutline};
`

const TokenStatsSection = styled.div`
  display: flex;
  /* flex-wrap: wrap; */
`
const StatPair = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
`

const Header = styled(ThemedText.MediumHeader)`
  font-size: 28px !important;
`

const StatPrice = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.textPrimary};
`
const NoData = styled.div`
  color: ${({ theme }) => theme.textTertiary};
`
const StatsWrapper = styled.div`
  /* display: flex;
  gap: 16px; */
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: left;
  width: 100%;
  ${textFadeIn}
`
