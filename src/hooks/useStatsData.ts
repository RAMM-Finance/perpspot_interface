import { Interface } from '@ethersproject/abi'
import IUniswapV3PoolStateABI from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { SqrtPriceMath, TickMath } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { getPoolId } from 'components/PositionTable/LeveragePositionTable/TokenRow'
import { SupportedChainId } from 'constants/chains'
import { VOLUME_STARTPOINT } from 'constants/misc'
import { ethers } from 'ethers'
import { collection, getDocs, setDoc, doc, query, where } from 'firebase/firestore'
import { firestore } from 'firebaseConfig'
import { client, clientBase, fetchAllData } from 'graphql/limitlessGraph/limitlessClients'
import {
  AddVolumeQuery,
  LiquidityProvidedQuery,
  LiquidityWithdrawnQuery,
  ReduceVolumeQuery,
} from 'graphql/limitlessGraph/queries'
import JSBI from 'jsbi'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery } from 'react-query'

import { IUniswapV3PoolStateInterface } from '../types/v3/IUniswapV3PoolState'
import { useDataProviderContract } from './useContract'
import { getDecimalAndUsdValueData } from './useUSDPrice'

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI.abi) as IUniswapV3PoolStateInterface

export function useRenderCount() {
  const renderCountRef = useRef(0)
  useEffect(() => {
    renderCountRef.current++
    console.log(`Render count: ${renderCountRef.current}`)
  })
}

export interface TvlByDay {
  timestamp: number;
  tvl: number;
}

export interface VolumeByDay {
  timestamp: number;
  volume: number;
}

export interface StatsData {
  totalTvl: number;
  tvlByDay: TvlByDay[];
  totalVolume: number;
  volumeByDay: VolumeByDay[];
}

export function useStatsData(): {
  loading: boolean
  result: StatsData | undefined
  error: boolean
} {
  const { chainId } = useWeb3React()
  const dataProvider = useDataProviderContract()
  const queryKey = useMemo(() => {
    if (!chainId || !dataProvider) return []
    return ['queryPoolsData', chainId, dataProvider.address]
  }, [chainId, dataProvider])

  const { data, isLoading, isError, refetch } = useQuery(
    queryKey,
    async () => {
      if (!dataProvider) throw Error('missing dataProvider')
      if (!chainId) throw Error('missing chainId')
      try {
        const clientToUse = chainId === SupportedChainId.BASE ? clientBase : client

        const [AddQueryData, ReduceQueryData, ProvidedQueryData, WithdrawnQueryData] = await Promise.all([
          fetchAllData(AddVolumeQuery, clientToUse),
          fetchAllData(ReduceVolumeQuery, clientToUse),
          fetchAllData(LiquidityProvidedQuery, clientToUse),
          fetchAllData(LiquidityWithdrawnQuery, clientToUse),
        ])
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

        const [addQuerySnapshot, reduceQuerySnapshot, prevPriceQuerySnapshot] = await Promise.all([
          getDocs(queryAdd),
          getDocs(queryReduce),
          getDocs(queryPrevPrice),
        ])

        const addData = addQuerySnapshot.docs.map((doc) => doc.data())
        const reduceData = reduceQuerySnapshot.docs.map((doc) => doc.data())
        const prevPriceData = prevPriceQuerySnapshot.docs.map((doc) => doc.data())

        const pools = new Set<string>()
        ProvidedQueryData?.forEach((entry: any) => {
          const pool = ethers.utils.getAddress(entry.pool)
          if (!pools.has(pool)) {
            pools.add(pool)
          }
        })

        const uniqueTokens_ = new Map<string, any>()
        await Promise.all(
          Array.from(pools).map(async (pool: any) => {
            const token = await dataProvider.getPoolkeys(pool)
            if (token) {
              const poolAdress = ethers.utils.getAddress(pool)
              if (!uniqueTokens_.has(poolAdress)) {
                const [value0, value1] = await Promise.all([
                  getDecimalAndUsdValueData(chainId, token[0]),
                  getDecimalAndUsdValueData(chainId, token[1]),
                ])

                uniqueTokens_.set(poolAdress, [
                  ethers.utils.getAddress(token[0]),
                  ethers.utils.getAddress(token[1]),
                  token[2],
                  value0,
                  value1,
                ])
              }
              return { poolAdress: (token[0], token[1], token[2]) }
            } else return null
          })
        )

        return {
          uniquePools: Array.from(pools),
          uniqueTokens: uniqueTokens_,
          addData: AddQueryData,
          reduceData: ReduceQueryData,
          providedData: ProvidedQueryData,
          withdrawnData: WithdrawnQueryData,
          addedVolumes: addData,
          reducedVolumes: reduceData,
          prevPriceData,
          useQueryChainId: chainId,
        }
      } catch (err) {
        console.log('zeke:', err)
        throw err
      }
    },
    {
      refetchOnMount: false,
      staleTime: 60 * 1000,
      keepPreviousData: true,
      enabled: queryKey.length > 0,
    }
  )

  // console.log('zeke:', data, isError, isLoading)

  useEffect(() => {
    if (chainId) {
      refetch()
    }
  }, [chainId, refetch])

  const slot0s = [] as any

  const statsData = useMemo(() => {
    if (isLoading || isError || !data) return undefined

    const {
      uniquePools,
      uniqueTokens,
      providedData,
      withdrawnData,
      addData,
      reduceData,
      addedVolumes,
      reducedVolumes,
      prevPriceData,
      useQueryChainId,
    } = data

    if (chainId !== useQueryChainId) return undefined

    const slot0ByPool: { [key: string]: any } = {}
    const slot0ByPoolAddress: { [key: string]: any } = {}
    uniquePools?.forEach((pool: any, index: any) => {
      const slot0 = slot0s[index]
      if (slot0 && uniqueTokens.get(pool)) {
        const poolAdress = ethers.utils.getAddress(pool)
        if (!slot0ByPoolAddress[poolAdress]) {
          slot0ByPoolAddress[poolAdress] = slot0.result
        }
      }
    })

    const processLiqEntry = (entry: any) => {
      const pool = ethers.utils.getAddress(entry.pool)
      const curTick = slot0ByPoolAddress[pool]?.tick

      // if (!curTick) curTick = slot0ByPoolAddress?.[pool]?.tick
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
      } else {
        amount1 = SqrtPriceMath.getAmount1Delta(
          TickMath.getSqrtRatioAtTick(entry.tickLower),
          TickMath.getSqrtRatioAtTick(entry.tickUpper),
          JSBI.BigInt(entry.liquidity.toString()),
          false
        ).toString()
        amount0 = '0'
      }

      const tokens = uniqueTokens.get(pool)

      const token0InfoFromUniswap = tokens[3]
      const token1InfoFromUniswap = tokens[4]

      return {
        pool,
        recipient: entry.recipient,
        amount0:
          (parseFloat(token0InfoFromUniswap?.lastPriceUSD) * Number(amount0)) / 10 ** token0InfoFromUniswap.decimals,
        amount1:
          (parseFloat(token1InfoFromUniswap?.lastPriceUSD) * Number(amount1)) / 10 ** token1InfoFromUniswap.decimals,
        timestamp: entry.blockTimestamp,
      }
    }
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    date.setUTCHours(0, 0, 0, 0)
    const oneMonthAgo = Math.floor(date.getTime() / 1000)

    const ProvidedDataFiltered: any[] = providedData?.filter((entry: any) => true) //entry.blockTimestamp >= oneMonthAgo)
    const ProvidedDataProcessed = ProvidedDataFiltered?.map(processLiqEntry)

    const WithdrawDataFiltered: any[] = withdrawnData?.filter((entry: any) => true) //entry.blockTimestamp >= oneMonthAgo)
    const WithdrawDataProcessed = WithdrawDataFiltered?.map(processLiqEntry)

    const addDataFiltered: any[] = addData?.filter((entry: any) => true) //entry.blockTimestamp >= oneMonthAgo)
    const reduceDataFiltered: any[] = reduceData?.filter((entry: any) => true) //entry.blockTimestamp >= oneMonthAgo)

    const addDataProcessed = addDataFiltered?.map((entry: any) => ({
      key: entry.pool,
      token: entry.positionIsToken0
        ? uniqueTokens?.get(ethers.utils.getAddress(entry.pool))?.[0]
        : uniqueTokens?.get(ethers.utils.getAddress(entry.pool))?.[1],
      amount: entry.addedAmount,
      timestamp: parseInt(entry.blockTimestamp)
    }))
    const reduceDataProcessed = reduceDataFiltered?.map((entry: any) => ({
      key: entry.pool,
      token: entry.positionIsToken0
        ? uniqueTokens?.get(ethers.utils.getAddress(entry.pool))?.[0]
        : uniqueTokens?.get(ethers.utils.getAddress(entry.pool))?.[1],
      amount: entry.reduceAmount,
      timestamp: parseInt(entry.blockTimestamp)
    }))

    const processEntry = (entry: any) => {
      const pool = ethers.utils.getAddress(entry.key)

      if (uniqueTokens.get(pool)) {
        const tokens = uniqueTokens?.get(pool)
        let totalValue

        const newKey = getPoolId(tokens[0], tokens[1], tokens[2])

        const data = prevPriceData?.find((entry: any) => entry.poolId === newKey)

        const token0Addr = data?.token0
        const token1Addr = data?.token1
        const token0PriceUSD = data?.token0Price
        const token1PriceUSD = data?.token1Price
        const token0Decimals = data?.token0Decimals
        const token1Decimals = data?.token1Decimals

        if (token0Addr?.toLowerCase() === entry.token.toString().toLowerCase()) {
          totalValue = (token0PriceUSD * entry.amount) / 10 ** token0Decimals
        } else if (token1Addr?.toLowerCase() === entry.token.toString().toLowerCase()) {
          totalValue = (token1PriceUSD * entry.amount) / 10 ** token1Decimals
        } else {
          totalValue = 0
        }

        return {
          volume: totalValue,
          timestamp: entry.timestamp,
        }
      }
      return {}
    }

    const volumeAdded = addDataProcessed?.map(processEntry)
    const volumeReduced = reduceDataProcessed?.map(processEntry)


    const processVolume = (entry: any) => {
      // if (entry.type === 'ADD') {
      //   if (totalAmountsByPool[entry.poolId]) {
      //     totalAmountsByPool[entry.poolId] += parseFloat(entry.volume)
      //   } else {
      //     totalAmountsByPool[entry.poolId] = parseFloat(entry.volume)
      //   }
      // } else if (entry.type === 'REDUCE') {
      //   if (totalAmountsByPool[entry.poolId]) {
      //     totalAmountsByPool[entry.poolId] += parseFloat(entry.volume)
      //   } else {
      //     totalAmountsByPool[entry.poolId] = parseFloat(entry.volume)
      //   }
      // }
      return {
        volume: entry.volume,
        timestamp: entry.timestamp
      }
    }

    const volumeAdded2 = addedVolumes.map(processVolume)
    const volumeReduced2 = reducedVolumes.map(processVolume)

    // TVL

    const providedDataByDay: { timestamp: number; tvl: number; }[] = ProvidedDataProcessed.reduce((acc, cur) => {
      const date = new Date(cur.timestamp * 1000)
      date.setUTCHours(0, 0, 0, 0)
      const dayTimestamp = date.getTime() / 1000
    
      const existingEntry = acc.find(entry => entry.timestamp === dayTimestamp)
      if (existingEntry) {
        existingEntry.tvl += cur.amount0
        existingEntry.tvl += cur.amount1
      } else {
        let tvl = 0
        tvl += cur.amount0
        tvl += cur.amount1
        acc.push({ timestamp: dayTimestamp, tvl: tvl })
      }
      return acc
    }, [] as { timestamp: number; tvl: number; }[])

    const withdrawDataByDay: { timestamp: number; tvl: number; }[] = WithdrawDataProcessed.reduce((acc, cur) => {
      const date = new Date(cur.timestamp * 1000)
      date.setUTCHours(0, 0, 0, 0)
      const dayTimestamp = date.getTime() / 1000
    
      const existingEntry = acc.find(entry => entry.timestamp === dayTimestamp)
      if (existingEntry) {
        existingEntry.tvl += cur.amount0
        existingEntry.tvl += cur.amount1
      } else {
        let tvl = 0
        tvl += cur.amount0
        tvl += cur.amount1
        acc.push({ timestamp: dayTimestamp, tvl: tvl })
      }
      return acc
    }, [] as { timestamp: number; tvl: number; }[])

    const tvlByDay = providedDataByDay.map(providedData => {
      const correspondingWithdrawData = withdrawDataByDay.find(withdrawData => withdrawData.timestamp === providedData.timestamp);
      const withdrawTvl = correspondingWithdrawData ? correspondingWithdrawData.tvl : 0
      return {
        timestamp: providedData.timestamp,
        tvl: providedData.tvl - withdrawTvl
      };
    })

    const sortedTvlByDay = tvlByDay.sort((a, b) => a.timestamp - b.timestamp)
    
    const totalTvl = sortedTvlByDay.reduce((sum, data) => sum + data.tvl, 0)

    // volume before startpoint

    const volumeAddedByDay1: { timestamp: number; volume: number; }[] = volumeAdded.reduce((acc, cur) => {
      const date = new Date(cur.timestamp * 1000)
      date.setUTCHours(0, 0, 0, 0)
      const dayTimestamp = date.getTime() / 1000
    
      const existingEntry = acc.find(entry => entry.timestamp === dayTimestamp)
      if (existingEntry) {
        existingEntry.volume += cur.volume || 0
      } else {
        let volume = 0
        volume += cur.volume || 0
        acc.push({ timestamp: dayTimestamp, volume: volume })
      }
      return acc
    }, [] as { timestamp: number; volume: number; }[])

    const volumeReducedByDay1: { timestamp: number; volume: number; }[] = volumeReduced.reduce((acc, cur) => {
      const date = new Date(cur.timestamp * 1000)
      date.setUTCHours(0, 0, 0, 0)
      const dayTimestamp = date.getTime() / 1000
    
      const existingEntry = acc.find(entry => entry.timestamp === dayTimestamp)
      if (existingEntry) {
        existingEntry.volume += cur.volume || 0
      } else {
        let volume = 0
        volume += cur.volume || 0
        acc.push({ timestamp: dayTimestamp, volume: volume })
      }
      return acc
    }, [] as { timestamp: number; volume: number; }[])

    console.log("VOLUME ADDED BY DAY", volumeAddedByDay1)
    console.log("VOLUME REDUCED BY DAY", volumeReducedByDay1)

    const volumeAddedByDay2: { timestamp: number; volume: number; }[] = volumeAdded2.reduce((acc, cur) => {
      const date = new Date(cur.timestamp * 1000)
      date.setUTCHours(0, 0, 0, 0)
      const dayTimestamp = date.getTime() / 1000
    
      const existingEntry = acc.find(entry => entry.timestamp === dayTimestamp)
      if (existingEntry) {
        existingEntry.volume += cur.volume || 0
      } else {
        let volume = 0
        volume += cur.volume || 0
        acc.push({ timestamp: dayTimestamp, volume: volume })
      }
      return acc
    }, [] as { timestamp: number; volume: number; }[])

    const volumeReducedByDay2: { timestamp: number; volume: number; }[] = volumeReduced2.reduce((acc, cur) => {
      const date = new Date(cur.timestamp * 1000)
      date.setUTCHours(0, 0, 0, 0)
      const dayTimestamp = date.getTime() / 1000
    
      const existingEntry = acc.find(entry => entry.timestamp === dayTimestamp)
      if (existingEntry) {
        existingEntry.volume += cur.volume || 0
      } else {
        let volume = 0
        volume += cur.volume || 0
        acc.push({ timestamp: dayTimestamp, volume: volume })
      }
      return acc
    }, [] as { timestamp: number; volume: number; }[])

  // 모든 배열에서 타임스탬프 수집
  const allTimestamps = [...volumeAddedByDay1, ...volumeAddedByDay2, ...volumeReducedByDay1, ...volumeReducedByDay2]
    .map(item => item.timestamp)
    .filter((value, index, self) => self.indexOf(value) === index); // 중복 제거

  // 각 타임스탬프에 대해 볼륨 합산
  const volumeByDay = allTimestamps.map(timestamp => {
    const volumeAdded1 = volumeAddedByDay1.find(item => item.timestamp === timestamp)?.volume || 0;
    const volumeAdded2 = volumeAddedByDay2.find(item => item.timestamp === timestamp)?.volume || 0;
    const volumeReduced1 = volumeReducedByDay1.find(item => item.timestamp === timestamp)?.volume || 0;
    const volumeReduced2 = volumeReducedByDay2.find(item => item.timestamp === timestamp)?.volume || 0;

    return {
      timestamp: timestamp,
      volume: volumeAdded1 + volumeAdded2 + volumeReduced1 + volumeReduced2
    };
  });

    const totalVolume = [
      ...volumeAddedByDay1,
      ...volumeAddedByDay2,
      ...volumeReducedByDay1,
      ...volumeReducedByDay2
    ].reduce((acc, cur) => acc + (cur.volume || 0), 0);
    
    console.log("TOTAL VOLUME", totalVolume);

    const sortedVolumeByDay = volumeByDay.sort((a, b) => a.timestamp - b.timestamp)

    if (sortedVolumeByDay.length > 0) {
      sortedVolumeByDay[0].volume += 175000
    }

    const statsData = {
      totalTvl: totalTvl,
      tvlByDay: sortedTvlByDay,
      totalVolume: totalVolume,
      volumeByDay: sortedVolumeByDay
    }
    return statsData
  }, [data, isError, isLoading])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (statsData && isLoading)
      setLoading(false)
  }, [statsData, isLoading])

  return useMemo(() => {
    return {
      loading: loading,
      error: isError,
      result: statsData,
    }
  }, [statsData, loading, isError])
}
