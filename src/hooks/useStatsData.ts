import { Interface } from '@ethersproject/abi'
import IUniswapV3PoolStateABI from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { SqrtPriceMath, TickMath } from '@uniswap/v3-sdk'
import { SupportedChainId } from 'constants/chains'
import { VOLUME_STARTPOINT } from 'constants/misc'
import { ethers } from 'ethers'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { firestore } from 'firebaseConfig'
import { client, clientBase, fetchAllData } from 'graphql/limitlessGraph/limitlessClients'
import {
  AddQuery,
  AddVolumeQuery,
  ForceClosedQueryV2,
  LiquidityProvidedQuery,
  LiquidityProvidedQueryV2,
  LiquidityWithdrawnQuery,
  LiquidityWithdrawnQueryV2,
  NftTransferQuery,
  ReduceQuery,
  ReduceVolumeQuery,
  RegisterQueryV2,
} from 'graphql/limitlessGraph/queries'
import JSBI from 'jsbi'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { useChainId } from 'wagmi'

import { IUniswapV3PoolStateInterface } from '../types/v3/IUniswapV3PoolState'
import { useDataProviderContract } from './useContract'
import { getDecimalAndUsdValueData, getMultipleUsdPriceData } from './useUSDPrice'
import { useMultipleContractSingleData } from 'lib/hooks/multicall'
import { getDecimals } from 'utils/getDecimals'

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI.abi) as IUniswapV3PoolStateInterface

export function useRenderCount() {
  const renderCountRef = useRef(0)
  useEffect(() => {
    renderCountRef.current++
    console.log(`Render count: ${renderCountRef.current}`)
  })
}

export interface TvlByDay {
  timestamp: number
  tvl: number
}

export interface VolumeByDay {
  timestamp: number
  volume: number
}

export interface UniqueUsers {
  timestamp: number
  count: number
}

export interface StatsData {
  totalTvl: number
  tvlByDay: TvlByDay[]
  totalVolume: number
  volumeByDay: VolumeByDay[]
  uniqueUsers: UniqueUsers[]
}

export function useStatsData(): {
  loading: boolean
  result: StatsData | undefined
  error: boolean
} {
  const chainId = useChainId()
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

        const [
          AddQueryData,
          ReduceQueryData,
          ProvidedQueryData,
          WithdrawnQueryData,
          AddUsersData,
          ReduceUsersData,
          ForceClosedData,
          TransferData,
          RegisterQueryData,
        ] = await Promise.all([
          fetchAllData(AddVolumeQuery, clientToUse),
          fetchAllData(ReduceVolumeQuery, clientToUse),
          fetchAllData(LiquidityProvidedQueryV2, clientToUse),
          fetchAllData(LiquidityWithdrawnQueryV2, clientToUse),
          fetchAllData(AddQuery, clientToUse),
          fetchAllData(ReduceQuery, clientToUse),
          fetchAllData(ForceClosedQueryV2, clientToUse),
          fetchAllData(NftTransferQuery, clientToUse),
          fetchAllData(RegisterQueryV2, clientToUse),
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

        const currentPools = Array.from(pools)
        
        const storedPoolKeys = JSON.parse(localStorage.getItem('poolKeys') || '[]')
        let hasChanges: boolean = false
        let poolKeysResults: any[]
        if (storedPoolKeys.length !== currentPools.length) {
          hasChanges = true
        } else {
          for (let pool of currentPools) {
            const isPoolPresent = storedPoolKeys.some((storedPoolKey: any) => storedPoolKey.pool === pool)

            if (!isPoolPresent) {
              hasChanges = true
              break
            }
          }
        }

        if (hasChanges) {
          const promises = currentPools.map(pool => dataProvider.getPoolkeys(pool).then(keys => ({ pool, keys })))
          poolKeysResults = await Promise.all(promises)
          localStorage.setItem('poolKeys', JSON.stringify(poolKeysResults))

        } else {
          poolKeysResults = storedPoolKeys
        }

        const tokenIdSet = new Set<string>()
        const tokenPricesMap = new Map<string, number>()

        poolKeysResults.forEach(({ keys }) => {
          tokenIdSet.add(keys[0])
          tokenIdSet.add(keys[1])
        })
        const tokenIdArr = Array.from(tokenIdSet)
        
        const priceResult = await getMultipleUsdPriceData(chainId, tokenIdArr)      
        priceResult.forEach((res: any) => {
          tokenPricesMap.set(res.address.toLowerCase(), res.priceUsd)
        })

        const uniqueTokens_ = new Map<string, any>()

        poolKeysResults.map(({ pool, keys: token }) => {
          if (token) {
            if (!uniqueTokens_.has(pool.toLowerCase())) {
              const token0Data = {
                lastPriceUSD: tokenPricesMap.get(token[0].toLowerCase()),
                decimals: getDecimals(token[0])
              }
      
              const token1Data = {
                lastPriceUSD: tokenPricesMap.get(token[1].toLowerCase()),
                decimals: getDecimals(token[1])
              }
      
              uniqueTokens_.set(pool.toLowerCase(), [
                ethers.utils.getAddress(token[0]),
                ethers.utils.getAddress(token[1]),
                token[2],
                token0Data,
                token1Data,
              ]);
            }
            return { poolAdress: (token[0], token[1], token[2]) }
          } else return null
        })
        // await Promise.all(
        //   Array.from(pools).map(async (pool: any) => {
        //     const token = await dataProvider.getPoolkeys(pool)
        //     if (token) {
        //       // const poolAdress = ethers.utils.getAddress(pool)
        //       if (!uniqueTokens_.has(pool.toLowerCase())) {
        //         const [value0, value1] = await Promise.all([
        //           getDecimalAndUsdValueData(chainId, token[0]),
        //           getDecimalAndUsdValueData(chainId, token[1]),
        //         ])

        //         uniqueTokens_.set(pool.toLowerCase(), [
        //           ethers.utils.getAddress(token[0]),
        //           ethers.utils.getAddress(token[1]),
        //           token[2],
        //           getDecimals(token[0]),
        //           getDecimals(token[1]),
        //         ])
        //       }
        //       return { poolAdress: (token[0], token[1], token[2]) }
        //     } else return null
        //   })
        // )

        return {
          uniquePools: Array.from(pools),
          uniqueTokens: uniqueTokens_,
          addData: AddQueryData,
          reduceData: ReduceQueryData,
          providedData: ProvidedQueryData,
          withdrawnData: WithdrawnQueryData,
          addedVolumes: addData,
          reducedVolumes: reduceData,
          addUsersData: AddUsersData,
          reduceUsersData: ReduceUsersData,
          forceClosedData: ForceClosedData,
          transferData: TransferData,
          registerData: RegisterQueryData,
          prevPriceData,
          useQueryChainId: chainId,
        }
      } catch (err) {
        console.log('useStatsData:', err)
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

  const uniquePools = data?.uniquePools
  const slot0s = useMultipleContractSingleData(uniquePools ? uniquePools : [], POOL_STATE_INTERFACE, 'slot0')

  const statsData = useMemo(() => {

    if (isLoading || isError || !data || slot0s.length === 0 || slot0s.some(slot => slot.loading)) return undefined

    const {
      uniquePools,
      uniqueTokens,
      providedData,
      withdrawnData,
      addData,
      reduceData,
      addedVolumes,
      reducedVolumes,
      addUsersData,
      reduceUsersData,
      forceClosedData,
      transferData,
      registerData,
      prevPriceData,
      useQueryChainId,
    } = data

    const allArraysHaveLength = [
      uniquePools,
      Array.from(uniqueTokens.entries()),
      providedData,
      withdrawnData,
      addData,
      reduceData,
      addedVolumes,
      reducedVolumes,
      addUsersData,
      reduceUsersData,
      forceClosedData,
      transferData,
      registerData,
      prevPriceData,
    ].every(array => array?.length > 0)
  
    if (!allArraysHaveLength) return undefined

    if (chainId !== useQueryChainId) return undefined

    const slot0ByPool: { [key: string]: any } = {}
    const slot0ByPoolAddress: { [key: string]: any } = {}
    uniquePools?.forEach((pool: any, index: any) => {
      const slot0 = slot0s[index]
      if (slot0 && uniqueTokens.get(pool.toLowerCase())) {
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

      const tokens = uniqueTokens.get(pool.toLowerCase())
      
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
        ? uniqueTokens?.get(entry.pool.toLowerCase())?.[0]
        : uniqueTokens?.get(entry.pool.toLowerCase())?.[1],
      amount: entry.addedAmount,
      timestamp: parseInt(entry.blockTimestamp),
    }))
    const reduceDataProcessed = reduceDataFiltered?.map((entry: any) => ({
      key: entry.pool,
      token: entry.positionIsToken0
        ? uniqueTokens?.get(entry.pool.toLowerCase())?.[0]
        : uniqueTokens?.get(entry.pool.toLowerCase())?.[1],
      amount: entry.reduceAmount,
      timestamp: parseInt(entry.blockTimestamp),
    }))

    const addUsersDataProcessed =
      addUsersData?.map((entry: any) => ({
        user: entry.trader.toLowerCase(),
        timestamp: parseInt(entry.blockTimestamp),
      })) || []

    const reduceUsersDataProcessed =
      reduceUsersData?.map((entry: any) => ({
        user: entry.trader.toLowerCase(),
        timestamp: parseInt(entry.blockTimestamp),
      })) || []

    const forceClosedDataProcessed =
      forceClosedData?.map((entry: any) => ({
        user: entry.trader.toLowerCase(),
        timestamp: parseInt(entry.blockTimestamp),
      })) || []

    const transferProcessed =
      transferData?.map((entry: any) => ({
        user:
          entry.from === '0x0000000000000000000000000000000000000000'
            ? entry.to.toLowerCase()
            : entry.from.toLowerCase(),
        timestamp: parseInt(entry.blockTimestamp),
      })) || []

    const registerDataProcessed =
      registerData?.map((entry: any) => ({
        user: entry.account.toLowerCase(),
        timestamp: parseInt(entry.blockTimestamp),
      })) || []

    const allDataProcessed = [
      ...addUsersDataProcessed,
      ...reduceUsersDataProcessed,
      ...forceClosedDataProcessed,
      ...transferProcessed,
      ...registerDataProcessed,
    ]

    const uniqueUsers: { timestamp: number; count: number; users: string[] }[] = allDataProcessed.reduce((acc, cur) => {
      const date = new Date(cur.timestamp * 1000)
      date.setUTCHours(0, 0, 0, 0)
      const dayTimestamp = date.getTime() / 1000

      const existingEntry = acc.find((entry) => entry.timestamp === dayTimestamp)
      if (existingEntry) {
        if (existingEntry.users.includes(cur.user)) {
          existingEntry.users.push(cur.user)
          existingEntry.count += 1
        }
      } else {
        acc.push({ timestamp: dayTimestamp, count: 1, users: [cur.user] })
      }
      return acc
    }, [] as { timestamp: number; count: number; users: string[] }[])

    const sortedUniqueUsers = uniqueUsers
      .map(({ timestamp, count }) => ({ timestamp, count }))
      .sort((a, b) => a.timestamp - b.timestamp)

    const processEntry = (entry: any) => {
      const pool = entry.key.toLowerCase()

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
        timestamp: entry.timestamp,
      }
    }

    const volumeAdded2 = addedVolumes?.map(processVolume)
    const volumeReduced2 = reducedVolumes?.map(processVolume)

    // TVL

    const providedDataByDay: { timestamp: number; tvl: number }[] = ProvidedDataProcessed.reduce((acc, cur) => {
      const date = new Date(cur.timestamp * 1000)
      date.setUTCHours(0, 0, 0, 0)
      const dayTimestamp = date.getTime() / 1000

      const existingEntry = acc.find((entry) => entry.timestamp === dayTimestamp)
      if (existingEntry) {
        existingEntry.tvl += cur.amount0
        existingEntry.tvl += cur.amount1
      } else {
        let tvl = 0
        tvl += cur.amount0
        tvl += cur.amount1
        acc.push({ timestamp: dayTimestamp, tvl })
      }
      return acc
    }, [] as { timestamp: number; tvl: number }[])

    const withdrawDataByDay: { timestamp: number; tvl: number }[] = WithdrawDataProcessed.reduce((acc, cur) => {
      const date = new Date(cur.timestamp * 1000)
      date.setUTCHours(0, 0, 0, 0)
      const dayTimestamp = date.getTime() / 1000

      const existingEntry = acc.find((entry) => entry.timestamp === dayTimestamp)
      if (existingEntry) {
        existingEntry.tvl += cur.amount0
        existingEntry.tvl += cur.amount1
      } else {
        let tvl = 0
        tvl += cur.amount0
        tvl += cur.amount1
        acc.push({ timestamp: dayTimestamp, tvl })
      }
      return acc
    }, [] as { timestamp: number; tvl: number }[])

    const tvlByDay = providedDataByDay.map((providedData) => {
      const correspondingWithdrawData = withdrawDataByDay.find(
        (withdrawData) => withdrawData.timestamp === providedData.timestamp
      )
      const withdrawTvl = correspondingWithdrawData ? correspondingWithdrawData.tvl : 0
      return {
        timestamp: providedData.timestamp,
        tvl: providedData.tvl - withdrawTvl,
      }
    })

    const sortedTvlByDay = tvlByDay.sort((a, b) => a.timestamp - b.timestamp)

    const totalTvl = sortedTvlByDay.reduce((sum, data) => sum + data.tvl, 0)

    // volume before startpoint

    const volumeAddedByDay1: { timestamp: number; volume: number; count: number }[] = volumeAdded?.reduce((acc, cur) => {
      const date = new Date(cur.timestamp * 1000)
      date.setUTCHours(0, 0, 0, 0)
      const dayTimestamp = date.getTime() / 1000

      const existingEntry = acc.find((entry) => entry.timestamp === dayTimestamp)
      if (existingEntry) {
        existingEntry.volume += cur.volume || 0
        existingEntry.count += 1
      } else {
        let volume = 0
        volume += cur.volume || 0
        acc.push({ timestamp: dayTimestamp, volume, count: 1 })
      }
      return acc
    }, [] as { timestamp: number; volume: number; count: number }[])

    const volumeReducedByDay1: { timestamp: number; volume: number; count: number }[] = volumeReduced?.reduce(
      (acc, cur) => {
        const date = new Date(cur.timestamp * 1000)
        date.setUTCHours(0, 0, 0, 0)
        const dayTimestamp = date.getTime() / 1000

        const existingEntry = acc.find((entry) => entry.timestamp === dayTimestamp)
        if (existingEntry) {
          existingEntry.volume += cur.volume || 0
          existingEntry.count += 1
        } else {
          let volume = 0
          volume += cur.volume || 0
          acc.push({ timestamp: dayTimestamp, volume, count: 1 })
        }
        return acc
      },
      [] as { timestamp: number; volume: number; count: number }[]
    )

    const volumeAddedByDay2: { timestamp: number; volume: number; count: number }[] = volumeAdded2?.reduce(
      (acc: any, cur: any) => {
        const date = new Date(cur.timestamp * 1000)
        date.setUTCHours(0, 0, 0, 0)
        const dayTimestamp = date.getTime() / 1000

        const existingEntry = acc.find((entry: any) => entry.timestamp === dayTimestamp)
        if (existingEntry) {
          existingEntry.volume += cur.volume || 0
          existingEntry.count += 1
        } else {
          let volume = 0
          volume += cur.volume || 0
          acc.push({ timestamp: dayTimestamp, volume, count: 1 })
        }
        return acc
      },
      [] as { timestamp: number; volume: number; count: number }[]
    )

    const volumeReducedByDay2: { timestamp: number; volume: number; count: number }[] = volumeReduced2?.reduce(
      (acc: any, cur: any) => {
        const date = new Date(cur.timestamp * 1000)
        date.setUTCHours(0, 0, 0, 0)
        const dayTimestamp = date.getTime() / 1000

        const existingEntry = acc.find((entry: any) => entry.timestamp === dayTimestamp)
        if (existingEntry) {
          existingEntry.volume += cur.volume || 0
          existingEntry.count += 1
        } else {
          let volume = 0
          volume += cur.volume || 0
          acc.push({ timestamp: dayTimestamp, volume, count: 1 })
        }
        return acc
      },
      [] as { timestamp: number; volume: number; count: number }[]
    )

    const allTimestamps = [...volumeAddedByDay1, ...volumeAddedByDay2, ...volumeReducedByDay1, ...volumeReducedByDay2]
      .map((item) => item.timestamp)
      .filter((value, index, self) => self.indexOf(value) === index)

    const volumeByDay = allTimestamps.map((timestamp) => {
      const volumeAdded1 = volumeAddedByDay1.find((item) => item.timestamp === timestamp)
      const volumeAdded2 = volumeAddedByDay2.find((item) => item.timestamp === timestamp)
      const volumeReduced1 = volumeReducedByDay1.find((item) => item.timestamp === timestamp)
      const volumeReduced2 = volumeReducedByDay2.find((item) => item.timestamp === timestamp)

      return {
        timestamp,
        volume:
          (volumeAdded1?.volume || 0) +
          (volumeAdded2?.volume || 0) +
          (volumeReduced1?.volume || 0) +
          (volumeReduced2?.volume || 0),
        count:
          (volumeAdded1?.count || 0) +
          (volumeAdded2?.count || 0) +
          (volumeReduced1?.count || 0) +
          (volumeReduced2?.count || 0),
      }
    })

    const totalVolume = [
      ...volumeAddedByDay1,
      ...volumeAddedByDay2,
      ...volumeReducedByDay1,
      ...volumeReducedByDay2,
    ].reduce((acc, cur) => acc + (cur.volume || 0), 0)

    const sortedVolumeByDay = volumeByDay.sort((a, b) => a.timestamp - b.timestamp)

    if (sortedVolumeByDay.length > 0) {
      sortedVolumeByDay[0].volume += 175000
    }

    const statsData = {
      totalTvl,
      tvlByDay: sortedTvlByDay,
      totalVolume,
      volumeByDay: sortedVolumeByDay,
      uniqueUsers: sortedUniqueUsers,
    }
    return statsData
  }, [data, slot0s, isError, isLoading])

  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (statsData && isLoading) setLoading(false)
  }, [statsData, isLoading])

  return useMemo(() => {
    console.log("STATSDATa", statsData)
    return {
      loading,
      error: isError,
      result: statsData,
    }
  }, [statsData, loading, isError])
}
