import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import {
  AddQuery,
  CollectQuery,
  DecreaseLiquidityQuery,
  IncreaseLiquidityQuery,
  ReduceQuery,
  PoolAddedQuery
} from 'graphql/limitlessGraph/queries'
import { useCurrency } from './Tokens'
import { useDataProviderContract, useLmtNFTPositionManager, useReferralContract,usdValue  } from './useContract'
import { useUSDPrice } from 'hooks/useUSDPrice'
import { useLmtLpPositionsFromTokenIds } from './useV3Positions'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useEffect, useMemo, useState } from 'react'


export function usePoolsData() {
  const [uniqueTokenIds, setUniqueTokenIds] = useState<BigNumber[]>([])
  const [uniquePools, setUniquePools] = useState<any>([])
  const [uniqueTokens, setUniqueTokens] = useState<any>()
  const { account, chainId } = useWeb3React()
  const [addData, setAddData] = useState<any>()
  const [reduceData, setReduceData] = useState<any>()
  const [addLiqData, setAddLiqData] = useState<any>()
  const [decreaseLiqData, setDecreaseLiqData] = useState<any>()

  const [codeUsers, setCodeUsers] = useState<any>([])
  const [uniqueReferrers, setUniqueReferrers] = useState<any>([])
  const [collectData, setCollectData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()
  const nfpm = useLmtNFTPositionManager()
  const dataProvider = useDataProviderContract()
  const referralContract = useReferralContract()

  useEffect(() => {
    if (!client || !AddQuery || loading || error || !referralContract || !account) return
    const call = async () => {
      try {
        setLoading(true)
        const poolQueryData = await client.query(PoolAddedQuery, {}).toPromise()
        const AddQueryData = await client.query(AddQuery, {}).toPromise()
        const ReduceQueryData = await client.query(ReduceQuery, {}).toPromise()
        const AddLiqQueryData = await client.query(IncreaseLiquidityQuery, {}).toPromise()
        const DecreaseLiquidityData = await client.query(DecreaseLiquidityQuery, {}).toPromise()

        console.log(
          'AddQuery',
          poolQueryData,
          AddQueryData.data.marginPositionIncreaseds,
          AddLiqQueryData,
          DecreaseLiquidityData
        )

        const uniqueTokenIds = new Set<string>()
        const uniqueTraders = new Set<string>()

        AddLiqQueryData?.data?.increaseLiquidities.forEach((entry: any) => {
          if (!uniqueTokenIds.has(entry.tokenId)) {
            uniqueTokenIds.add(entry.tokenId)
          }
        })

        const pools = new Set<string>()
        AddQueryData?.data?.marginPositionIncreaseds.forEach((entry: any) => {
          // const poolContract = usePoolContract(entry.pool)
          if (!pools.has(entry.pool)) {
            pools.add(entry.pool)
          }

        })

        const bigNumberTokenIds = Array.from(uniqueTokenIds).map((id) => BigNumber.from(id))
        setUniqueTokenIds(bigNumberTokenIds)
        setUniqueReferrers(Array.from(uniqueTraders))
        setUniquePools(Array.from(pools))
        setAddData(AddQueryData.data.marginPositionIncreaseds)
        setReduceData(ReduceQueryData.data.marginPositionReduceds)
        setAddLiqData(AddLiqQueryData.data.increaseLiquidities)
        setDecreaseLiqData(DecreaseLiquidityData.data.decreaseLiquidities)
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    call()
  }, [account, referralContract])

  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const uniqueTokens_ = new Map<string, any>()
    const call = async () => {
      try {
        const tokens = await Promise.all(
          uniquePools.map(async (pool: any) => {
            const token = await dataProvider?.getPoolkeys(pool)
            if (token) {
              if (!uniqueTokens_.has(pool)) {
                uniqueTokens_.set(pool, [token[0], token[1]])
              }
              return { pool: (token[0], token[1]) }
            } else return null
          })
        )
        setUniqueTokens(uniqueTokens_)
        setLoaded(true)
      } catch (err) {
        console.log('tokens fetching ', err)
      }
    }
    call()
  }, [uniquePools, dataProvider])


  const { positions: lpPositions, loading: lpPositionsLoading } = useLmtLpPositionsFromTokenIds(uniqueTokenIds)
  console.log('data', addData, reduceData, lpPositions)

  let poolToData
  // return [pool: (tvl, volume)]
  return useMemo(() => {
    return 
      poolToData
      // tradeProcessedByTrader,
      // lpPositionsByUniqueLps,
      // refereeActivity,
      // This includes loading, positions, etc.
      // loading,
      // error
    
  }, [addData, addLiqData, reduceData, decreaseLiqData, lpPositions, loading, error])
}
