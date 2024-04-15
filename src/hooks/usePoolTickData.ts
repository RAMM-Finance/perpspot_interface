import { Currency } from '@uniswap/sdk-core'
import { FeeAmount, nearestUsableTick, Pool, TICK_SPACINGS, tickToPrice } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { SupportedChainId } from 'constants/chains'
import { ZERO_ADDRESS } from 'constants/misc'
import { useAllV3TicksQuery } from 'graphql/thegraph/__generated__/types-and-hooks'
import { TickData, Ticks } from 'graphql/thegraph/AllV3TicksQuery'
import { apolloClient } from 'graphql/thegraph/apollo'
import JSBI from 'jsbi'
import ms from 'ms.macro'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import computeSurroundingTicks from 'utils/computeSurroundingTicks'

import { POOL_INIT_CODE_HASH, V3_CORE_FACTORY_ADDRESSES } from '../constants/addresses'
import { useTickLens } from './useContract'
import { PoolState, usePool } from './usePools'

const PRICE_FIXED_DIGITS = 8
const CHAIN_IDS_MISSING_SUBGRAPH_DATA = [
  SupportedChainId.ARBITRUM_ONE,
  // SupportedChainId.ARBITRUM_GOERLI,
  // SupportedChainId.SEPOLIA,
  SupportedChainId.BASE,
]

// Tick with fields parsed to JSBIs, and active liquidity computed.
export interface TickProcessed {
  tick: number
  liquidityActive: BN
  liquidityNet: BN
  price0: string
}

const REFRESH_FREQUENCY = { blocksPerFetch: 2 }

const getActiveTick = (tickCurrent: number | undefined, feeAmount: FeeAmount | undefined) =>
  tickCurrent && feeAmount ? Math.floor(tickCurrent / TICK_SPACINGS[feeAmount]) * TICK_SPACINGS[feeAmount] : undefined

const bitmapIndex = (tick: number, tickSpacing: number) => {
  return Math.floor(tick / tickSpacing / 256)
}

function useTicksFromTickLens(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  numSurroundingTicks: number | undefined = 125
) {
  const [tickDataLatestSynced, setTickDataLatestSynced] = useState<TickData[]>([])

  const [poolState, pool] = usePool(currencyA, currencyB, feeAmount)

  const tickSpacing = feeAmount && TICK_SPACINGS[feeAmount]

  // Find nearest valid tick for pool in case tick is not initialized.
  const activeTick = pool?.tickCurrent && tickSpacing ? nearestUsableTick(pool?.tickCurrent, tickSpacing) : undefined

  const { chainId } = useWeb3React()

  const poolAddress =
    currencyA && currencyB && feeAmount && poolState === PoolState.EXISTS
      ? Pool.getAddress(
          currencyA?.wrapped,
          currencyB?.wrapped,
          feeAmount,
          POOL_INIT_CODE_HASH,
          chainId ? V3_CORE_FACTORY_ADDRESSES[chainId] : undefined
        )
      : undefined

  // it is also possible to grab all tick data but it is extremely slow
  // bitmapIndex(nearestUsableTick(TickMath.MIN_TICK, tickSpacing), tickSpacing)
  const minIndex = useMemo(
    () =>
      tickSpacing && activeTick ? bitmapIndex(activeTick - numSurroundingTicks * tickSpacing, tickSpacing) : undefined,
    [tickSpacing, activeTick, numSurroundingTicks]
  )

  const maxIndex = useMemo(
    () =>
      tickSpacing && activeTick ? bitmapIndex(activeTick + numSurroundingTicks * tickSpacing, tickSpacing) : undefined,
    [tickSpacing, activeTick, numSurroundingTicks]
  )

  const tickLensArgs: [string, number][] = useMemo(
    () =>
      typeof maxIndex === 'number' && typeof minIndex === 'number' && poolAddress && poolAddress !== ZERO_ADDRESS
        ? new Array(maxIndex - minIndex + 1)
            .fill(0)
            .map((_, i) => i + minIndex)
            .map((wordIndex) => [poolAddress, wordIndex])
        : [],
    [minIndex, maxIndex, poolAddress]
  )

  const tickLens = useTickLens()

  const key = useMemo(() => {
    if (!tickLens || !tickLensArgs.length || !currencyB || !currencyA || !feeAmount) return 'missing'
    return JSON.stringify(tickLensArgs) + currencyA?.wrapped.address + currencyB?.wrapped.address + feeAmount
  }, [tickLensArgs, tickLens, currencyA, currencyB, feeAmount])

  const {
    data: tickData,
    isLoading,
    isError,
    isSuccess,
  } = useQuery(
    ['tickLens', key],
    async () => {
      if (!tickLens || !tickLensArgs.length) throw new Error('No tickLens or tickLensArgs')
      const promises = tickLensArgs.map((args) => tickLens.callStatic.getPopulatedTicksInWord(args[0], args[1]))
      const callResults = await Promise.all(promises)
      const latestTickData = callResults
        .flatMap((result) =>
          result.map((response: any) => {
            // console.log('response', response[1].toString())
            return {
              tick: response[0],
              liquidityNet: new BN(response[1].toString()),
              price0: 0,
              price1: 0,
            }
          })
        )
        .sort((a, b) => a.tick - b.tick)

      return latestTickData
    },
    {
      keepPreviousData: true,
      refetchInterval: ms`5s`,
    }
  )

  // return the latest synced tickData even if we are still loading the newest data
  useEffect(() => {
    if (!isLoading && !isError && isSuccess) {
      tickData && setTickDataLatestSynced(tickData.sort((a, b) => a.tick - b.tick))
    }
  }, [isError, isLoading, tickData, isSuccess])

  return useMemo(
    () => ({ isLoading, isError, tickData: tickDataLatestSynced }),
    [isLoading, isError, tickDataLatestSynced]
  )
}

function useTicksFromSubgraph(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  skip = 0
) {
  const { chainId } = useWeb3React()
  const poolAddress =
    currencyA && currencyB && feeAmount
      ? Pool.getAddress(
          currencyA?.wrapped,
          currencyB?.wrapped,
          feeAmount,
          undefined,
          chainId ? V3_CORE_FACTORY_ADDRESSES[chainId] : undefined
        )
      : undefined

  return useAllV3TicksQuery({
    variables: { poolAddress: poolAddress?.toLowerCase(), skip },
    skip: !poolAddress,
    pollInterval: ms`30s`,
    client: apolloClient,
  })
}

const MAX_THE_GRAPH_TICK_FETCH_VALUE = 1000
// Fetches all ticks for a given pool
function useAllV3Ticks(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): {
  isLoading: boolean
  error: unknown
  ticks: TickData[] | undefined
} {
  const useSubgraph = currencyA ? !CHAIN_IDS_MISSING_SUBGRAPH_DATA.includes(currencyA.chainId) : true

  const tickLensTickData = useTicksFromTickLens(!useSubgraph ? currencyA : undefined, currencyB, feeAmount)

  const [skipNumber, setSkipNumber] = useState(0)
  const [subgraphTickData, setSubgraphTickData] = useState<Ticks>([])
  const {
    data,
    error,
    loading: isLoading,
  } = useTicksFromSubgraph(useSubgraph ? currencyA : undefined, currencyB, feeAmount, skipNumber)

  console.log('zeke:', data, tickLensTickData, isLoading)

  useEffect(() => {
    if (data?.ticks.length) {
      setSubgraphTickData((tickData) => [...tickData, ...data.ticks])
      if (data.ticks.length === MAX_THE_GRAPH_TICK_FETCH_VALUE) {
        setSkipNumber((skipNumber) => skipNumber + MAX_THE_GRAPH_TICK_FETCH_VALUE)
      }
    }
  }, [data?.ticks])

  return {
    isLoading: useSubgraph
      ? isLoading || data?.ticks.length === MAX_THE_GRAPH_TICK_FETCH_VALUE
      : tickLensTickData.isLoading,
    error: useSubgraph ? error : tickLensTickData.isError,
    ticks: useSubgraph ? subgraphTickData : tickLensTickData.tickData,
  }
}

function safeParseToBigInt(value: any) {
  try {
    return JSBI.BigInt(value)
  } catch (error) {
    console.error('Failed to convert value to BigInt:', value, error)
    return JSBI.BigInt(0)
  }
}

export function usePoolActiveLiquidity(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): {
  isLoading: boolean
  error: any
  activeTick: number | undefined
  data: TickProcessed[] | undefined
} {
  const pool = usePool(currencyA, currencyB, feeAmount)

  // Find nearest valid tick for pool in case tick is not initialized.
  const activeTick = useMemo(() => getActiveTick(pool[1]?.tickCurrent, feeAmount), [pool, feeAmount])

  const { isLoading, error, ticks } = useAllV3Ticks(currencyA, currencyB, feeAmount)
  // console.log('zeke:', ticks, isLoading, error)

  return useMemo(() => {
    if (
      !currencyA ||
      !currencyB ||
      activeTick === undefined ||
      pool[0] !== PoolState.EXISTS ||
      !ticks ||
      ticks.length === 0 ||
      isLoading
    ) {
      return {
        isLoading: isLoading || pool[0] === PoolState.LOADING,
        error,
        activeTick,
        data: undefined,
      }
    }

    const token0 = currencyA?.wrapped
    const token1 = currencyB?.wrapped

    // find where the active tick would be to partition the array
    // if the active tick is initialized, the pivot will be an element
    // if not, take the previous tick as pivot
    const pivot = ticks.findIndex(({ tick }) => tick > activeTick) - 1

    if (pivot < 0) {
      // consider setting a local error
      console.error('TickData pivot not found')
      return {
        isLoading,
        error,
        activeTick,
        data: undefined,
      }
    }
    // console.log('activeTickProcessed', ticks[pivot].liquidityNet, JSBI.BigInt(ticks[pivot].liquidityNet))

    const activeTickProcessed: TickProcessed = {
      liquidityActive: new BN(pool[1]?.liquidity.toString() ?? 0),
      tick: activeTick,
      liquidityNet: Number(ticks[pivot].tick) === activeTick ? new BN(ticks[pivot].liquidityNet) : new BN(0),
      price0: tickToPrice(token0, token1, activeTick).toFixed(PRICE_FIXED_DIGITS),
    }

    const subsequentTicks = computeSurroundingTicks(token0, token1, activeTickProcessed, ticks, pivot, true)

    const previousTicks = computeSurroundingTicks(token0, token1, activeTickProcessed, ticks, pivot, false)

    const ticksProcessed = previousTicks.concat(activeTickProcessed).concat(subsequentTicks)

    return {
      isLoading,
      error,
      activeTick,
      data: ticksProcessed,
    }
  }, [currencyA, currencyB, activeTick, pool, ticks, isLoading, error])
}
