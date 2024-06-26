import { Interface } from '@ethersproject/abi'
import IUniswapV3PoolStateJSON from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { SqrtPriceMath, TickMath } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { LMT_QUOTER } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { ethers } from 'ethers'
import { client, clientBase, fetchAllData } from 'graphql/limitlessGraph/limitlessClients'
import {
  AddQuery,
  AddVolumeQuery,
  AddCountQuery,
  ForceClosedCountQuery,
  LiquidityProvidedQueryV2,
  LiquidityWithdrawnQueryV2,
  ReduceQuery,
  ReduceVolumeQuery,
  ReduceCountQuery,
  PremiumDepositedCountQuery,
  PremiumWithdrawnCountQuery,
} from 'graphql/limitlessGraph/queries'
import JSBI from 'jsbi'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { PoolContractInfo, usePoolKeyList } from 'state/application/hooks'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { LmtQuoterSDK } from 'utils/lmtSDK/LmtQuoter'
import { useChainId } from 'wagmi'

import { useDataProviderContract, useLimweth, useSharedLiquidity } from './useContract'
import { useContractCallV2 } from './useContractCall'
import { useAllPoolAndTokenPriceData } from './useUserPriceData'
import { VOLUME_STARTPOINT } from 'constants/misc'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { firestore } from 'firebaseConfig'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateJSON.abi)

export function useRenderCount() {
  const renderCountRef = useRef(0)
  useEffect(() => {
    renderCountRef.current++
    console.log(`Render count: ${renderCountRef.current}`)
  })
}

interface PoolTVLData {
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

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!chainId) throw Error('missing chainId')
      if (!tokenPriceData || Object.keys(tokenPriceData).length === 0) throw Error('missing price provider')
      try {
        const clientToUse = chainId === SupportedChainId.BASE ? clientBase : client
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

        const queryPrevPrice = query(collection(firestore, 'priceUSD-from-1716269264'))

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

        const addData = addQuerySnapshot.docs.map((doc) => doc.data())
        const reduceData = reduceQuerySnapshot.docs.map((doc) => doc.data())
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
          addedVolumes: addData,
          reducedVolumes: reduceData,
          prevPriceData,
          // etc
          useQueryChainId: chainId,
        }
      } catch (err) {
        console.log('useLMTPool:', err)
        throw err
      }
    },
    enabled: dataFetchEnabled,
    refetchOnMount: false,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData
  })

  // const { data, isLoading, isError } = useQuery<any, any, QueryData>({
  //   queryKey,
  //   queryFn: async () => {

  //     if (!chainId) throw Error('missing chainId')
  //     if (!tokenPriceData || Object.keys(tokenPriceData).length === 0) throw Error('missing price provider')
  //     try {
  //       const clientToUse = chainId === SupportedChainId.BASE ? clientBase : client
  //       const timestamp = VOLUME_STARTPOINT
        
  //       const queryAdd = query(
  //         collection(firestore, 'volumes'),
  //         where('timestamp', '>=', timestamp),
  //         where('type', '==', 'ADD')
  //       )

  //       const queryReduce = query(
  //         collection(firestore, 'volumes'),
  //         where('timestamp', '>=', timestamp),
  //         where('type', '==', 'REDUCE')
  //       )

  //       const queryPrevPrice = query(collection(firestore, 'priceUSD-from-1716269264'))

  //       const [
  //         // for TVL
  //         ProvidedQueryData,
  //         WithdrawnQueryData,
  //         // for number of trades
  //         AddUsersCountData,
  //         ReduceUsersCountData,
  //         ForceClosedCountData,
  //         PremiumDepositedCountData,
  //         PremiumWithdrawnCountData,
  //         // for Volumes
  //         AddQueryData,
  //         ReduceQueryData,
  //         addQuerySnapshot,
  //         reduceQuerySnapshot,
  //         prevPriceQuerySnapshot,
  //       ] = await Promise.all([
  //         // for TVL
  //         fetchAllData(LiquidityProvidedQueryV2, clientToUse),
  //         fetchAllData(LiquidityWithdrawnQueryV2, clientToUse),
  //         // for number of trades
  //         fetchAllData(AddCountQuery, clientToUse),
  //         fetchAllData(ReduceCountQuery, clientToUse),
  //         fetchAllData(ForceClosedCountQuery, clientToUse),
  //         fetchAllData(PremiumDepositedCountQuery, clientToUse),
  //         fetchAllData(PremiumWithdrawnCountQuery, clientToUse),
  //         // for Volumes 
  //         fetchAllData(AddVolumeQuery, clientToUse),
  //         fetchAllData(ReduceVolumeQuery, clientToUse),
  //         getDocs(queryAdd),
  //         getDocs(queryReduce),
  //         getDocs(queryPrevPrice),
  //       ])

  //       const addData = addQuerySnapshot.docs.map((doc) => doc.data())
  //       const reduceData = reduceQuerySnapshot.docs.map((doc) => doc.data())
  //       const prevPriceData = prevPriceQuerySnapshot.docs.map((doc) => doc.data())
        
  //       return {
  //         // for TVL
  //         providedData: ProvidedQueryData,
  //         withdrawnData: WithdrawnQueryData,
  //         // for number of trades
  //         addUsersCountData: AddUsersCountData,
  //         reduceUsersCountData: ReduceUsersCountData,
  //         forceClosedCountData: ForceClosedCountData,
  //         premiumDepositedCountData: PremiumDepositedCountData,
  //         premiumWithdrawnCountData: PremiumWithdrawnCountData,
  //         // for Volumes
  //         addData: AddQueryData,
  //         reduceData: ReduceQueryData,
  //         addedVolumes: addData,
  //         reducedVolumes: reduceData,
  //         prevPriceData,
  //         // etc
  //         useQueryChainId: chainId,
  //       }
  //     } catch (err) {
  //       console.log('useLMTPool:', err)
  //       throw err
  //     }
  //   },
  //   refetchOnMount: false,
  //   staleTime: 60 * 1000,
  //   placeholderData: keepPreviousData,
  //   enabled: queryKey.length > 0,
  // })

  const { poolList } = usePoolKeyList()
  const limweth = useLimweth()
  const { result: limWethBalance } = useSingleCallResult(limweth, 'tokenBalance', [])

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
  }, [poolList])

  const availableLiquidities: { [poolId: string]: BN } | undefined = useMemo(() => {
    if (limWethBalance && sharedLiquidity && poolMap) {
      const result: { [poolId: string]: BN } = {}
      sharedLiquidity[0].forEach((info: any) => {
        const poolId = getPoolId(info[0][0], info[0][1], info[0][2])
        const maxPerPair = Number(info[1].toString())
        const exposure = Number(info[2].toString())
        result[poolId] = new BN(maxPerPair).shiftedBy(-18).times(new BN(limWethBalance[0].toString())).minus(exposure)
      })
      return result
    }

    return undefined
  }, [limWethBalance, sharedLiquidity, poolMap])

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

      const test = poolMap[pool.toLowerCase()]

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
      else {
        amount0 = '0'
        amount1 = SqrtPriceMath.getAmount1Delta(
          TickMath.getSqrtRatioAtTick(entry.tickLower),
          TickMath.getSqrtRatioAtTick(entry.tickUpper),
          JSBI.BigInt(entry.liquidity.toString()),
          false
        ).toString()
      } 

      // if (test.token0.toLowerCase() === '0x3B9728bD65Ca2c11a817ce39A6e91808CceeF6FD'.toLowerCase() || test.token1.toLowerCase() === '0x3B9728bD65Ca2c11a817ce39A6e91808CceeF6FD'.toLowerCase()) {
      //   console.log(poolMap[pool.toLowerCase()])
      //   console.log(entry.pool)
      //   console.log("CUR TICK", curTick)
      //   console.log("TickUPPER", entry.tickUpper)
      //   console.log("TickLOWER", entry.tickLower)
      //   console.log("AmOUNT0", amount0)
      //   console.log("AMOUNT1", amount1)
      // }

      // 0x0578d8a44db98b23bf096a382e016e29a5ce0ffe-0x4200000000000000000000000000000000000006-10000
      // :
      // longableLiquidity
      // :
      // 3.2726192155131287e+22
      // shortableLiquidity
      // :
      // 112869.18529308242
      // test0
      // :
      // 3.2726192155131287e+22
      // test1
      // :
      // 0
      // totalValueLocked
      // :
      // 212649.30191607663
      // volume
      // :
      // 0

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
          totalValue: 0
        }
      }

      const token = entry.positionIsToken0
        ? poolMapData.token0
        : poolMapData.token1

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
      
      if (token0Addr?.toLowerCase() === token.toString().toLowerCase()) {
        totalValue = (token0PriceUSD * amount) / 10 ** token0Decimals
      } else if (token1Addr?.toLowerCase() === token.toString().toLowerCase()) {
        totalValue = (token1PriceUSD * amount) / 10 ** token1Decimals
      } else {
        totalValue = 0
      }

      return {
        totalValue
      }
    },
    [poolMap, data, chainId]
  )

  const processFirebaseVolumeEntry = useCallback(
    (entry: any) => {
      return {
        totalValue: parseFloat(entry.volume)
      }
    },
    [chainId]
  )

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
    if (!data || !poolMap || !limwethPrice || !availableLiquidities) return undefined
    try {
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
        addedVolumes, 
        reducedVolumes,
        // for Number of trades 
        addUsersCountData, 
        reduceUsersCountData, 
        forceClosedCountData, 
        premiumDepositedCountData, 
        premiumWithdrawnCountData
      } = data as any

      const ProvidedDataProcessed = providedData?.map(processLiqEntry)
      const WithdrawDataProcessed = withdrawnData?.map(processLiqEntry)
      const totalAmountsByPool: { [key: string]: number } = {}

      const addSubgraphDataVolumes = addData?.map((data: any) => processSubgraphVolumeEntry(data, 'ADD'))
      const reduceSubgraphDataVolumes = reduceData?.map((data: any) => processSubgraphVolumeEntry(data, 'REDUCE'))
      const addedFirebaseVolumes = addedVolumes.map(processFirebaseVolumeEntry)
      const reducedFirebaseVolumes = reducedVolumes.map(processFirebaseVolumeEntry)

      const totalAddedSubgraphVolume = addSubgraphDataVolumes.reduce((acc: any, curr: any) => acc + curr.totalValue, 0)
      const totalReducedSubgraphVolume = reduceSubgraphDataVolumes.reduce((acc: any, curr: any) => acc + curr.totalValue, 0)
      const totalAddedFirebaseVolume = addedFirebaseVolumes.reduce((acc: any, curr: any) => acc + curr.totalValue, 0)
      const totalReducedFirebaseVolume = reducedFirebaseVolumes.reduce((acc: any, curr: any) => acc + curr.totalValue, 0)

      const totalVolume = totalAddedSubgraphVolume + totalReducedSubgraphVolume + totalAddedFirebaseVolume + totalReducedFirebaseVolume

      const numberOfTrades = addUsersCountData.length + reduceUsersCountData.length + forceClosedCountData.length + premiumDepositedCountData.length + premiumWithdrawnCountData.length
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
          // if (token1.toLowerCase() === '0x3B9728bD65Ca2c11a817ce39A6e91808CceeF6FD'.toLowerCase()) {
          //   console.log("BEFORE PROVIDE1", token0, token1)
          //   console.log("PROVIDED AMOUNT1", entry.amount0, entry.amount1)
          // }
          TVLDataLongable[key] += entry.amount0
          TVLDataShortable[key] += entry.amount1
        } else if (token1.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token1 is WETH
          TVLDataLongable[key] += entry.amount1
          TVLDataShortable[key] += entry.amount0
          // if (token0.toLowerCase() === '0x3B9728bD65Ca2c11a817ce39A6e91808CceeF6FD'.toLowerCase()) {
          //   console.log("BEFORE PROVIDE2", token0, token1)
          //   console.log("PROVIDED AMOUNT2", entry.amount0, entry.amount1)
          // }
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
          // if (token1.toLowerCase() === '0x3B9728bD65Ca2c11a817ce39A6e91808CceeF6FD'.toLowerCase()) {
          //   console.log("BEFORE WITHDRAW1", token0, token1)
          //   console.log("WITHDRAWN AMOUNT1", entry.amount0, entry.amount1)
          // }
          TVLDataLongable[key] -= entry.amount0
          TVLDataShortable[key] -= entry.amount1
        } else if (token1.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token1 is WETH
          TVLDataLongable[key] -= entry.amount1
          TVLDataShortable[key] -= entry.amount0
          // if (token0.toLowerCase() === '0x3B9728bD65Ca2c11a817ce39A6e91808CceeF6FD'.toLowerCase()) {
          //   console.log("BEFORE WITHDRAW2", token0, token1)
          //   console.log("WITHDRAWN AMOUNT2", entry.amount0, entry.amount1)
          // }
        }
      })

      Object.keys(TVLDataPerPool).forEach((key) => {
        const isUSDC = key.toLowerCase().includes('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) // when WETH/USDC pool in BASE
        const availableLiquidity = limwethPrice * parseFloat(availableLiquidities[key].shiftedBy(-18).toFixed(0))
        if (!TVLDataPerPool[key] || !TVLDataLongable[key] || !TVLDataShortable[key]) {
          return
        }
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
          test0: isUSDC ? 0 : TVLDataLongable[key.toLowerCase()],
          test1: isUSDC ? TVLDataLongable[key.toLowerCase()] : 0,
          numberOfTrades: numberOfTrades
        }
      })

      return poolToData
    } catch (err) {
      console.log('zeke:', err)
    }
    return undefined
  }, [data, poolMap, limwethPrice, availableLiquidities])

  return useMemo(() => {
    return {
      loading: isLoading,
      result: poolToData,
      error: isError,
    }
  }, [poolToData])
}
