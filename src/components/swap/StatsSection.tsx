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
import { Tab, TabList, Tabs } from 'react-tabs'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { textFadeIn } from 'theme/styles'

const UNSUPPORTED_METADATA_CHAINS = [SupportedChainId.BNB]

// import { UNSUPPORTED_METADATA_CHAINS } from '../constants'

type NumericStat = number | undefined | null

function Stat({
  dataCy,
  value,
  title,
  description,
  baseQuoteSymbol,
}: {
  dataCy: string
  value: NumericStat
  title: ReactNode
  description?: ReactNode
  baseQuoteSymbol?: string
}) {
  let _value = value ? formatNumber(value, NumberType.FiatTokenPrice).replace(/\$/g, '') : '-'
  if (value && baseQuoteSymbol) {
    _value = `${_value} ${baseQuoteSymbol}`
  }
  return (
    <StatWrapper data-cy={`${dataCy}`}>
      <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
      <StatPrice>{_value}</StatPrice>
    </StatWrapper>
  )
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
        title={<Trans>Oracle Price</Trans>}
      />
      <StatWrapper data-cy="delta-24h">
        <Trans>24h Change</Trans>
        <StatPrice>
          <AutoRow>
            <ArrowCell>{arrow}</ArrowCell>
            <DeltaText delta={Number(stats?.delta)}>
              {stats?.delta ? formatNumber(stats.delta, NumberType.SwapTradeAmount) : '-'}%
            </DeltaText>
          </AutoRow>
        </StatPrice>
      </StatWrapper>
      <Stat dataCy="24h-low" value={stats?.low24h} baseQuoteSymbol={baseQuoteSymbol} title={<Trans>24h low</Trans>} />
      <Stat
        dataCy="24h-high"
        value={stats?.high24h}
        baseQuoteSymbol={baseQuoteSymbol}
        title={<Trans>24h high</Trans>}
      />
      <Stat
        dataCy="liq-below"
        value={stats?.token1Reserve}
        baseQuoteSymbol={token1Symbol}
        title={<Trans>Liquidity Below</Trans>}
      />
      <Stat
        dataCy="liq-above"
        value={stats?.token0Reserve}
        baseQuoteSymbol={token0Symbol}
        title={<Trans>Liquidity Above</Trans>}
      />
      <ChartButtons>
        <Tabs>
          <TabList>
            <Tab>
              <Trans>TVL</Trans>
            </Tab>
            <Tab>
              <Trans>Price</Trans>
            </Tab>
          </TabList>
        </Tabs>
      </ChartButtons>
    </StatsWrapper>
  )
}

const StatWrapper = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 12px;
  padding: 0 0.5rem;
  width: max-content;
  font-weight: 900;

  border-left: 2px solid ${({ theme }) => theme.backgroundOutline};
`
const ChartButtons = styled.div`
  display: flex;
  padding: 0 0.5rem;
  gap: 0.25vw;
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
  gap: 3vw;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: left;
  width: 100%;
  ${textFadeIn}
`
