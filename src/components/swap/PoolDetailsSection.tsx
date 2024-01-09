import { computePoolAddress, Pool } from '@uniswap/v3-sdk'
import { PoolDataChart, PoolDataChartLoading } from 'components/ExchangeChart/PoolDataChart'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { getFakeSymbol, isFakePair } from 'constants/fake-tokens'
import { useBulkBinData } from 'hooks/useLMTV2Positions'
import { useLatestPoolPriceData } from 'hooks/usePoolPriceData'
import { PoolState } from 'hooks/usePools'
import { useMemo } from 'react'
import styled from 'styled-components/macro'

import LiquidityDistributionTable, { LiquidityDistributionLoading } from './LiquidityDistributionTable'

const MiddleContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
  align-content: center;
`

const LiquidityDistibutionWrapper = styled.div`
  border: solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  border-radius: 10px;
  width: 350px;
  padding: 1rem;
  height: 550px;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
`

function getSymbol(
  pool: Pool | undefined,
  chainId: number | undefined,
  invertPrice: boolean | undefined
): string | undefined {
  if (!pool || !chainId || invertPrice === undefined) return undefined
  // const invertPrice = new BN(pool.token0Price.toFixed(18)).lt(1)

  const baseSymbol = invertPrice ? pool.token1.symbol : pool.token0.symbol
  const quoteSymbol = invertPrice ? pool.token0.symbol : pool.token1.symbol
  if (isFakePair(chainId, pool.token0.address.toLowerCase(), pool.token1.address.toLowerCase())) {
    return getFakeSymbol(chainId, pool.token0.address.toLowerCase(), pool.token1.address.toLowerCase())
  }
  return JSON.stringify({
    poolAddress: computePoolAddress({
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
      tokenA: pool.token0,
      tokenB: pool.token1,
      fee: pool.fee,
    }),
    baseSymbol,
    quoteSymbol,
    invertPrice,
  })
}
export function PoolDetailsSection({
  pool,
  poolState,
  chainId,
}: {
  pool?: Pool
  poolState?: PoolState
  chainId?: number
}) {
  const poolAddress = useMemo(() => {
    if (!pool || !chainId) return undefined
    return computePoolAddress({
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
      tokenA: pool.token0,
      tokenB: pool.token1,
      fee: pool.fee,
    })
  }, [pool, chainId])

  // console.log('poolContract', useSingleCallResult(poolContract, 'slot0')?.result)
  const { data: priceData } = useLatestPoolPriceData(poolAddress, chainId)
  const invertPrice = useMemo(() => {
    if (!priceData) return undefined
    console.log('priceData', priceData.priceNow.toString())
    return priceData.priceNow.lt(1)
  }, [priceData])
  const symbol = useMemo(() => getSymbol(pool, chainId, invertPrice), [pool, invertPrice, chainId])
  const token0 = pool?.token0
  const token1 = pool?.token1
  const currentPrice = Number(pool?.sqrtRatioX96) ** 2 / 2 ** 192
  const { result: binData } = useBulkBinData(pool?.token0?.address, pool?.token1?.address, pool?.fee, pool?.tickCurrent)
  if (!pool || !chainId) return <PoolDetailsSkeleton />
  return (
    <MiddleContainer>
      {symbol && chainId && <PoolDataChart symbol={symbol} chainId={chainId} />}
      <LiquidityDistibutionWrapper>
        <LiquidityDistributionTable token0={token0} token1={token1} currentPrice={currentPrice} bin={binData} />
      </LiquidityDistibutionWrapper>
    </MiddleContainer>
  )
}

function PoolDetailsSkeleton() {
  return (
    <MiddleContainer>
      <PoolDataChartLoading />
      <LiquidityDistibutionWrapper>
        <LiquidityDistributionLoading />
      </LiquidityDistibutionWrapper>
    </MiddleContainer>
  )
}
