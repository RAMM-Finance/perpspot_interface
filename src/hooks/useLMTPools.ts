import { Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { abi as IUniswapV3PoolStateABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { SqrtPriceMath, TickMath } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import { AddQuery, IncreaseLiquidityQuery, PoolAddedQuery, ReduceQuery,LiquidityProvidedQuery,
LiquidityWithdrawnQuery} from 'graphql/limitlessGraph/queries'
import JSBI from 'jsbi'
import { useMultipleContractSingleData } from 'lib/hooks/multicall'
import { useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'

import { IUniswapV3PoolStateInterface } from '../types/v3/IUniswapV3PoolState'
import {
  tokenDecimal,
  usdValue,
  useDataProviderContract,
  useLmtNFTPositionManager,
  useReferralContract,
} from './useContract'
import { useLmtLpPositionsFromTokenIds } from './useV3Positions'

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI) as IUniswapV3PoolStateInterface

export function usePoolsData() {
  const [uniqueTokenIds, setUniqueTokenIds] = useState<BigNumber[]>([])
  const [uniquePools, setUniquePools] = useState<any>([])
  const [uniqueTokens, setUniqueTokens] = useState<any>()
  const [addData, setAddData] = useState<any>()
  const [reduceData, setReduceData] = useState<any>()
  // const [addLiqData, setAddLiqData] = useState<any>()
  const [providedData, setProvidedData] = useState<any>()
  const [withdrawnData, setWithdrawnData] = useState<any>()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()

  const { account, chainId } = useWeb3React()
  const nfpm = useLmtNFTPositionManager()
  const dataProvider = useDataProviderContract()
  const referralContract = useReferralContract()

  useEffect(() => {
    if (!client || !AddQuery || loading || error || !referralContract ) return
    const call = async () => {
      try {
        setLoading(true)
        const poolQueryData = await client.query(PoolAddedQuery, {}).toPromise()
        const AddQueryData = await client.query(AddQuery, {}).toPromise()
        const ReduceQueryData = await client.query(ReduceQuery, {}).toPromise()
        // const AddLiqQueryData = await client.query(IncreaseLiquidityQuery, {}).toPromise()
        const ProvidedQueryData = await client.query(LiquidityProvidedQuery, {}).toPromise() 
        const WithdrawnQueryData = await client.query(LiquidityWithdrawnQuery, {}).toPromise() 
        // console.log('AddQuery', poolQueryData, AddQueryData.data.marginPositionIncreaseds, AddLiqQueryData)

        // const uniqueTokenIds = new Set<string>()

        // AddLiqQueryData?.data?.increaseLiquidities.forEach((entry: any) => {
        //   if (!uniqueTokenIds.has(entry.tokenId)) {
        //     uniqueTokenIds.add(entry.tokenId)
        //   }
        // })

        const pools = new Set<string>()
        ProvidedQueryData?.data?.liquidityProvideds.forEach((entry: any) => {
          const pool = ethers.utils.getAddress(entry.pool)
          if (!pools.has(pool)) {
            pools.add(pool)
          }
        })

        const uniqueTokens_ = new Map<string, any>()
        const tokens = await Promise.all(
          Array.from(pools).map(async (pool: any) => {
            const token = await dataProvider?.getPoolkeys(pool)
            if (token) {
              const poolAdress = ethers.utils.getAddress(pool)
              if (!uniqueTokens_.has(poolAdress)) {
                uniqueTokens_.set(poolAdress, [
                  ethers.utils.getAddress(token[0]), 
                  ethers.utils.getAddress(token[1]), 
                  token[2]]
                )
              }
              return { poolAdress: (token[0], token[1], token[2]) }
            } else return null
          })
        )
        // const bigNumberTokenIds = Array.from(uniqueTokenIds).map((id) => BigNumber.from(id))

        setProvidedData(ProvidedQueryData?.data.liquidityProvideds)
        setWithdrawnData(WithdrawnQueryData?.data.liquidityWithdrawns)
        setUniqueTokens(uniqueTokens_)
        // setUniqueTokenIds(bigNumberTokenIds)
        setUniquePools(Array.from(pools))
        setAddData(AddQueryData.data.marginPositionIncreaseds)
        setReduceData(ReduceQueryData.data.marginPositionReduceds)
        // setAddLiqData(AddLiqQueryData.data.increaseLiquidities)
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    call()
  }, [account, referralContract, dataProvider])

  const slot0s = useMultipleContractSingleData(uniquePools, POOL_STATE_INTERFACE, 'slot0')
  // const { positions: lpPositions, loading: lpPositionsLoading } = useLmtLpPositionsFromTokenIds(uniqueTokenIds)

  const poolToData = useMemo(() => {
    const slot0ByPool: { [key: string]: any } = {}
    const slot0ByPoolAddress: { [key: string]: any } = {}
    uniquePools?.forEach((pool: any, index: any) => {
      const slot0 = slot0s[index]
      if (slot0 && uniqueTokens.get(pool)) {
        const poolAdress = ethers.utils.getAddress(pool)
        if(!slot0ByPoolAddress[poolAdress]){
          slot0ByPoolAddress[poolAdress] = slot0.result
        }
      }
    })

    const processLiqEntry = (entry: any) => {
      const pool = ethers.utils.getAddress(entry.pool)
      let curTick = slot0ByPoolAddress[pool]?.[0].tick 
      if(!curTick) curTick = slot0ByPoolAddress?.[pool]?.tick
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
      const usdValueOfToken0 = usdValue[tokens[0]]
      const usdValueOfToken1 = usdValue[tokens[1]]

      return{
        pool: pool, 
        amount0: usdValueOfToken0* Number(amount0)/ 10 ** tokenDecimal[tokens[0]], 
        amount1: usdValueOfToken1* Number(amount1)/ 10 ** tokenDecimal[tokens[1]]
      }
    }
    const ProvidedDataProcessed = providedData?.map(processLiqEntry)
    const WithdrawDataProcessed = withdrawnData?.map(processLiqEntry)


    const totalAmountsByPool: { [key: string]: number } = {}
    const poolToData: { [key: string]: { totalValueLocked: number; volume: number } } = {}

    const addDataProcessed = addData?.map((entry: any) => ({
      key: entry.pool,
      token: entry.positionIsToken0 ? uniqueTokens?.get(ethers.utils.getAddress(entry.pool))?.[0] : uniqueTokens?.get(ethers.utils.getAddress(entry.pool))?.[1],
      amount: entry.addedAmount,
    }))
    const reduceDataProcessed = reduceData?.map((entry: any) => ({
      key: entry.pool,
      token: entry.positionIsToken0 ? uniqueTokens?.get(ethers.utils.getAddress(entry.pool))?.[0] : uniqueTokens?.get(ethers.utils.getAddress(entry.pool))?.[1],
      amount: entry.reduceAmount,
    }))

    const processEntry = (entry: any) => {
      const usdValueOfToken = usdValue[entry.token] || 0
      const totalValue = (usdValueOfToken * entry.amount) / 10 ** tokenDecimal[entry.token]
      const pool = ethers.utils.getAddress(entry.key)
      if (uniqueTokens.get(pool)) {
        const tokens = uniqueTokens?.get(pool)
        const newKey = `${tokens[0]}-${tokens[1]}-${tokens[2]}`
        if (totalAmountsByPool[newKey]) {
          totalAmountsByPool[newKey] += totalValue
        } else {
          totalAmountsByPool[newKey] = totalValue
        }
      }
    }
    addDataProcessed?.forEach(processEntry)
    reduceDataProcessed?.forEach(processEntry)

    const TVLDataPerPool : { [key: string]: any } = {}
    ProvidedDataProcessed?.forEach((entry:any)=>{
      const tokens = uniqueTokens.get(entry.pool)
      const key = `${ethers.utils.getAddress(tokens[0])}-${ethers.utils.getAddress(tokens[1])}-${tokens[2]}`

      if(!TVLDataPerPool[key]){
        TVLDataPerPool[key] = 0
      }
      TVLDataPerPool[key] += entry.amount0
      TVLDataPerPool[key] += entry.amount1
    })
    WithdrawDataProcessed?.forEach((entry:any)=>{
      const tokens = uniqueTokens.get(entry.pool)
      const key = `${ethers.utils.getAddress(tokens[0])}-${ethers.utils.getAddress(tokens[1])}-${tokens[2]}`

      TVLDataPerPool[key] -= entry.amount0
      TVLDataPerPool[key] -= entry.amount1
    })


    Object.keys(TVLDataPerPool).forEach((key)=>{
      poolToData[key] = { totalValueLocked: TVLDataPerPool[key], volume: totalAmountsByPool?.[key] }
    })

    return poolToData
  }, [uniquePools, uniqueTokens, slot0s, providedData,withdrawnData, addData, reduceData])

  return useMemo(() => {
    return poolToData
  }, [poolToData])
}
