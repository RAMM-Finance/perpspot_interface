import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { computePoolAddress, Pool } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { AutoRow } from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import { ArrowCell, DeltaText, getDeltaArrow } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { getFakePool, isFakePair } from 'constants/fake-tokens'
import { useTokenContract } from 'hooks/useContract'
import { usePoolsData } from 'hooks/useLMTPools'
import { useLatestPoolPriceData } from 'hooks/usePoolPriceData'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ReactNode, useMemo } from 'react'
import styled from 'styled-components'
import { ThemedText } from 'theme'
import { textFadeIn } from 'theme/styles'
import { formatDollar } from 'utils/formatNumbers'

const StatsWrapper = styled.div`
  gap: 16px;
  ${textFadeIn}
  display: flex;
  flex-direction: row;
  width: 100%;
`

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

type NumericStat = BN | undefined | null

const StatPrice = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.textPrimary};
`

function Stat({
  dataCy,
  value,
  title,
  description,
  baseQuoteSymbol,
  dollar,
  loading,
  delta = false,
}: {
  dataCy: string
  value: NumericStat
  title: ReactNode
  description?: ReactNode
  baseQuoteSymbol?: string
  dollar?: boolean
  loading: boolean
  delta?: boolean
}) {
  let _value = formatBNToString(value ?? undefined, NumberType.FiatTokenPrice, true)
  const arrow = getDeltaArrow(value?.toNumber(), 18)
  if (value && baseQuoteSymbol) {
    _value = `${_value} ${baseQuoteSymbol}`
  }
  if (loading) {
    return (
      <StatWrapper data-cy={`${dataCy}`}>
        <MouseoverTooltip text={description}>{title}</MouseoverTooltip>
        <StatPrice>
          <LoadingBubble />
        </StatPrice>
      </StatWrapper>
    )
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
        {delta ? (
          <StatPrice>
            <AutoRow>
              <ArrowCell>{arrow}</ArrowCell>
              <DeltaText delta={value?.toNumber()}>
                {formatBNToString(value?.abs() ?? undefined, NumberType.TokenNonTx)}%
              </DeltaText>
            </AutoRow>
          </StatPrice>
        ) : (
          <StatPrice>
            <ThemedText.BodySmall color="textSecondary">{_value}</ThemedText.BodySmall>
          </StatPrice>
        )}
      </StatWrapper>
    )
  }
}

export function PoolStatsSection({ chainId, pool }: { chainId?: number; pool?: Pool }) {
  const poolAddress = useMemo(() => {
    if (!pool || !chainId) return null
    if (isFakePair(chainId, pool.token0.address.toLowerCase(), pool.token1.address.toLowerCase())) {
      return getFakePool(chainId, pool.token0.address.toLowerCase(), pool.token1.address.toLowerCase())
    }
    return computePoolAddress({
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
      tokenA: pool.token0,
      tokenB: pool.token1,
      fee: pool.fee,
    })
  }, [chainId, pool])

  const { data: priceData, loading: priceLoading } = useLatestPoolPriceData(poolAddress, chainId)
  const poolData = usePoolsData()
  const contract0 = useTokenContract(pool?.token0?.address)
  const contract1 = useTokenContract(pool?.token1?.address)
  const { result: reserve0, loading: loading0 } = useSingleCallResult(contract0, 'balanceOf', [poolAddress ?? ''])
  const { result: reserve1, loading: loading1 } = useSingleCallResult(contract1, 'balanceOf', [poolAddress ?? ''])
  const [currentPrice, invertPrice, low24h, high24h, delta24h, volume, tvl] = useMemo(() => {
    if (!priceData || !pool || !poolData) return [null, false, null, null, null, null, null]

    let tvl
    let volume
    if (Object.keys(poolData).find((pair: any) => `${pool.token0?.address}-${pool.token1?.address}-${pool?.fee}`)) {
      {
        tvl = new BN(poolData[`${pool.token0?.address}-${pool.token1?.address}-${pool?.fee}`]?.totalValueLocked)
        volume = new BN(poolData[`${pool.token0?.address}-${pool.token1?.address}-${pool?.fee}`]?.volume)
      }
    }

    let price = priceData.priceNow
    const invertPrice = price.lt(1)
    let delta
    let price24hHigh
    let price24hLow
    let price24hAgo
    if (invertPrice) {
      price = new BN(1).div(price)
      price24hAgo = new BN(1).div(priceData.price24hAgo)
      delta = price.minus(price24hAgo).div(price).times(100)
      price24hHigh = new BN(1).div(priceData.low24)
      price24hLow = new BN(1).div(priceData.high24)
    } else {
      delta = price.minus(priceData.price24hAgo).div(price).times(100)
      price24hHigh = priceData.high24
      price24hLow = priceData.low24
    }
    return [price, invertPrice, price24hLow, price24hHigh, delta, volume, tvl, pool]
  }, [pool, priceData, poolData])

  const baseQuoteSymbol = invertPrice
    ? pool?.token0.symbol + '/' + pool?.token1.symbol
    : pool?.token1.symbol + '/' + pool?.token0.symbol

  const loading = loading0 || loading1 || priceLoading || !reserve0 || !reserve1 || !priceData || !pool

  return (
    <StatsWrapper>
      <Stat
        dataCy="current-price"
        value={currentPrice}
        baseQuoteSymbol={baseQuoteSymbol}
        title={
          <ThemedText.BodySmall>
            <Trans>Oracle Price</Trans>
          </ThemedText.BodySmall>
        }
        loading={loading}
      />
      <Stat
        dataCy="delta-24h"
        value={delta24h}
        delta={true}
        title={
          <ThemedText.BodySmall>
            <Trans>24h Change</Trans>
          </ThemedText.BodySmall>
        }
        loading={loading}
      />
      <Stat
        dataCy="24h-low"
        value={low24h}
        baseQuoteSymbol={baseQuoteSymbol}
        title={
          <ThemedText.BodySmall>
            <Trans>24h low</Trans>
          </ThemedText.BodySmall>
        }
        loading={loading}
      />
      <Stat
        dataCy="24h-high"
        value={high24h}
        baseQuoteSymbol={baseQuoteSymbol}
        title={
          <ThemedText.BodySmall>
            <Trans>24h high</Trans>
          </ThemedText.BodySmall>
        }
        loading={loading}
      />
      <Stat
        dataCy="liq-below"
        value={tvl}
        dollar={true}
        title={
          <ThemedText.BodySmall>
            <Trans>TVL</Trans>
          </ThemedText.BodySmall>
        }
        loading={loading}
      />
      <Stat
        dataCy="liq-above"
        value={volume}
        dollar={true}
        title={
          <ThemedText.BodySmall>
            <Trans>Total Volume</Trans>
          </ThemedText.BodySmall>
        }
        loading={loading}
      />
    </StatsWrapper>
  )
}
