import { Trans } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { POOL_INIT_CODE_HASH } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { AutoRow } from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import { ArrowCell, DeltaText, getDeltaArrow } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { getInvertPrice, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { defaultAbiCoder, getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils'
import { useCurrency } from 'hooks/Tokens'
import { useTokenContract } from 'hooks/useContract'
import { useLatestPoolPriceData } from 'hooks/usePoolPriceData'
import { usePool } from 'hooks/usePools'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { ReactNode, useMemo } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { textFadeIn } from 'theme/styles'
import { formatDollar } from 'utils/formatNumbers'

export const StatsWrapper = styled.div`
  gap: 16px;
  ${textFadeIn}
  display: flex;
  flex-direction: row;
  width: 100%;
`

export function PoolStatsSection({
  chainId,
  inputAddress,
  outputAddress,
  fee,
  poolData,
}: {
  chainId?: number
  inputAddress?: string
  outputAddress?: string
  fee?: number
  poolData: any
}) {
  const [address0, address1] = useMemo(() => {
    if (!inputAddress || !outputAddress) return [undefined, undefined]

    const inputIs0 = inputAddress.toLowerCase() < outputAddress.toLowerCase()

    if (inputIs0) {
      return [inputAddress, outputAddress]
    } else {
      return [outputAddress, inputAddress]
    }
  }, [inputAddress, outputAddress])

  const currency0 = useCurrency(address0)
  const currency1 = useCurrency(address1)

  const poolAddress = useMemo(() => {
    if (!address0 || !address1 || !fee || !chainId) return null
    // if (isFakePair(chainId, pool.token0.address.toLowerCase(), pool.token1.address.toLowerCase())) {
    //   return getFakePool(chainId, pool.token0.address.toLowerCase(), pool.token1.address.toLowerCase())
    // }
    return getAddress(address0, address1, fee, chainId)
  }, [chainId, address0, address1, fee])

  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, fee)

  const { data: priceData } = useLatestPoolPriceData(poolAddress ?? undefined)

  const contract0 = useTokenContract(address0)
  const contract1 = useTokenContract(address1)

  const { result: reserve0, loading: loading0 } = useSingleCallResult(contract0, 'balanceOf', [
    poolAddress ?? undefined,
  ])
  const { result: reserve1, loading: loading1 } = useSingleCallResult(contract1, 'balanceOf', [
    poolAddress ?? undefined,
  ])

  // const token0Decimals = currency0?.decimals
  // const token1Decimals = currency1?.decimals
  // const { provider } = useWeb3React()
  // const { data: token0Price } = useQuery(
  //   ['currentPrice', poolAddress, token0Decimals, token1Decimals],
  //   async () => {
  //     if (!poolAddress) throw new Error('No pool address')
  //     if (!token1Decimals) throw new Error('No token1 decimals')
  //     if (!token0Decimals) throw new Error('No token0 decimals')
  //     if (!provider) throw new Error('No provider')
  //     try {
  //       return await getToken0Price(poolAddress, token0Decimals, token1Decimals, provider)
  //     } catch (err) {
  //       console.log('token0Price err', err)
  //       throw new Error('Failed to fetch token0 price')
  //     }
  //   },
  //   {
  //     keepPreviousData: true,
  //     refetchInterval: 1000 * 20,
  //   }
  // )

  const [currentPrice, invertPrice, low24h, high24h, delta24h, volume, tvl] = useMemo(() => {
    if (!pool || !poolData || !priceData) return [null, false, null, null, null, null, null]

    let tvl
    let volume
    if (Object.keys(poolData).find((pair: any) => `${pool?.token0?.address}-${pool?.token1?.address}-${pool?.fee}`)) {
      {
        tvl = new BN(poolData[`${pool?.token0?.address}-${pool.token1?.address}-${pool?.fee}`]?.totalValueLocked)
        volume = new BN(poolData[`${pool?.token0?.address}-${pool.token1?.address}-${pool?.fee}`]?.volume)
      }
    }

    const invertPrice = getInvertPrice(pool.token0.address, pool.token1.address, chainId)
    const token0Price = new BN(pool.token0Price.toFixed(18))
    const price = invertPrice ? new BN(1).div(token0Price) : token0Price

    // const price24hAgo = priceData.price24hAgo
    const delta = price.minus(priceData.price24hAgo).div(price).times(100)
    const price24hHigh = priceData.high24
    const price24hLow = priceData.low24
    // console.log('price stuff', delta.toString(), price.toString(), priceData.price24hAgo.toString())
    return [price, invertPrice, price24hLow, price24hHigh, delta, volume, tvl, pool, token0Price]
  }, [pool, priceData, poolData, chainId])

  const baseQuoteSymbol = invertPrice
    ? currency1?.symbol + '/' + currency0?.symbol
    : currency0?.symbol + '/' + currency1?.symbol

  const loading = loading0 || loading1 || !priceData || !reserve0 || !reserve1 || !priceData || !pool

  return (
    <StatsWrapper>
      <Stat
        dataCy="current-price"
        value={currentPrice}
        baseQuoteSymbol={baseQuoteSymbol}
        title={
          <ThemedText.BodySmall>
            <Trans>Price</Trans>
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
            <Trans>24h Change (Δ)</Trans>
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
        loading={false}
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
        loading={false}
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

type NumericStat = BN | undefined | null

const StatPrice = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.textPrimary};
`

export function Stat({
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
          <LoadingBubble height="18px" />
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

export function getAddress(address0: string, address1: string, fee: number, chainId: number): string {
  return getCreate2Address(
    V3_CORE_FACTORY_ADDRESSES[chainId],
    solidityKeccak256(['bytes'], [defaultAbiCoder.encode(['address', 'address', 'uint24'], [address0, address1, fee])]),
    POOL_INIT_CODE_HASH
  )
}
