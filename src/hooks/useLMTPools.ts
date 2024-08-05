import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SqrtPriceMath, TickMath } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { LIM_WETH, LMT_QUOTER } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { VOLUME_STARTPOINT } from 'constants/misc'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { ethers } from 'ethers'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { firestore } from 'firebaseConfig'
import { clientArbitrum, clientBase, fetchAllData } from 'graphql/limitlessGraph/limitlessClients'
import {
  AddCountQuery,
  ForceClosedCountQuery,
  LiquidityProvidedForPoolQuery,
  LiquidityProvidedQueryV2,
  LiquidityWithdrawnForPoolQuery,
  LiquidityWithdrawnQueryV2,
  PremiumDepositedCountQuery,
  PremiumWithdrawnCountQuery,
  ReduceCountQuery,
} from 'graphql/limitlessGraph/queries'
import JSBI from 'jsbi'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { PoolContractInfo, usePoolKeyList } from 'state/application/hooks'
import { LimWethSDK } from 'utils/lmtSDK/LimWeth'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { LmtQuoterSDK } from 'utils/lmtSDK/LmtQuoter'

import { useLimweth } from './useContract'
import { useContractCallV2 } from './useContractCall'
import { useAllPoolAndTokenPriceData } from './useUserPriceData'
import { useChainId } from 'wagmi'
// const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateJSON.abi)

export function useRenderCount() {
  const renderCountRef = useRef(0)
  useEffect(() => {
    renderCountRef.current++
    console.log(`Render count: ${renderCountRef.current}`)
  })
}

export interface PoolTVLData {
  [key: string]: {
    totalValueLocked: number
    volume: number
    numberOfTrades: number
    longableLiquidity: number
    shortableLiquidity: number
  }
}

// todo: fetch tvl for single pool address
export function useStatsLiquidities(poolAddress: string | null): {
  loading: boolean
  result: {
    longableLiquidity: number, shortableLiquidity: number
   } | undefined
} {
  const chainId = useChainId()
  
  const queryKey = useMemo(() => {
    if (!poolAddress || !chainId) return []
    return ['queryPoolsData', poolAddress]
  }, [poolAddress, chainId])

  const enabled = useMemo(() => {
    return Boolean(poolAddress && chainId)
  }, [poolAddress, chainId])

  const fetchData = useCallback(async () => {
    if (!poolAddress) return undefined
    const clientToUse = chainId === SupportedChainId.BASE ? clientBase : clientArbitrum

    console.time("FETCH DATA SPEED")

    const [
      providedData, 
      withdrawnData
    ] = await Promise.all([
      fetchAllData(LiquidityProvidedForPoolQuery, clientToUse, poolAddress),
      fetchAllData(LiquidityWithdrawnForPoolQuery, clientToUse, poolAddress),
    ])
    console.timeEnd("FETCH DATA SPEED")    
    return {
      providedData,
      withdrawnData
    }
  }, [poolAddress, chainId])


  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchData,
    enabled: enabled,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    // placeholderData: keepPreviousData,
  })

  const { poolList } = usePoolKeyList(chainId)

  const poolMap = useMemo(() => {
    if (poolList) {
      return poolList.reduce(
        (prev, current) => {
          prev[current.poolAddress.toLowerCase()] = current
          return prev
        },
        {} as {
          [pool: string]: PoolContractInfo
        }
      )
    }
    return undefined
  }, [poolList])

  const { tokens: tokenPriceData } = useAllPoolAndTokenPriceData(chainId)

  const limwethPrice = useMemo(() => {
    if (tokenPriceData) {
      const weth = WRAPPED_NATIVE_CURRENCY[chainId]?.address
      return weth ? tokenPriceData[weth.toLowerCase()]?.usdPrice : undefined
    }
    return undefined
  }, [tokenPriceData, chainId])

  const sharedLiquidityCallState = useContractCallV2(
    chainId,
    LMT_QUOTER,
    LmtQuoterSDK.INTERFACE.encodeFunctionData('getSharedLiquidityInfo'),
    ['getSharedLiquidityInfo'],
    false,
    true,
    (data) => {
      return LmtQuoterSDK.INTERFACE.decodeFunctionResult('getSharedLiquidityInfo', data)
    }
  )

  const limweth = useLimweth(false)

  const calldata = useMemo(() => {
    return LimWethSDK.INTERFACE.encodeFunctionData('tokenBalance', [])
  }, [limweth])

  const { result } = useContractCallV2(
    chainId,
    LIM_WETH,
    calldata,
    ['tokenBalance'],
    false,
    true,
    (data) => {
      return LimWethSDK.INTERFACE.decodeFunctionResult('tokenBalance', data)
    }
  )

  const { limwethBalance } = useMemo(() => {
    if (!result || !chainId)
      return {
        limwethBalance: undefined,
      }
    return {
      limwethBalance: result[0],
      
    }
  }, [result, chainId])

  const sharedLiq = sharedLiquidityCallState?.result

  const availableLiquidities: { [poolId: string]: BN } | undefined = useMemo(() => {
    if (limwethBalance !== undefined && sharedLiq && poolMap) {
      const result: { [poolId: string]: BN } = {}

      sharedLiq[0].forEach((info: any) => {
        const poolId = getPoolId(info[0][0], info[0][1], info[0][2])
        const maxPerPair = Number(info[1].toString())
        const exposure = Number(info[2].toString())
       
        result[poolId] = new BN(maxPerPair).shiftedBy(-18).times(new BN(limwethBalance.toString())).minus(exposure)
      })
      return result
    }

    return undefined
  }, [limwethBalance, sharedLiq, poolMap])

  const processLiqEntry = useCallback((entry: any, poolMap: any, tokenPriceData: any) => {
    if (!poolMap || !tokenPriceData || !Object.keys(poolMap).length || !Object.keys(tokenPriceData).length) return
    const pool = ethers.utils.getAddress(entry.pool)

    if (!poolMap[pool.toLowerCase()]) {
      return {
        pool,
        amount0: 0,
        amount1: 0,
      }
    }
    const curTick = poolMap[pool.toLowerCase()].tick

    let amount0
    let amount1

    if (curTick < entry.tickLower) {
      amount0 = SqrtPriceMath.getAmount0Delta(
        TickMath.getSqrtRatioAtTick(entry.tickLower),
        TickMath.getSqrtRatioAtTick(entry.tickUpper),
        JSBI.BigInt(entry.liquidity.toString()),
        false
      ).toString()
      amount1 = '0'
    } else if (curTick > entry.tickUpper) {
      amount1 = SqrtPriceMath.getAmount1Delta(
        TickMath.getSqrtRatioAtTick(entry.tickLower),
        TickMath.getSqrtRatioAtTick(entry.tickUpper),
        JSBI.BigInt(entry.liquidity.toString()),
        false
      ).toString()
      amount0 = '0'
    } else {
      amount0 = SqrtPriceMath.getAmount0Delta(
        TickMath.getSqrtRatioAtTick(curTick),
        TickMath.getSqrtRatioAtTick(entry.tickUpper),
        JSBI.BigInt(entry.liquidity.toString()),
        false
      ).toString()
      amount1 = SqrtPriceMath.getAmount1Delta(
        TickMath.getSqrtRatioAtTick(entry.tickLower),
        TickMath.getSqrtRatioAtTick(curTick),
        JSBI.BigInt(entry.liquidity.toString()),
        false
      ).toString()
    }

    const token0 = poolMap[pool.toLowerCase()].token0.toLowerCase()
    const token1 = poolMap[pool.toLowerCase()].token1.toLowerCase()
    const token0Usd = tokenPriceData[token0].usdPrice
    const token1Usd = tokenPriceData[token1].usdPrice
    const decimals0 = poolMap[pool.toLowerCase()].decimals0
    const decimals1 = poolMap[pool.toLowerCase()].decimals1

    return {
      pool,
      amount0: (token0Usd * Number(amount0)) / 10 ** decimals0,
      amount1: (token1Usd * Number(amount1)) / 10 ** decimals1
    }
  }, [])

  const TVLDataLongable: { [key: string]: any } = {}
  const TVLDataShortable: { [key: string]: any } = {}

  const isAllLoaded = useMemo(() => {
    return Boolean(
      !isLoading &&
        data &&
        poolMap &&
        limwethPrice &&
        availableLiquidities
    )
  }, [isLoading, data, poolMap, limwethPrice, availableLiquidities])


  const poolToData = useMemo(() => {
    if (!poolAddress || !poolMap || !availableLiquidities || !tokenPriceData || !limwethPrice || !data || !chainId) return undefined
    
    const { providedData, withdrawnData } = data

    const providedDataProcessed = providedData?.map((data: any) =>
      processLiqEntry(data, poolMap, tokenPriceData)
    )
    const withdrawnDataProcessed = withdrawnData?.map((data: any) =>
      processLiqEntry(data, poolMap, tokenPriceData)
    )

    providedDataProcessed?.forEach((entry: any) => {
      if (!poolMap || !poolMap[entry.pool.toLowerCase()]) return
      const { token0, token1, fee } = poolMap[entry.pool.toLowerCase()]
      const key = getPoolId(token0, token1, fee).toLowerCase()
  
      if (!TVLDataLongable[key]) {
        TVLDataLongable[key] = 0
      }
      if (!TVLDataShortable[key]) {
        TVLDataShortable[key] = 0
      }

      // WBTC USDC

      if (
        key.includes('0x4200000000000000000000000000000000000006-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913-500'.toLowerCase()) || // BASE
        key.includes('0x82af49447d8a07e3bd95bd0d56f35241523fbab1-0xaf88d065e77c8cc2239327c5edb3a432268e5831-500'.toLowerCase()) || // ARB
        key.includes('0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f-0xaf88d065e77c8cc2239327c5edb3a432268e5831-500'.toLowerCase()) // WBTC-USDC PAIR
      ) {
        // when WETH/USDC, WBTC/USDC pool
        TVLDataLongable[key] += entry.amount1
        TVLDataShortable[key] += entry.amount0
        
      } else if (
        token0.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase() || // BASE
        token0.toLowerCase() === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase() || // ARB
        key.includes('0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f-0x82af49447d8a07e3bd95bd0d56f35241523fbab1-500'.toLowerCase()) // WBTC-WETH
      ) {
        // when non-USDC/WETH pool and token0 is WETH
        TVLDataLongable[key] += entry.amount0
        TVLDataShortable[key] += entry.amount1

      } else if (
        token1.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase() || // BASE
        token1.toLowerCase() === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase() // ARB
      ) {
        // when non-USDC/WETH pool and token1 is WETH
        TVLDataLongable[key] += entry.amount1
        TVLDataShortable[key] += entry.amount0
      }
    })
    withdrawnDataProcessed?.forEach((entry: any) => {
      if (!poolMap || !poolMap[entry.pool.toLowerCase()]) return
      const { token0, token1, fee } = poolMap[entry.pool.toLowerCase()]
      const key = getPoolId(token0, token1, fee).toLowerCase()
  
      if (!TVLDataLongable[key]) {
        TVLDataLongable[key] = 0
      }
      if (!TVLDataShortable[key]) {
        TVLDataShortable[key] = 0
      }
      if (
        key.includes('0x4200000000000000000000000000000000000006-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913-500'.toLowerCase()) || // WETH/USDC BASE
        key.includes('0x82af49447d8a07e3bd95bd0d56f35241523fbab1-0xaf88d065e77c8cc2239327c5edb3a432268e5831-500'.toLowerCase()) || // WETH/USDC ARB
        key.includes('0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f-0xaf88d065e77c8cc2239327c5edb3a432268e5831-500'.toLowerCase()) // WBTC-USDC ARB
      ) {
        // when  pool
        TVLDataLongable[key] -= entry.amount1
        TVLDataShortable[key] -= entry.amount0
      } else if (
        token0.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase() || // BASE
        token0.toLowerCase() === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase() || // ARB
        key.includes('0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f-0x82af49447d8a07e3bd95bd0d56f35241523fbab1-500'.toLowerCase()) // WBTC-WETH ARB
      ) {
        // when non-USDC/WETH pool and token0 is WETH
        TVLDataLongable[key] -= entry.amount0
        TVLDataShortable[key] -= entry.amount1
      } else if (
        token1.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase() || // BASE
        token1.toLowerCase() === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'.toLowerCase() // ARB
      ) {
        // when non-USDC/WETH pool and token1 is WETH
        TVLDataLongable[key] -= entry.amount1
        TVLDataShortable[key] -= entry.amount0
      }
    })

    let liqData: any
    if (Object.keys(TVLDataLongable).length === 0) {
      const pool = poolMap[poolAddress.toLowerCase()]
      
      const poolKey = getPoolId(pool.token0, pool.token1, pool.fee)
      TVLDataLongable[poolKey.toLowerCase()] = 0
      TVLDataShortable[poolKey.toLowerCase()] = 0
      
      // TVLDataLongable[key.toLowerCase()] = 0
    }
    Object.keys(TVLDataLongable).forEach((key) => {
      const isInverted =
      key.toLowerCase().includes('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) || // WETH/USDC pool in BASE
      key.toLowerCase().includes('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'.toLowerCase()) || // WETH/USDC pool in ARBITRUM
      key.toLowerCase().includes('0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f-0x82af49447d8a07e3bd95bd0d56f35241523fbab1-500'.toLowerCase()) // WBTC/WETH pool in ARBITRUM
      

      const availableLiquidity = availableLiquidities[key]
      ? limwethPrice * availableLiquidities[key].shiftedBy(-18).toNumber()
      : 0

      liqData = {
        longableLiquidity: isInverted
          ? TVLDataLongable[key.toLowerCase()]
          : TVLDataLongable[key.toLowerCase()] + availableLiquidity,
        shortableLiquidity: isInverted
          ? TVLDataShortable[key.toLowerCase()] + availableLiquidity
          : TVLDataShortable[key.toLowerCase()]
      }
    })

    return liqData
    
  }, [poolAddress, poolMap, availableLiquidities, tokenPriceData, limwethPrice, data, chainId])

  return useMemo(() => {
    return {
      loading: !isAllLoaded,
      result: poolToData,
      error: isError,
    }
  }, [poolToData])
}

export function usePoolsTVLandVolume(): {
  loading: boolean
  result: PoolTVLData | undefined
  error: boolean
} {
  // TODO : maybe we don't need to fetch previous subgraph volume data, because it is always the same

  const { tokens: arbTokenPriceData } = useAllPoolAndTokenPriceData(SupportedChainId.ARBITRUM_ONE)
  const { tokens: baseTokenPriceData } = useAllPoolAndTokenPriceData(SupportedChainId.BASE)

  //useBaseLimweth()
  const arbLimweth = useLimweth(false, SupportedChainId.ARBITRUM_ONE)
  const baseLimweth = useLimweth(false, SupportedChainId.BASE)

  const calldata = useMemo(() => {
    return LimWethSDK.INTERFACE.encodeFunctionData('tokenBalance', [])
  }, [arbLimweth, baseLimweth])

  const { result: arbResults } = useContractCallV2(
    SupportedChainId.ARBITRUM_ONE,
    LIM_WETH,
    calldata,
    ['tokenBalance'],
    false,
    true,
    (data) => {
      return LimWethSDK.INTERFACE.decodeFunctionResult('tokenBalance', data)
    }
  )

  const { result: baseResults } = useContractCallV2(
    SupportedChainId.BASE,
    LIM_WETH,
    calldata,
    ['tokenBalance'],
    false,
    true,
    (data) => {
      return LimWethSDK.INTERFACE.decodeFunctionResult('tokenBalance', data)
    }
  )

  const { arbLimwethBalance, baseLimwethBalance } = useMemo(() => {
    if (!arbResults || !baseResults)
      return {
        arbLimwethBalance: undefined,
        baseLimwethBalance: undefined,
      }
    return {
      arbLimwethBalance: arbResults[0],
      baseLimwethBalance: baseResults[0],
    }
  }, [arbResults, baseResults])

  const queryKey = useMemo(() => {
    if (!arbTokenPriceData || !baseTokenPriceData) return []
    return ['queryPoolsData']
  }, [arbTokenPriceData, baseTokenPriceData])

  const dataFetchEnabled = useMemo(() => {
    return Boolean(arbTokenPriceData && baseTokenPriceData)
  }, [arbTokenPriceData, baseTokenPriceData])

  const fetchTVLandVolumeData = useCallback(async () => {
    if (!arbTokenPriceData || !baseTokenPriceData) throw Error('missing token price data')
    try {
      // const clientToUse = chainId === SupportedChainId.BASE ? clientBase : clientArbitrum
      const timestamp = VOLUME_STARTPOINT

      const queryAdd = query(
        collection(firestore, 'volumes'),
        where('timestamp', '>=', timestamp),
        where('type', '==', 'ADD')
      )

      const queryReduce = query(
        collection(firestore, 'volumes'),
        where('timestamp', '>=', timestamp),
        where('type', '==', 'REDUCE')
      )

      const queryPrevPriceBase = query(collection(firestore, 'priceUSD-from-1716269264'))

      const queryPrevPriceArb = query(collection(firestore, 'priceUSD-from-1720161621-arbitrum'))

      console.time('FETCH ALL')
      const [
        // ARBITRUM
        // for TVL
        arbProvidedQueryData,
        arbWithdrawnQueryData,
        // for number of trades
        arbAddUsersCountData,
        arbReduceUsersCountData,
        arbForceClosedCountData,
        arbPremiumDepositedCountData,
        arbPremiumWithdrawnCountData,
        // // for Volumes
        // arbAddQueryData,
        // arbReduceQueryData,
        arbAddQuerySnapshot,
        arbReduceQuerySnapshot,
        // prevArbPriceQuerySnapshot,

        // BASE
        // for TVL
        baseProvidedQueryData,
        baseWithdrawnQueryData,
        // for number of trades
        baseAddUsersCountData,
        baseReduceUsersCountData,
        baseForceClosedCountData,
        basePremiumDepositedCountData,
        basePremiumWithdrawnCountData,
        // for Volumes
        // baseAddQueryData,
        // baseReduceQueryData,
        baseAddQuerySnapshot,
        baseReduceQuerySnapshot,
        // prevBasePriceQuerySnapshot,
        // Limweth
        // arbLimwethBalance,
        // baseLimwethBalance
      ] = await Promise.all([
        // ARBITRUM
        // for TVL
        fetchAllData(LiquidityProvidedQueryV2, clientArbitrum),
        fetchAllData(LiquidityWithdrawnQueryV2, clientArbitrum),
        // for number of trades
        fetchAllData(AddCountQuery, clientArbitrum),
        fetchAllData(ReduceCountQuery, clientArbitrum),
        fetchAllData(ForceClosedCountQuery, clientArbitrum),
        fetchAllData(PremiumDepositedCountQuery, clientArbitrum),
        fetchAllData(PremiumWithdrawnCountQuery, clientArbitrum),
        // // for Volumes
        // fetchAllData(AddVolumeQuery, clientArbitrum),
        // fetchAllData(ReduceVolumeQuery, clientArbitrum),
        getDocs(queryAdd),
        getDocs(queryReduce),
        // getDocs(queryPrevPriceArb),

        // BASE
        // for TVL
        fetchAllData(LiquidityProvidedQueryV2, clientBase),
        fetchAllData(LiquidityWithdrawnQueryV2, clientBase),
        // for number of trades
        fetchAllData(AddCountQuery, clientBase),
        fetchAllData(ReduceCountQuery, clientBase),
        fetchAllData(ForceClosedCountQuery, clientBase),
        fetchAllData(PremiumDepositedCountQuery, clientBase),
        fetchAllData(PremiumWithdrawnCountQuery, clientBase),
        // for Volumes
        // fetchAllData(AddVolumeQuery, clientBase),
        // fetchAllData(ReduceVolumeQuery, clientBase),
        getDocs(queryAdd),
        getDocs(queryReduce),
        // getDocs(queryPrevPriceBase),
        // limeth
        // baseLimweth?.tokenBalance(),
        // arbLimweth?.tokenBalance()
      ])
      console.timeEnd('FETCH ALL')

      const arbAddData = arbAddQuerySnapshot.docs
        .map((doc) => doc.data())
        .filter((data) => data.chainId === SupportedChainId.ARBITRUM_ONE)

      const arbReduceData = arbReduceQuerySnapshot.docs
        .map((doc) => doc.data())
        .filter((data) => data.chainId === SupportedChainId.ARBITRUM_ONE)

      const baseAddData = baseAddQuerySnapshot.docs
        .map((doc) => doc.data())
        .filter((data) => data.chainId === SupportedChainId.BASE || data.chainId === undefined)

      const baseReduceData = baseReduceQuerySnapshot.docs
        .map((doc) => doc.data())
        .filter((data) => data.chainId === SupportedChainId.BASE || data.chainId === undefined)

      // const arbPrevPriceData = prevArbPriceQuerySnapshot.docs.map((doc) => doc.data())
      // const basePrevPriceData = prevBasePriceQuerySnapshot.docs.map((doc) => doc.data())

      return {
        // ARB
        // for TVL
        arbProvidedData: arbProvidedQueryData,
        arbWithdrawnData: arbWithdrawnQueryData,
        // for number of trades
        arbAddUsersCountData,
        arbReduceUsersCountData,
        arbForceClosedCountData,
        arbPremiumDepositedCountData,
        arbPremiumWithdrawnCountData,
        // for Volumes
        // arbAddData: arbAddQueryData,
        // arbReduceData: arbReduceQueryData,
        arbAddedFirebaseVolumes: arbAddData,
        arbReducedFirebaseVolumes: arbReduceData,
        // arbPrevPriceData,
        // BASE
        // for TVL
        baseProvidedData: baseProvidedQueryData,
        baseWithdrawnData: baseWithdrawnQueryData,
        // for number of trades
        baseAddUsersCountData,
        baseReduceUsersCountData,
        baseForceClosedCountData,
        basePremiumDepositedCountData,
        basePremiumWithdrawnCountData,
        // for Volumes
        // baseAddData: baseAddQueryData,
        // baseReduceData: baseReduceQueryData,
        baseAddedFirebaseVolumes: baseAddData,
        baseReducedFirebaseVolumes: baseReduceData,
        // basePrevPriceData,
        // limweth
        // arbLimwethBalance,
        // baseLimwethBalance
      }
    } catch (err) {
      console.log('fetchData Error in useLMTPools:', err)
      throw err
    }
  }, [arbTokenPriceData, baseTokenPriceData])

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchTVLandVolumeData,
    enabled: dataFetchEnabled,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })

  const { poolList: basePoolList } = usePoolKeyList(SupportedChainId.BASE)
  const { poolList: arbPoolList } = usePoolKeyList(SupportedChainId.ARBITRUM_ONE)

  // const { result: limWethBalance, loading: limWethLoading } = useSingleCallResult(limweth, 'tokenBalance', [])

  const arbSharedLiquidityCallState = useContractCallV2(
    SupportedChainId.ARBITRUM_ONE,
    LMT_QUOTER,
    LmtQuoterSDK.INTERFACE.encodeFunctionData('getSharedLiquidityInfo'),
    ['getSharedLiquidityInfo'],
    false,
    true,
    (data) => {
      return LmtQuoterSDK.INTERFACE.decodeFunctionResult('getSharedLiquidityInfo', data)
    }
  )

  const baseSharedLiquidityCallState = useContractCallV2(
    SupportedChainId.BASE,
    LMT_QUOTER,
    LmtQuoterSDK.INTERFACE.encodeFunctionData('getSharedLiquidityInfo'),
    ['getSharedLiquidityInfo'],
    false,
    true,
    (data) => {
      return LmtQuoterSDK.INTERFACE.decodeFunctionResult('getSharedLiquidityInfo', data)
    }
  )

  const arbSharedLiquidity = arbSharedLiquidityCallState?.result
  const baseSharedLiquidity = baseSharedLiquidityCallState?.result

  const limwethPrice = useMemo(() => {
    if (baseTokenPriceData) {
      const baseWeth = WRAPPED_NATIVE_CURRENCY[SupportedChainId.BASE]?.address
      return baseWeth ? baseTokenPriceData[baseWeth.toLowerCase()]?.usdPrice : undefined
    }
    return undefined
  }, [baseTokenPriceData])

  const arbPoolMap = useMemo(() => {
    if (arbPoolList) {
      return arbPoolList.reduce(
        (prev, current) => {
          prev[current.poolAddress.toLowerCase()] = current
          return prev
        },
        {} as {
          [pool: string]: PoolContractInfo
        }
      )
    }
    return undefined
  }, [arbPoolList])

  const basePoolMap = useMemo(() => {
    if (basePoolList) {
      return basePoolList.reduce(
        (prev, current) => {
          prev[current.poolAddress.toLowerCase()] = current
          return prev
        },
        {} as {
          [pool: string]: PoolContractInfo
        }
      )
    }
    return undefined
  }, [basePoolList])

  const arbAvailableLiquidities: { [poolId: string]: BN } | undefined = useMemo(() => {
    if (arbLimwethBalance !== undefined && arbSharedLiquidity && arbPoolMap) {
      const result: { [poolId: string]: BN } = {}

      arbSharedLiquidity[0].forEach((info: any) => {
        const poolId = getPoolId(info[0][0], info[0][1], info[0][2])
        const maxPerPair = Number(info[1].toString())
        const exposure = Number(info[2].toString())
      
        result[poolId] = new BN(maxPerPair).shiftedBy(-18).times(new BN(arbLimwethBalance.toString())).minus(exposure)
      })
      return result
    }

    return undefined
  }, [arbLimwethBalance, arbSharedLiquidity, arbPoolMap])

  const baseAvailableLiquidities: { [poolId: string]: BN } | undefined = useMemo(() => {
    if (baseLimwethBalance !== undefined && baseSharedLiquidity && basePoolMap) {
      const result: { [poolId: string]: BN } = {}
      baseSharedLiquidity[0].forEach((info: any) => {
        const poolId = getPoolId(info[0][0], info[0][1], info[0][2])
        const maxPerPair = Number(info[1].toString())
        const exposure = Number(info[2].toString())
        
        result[poolId] = new BN(maxPerPair).shiftedBy(-18).times(new BN(baseLimwethBalance.toString())).minus(exposure)
      })
      return result
    }

    return undefined
  }, [baseLimwethBalance, baseSharedLiquidity, basePoolMap])

  const processLiqEntry = useCallback((entry: any, poolMap: any, tokenPriceData: any) => {
    if (!poolMap || !tokenPriceData || !Object.keys(poolMap).length || !Object.keys(tokenPriceData).length) return
    const pool = ethers.utils.getAddress(entry.pool)

    if (!poolMap[pool.toLowerCase()]) {
      return {
        pool,
        amount0: 0,
        amount1: 0,
      }
    }
    const curTick = poolMap[pool.toLowerCase()].tick

    let amount0
    let amount1

    if (curTick < entry.tickLower) {
      amount0 = SqrtPriceMath.getAmount0Delta(
        TickMath.getSqrtRatioAtTick(entry.tickLower),
        TickMath.getSqrtRatioAtTick(entry.tickUpper),
        JSBI.BigInt(entry.liquidity.toString()),
        false
      ).toString()
      amount1 = '0'
    } else if (curTick > entry.tickUpper) {
      amount1 = SqrtPriceMath.getAmount1Delta(
        TickMath.getSqrtRatioAtTick(entry.tickLower),
        TickMath.getSqrtRatioAtTick(entry.tickUpper),
        JSBI.BigInt(entry.liquidity.toString()),
        false
      ).toString()
      amount0 = '0'
    } else {
      amount0 = SqrtPriceMath.getAmount0Delta(
        TickMath.getSqrtRatioAtTick(curTick),
        TickMath.getSqrtRatioAtTick(entry.tickUpper),
        JSBI.BigInt(entry.liquidity.toString()),
        false
      ).toString()
      amount1 = SqrtPriceMath.getAmount1Delta(
        TickMath.getSqrtRatioAtTick(entry.tickLower),
        TickMath.getSqrtRatioAtTick(curTick),
        JSBI.BigInt(entry.liquidity.toString()),
        false
      ).toString()
    }

    const token0 = poolMap[pool.toLowerCase()].token0.toLowerCase()
    const token1 = poolMap[pool.toLowerCase()].token1.toLowerCase()
    const token0Usd = tokenPriceData[token0].usdPrice
    const token1Usd = tokenPriceData[token1].usdPrice
    const decimals0 = poolMap[pool.toLowerCase()].decimals0
    const decimals1 = poolMap[pool.toLowerCase()].decimals1

    return {
      pool,
      amount0: (token0Usd * Number(amount0)) / 10 ** decimals0,
      amount1: (token1Usd * Number(amount1)) / 10 ** decimals1
    }
  }, [])

  const processSubgraphVolumeEntry = useCallback(
    (entry: any, poolMap: any, prevPriceData: any, processType: string) => {
      if (!poolMap || !Object.keys(poolMap).length) return
      const key = entry.pool
      const poolMapData = poolMap[key.toLowerCase()]

      if (!poolMapData) {
        return {
          totalValue: 0,
        }
      }

      const token = entry.positionIsToken0 ? poolMapData.token0 : poolMapData.token1

      const amount = processType === 'ADD' ? entry.addedAmount : entry.reduceAmount

      let totalValue

      const newKey = getPoolId(poolMapData.token0, poolMapData.token1, poolMapData.fee)

      const prevPrice = prevPriceData?.find((prevPrice: any) => prevPrice.poolId === newKey)

      const token0Addr = prevPrice?.token0
      const token1Addr = prevPrice?.token1
      const token0PriceUSD = prevPrice?.token0Price
      const token1PriceUSD = prevPrice?.token1Price
      const token0Decimals = prevPrice?.token0Decimals
      const token1Decimals = prevPrice?.token1Decimals

      if (token0Addr?.toLowerCase() === token.toString().toLowerCase()) {
        totalValue = (token0PriceUSD * amount) / 10 ** token0Decimals
      } else if (token1Addr?.toLowerCase() === token.toString().toLowerCase()) {
        totalValue = (token1PriceUSD * amount) / 10 ** token1Decimals
      } else {
        totalValue = 0
      }
      return {
        totalValue,
      }
    },
    []
  )

  const processFirebaseVolumeEntry = useCallback((entry: any) => {
    return {
      totalValue: parseFloat(entry.volume),
    }
  }, [])

  const isAllLoaded = useMemo(() => {
    return Boolean(
      !isLoading &&
        data &&
        arbPoolMap &&
        basePoolMap &&
        limwethPrice &&
        arbAvailableLiquidities &&
        baseAvailableLiquidities
    )
  }, [isLoading, data, arbPoolMap, basePoolMap, limwethPrice, arbAvailableLiquidities, baseAvailableLiquidities])

  const poolToData:
    | {
        [key: string]: {
          totalValueLocked: number
          volume: number
          longableLiquidity: number
          shortableLiquidity: number
          test0: number
          test1: number
          numberOfTrades: number
        }
      }
    | undefined = useMemo(() => {

    if (
      !data ||
      isLoading ||
      !arbPoolMap ||
      !basePoolMap ||
      !limwethPrice ||
      !arbAvailableLiquidities ||
      !baseAvailableLiquidities
    )
      return undefined
    try {
      console.time('USE MEMO POOL TO DATA')
      const poolToData: {
        [key: string]: {
          totalValueLocked: number
          volume: number
          longableLiquidity: number
          shortableLiquidity: number
          test0: number
          test1: number
          numberOfTrades: number
        }
      } = {}

      const {
        // for TVL
        arbProvidedData,
        arbWithdrawnData,
        // for Volumes
        // arbAddData,
        // arbReduceData,
        arbAddedFirebaseVolumes,
        arbReducedFirebaseVolumes,
        // arbPrevPriceData,
        // for Number of trades
        arbAddUsersCountData,
        arbReduceUsersCountData,
        arbForceClosedCountData,
        arbPremiumDepositedCountData,
        arbPremiumWithdrawnCountData,

        baseProvidedData,
        baseWithdrawnData,
        // for Volumes
        // baseAddData,
        // baseReduceData,
        baseAddedFirebaseVolumes,
        baseReducedFirebaseVolumes,
        // basePrevPriceData,
        // for Number of trades
        baseAddUsersCountData,
        baseReduceUsersCountData,
        baseForceClosedCountData,
        basePremiumDepositedCountData,
        basePremiumWithdrawnCountData,
      } = data as any

      const arbProvidedDataProcessed = arbProvidedData?.map((data: any) =>
        processLiqEntry(data, arbPoolMap, arbTokenPriceData)
      )
      const arbWithdrawDataProcessed = arbWithdrawnData?.map((data: any) =>
        processLiqEntry(data, arbPoolMap, arbTokenPriceData)
      )
      // const arbAddSubgraphDataVolumes = arbAddData?.map((data: any) => processSubgraphVolumeEntry(data, arbPoolMap, arbPrevPriceData, 'ADD'))
      // const arbReduceSubgraphDataVolumes = arbReduceData?.map((data: any) => processSubgraphVolumeEntry(data, arbPoolMap, arbPrevPriceData, 'REDUCE'))
      const arbProcessedAddedFirebaseVolumes = arbAddedFirebaseVolumes.map(processFirebaseVolumeEntry)
      const arbProcessedReducedFirebaseVolumes = arbReducedFirebaseVolumes.map(processFirebaseVolumeEntry)

      const baseProvidedDataProcessed = baseProvidedData?.map((data: any) =>
        processLiqEntry(data, basePoolMap, baseTokenPriceData)
      )
      const baseWithdrawDataProcessed = baseWithdrawnData?.map((data: any) =>
        processLiqEntry(data, basePoolMap, baseTokenPriceData)
      )
      // const baseAddSubgraphDataVolumes = baseAddData?.map((data: any) => processSubgraphVolumeEntry(data, basePoolMap, basePrevPriceData, 'ADD'))
      // const baseReduceSubgraphDataVolumes = baseReduceData?.map((data: any) => processSubgraphVolumeEntry(data, basePoolMap, basePrevPriceData, 'REDUCE'))
      const baseProcessedAddedFirebaseVolumes = baseAddedFirebaseVolumes.map(processFirebaseVolumeEntry)
      const baseProcessedReducedFirebaseVolumes = baseReducedFirebaseVolumes.map(processFirebaseVolumeEntry)

      // const arbTotalAddedSubgraphVolume = arbAddSubgraphDataVolumes.reduce((acc: any, curr: any) => acc + curr.totalValue, 0)
      // const arbTotalReducedSubgraphVolume = arbReduceSubgraphDataVolumes.reduce(
      //   (acc: any, curr: any) => acc + curr.totalValue,
      //   0
      // )
      const arbTotalAddedFirebaseVolume = arbProcessedAddedFirebaseVolumes.reduce(
        (acc: any, curr: any) => acc + curr.totalValue,
        0
      )
      const arbTotalReducedFirebaseVolume = arbProcessedReducedFirebaseVolumes.reduce(
        (acc: any, curr: any) => acc + curr.totalValue,
        0
      )

      const ARB_TOTAL_ADDED_SUBGRAPH_VOLUME = 26657.39973402315
      const ARB_TOTAL_REDUCED_SUBGRAPH_VOLUME = 16921.774667120735

      const arbTotalVolume =
        ARB_TOTAL_ADDED_SUBGRAPH_VOLUME +
        ARB_TOTAL_REDUCED_SUBGRAPH_VOLUME +
        arbTotalAddedFirebaseVolume +
        arbTotalReducedFirebaseVolume

      // const baseTotalAddedSubgraphVolume = baseAddSubgraphDataVolumes.reduce((acc: any, curr: any) => acc + curr.totalValue, 0)
      // const baseTotalReducedSubgraphVolume = baseReduceSubgraphDataVolumes.reduce(
      //   (acc: any, curr: any) => acc + curr.totalValue,
      //   0
      // )
      const baseTotalAddedFirebaseVolume = baseProcessedAddedFirebaseVolumes.reduce(
        (acc: any, curr: any) => acc + curr.totalValue,
        0
      )
      const baseTotalReducedFirebaseVolume = baseProcessedReducedFirebaseVolumes.reduce(
        (acc: any, curr: any) => acc + curr.totalValue,
        0
      )

      const BASE_TOTAL_ADDED_SUBGRAPH_VOLUME = 1841082.7531418717
      const BASE_TOTAL_REDUCED_SUBGRAPH_VOLUME = 1584906.0720194455

      // console.log("ARB TOTAL ADDED SUBGRAPH VOLUME", ARB_TOTAL_ADDED_SUBGRAPH_VOLUME)
      // console.log("ARB TOTAL REDUCED SUBGRAPH VOLUME", ARB_TOTAL_REDUCED_SUBGRAPH_VOLUME)
      // console.log("ARB TOTAL ADDED FIREBASE VOLUME", arbTotalAddedFirebaseVolume)
      // console.log("ARB TOTAL REDUCED FIREBASE VOLUME", arbTotalReducedFirebaseVolume)
      // console.log("------")
      // console.log("BASE TOTAL ADDED SUBGRAPH VOLUME", BASE_TOTAL_ADDED_SUBGRAPH_VOLUME)
      // console.log("BASE TOTAL REDUCED SUBGRAPH VOLUME", BASE_TOTAL_REDUCED_SUBGRAPH_VOLUME)
      // console.log("BASE TOTAL ADDED FIREBASE VOLUME", baseTotalAddedFirebaseVolume)
      // console.log("BASE TOTAL REDUCED FIREBASE VOLUME", baseTotalReducedFirebaseVolume)

      const baseTotalVolume =
        BASE_TOTAL_ADDED_SUBGRAPH_VOLUME +
        BASE_TOTAL_REDUCED_SUBGRAPH_VOLUME +
        baseTotalAddedFirebaseVolume +
        baseTotalReducedFirebaseVolume

      const totalVolume = arbTotalVolume + baseTotalVolume

      const numberOfTrades =
        // ARB
        arbAddUsersCountData.length +
        arbReduceUsersCountData.length +
        arbForceClosedCountData.length +
        arbPremiumDepositedCountData.length +
        arbPremiumWithdrawnCountData.length +
        // BASE
        baseAddUsersCountData.length +
        baseReduceUsersCountData.length +
        baseForceClosedCountData.length +
        basePremiumDepositedCountData.length +
        basePremiumWithdrawnCountData.length

      // const processVolume = (entry: any) => {
      //   if (entry.type === 'ADD') {
      //     if (totalAmountsByPool[entry.poolId]) {
      //       totalAmountsByPool[entry.poolId] += parseFloat(entry.volume)
      //     } else {
      //       totalAmountsByPool[entry.poolId] = parseFloat(entry.volume)
      //     }
      //   } else if (entry.type === 'REDUCE') {
      //     if (totalAmountsByPool[entry.poolId]) {
      //       totalAmountsByPool[entry.poolId] += parseFloat(entry.volume)
      //     } else {
      //       totalAmountsByPool[entry.poolId] = parseFloat(entry.volume)
      //     }
      //   }
      // }
      // addedVolumes.forEach(processVolume)
      // reducedVolumes.forEach(processVolume)

      const TVLDataPerPool: { [key: string]: any } = {}
      const TVLDataLongable: { [key: string]: any } = {}
      const TVLDataShortable: { [key: string]: any } = {}

      arbProvidedDataProcessed?.forEach((entry: any) => {
        if (!arbPoolMap || !arbPoolMap[entry.pool.toLowerCase()]) return
        const { token0, token1, fee } = arbPoolMap[entry.pool.toLowerCase()]
        const key = getPoolId(token0, token1, fee).toLowerCase()
        if (!TVLDataPerPool[key]) {
          TVLDataPerPool[key] = 0
        }
        if (!TVLDataLongable[key]) {
          TVLDataLongable[key] = 0
        }
        if (!TVLDataShortable[key]) {
          TVLDataShortable[key] = 0
        }
        TVLDataPerPool[key] += entry.amount0
        TVLDataPerPool[key] += entry.amount1

        if (token1.toLowerCase() === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) {
          // when WETH/USDC pool in BASE
          TVLDataLongable[key] += entry.amount1
          TVLDataShortable[key] += entry.amount0
        } else if (token0.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token0 is WETH
          TVLDataLongable[key] += entry.amount0
          TVLDataShortable[key] += entry.amount1
        } else if (token1.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token1 is WETH
          TVLDataLongable[key] += entry.amount1
          TVLDataShortable[key] += entry.amount0
        }
      })

      arbWithdrawDataProcessed?.forEach((entry: any) => {
        if (!arbPoolMap || !arbPoolMap[entry.pool.toLowerCase()]) return

        const { token0, token1, fee } = arbPoolMap[entry.pool.toLowerCase()]
        const key = getPoolId(token0, token1, fee).toLowerCase()

        TVLDataPerPool[key] -= entry.amount0
        TVLDataPerPool[key] -= entry.amount1

        if (token1.toLowerCase() === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) {
          // when WETH/USDC pool in BASE
          TVLDataLongable[key] -= entry.amount1
          TVLDataShortable[key] -= entry.amount0
        } else if (token0.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token0 is WETH
          TVLDataLongable[key] -= entry.amount0
          TVLDataShortable[key] -= entry.amount1
        } else if (token1.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token1 is WETH
          TVLDataLongable[key] -= entry.amount1
          TVLDataShortable[key] -= entry.amount0
        }
      })

      baseProvidedDataProcessed?.forEach((entry: any) => {
        if (!basePoolMap || !basePoolMap[entry.pool.toLowerCase()]) return
        const { token0, token1, fee } = basePoolMap[entry.pool.toLowerCase()]
        const key = getPoolId(token0, token1, fee).toLowerCase()
        if (!TVLDataPerPool[key]) {
          TVLDataPerPool[key] = 0
        }
        if (!TVLDataLongable[key]) {
          TVLDataLongable[key] = 0
        }
        if (!TVLDataShortable[key]) {
          TVLDataShortable[key] = 0
        }

        TVLDataPerPool[key] += entry.amount0
        TVLDataPerPool[key] += entry.amount1


        if (token1.toLowerCase() === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) {
          // when WETH/USDC pool in BASE
          TVLDataLongable[key] += entry.amount1
          TVLDataShortable[key] += entry.amount0
        } else if (token0.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token0 is WETH
          TVLDataLongable[key] += entry.amount0
          TVLDataShortable[key] += entry.amount1
        } else if (token1.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token1 is WETH
          TVLDataLongable[key] += entry.amount1
          TVLDataShortable[key] += entry.amount0
        }
      })

      baseWithdrawDataProcessed?.forEach((entry: any) => {
        if (!basePoolMap || !basePoolMap[entry.pool.toLowerCase()]) return

        const { token0, token1, fee } = basePoolMap[entry.pool.toLowerCase()]
        const key = getPoolId(token0, token1, fee).toLowerCase()

        TVLDataPerPool[key] -= entry.amount0
        TVLDataPerPool[key] -= entry.amount1

        if (token1.toLowerCase() === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) {
          // when WETH/USDC pool in BASE
          TVLDataLongable[key] -= entry.amount1
          TVLDataShortable[key] -= entry.amount0
        } else if (token0.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token0 is WETH
          TVLDataLongable[key] -= entry.amount0
          TVLDataShortable[key] -= entry.amount1
        } else if (token1.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token1 is WETH
          TVLDataLongable[key] -= entry.amount1
          TVLDataShortable[key] -= entry.amount0
        }
      })

      Object.keys(arbAvailableLiquidities).forEach((key) => {
        if (!TVLDataPerPool.hasOwnProperty(key)) {
          TVLDataPerPool[key] = 0
        }
        if (!TVLDataLongable.hasOwnProperty(key)) {
          TVLDataLongable[key] = 0
        }
        if (!TVLDataShortable.hasOwnProperty(key)) {
          TVLDataShortable[key] = 0
        }
      })

      Object.keys(baseAvailableLiquidities).forEach((key) => {
        if (!TVLDataPerPool.hasOwnProperty(key)) {
          TVLDataPerPool[key] = 0
        }
        if (!TVLDataLongable.hasOwnProperty(key)) {
          TVLDataLongable[key] = 0
        }
        if (!TVLDataShortable.hasOwnProperty(key)) {
          TVLDataShortable[key] = 0
        }
      })

      Object.keys(TVLDataPerPool).forEach((key) => {
        const isInverted =
          key.toLowerCase().includes('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) || // WETH/USDC pool in BASE
          key.toLowerCase().includes('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'.toLowerCase()) || // WETH/USDC pool in ARBITRUM
          key.toLowerCase().includes('0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f-0x82af49447d8a07e3bd95bd0d56f35241523fbab1-500'.toLowerCase()) // WBTC/WETH pool in ARBITRUM

        const availableLiquidity = arbAvailableLiquidities[key]
          ? limwethPrice * arbAvailableLiquidities[key].shiftedBy(-18).toNumber()
          : baseAvailableLiquidities[key]
          ? limwethPrice * baseAvailableLiquidities[key].shiftedBy(-18).toNumber()
          : 0

        // if (key === '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe-0x4200000000000000000000000000000000000006-10000') {
        //   console.log(
        //     'zeke:v2',
        //     availableLiquidity,
        //     limwethPrice,
        //     parseFloat())
        //   )
        // }
        poolToData[key.toLowerCase()] = {
          totalValueLocked: TVLDataPerPool[key.toLowerCase()],
          volume: totalVolume, // totalAmountsByPool?.[key.toLowerCase()] ?? 0,
          longableLiquidity: isInverted
            ? TVLDataLongable[key.toLowerCase()]
            : TVLDataLongable[key.toLowerCase()] + availableLiquidity,
          shortableLiquidity: isInverted
            ? TVLDataShortable[key.toLowerCase()] + availableLiquidity
            : TVLDataShortable[key.toLowerCase()],
          test0: isInverted ? 0 : availableLiquidity,
          test1: isInverted ? availableLiquidity : 0,
          numberOfTrades,
        }
      })

      console.timeEnd('USE MEMO POOL TO DATA')
      return poolToData
    } catch (err) {
      console.log('zeke:', err)
    }
    return undefined
  }, [isAllLoaded])

  return useMemo(() => {
    console.log('POOL TO DATA', poolToData)
    return {
      loading: !isAllLoaded,
      result: poolToData,
      error: isError,
    }
  }, [poolToData, isAllLoaded])
}
