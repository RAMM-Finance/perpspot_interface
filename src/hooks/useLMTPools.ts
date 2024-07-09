import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SqrtPriceMath, TickMath } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { LMT_QUOTER } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { VOLUME_STARTPOINT } from 'constants/misc'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { ethers } from 'ethers'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { firestore } from 'firebaseConfig'
import { clientArbitrum, clientBase, fetchAllData } from 'graphql/limitlessGraph/limitlessClients'
import {
  AddCountQuery,
  AddVolumeQuery,
  ForceClosedCountQuery,
  LiquidityProvidedQueryV2,
  LiquidityWithdrawnQueryV2,
  PremiumDepositedCountQuery,
  PremiumWithdrawnCountQuery,
  ReduceCountQuery,
  ReduceVolumeQuery,
} from 'graphql/limitlessGraph/queries'
import JSBI from 'jsbi'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { PoolContractInfo, usePoolKeyList } from 'state/application/hooks'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { LmtQuoterSDK } from 'utils/lmtSDK/LmtQuoter'
import { useChainId } from 'wagmi'

import { useLimweth } from './useContract'
import { useContractCallV2 } from './useContractCall'
import { useAllPoolAndTokenPriceData } from './useUserPriceData'
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
  }
}

export function usePoolsTVLandVolume(): {
  loading: boolean
  result: PoolTVLData | undefined
  error: boolean
} {
  const chainId = useChainId()
  const { tokens: tokenPriceData } = useAllPoolAndTokenPriceData()

  const queryKey = useMemo(() => {
    if (!chainId || !tokenPriceData || Object.keys(tokenPriceData).length === 0) return []
    return ['queryPoolsData', chainId]
  }, [chainId, tokenPriceData])

  const dataFetchEnabled = useMemo(() => {
    return Boolean(tokenPriceData && Object.entries(tokenPriceData).length > 0 && chainId)
  }, [chainId, tokenPriceData])

  const fetchTVLandVolumeData = useCallback(async () => {
    if (!chainId) throw Error('missing chainId')
    if (!tokenPriceData || Object.keys(tokenPriceData).length === 0) throw Error('missing token price data')
    try {
      const clientToUse = chainId === SupportedChainId.BASE ? clientBase : clientArbitrum
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

      const queryPrevPrice = query(
        collection(
          firestore,
          chainId === SupportedChainId.BASE ? 'priceUSD-from-1716269264' : 'priceUSD-from-1720161621-arbitrum'
        )
      )

      // console.time("fetchAllData LiquidityProvidedQueryV2");
      // const res1 = await fetchAllData(LiquidityProvidedQueryV2, clientToUse);
      // console.timeEnd("fetchAllData LiquidityProvidedQueryV2");
      // console.log("fetchAllData provided", res1)
      
      // console.time("fetchAllData LiquidityWithdrawnQueryV2");
      // const res2 = await fetchAllData(LiquidityWithdrawnQueryV2, clientToUse);
      // console.timeEnd("fetchAllData LiquidityWithdrawnQueryV2");
      // console.log("fetchAllData liwthdrawn", res2)

      // console.time("fetchAllData AddCountQuery");
      // await fetchAllData(AddCountQuery, clientToUse);
      // console.timeEnd("fetchAllData AddCountQuery");

      // console.time("fetchAllData ReduceCountQuery");
      // await fetchAllData(ReduceCountQuery, clientToUse);
      // console.timeEnd("fetchAllData ReduceCountQuery");

      // console.time("fetchAllData ForceClosedCountQuery");
      // await fetchAllData(ForceClosedCountQuery, clientToUse);
      // console.timeEnd("fetchAllData ForceClosedCountQuery");

      // console.time("fetchAllData PremiumDepositedCountQuery");
      // await fetchAllData(PremiumDepositedCountQuery, clientToUse);
      // console.timeEnd("fetchAllData PremiumDepositedCountQuery");

      // console.time("fetchAllData PremiumWithdrawnCountQuery");
      // await fetchAllData(PremiumWithdrawnCountQuery, clientToUse);
      // console.timeEnd("fetchAllData PremiumWithdrawnCountQuery");

      // console.time("fetchAllData AddVolumeQuery");
      // const res3 = await fetchAllData(AddVolumeQuery, clientToUse);
      // console.timeEnd("fetchAllData AddVolumeQuery");
      // console.log("RES3", res3.length)

      // console.time("fetchAllData ReduceVolumeQuery");
      // const res4 = await fetchAllData(ReduceVolumeQuery, clientToUse);
      // console.timeEnd("fetchAllData ReduceVolumeQuery");
      // console.log("RES4", res4.length)

      // console.time("getDocs queryAdd");
      // await getDocs(queryAdd);
      // console.timeEnd("getDocs queryAdd");

      // console.time("getDocs queryReduce");
      // await getDocs(queryReduce);
      // console.timeEnd("getDocs queryReduce");

      // console.time("getDocs queryPrevPrice");
      // await getDocs(queryPrevPrice);
      // console.timeEnd("getDocs queryPrevPrice");

      console.time("PROMISE ALL")
      const [
        // for TVL
        ProvidedQueryData,
        WithdrawnQueryData,
        // for number of trades
        AddUsersCountData,
        ReduceUsersCountData,
        ForceClosedCountData,
        PremiumDepositedCountData,
        PremiumWithdrawnCountData,
        // for Volumes
        AddQueryData,
        ReduceQueryData,
        addQuerySnapshot,
        reduceQuerySnapshot,
        prevPriceQuerySnapshot,
      ] = await Promise.all([
        // for TVL
        fetchAllData(LiquidityProvidedQueryV2, clientToUse),
        fetchAllData(LiquidityWithdrawnQueryV2, clientToUse),
        // for number of trades
        fetchAllData(AddCountQuery, clientToUse),
        fetchAllData(ReduceCountQuery, clientToUse),
        fetchAllData(ForceClosedCountQuery, clientToUse),
        fetchAllData(PremiumDepositedCountQuery, clientToUse),
        fetchAllData(PremiumWithdrawnCountQuery, clientToUse),
        // for Volumes
        fetchAllData(AddVolumeQuery, clientToUse),
        fetchAllData(ReduceVolumeQuery, clientToUse),
        getDocs(queryAdd),
        getDocs(queryReduce),
        getDocs(queryPrevPrice),
      ])
      console.timeEnd("PROMISE ALL")

      const addData = addQuerySnapshot.docs
        .map((doc) => doc.data())
        .filter((data) =>
          chainId === SupportedChainId.BASE
            ? data.chainId === chainId || data.chainId === undefined
            : data.chainId === chainId
        )
      const reduceData = reduceQuerySnapshot.docs
        .map((doc) => doc.data())
        .filter((data) =>
          chainId === SupportedChainId.BASE
            ? data.chainId === chainId || data.chainId === undefined
            : data.chainId === chainId
        )

      console.log("addData", AddQueryData.length, ReduceQueryData.length)

      const prevPriceData = prevPriceQuerySnapshot.docs.map((doc) => doc.data())

      return {
        // for TVL
        providedData: ProvidedQueryData,
        withdrawnData: WithdrawnQueryData,
        // for number of trades
        addUsersCountData: AddUsersCountData,
        reduceUsersCountData: ReduceUsersCountData,
        forceClosedCountData: ForceClosedCountData,
        premiumDepositedCountData: PremiumDepositedCountData,
        premiumWithdrawnCountData: PremiumWithdrawnCountData,
        // for Volumes
        addData: AddQueryData,
        reduceData: ReduceQueryData,
        addedFirebaseVolumes: addData,
        reducedFirebaseVolumes: reduceData,
        prevPriceData,
        // etc
        useQueryChainId: chainId,
      }
    } catch (err) {
      console.log('fetchData Error in useLMTPools:', err)
      throw err
    }
  }, [chainId, tokenPriceData])

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

  const { poolList } = usePoolKeyList()
  const limweth = useLimweth()
  const { result: limWethBalance, loading: limWethLoading } = useSingleCallResult(limweth, 'tokenBalance', [])

  const sharedLiquidityCallState = useContractCallV2(
    LMT_QUOTER,
    LmtQuoterSDK.INTERFACE.encodeFunctionData('getSharedLiquidityInfo'),
    ['getSharedLiquidityInfo'],
    false,
    true,
    (data) => {
      return LmtQuoterSDK.INTERFACE.decodeFunctionResult('getSharedLiquidityInfo', data)
    }
  )

  const sharedLiquidity = sharedLiquidityCallState?.result

  const limwethPrice = useMemo(() => {
    if (tokenPriceData && limweth && chainId) {
      const weth = WRAPPED_NATIVE_CURRENCY[chainId]?.address
      return weth ? tokenPriceData[weth.toLowerCase()]?.usdPrice : undefined
    }
    return undefined
  }, [tokenPriceData, limweth, chainId])

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
  }, [poolList, chainId])

  const availableLiquidities: { [poolId: string]: BN } | undefined = useMemo(() => {
    if (!limWethLoading && chainId && limWethBalance !== undefined && sharedLiquidity && poolMap) {
      const result: { [poolId: string]: BN } = {}

      sharedLiquidity[0].forEach((info: any) => {
        const poolId = getPoolId(info[0][0], info[0][1], info[0][2])
        const maxPerPair = Number(info[1].toString())
        const exposure = Number(info[2].toString())
        // console.log("MAX PER PAIR, LIMBAL, EXPOSRUE", maxPerPair, limWethBalance[0], exposure)
        result[poolId] = new BN(maxPerPair).shiftedBy(-18).times(new BN(limWethBalance[0].toString())).minus(exposure)
      })
      return result
    }

    return undefined
  }, [limWethBalance, limWethLoading, sharedLiquidity, poolMap, chainId])

  const processLiqEntry = useCallback(
    (entry: any) => {
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
        amount0 = '0'
        amount1 = SqrtPriceMath.getAmount1Delta(
          TickMath.getSqrtRatioAtTick(entry.tickLower),
          TickMath.getSqrtRatioAtTick(entry.tickUpper),
          JSBI.BigInt(entry.liquidity.toString()),
          false
        ).toString()
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
        amount1: (token1Usd * Number(amount1)) / 10 ** decimals1,
      }
    },
    [poolMap, tokenPriceData, limwethPrice, limWethBalance, sharedLiquidity, chainId, limweth]
  )

  const processSubgraphVolumeEntry = useCallback(
    (entry: any, processType: string) => {
      if (!poolMap || !Object.keys(poolMap).length || !data) return
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

      const prevPrice = data.prevPriceData?.find((prevPrice: any) => prevPrice.poolId === newKey)

      const token0Addr = prevPrice?.token0
      const token1Addr = prevPrice?.token1
      const token0PriceUSD = prevPrice?.token0Price
      const token1PriceUSD = prevPrice?.token1Price
      const token0Decimals = prevPrice?.token0Decimals
      const token1Decimals = prevPrice?.token1Decimals

      // console.log("toknePriceData", tokenPriceData, poolMapData.token0, poolMapData.token1)

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
    [poolMap, data, chainId]
  )

  const processFirebaseVolumeEntry = useCallback(
    (entry: any) => {
      return {
        totalValue: parseFloat(entry.volume),
      }
    },
    [chainId]
  )

  const isAllLoaded = useMemo(() => {
    // console.log('isLoading:', isLoading);
    // console.log('data:', data);
    // console.log('poolMap:', poolMap);
    // console.log('limwethPrice:', limwethPrice);
    // console.log('availableLiquidities:', availableLiquidities);
    // console.log('chainId:', chainId);
    return Boolean(!isLoading && data && poolMap && limwethPrice && availableLiquidities && chainId)
  }, [isLoading, data, poolMap, limwethPrice, availableLiquidities, chainId])

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
    if (!data || isLoading || !poolMap || !limwethPrice || !availableLiquidities || !chainId) return undefined
    try {
      console.log("DEPS", isAllLoaded, chainId)
      console.time("POOL TO DATA START")
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
        providedData,
        withdrawnData,
        // for Volumes
        addData,
        reduceData,
        addedFirebaseVolumes,
        reducedFirebaseVolumes,
        // for Number of trades
        addUsersCountData,
        reduceUsersCountData,
        forceClosedCountData,
        premiumDepositedCountData,
        premiumWithdrawnCountData,
      } = data as any

      console.time("PROV PROC")
      const ProvidedDataProcessed = providedData?.map(processLiqEntry)
      console.timeEnd("PROV PROC")
      console.time("WITH PROC")
      const WithdrawDataProcessed = withdrawnData?.map(processLiqEntry)
      console.timeEnd("WITH PROC")
      const addSubgraphDataVolumes = addData?.map((data: any) => processSubgraphVolumeEntry(data, 'ADD'))
      const reduceSubgraphDataVolumes = reduceData?.map((data: any) => processSubgraphVolumeEntry(data, 'REDUCE'))
      const processedAddedFirebaseVolumes = addedFirebaseVolumes.map(processFirebaseVolumeEntry)
      const processedReducedFirebaseVolumes = reducedFirebaseVolumes.map(processFirebaseVolumeEntry)

      const totalAddedSubgraphVolume = addSubgraphDataVolumes.reduce((acc: any, curr: any) => acc + curr.totalValue, 0)
      const totalReducedSubgraphVolume = reduceSubgraphDataVolumes.reduce(
        (acc: any, curr: any) => acc + curr.totalValue,
        0
      )
      const totalAddedFirebaseVolume = processedAddedFirebaseVolumes.reduce(
        (acc: any, curr: any) => acc + curr.totalValue,
        0
      )
      const totalReducedFirebaseVolume = processedReducedFirebaseVolumes.reduce(
        (acc: any, curr: any) => acc + curr.totalValue,
        0
      )

      const totalVolume =
        totalAddedSubgraphVolume + totalReducedSubgraphVolume + totalAddedFirebaseVolume + totalReducedFirebaseVolume

      const numberOfTrades =
        addUsersCountData.length +
        reduceUsersCountData.length +
        forceClosedCountData.length +
        premiumDepositedCountData.length +
        premiumWithdrawnCountData.length
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

      ProvidedDataProcessed?.forEach((entry: any) => {
        if (!poolMap || !poolMap[entry.pool.toLowerCase()]) return
        const { token0, token1, fee } = poolMap[entry.pool.toLowerCase()]
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

      WithdrawDataProcessed?.forEach((entry: any) => {
        if (!poolMap || !poolMap[entry.pool.toLowerCase()]) return

        const { token0, token1, fee } = poolMap[entry.pool.toLowerCase()]
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

      Object.keys(availableLiquidities).forEach((key) => {
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
        const isUSDC =
          chainId === SupportedChainId.BASE
            ? key.toLowerCase().includes('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) // when WETH/USDC pool in BASE
            : chainId === SupportedChainId.ARBITRUM_ONE
            ? key.toLowerCase().includes('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'.toLowerCase()) // when WETH/USDC pool in ARBITRUM
            : key.toLowerCase().includes('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) // default: BASE

        const availableLiquidity = limwethPrice * parseFloat(availableLiquidities[key].shiftedBy(-18).toFixed(0))

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
          longableLiquidity: isUSDC
            ? TVLDataLongable[key.toLowerCase()]
            : TVLDataLongable[key.toLowerCase()] + availableLiquidity,
          shortableLiquidity: isUSDC
            ? TVLDataShortable[key.toLowerCase()] + availableLiquidity
            : TVLDataShortable[key.toLowerCase()],
          test0: isUSDC ? 0 : availableLiquidity,
          test1: isUSDC ? availableLiquidity : 0,
          numberOfTrades,
        }
      })

      console.timeEnd("POOL TO DATA START")
      return poolToData
    } catch (err) {
      console.log('zeke:', err)
    }
    return undefined
  }, [isAllLoaded, chainId])

  return useMemo(() => {
    return {
      loading: !isAllLoaded,
      result: poolToData,
      error: isError,
    }
  }, [poolToData, isAllLoaded, chainId])
}
