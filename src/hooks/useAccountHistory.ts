
import { useState,useEffect, useMemo } from 'react'

import { ethers } from 'ethers'


import {
  AddQuery,
  ReduceQuery,
  AddOrderQuery,
  CancelOrderQuery, 
  ForceClosedQuery, 
} from 'graphql/limitlessGraph/queries'
import { client } from 'graphql/limitlessGraph/limitlessClients'

import { useDataProviderContract } from './useContract'


export function useHistoryData(address:any){
  const [addData, setAddData] = useState<any>()
  const [reduceData, setReduceData] = useState<any>()
  const [forceCloseData, setForceCloseData] = useState<any>()
  const [addOrderData, setAddOrderData] = useState<any>()
  const [cancelOrderData, setCancelOrderData] = useState<any>()
  const dataProvider = useDataProviderContract()
  const [uniqueTokens, setUniqueTokens] = useState<any>()


  const account = useMemo(()=>{
    return ethers.utils.getAddress(address)
  }, [address])

  useEffect(()=>{
    if (!client || !dataProvider) return

    const call = async()=>{
        const AddQueryData = await client.query(AddQuery, {}).toPromise()
        const ReduceQueryData = await client.query(ReduceQuery, {}).toPromise()
        const AddOrderData = await client.query(AddOrderQuery, {}).toPromise() 
        const CancelOrderData = await client.query(CancelOrderQuery, {}).toPromise() 
        const ForceCloseData = await client.query(ForceClosedQuery, {}).toPromise() 

        const addQueryFiltered = AddQueryData?.data?.marginPositionIncreaseds.filter((data:any)=>{
          if(ethers.utils.getAddress(data.trader) == account ) return true 
          else return false 
        })

        const reduceQueryFiltered = ReduceQueryData?.data?.marginPositionReduceds.filter((data:any)=>{
          if(ethers.utils.getAddress(data.trader) == account ) return true 
          else return false 
        })

        const addOrderFiltered = AddOrderData?.data?.orderAddeds.filter((data:any)=>{
          if(ethers.utils.getAddress(data.trader) == account ) return true 
          else return false 
        })

        const cancelOrderFiltered = CancelOrderData?.data?.orderCanceleds.filter((data:any)=>{
          if(ethers.utils.getAddress(data.trader) == account ) return true 
          else return false 
        })

        const forceCloseFiltered = ForceCloseData?.data?.forceCloseds.filter((data:any)=>{
          if(ethers.utils.getAddress(data.trader) == account ) return true 
          else return false 
        })

        const pools = new Set<string>()
        AddQueryData?.data?.marginPositionIncreaseds.forEach((entry: any) => {
          if (!pools.has(entry.pool)) {
            pools.add(entry.pool)
          }
        })
        ReduceQueryData?.data.marginPositionReduceds.forEach((entry: any) => {
          if (!pools.has(entry.pool)) {
            pools.add(entry.pool)
          }
        })
        
        forceCloseFiltered.forEach((entry: any) => {
          if (!pools.has(entry.pool)) {
            pools.add(entry.pool)
          }
        })
        addOrderFiltered.forEach((entry: any) => {
          if (!pools.has(entry.pool)) {
            pools.add(entry.pool)
          }
        })
        cancelOrderFiltered.forEach((entry: any) => {
          if (!pools.has(entry.pool)) {
            pools.add(entry.pool)
          }
        })

        const uniquePools = Array.from(pools)
        const uniqueTokens_ = new Map<string, any>()
        try {
          const tokens = await Promise.all(
            Array.from(pools).map(async (pool: any) => {
              const token = await dataProvider?.getPoolkeys(pool)
              if (token) {
                const pool_ = ethers.utils.getAddress(pool)
                if (!uniqueTokens_.has(pool)) {
                  uniqueTokens_.set(pool_, [token[0], token[1]])
                }
                return { pool_: (token[0], token[1]) }
              } else return null
            })
          )
          setUniqueTokens(uniqueTokens_)
        } catch (err) {
          console.log('tokens fetching ', err)
        }


        setAddData(addQueryFiltered)
        setReduceData(reduceQueryFiltered)
        setForceCloseData(forceCloseFiltered  )
        setCancelOrderData(cancelOrderFiltered)
        setAddOrderData(addOrderFiltered)

    }

    call()

  }, [client, account])


  const history = useMemo(()=>{
    if(!addOrderData || !reduceData || !addData || !cancelOrderData || !forceCloseData || !uniqueTokens) return 
    const combinedData: any[] = [
      ...addData.map((item:any) => ({ ...item, 
        token0: uniqueTokens.get(ethers.utils.getAddress(item.pool))[0], 
        token1: uniqueTokens.get(ethers.utils.getAddress(item.pool))[1], 
        actionType: 'Add Position' })),
      ...reduceData.map((item:any) => ({ ...item, 
        token0: uniqueTokens.get(ethers.utils.getAddress(item.pool))[0], 
        token1: uniqueTokens.get(ethers.utils.getAddress(item.pool))[1], 
        actionType: 'Reduce Position' })),
      ...addOrderData.map((item:any) => ({ ...item, 
        token0: uniqueTokens.get(ethers.utils.getAddress(item.pool))[0], 
        token1: uniqueTokens.get(ethers.utils.getAddress(item.pool))[1], 
        actionType: 'Add Order' })),
      ...cancelOrderData.map((item:any) => ({ ...item, 
        token0: uniqueTokens.get(ethers.utils.getAddress(item.pool))[0], 
        token1: uniqueTokens.get(ethers.utils.getAddress(item.pool))[1], 
        actionType: 'Cancel Order' })),
      ...forceCloseData.map((item:any) => ({ ...item, 
        token0: uniqueTokens.get(ethers.utils.getAddress(item.pool))[0], 
        token1: uniqueTokens.get(ethers.utils.getAddress(item.pool))[1], 
        actionType: 'Force Closed' }))
    ]
    const sortedCombinedData = combinedData.sort((a, b) => b.blockTimestamp - a.blockTimestamp)
    return sortedCombinedData
  }, [addData, reduceData, addOrderData, cancelOrderData, forceCloseData, uniqueTokens])


  return history 
  
}