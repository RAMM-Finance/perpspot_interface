import { computePoolAddress, Pool } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { PoolDataChart, PoolDataChartLoading } from 'components/ExchangeChart/PoolDataChart'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { getFakeSymbol, isFakePair } from 'constants/fake-tokens'
import { useBulkBinData } from 'hooks/useLMTV2Positions'
import { PoolState } from 'hooks/usePools'
import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { MarginLimitOrder, MarginPositionDetails } from 'types/lmtv2position'

import LiquidityDistributionTable, { LiquidityDistributionLoading } from './LiquidityDistributionTable'
import PoolSelect from './PoolSelect'
import { PostionsContainer } from './PostionsContainer'

const Container = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
  align-content: center;
  margin-left: 0.25rem;
  height: 100%;
`
const MiddleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 0.25rem;
  width: 400px;
  height: 100%;
`

const LiquidityDistibutionWrapper = styled.div`
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  border-radius: 10px;
  width: 97%;
  padding: 1rem;
  height: 100%;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
`

const PositionsWrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: solid 1px ${({ theme }) => theme.backgroundOutline};
  margin-bottom: 0.5rem;
  min-height: 150px;
  height: 100%;
  border-radius: 10px;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  overflow-x: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
`

function getSymbol(pool: Pool | undefined, chainId: number | undefined): string | undefined {
  if (!pool || !chainId) return undefined
  const invertPrice = new BN(pool.token0Price.toFixed(18)).lt(1)

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
  })
}

export function PoolDetailsSection({
  pool,
  poolState,
  chainId,
  account,
  orders,
  loadingOrders,
  positions,
  loadingPositions,
}: {
  pool?: Pool
  poolState?: PoolState
  chainId?: number
  account?: string
  orders?: MarginLimitOrder[]
  loadingOrders?: boolean
  positions?: MarginPositionDetails[]
  loadingPositions?: boolean
}) {
  // console.log('poolContract', useSingleCallResult(poolContract, 'slot0')?.result)
  const symbol = useMemo(() => getSymbol(pool, chainId), [pool, chainId])
  const token0 = pool?.token0
  const token1 = pool?.token1
  const currentPrice = Number(pool?.sqrtRatioX96) ** 2 / 2 ** 192
  const { result: binData } = useBulkBinData(pool)
  // const binData = undefined

  function PoolDetailsSkeleton() {
    return (
      <Container>
        <MiddleContainer>
          <PoolDataChartLoading />
        </MiddleContainer>
        <RightContainer>
          <PoolSelect detailsLoading={true} />
          <LiquidityDistibutionWrapper>
            <LiquidityDistributionLoading />
          </LiquidityDistibutionWrapper>
        </RightContainer>
      </Container>
    )
  }

  if (!pool || !chainId) return <PoolDetailsSkeleton />
  return (
    <Container>
      <MiddleContainer>
        {symbol && chainId && <PoolDataChart symbol={symbol} chainId={chainId} />}
        <PositionsWrapper>
          <PostionsContainer
            account={account}
            orders={orders}
            loadingOrders={loadingOrders}
            positions={positions}
            loadingPositions={loadingPositions}
          />
        </PositionsWrapper>
      </MiddleContainer>
      <RightContainer>
        <PoolSelect detailsLoading={false} />
        <LiquidityDistibutionWrapper>
          <LiquidityDistributionTable token0={token0} token1={token1} currentPrice={currentPrice} bin={binData} />
        </LiquidityDistibutionWrapper>
      </RightContainer>
    </Container>
  )
}
