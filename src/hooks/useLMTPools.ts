import { Interface } from '@ethersproject/abi'
import { abi as IUniswapV3PoolStateABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { SqrtPriceMath, TickMath } from '@uniswap/v3-sdk'
import { ethers } from 'ethers'
import { client } from 'graphql/limitlessGraph/limitlessClients'
import { AddQuery, LiquidityProvidedQuery, LiquidityWithdrawnQuery, ReduceQuery } from 'graphql/limitlessGraph/queries'
import JSBI from 'jsbi'
import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from 'react-query'

import { IUniswapV3PoolStateInterface } from '../types/v3/IUniswapV3PoolState'
import { getDecimalAndUsdValueData, tokenDecimal, usdValue, useDataProviderContract } from './useContract'

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI) as IUniswapV3PoolStateInterface

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
  }
}

export function usePoolsData(): {
  loading: boolean
  result: PoolTVLData | undefined
  error: boolean
} {
  const dataProvider = useDataProviderContract()

  const { data, isLoading, isError } = useQuery(
    ['queryPoolsData', dataProvider ? 'key' : 'missing key'],
    async () => {
      if (!dataProvider) throw Error('missing dataProvider')
      const AddQueryData = await client.query(AddQuery, {}).toPromise()
      const ReduceQueryData = await client.query(ReduceQuery, {}).toPromise()
      const ProvidedQueryData = await client.query(LiquidityProvidedQuery, {}).toPromise()
      const WithdrawnQueryData = await client.query(LiquidityWithdrawnQuery, {}).toPromise()
      const pools = new Set<string>()
      ProvidedQueryData?.data?.liquidityProvideds.forEach((entry: any) => {
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
              uniqueTokens_.set(poolAdress, [
                ethers.utils.getAddress(token[0]),
                ethers.utils.getAddress(token[1]),
                token[2],
                await getDecimalAndUsdValueData('arbitrum-one', token[0]),
                await getDecimalAndUsdValueData('arbitrum-one', token[1]),
              ])
            }
            return { poolAdress: (token[0], token[1], token[2]) }
          } else return null
        })
      )
      return {
        uniquePools: Array.from(pools),
        uniqueTokens: uniqueTokens_,
        addData: AddQueryData.data.marginPositionIncreaseds,
        reduceData: ReduceQueryData.data.marginPositionReduceds,
        providedData: ProvidedQueryData.data.liquidityProvideds,
        withdrawnData: WithdrawnQueryData.data.liquidityWithdrawns,
      }
    },
    {
      refetchOnMount: false,
      staleTime: 60 * 1000,
      keepPreviousData: true,
    }
  )


  const slot0s = [] as any


  const poolToData = useMemo(() => {
    if (isLoading || isError || !data) return undefined

    const { uniquePools, uniqueTokens, providedData, withdrawnData, addData, reduceData } = data

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
      let curTick = slot0ByPoolAddress[pool]?.[0].tick
      if (!curTick) curTick = slot0ByPoolAddress?.[pool]?.tick
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

      // const usdValueOfToken0 = usdValue[tokens[0]]
      // const usdValueOfToken1 = usdValue[tokens[1]]

      const token0InfoFromUniswap = tokens[3]
      const token1InfoFromUniswap = tokens[4]

      return {
        pool,
        amount0: (token0InfoFromUniswap?.lastPriceUSD * Number(amount0)) / 10 ** token0InfoFromUniswap.decimals,
        amount1: (token1InfoFromUniswap?.lastPriceUSD * Number(amount1)) / 10 ** token1InfoFromUniswap.decimals,
      }
    }

    const ProvidedDataProcessed = providedData?.map(processLiqEntry)
    const WithdrawDataProcessed = withdrawnData?.map(processLiqEntry)

    const totalAmountsByPool: { [key: string]: number } = {}
    const poolToData: { [key: string]: { totalValueLocked: number; volume: number } } = {}

    const addDataProcessed = addData?.map((entry: any) => ({
      key: entry.pool,
      token: entry.positionIsToken0
        ? uniqueTokens?.get(ethers.utils.getAddress(entry.pool))?.[0]
        : uniqueTokens?.get(ethers.utils.getAddress(entry.pool))?.[1],
      amount: entry.addedAmount,
    }))
    const reduceDataProcessed = reduceData?.map((entry: any) => ({
      key: entry.pool,
      token: entry.positionIsToken0
        ? uniqueTokens?.get(ethers.utils.getAddress(entry.pool))?.[0]
        : uniqueTokens?.get(ethers.utils.getAddress(entry.pool))?.[1],
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

    const TVLDataPerPool: { [key: string]: any } = {}
    ProvidedDataProcessed?.forEach((entry: any) => {
      const tokens = uniqueTokens.get(entry.pool)
      const key = `${ethers.utils.getAddress(tokens[0])}-${ethers.utils.getAddress(tokens[1])}-${tokens[2]}`

      if (!TVLDataPerPool[key]) {
        TVLDataPerPool[key] = 0
      }

      TVLDataPerPool[key] += entry.amount0
      TVLDataPerPool[key] += entry.amount1
    })

    WithdrawDataProcessed?.forEach((entry: any) => {
      const tokens = uniqueTokens.get(entry.pool)
      const key = `${ethers.utils.getAddress(tokens[0])}-${ethers.utils.getAddress(tokens[1])}-${tokens[2]}`

      TVLDataPerPool[key] -= entry.amount0
      TVLDataPerPool[key] -= entry.amount1
    })
    // console.log('provideddataprocessed', ProvidedDataProcessed, WithdrawDataProcessed)

    Object.keys(TVLDataPerPool).forEach((key) => {
      poolToData[key] = { totalValueLocked: TVLDataPerPool[key], volume: totalAmountsByPool?.[key] ?? 0 }
    })

    return poolToData
  }, [slot0s, data, isError, isLoading])

  return useMemo(() => {
    return {
      loading: isLoading,
      error: isError,
      result: poolToData,
    }
  }, [poolToData, isLoading, isError])
}
