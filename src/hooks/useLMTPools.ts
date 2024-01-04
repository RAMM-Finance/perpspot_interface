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
import { useDataProviderContract, useLmtNFTPositionManager, useReferralContract,usdValue ,tokenDecimal } from './useContract'
import { useUSDPrice } from 'hooks/useUSDPrice'
import { useLmtLpPositionsFromTokenIds } from './useV3Positions'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useEffect, useMemo, useState } from 'react'
import { Pool, Position, SqrtPriceMath, TickMath } from '@uniswap/v3-sdk'
import JSBI from 'jsbi'
import { useMultipleContractSingleData, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { abi as IUniswapV3PoolStateABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { IUniswapV3PoolStateInterface } from '../types/v3/IUniswapV3PoolState'
import { Interface } from '@ethersproject/abi'

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI) as IUniswapV3PoolStateInterface

export function usePoolsData() {
  const [uniqueTokenIds, setUniqueTokenIds] = useState<BigNumber[]>([])
  const [uniquePools, setUniquePools] = useState<any>([])
  const [uniqueTokens, setUniqueTokens] = useState<any>()
  const [addData, setAddData] = useState<any>()
  const [reduceData, setReduceData] = useState<any>()
  const [addLiqData, setAddLiqData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()

  const { account, chainId } = useWeb3React()
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

        console.log(
          'AddQuery',
          poolQueryData,
          AddQueryData.data.marginPositionIncreaseds,
          AddLiqQueryData,
        )

        const uniqueTokenIds = new Set<string>()

        AddLiqQueryData?.data?.increaseLiquidities.forEach((entry: any) => {
          if (!uniqueTokenIds.has(entry.tokenId)) {
            uniqueTokenIds.add(entry.tokenId)
          }
        })

        const pools = new Set<string>()
        AddQueryData?.data?.marginPositionIncreaseds.forEach((entry: any) => {
          if (!pools.has(entry.pool)) {
            pools.add(entry.pool)
          }
        })

        const uniqueTokens_ = new Map<string, any>()
        const tokens = await Promise.all(
          Array.from(pools).map(async (pool: any) => {
            const token = await dataProvider?.getPoolkeys(pool)
            if (token) {
              if (!uniqueTokens_.has(pool)) {
                uniqueTokens_.set(pool, [token[0], token[1], token[2]])
              }
              return { pool: (token[0], token[1],token[2]) }
            } else return null
          })
        )
        const bigNumberTokenIds = Array.from(uniqueTokenIds).map((id) => BigNumber.from(id))

        setUniqueTokens(uniqueTokens_)
        setUniqueTokenIds(bigNumberTokenIds)
        setUniquePools(Array.from(pools))
        setAddData(AddQueryData.data.marginPositionIncreaseds)
        setReduceData(ReduceQueryData.data.marginPositionReduceds)
        setAddLiqData(AddLiqQueryData.data.increaseLiquidities)
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    call()
  }, [account, referralContract, ])

  const slot0s = useMultipleContractSingleData(uniquePools, POOL_STATE_INTERFACE, 'slot0')
  const { positions: lpPositions, loading: lpPositionsLoading } = useLmtLpPositionsFromTokenIds(uniqueTokenIds)

  const poolToData = useMemo(() => {
    const slot0ByPool: { [key: string]: any } = {}

    uniquePools?.forEach((pool:any, index:any) => {
      const slot0 = slot0s[index]
      if (slot0 && uniqueTokens.get(pool)) {
        const entry = uniqueTokens.get(pool)
        const key = `${entry[0]}-${entry[1]}-${entry[2]}`

        if (!slot0ByPool[key]) {
          slot0ByPool[key] = slot0.result
        }
      }
    })

    const lpPositionByPool: { [key: string]: any } = {}
    const totalAmountsByPool: { [key: string]: number } = {}
    const poolToData: { [key: string]: { totalValueLocked: number, volume: number } } = {}

    lpPositions?.forEach(entry=>{
      const key = `${entry.token0}-${entry.token1}-${entry.fee}`
      if(!lpPositionByPool[key]){
        lpPositionByPool[key] = []
      }
      const curTick = slot0ByPool?.[key]?.[0].tick 

      let amount0
      let amount1
      if(curTick< entry.tickLower){
        amount0 = SqrtPriceMath.getAmount0Delta(
          TickMath.getSqrtRatioAtTick(entry.tickLower),
          TickMath.getSqrtRatioAtTick(entry.tickUpper),
          JSBI.BigInt(entry.liquidity.toString()),
          false
        ).toString()
        amount1 = "0"
      } else if(curTick > entry.tickUpper){
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
      } else{
        amount1 = SqrtPriceMath.getAmount1Delta(
          TickMath.getSqrtRatioAtTick(entry.tickLower),
          TickMath.getSqrtRatioAtTick(entry.tickUpper),
          JSBI.BigInt(entry.liquidity.toString()),
          false
        ).toString()
        amount0="0"
      }

      const newEntry = {
        amount0: Number(amount0) * usdValue[entry.token0] ,
        amount1: Number(amount1)* usdValue[entry.token1],
        token0: entry.token0,
        token1: entry.token1
      }

      lpPositionByPool[key].push(newEntry)
    })

    const addDataProcessed = addData?.map((entry: any) => ({
      key: entry.pool, 
      token: entry.positionIsToken0 ? uniqueTokens?.get(entry.pool)?.[0] : uniqueTokens?.get(entry.pool)?.[1],
      amount: entry.addedAmount,
    }))
    const reduceDataProcessed = reduceData?.map((entry: any) => ({
      key: entry.pool,
      token: entry.positionIsToken0 ? uniqueTokens?.get(entry.pool)?.[0] : uniqueTokens?.get(entry.pool)?.[1],
      amount: entry.reduceAmount,
    }))

    const processEntry = (entry: any) => {
      const usdValueOfToken = usdValue[entry.token] || 0
      const totalValue = (usdValueOfToken * entry.amount) / 10**tokenDecimal[entry.token]
      if ( uniqueTokens.get(entry.key)){
        const tokens = uniqueTokens?.get(entry.key)
        const newKey = `${tokens[0]}-${tokens[1]}-${tokens[2]}`
        if (totalAmountsByPool[newKey]) {
          totalAmountsByPool[newKey] += totalValue
        } else {
          totalAmountsByPool[newKey] = totalValue
        }

      }
    };
    addDataProcessed?.forEach(processEntry)
    reduceDataProcessed?.forEach(processEntry)

    Object.keys(lpPositionByPool).forEach(key => {
      let totalValueLocked = 0

      lpPositionByPool[key].forEach((entry:any) => {
        totalValueLocked += entry.amount0/ 10**tokenDecimal[entry.token0]
        totalValueLocked += entry.amount1/ 10**tokenDecimal[entry.token1]
      })

      // Assign the summed values to the new object
      poolToData[key] = { totalValueLocked:totalValueLocked, volume:totalAmountsByPool?.[key] }
    })

    return poolToData
  }, [uniquePools, uniqueTokens, slot0s, lpPositions, addData, reduceData, addLiqData]);

  return useMemo(() => {
    return poolToData
  }, [poolToData])
}
