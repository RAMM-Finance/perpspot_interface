import { SupportedChainId } from 'constants/chains'
import { ethers } from 'ethers'
import { clientArbitrum, clientBase, fetchAllData } from 'graphql/limitlessGraph/limitlessClients'
import { AddQuery, ForceClosedQueryV2, ReduceQuery } from 'graphql/limitlessGraph/queries'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useChainId } from 'wagmi'

import { useDataProviderContract } from './useContract'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { usePoolKeyList, PoolContractInfo } from 'state/application/hooks'

export function useHistoryData(address: any) {

  const chainId = useChainId()

  const account = useMemo(() => {
    return ethers.utils.getAddress(address)
  }, [address])

  const queryKey = useMemo(() => {
    if (!account || !chainId) return []
    console.log("queryKey", ['historyToShow', account, chainId])
    return ['historyToShow', account, chainId]
  }, [account, chainId])

  const enabled = useMemo(() => {
    return Boolean(account && chainId)
  }, [account, chainId])
  const fetchData = useCallback(async () => {
    console.log("CHAINID in fetchData", chainId)
    let AddQueryData
    let ReduceQueryData
    let ForceCloseData

    if (chainId === SupportedChainId.BASE) {
      [AddQueryData, ReduceQueryData, ForceCloseData] = await Promise.all([
        fetchAllData(AddQuery, clientBase),
        fetchAllData(ReduceQuery, clientBase),
        fetchAllData(ForceClosedQueryV2, clientBase),
      ])
    } else {
      [AddQueryData, ReduceQueryData, ForceCloseData] = await Promise.all([
        fetchAllData(AddQuery, clientArbitrum),
        fetchAllData(ReduceQuery, clientArbitrum),
        fetchAllData(ForceClosedQueryV2, clientArbitrum),
      ])
    }
    const addQueryFiltered = AddQueryData?.filter((data: any) => {
      if (ethers.utils.getAddress(data.trader) == account) return true
      else return false
    })

    const reduceQueryFiltered = ReduceQueryData?.filter((data: any) => {
      if (ethers.utils.getAddress(data.trader) == account) return true
      else return false
    })

    const forceCloseFiltered = ForceCloseData?.filter((data: any) => {
      if (ethers.utils.getAddress(data.trader) == account) return true
      else return false
    })

    const pools = new Set<string>()
    AddQueryData?.forEach((entry: any) => {
      if (!pools.has(entry.pool)) {
        pools.add(entry.pool)
      }
    })
    ReduceQueryData?.forEach((entry: any) => {
      if (!pools.has(entry.pool)) {
        pools.add(entry.pool)
      }
    })

    ForceCloseData?.forEach((entry: any) => {
      if (!pools.has(entry.pool)) {
        pools.add(entry.pool)
      }
    })
    return {
      queryChainId: chainId,
      addData: addQueryFiltered,
      reduceData: reduceQueryFiltered,
      forceCloseData: forceCloseFiltered,
    }
  }, [chainId, account])

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchData,
    enabled,
    refetchOnMount: false,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })

  const IS_DEFAULT_POOLLIST = true
  const { poolList } = usePoolKeyList(chainId, IS_DEFAULT_POOLLIST)

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

  const history = useMemo(() => {
    if (!poolMap || !data) return

    const { addData, reduceData, forceCloseData, queryChainId } = data
    if (queryChainId !== chainId) return
    const combinedData: any[] = [
      ...addData.map((item: any) => {
        return {
          ...item,
          token0: poolMap[item.pool.toLowerCase()].token0,
          token1: poolMap[item.pool.toLowerCase()].token1,
          actionType: 'Add Position',
        }
      }),
      ...reduceData.map((item: any) => ({
        ...item,
        token0: poolMap[item.pool.toLowerCase()].token0,
        token1: poolMap[item.pool.toLowerCase()].token1,
        actionType: 'Reduce Position',
      })),
      ...forceCloseData.map((item: any) => ({
        ...item,
        token0: poolMap[item.pool.toLowerCase()].token0,
        token1: poolMap[item.pool.toLowerCase()].token1,
        actionType: 'Force Closed',
      })),
    ]
    const sortedCombinedData = combinedData.sort((a, b) => b.blockTimestamp - a.blockTimestamp)
    return sortedCombinedData
  }, [poolMap, data, account])

  return history
}
