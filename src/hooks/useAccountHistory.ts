import { SupportedChainId } from 'constants/chains'
import { ethers } from 'ethers'
import { clientArbitrum, clientBase, fetchAllData } from 'graphql/limitlessGraph/limitlessClients'
import { AddQuery, ForceClosedQueryV2, ReduceQuery } from 'graphql/limitlessGraph/queries'
import { useEffect, useMemo, useState } from 'react'
import { useChainId } from 'wagmi'

import { useDataProviderContract } from './useContract'

export function useHistoryData(address: any) {
  const [addData, setAddData] = useState<any>([])
  const [reduceData, setReduceData] = useState<any>([])
  const [forceCloseData, setForceCloseData] = useState<any>([])
  const [addOrderData, setAddOrderData] = useState<any>([])
  const dataProvider = useDataProviderContract()
  const [uniqueTokens, setUniqueTokens] = useState<any>()

  const chainId = useChainId()

  const account = useMemo(() => {
    return ethers.utils.getAddress(address)
  }, [address])
  useEffect(() => {
    if (!clientArbitrum || !dataProvider) return

    const call = async () => {
      let AddQueryData
      let ReduceQueryData
      let ForceCloseData

      if (chainId === SupportedChainId.BASE) {
        ;[AddQueryData, ReduceQueryData, ForceCloseData] = await Promise.all([
          fetchAllData(AddQuery, clientBase),
          fetchAllData(ReduceQuery, clientBase),
          fetchAllData(ForceClosedQueryV2, clientBase),
        ])
      } else {
        ;[AddQueryData, ReduceQueryData, ForceCloseData] = await Promise.all([
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

      const uniqueTokens_ = new Map<string, any>()
      const uniqueTokensFromLS: any[] = JSON.parse(localStorage.getItem('uniqueTokens') || '[]')

      let hasNew = false
      for (const pool of pools) {
        const pool_ = ethers.utils.getAddress(pool)
        hasNew = !uniqueTokensFromLS.some((token: any) => token[0].toLowerCase() === pool.toLowerCase())
        if (hasNew) {
          break
        }
      }

      if (hasNew) {
        try {
          await Promise.all(
            Array.from(pools).map(async (pool: any) => {
              const token = await dataProvider?.getPoolkeys(pool)
              if (token) {
                if (!uniqueTokens_.has(pool)) {
                  uniqueTokens_.set(pool.toLowerCase(), [token[0], token[1]])
                }
                return { pool_: (token[0], token[1]) }
              } else return null
            })
          )
          const uniqueTokensArray = Array.from(uniqueTokens_.entries())
          localStorage.setItem('uniqueTokens', JSON.stringify(uniqueTokensArray))
          setUniqueTokens(uniqueTokens_)
        } catch (err) {
          console.log('tokens fetching ', err)
        }
      } else {
        const uniqueTokens_ = new Map(uniqueTokensFromLS)
        setUniqueTokens(uniqueTokens_)
      }

      setAddData(addQueryFiltered)
      setReduceData(reduceQueryFiltered)
      setForceCloseData(forceCloseFiltered)
    }

    call()
  }, [clientArbitrum, clientBase, account])

  const history = useMemo(() => {
    if (!addOrderData || !reduceData || !forceCloseData || !uniqueTokens) return
    const combinedData: any[] = [
      ...addData.map((item: any) => {
        return {
          ...item,
          token0: uniqueTokens.get(item.pool.toLowerCase())[0],
          token1: uniqueTokens.get(item.pool.toLowerCase())[1],
          actionType: 'Add Position',
        }
      }),
      ...reduceData.map((item: any) => ({
        ...item,
        token0: uniqueTokens.get(item.pool.toLowerCase())[0],
        token1: uniqueTokens.get(item.pool.toLowerCase())[1],
        actionType: 'Reduce Position',
      })),
      ...forceCloseData.map((item: any) => ({
        ...item,
        token0: uniqueTokens.get(item.pool.toLowerCase())[0],
        token1: uniqueTokens.get(item.pool.toLowerCase())[1],
        actionType: 'Force Closed',
      })),
    ]
    const sortedCombinedData = combinedData.sort((a, b) => b.blockTimestamp - a.blockTimestamp)
    return sortedCombinedData
  }, [addData, reduceData, forceCloseData, uniqueTokens])
  return history
}
