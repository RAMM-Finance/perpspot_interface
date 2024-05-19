import { Interface } from '@ethersproject/abi'
import { abi as IUniswapV3PoolStateABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { SqrtPriceMath, TickMath } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from 'constants/chains'
import { ethers } from 'ethers'
import { client, clientBase, fetchAllData } from 'graphql/limitlessGraph/limitlessClients'
import { AddQuery, LiquidityProvidedQuery, LiquidityWithdrawnQuery, ReduceQuery } from 'graphql/limitlessGraph/queries'
import JSBI from 'jsbi'
import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from 'react-query'

import { IUniswapV3PoolStateInterface } from '../types/v3/IUniswapV3PoolState'
import { useDataProviderContract } from './useContract'
import { getDecimalAndUsdValueData } from './useUSDPrice'
import { useMultipleContractSingleData } from 'lib/hooks/multicall'

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
  const { chainId } = useWeb3React()
  const dataProvider = useDataProviderContract()

  const queryKey = useMemo(() => {
    if (!chainId || !dataProvider) return []
    return ['queryPoolsData', chainId, dataProvider.address]
  }, [chainId, dataProvider])

  // async function fetchAllData(query: any, client: any) {
  //   let allResults: any[] = []
  //   let skip = 0;
  //   const first = 1000 // maximum limit
  
  //   while (true) {
  //     const result = await client.query(query, { first, skip }).toPromise()
  //     if (query === AddQuery) {
  //       if (!result.data || !result.data.marginPositionIncreaseds.length) {
  //         break
  //       }
  //       allResults = [...allResults, ...result.data.marginPositionIncreaseds]
  //     } else if (query === ReduceQuery) {
  //       if (!result.data || !result.data.marginPositionReduceds.length) {
  //         break
  //       }
  //       allResults = [...allResults, ...result.data.marginPositionReduceds]
  //     }
  //     if (query === AddQuery) {
  //       allResults = [...allResults, ...result.data.marginPositionIncreaseds]
  //     } else if (query === ReduceQuery) {
  //       allResults = [...allResults, ...result.data.marginPositionReduceds]
  //     }
  
  //     skip += first
  //   }
  
  //   return allResults
  // }

  const { data, isLoading, isError, refetch } = useQuery(
    queryKey,
    async () => {
      if (!dataProvider) throw Error('missing dataProvider')
      if (!chainId) throw Error('missing chainId')
      try {
        // console.log('zeke:1')
        let clientToUse = chainId === SupportedChainId.BASE ? clientBase : client

        let [AddQueryData, ReduceQueryData, ProvidedQueryData, WithdrawnQueryData] = await Promise.all([
          fetchAllData(AddQuery, clientToUse),
          fetchAllData(ReduceQuery, clientToUse),
          fetchAllData(LiquidityProvidedQuery, clientToUse),
          fetchAllData(LiquidityWithdrawnQuery, clientToUse)
        ])
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

  useEffect(() => {
    if (chainId) {
      refetch()
    }
  }, [chainId, refetch])

  const slot0s = [] as any

  // const uPools = data?.uniquePools ? data.uniquePools : []
  
  // const providedSlot0s = useMultipleContractSingleData(uPools, POOL_STATE_INTERFACE, 'slot0')

  const poolToData = useMemo(() => {
    if (isLoading || isError || !data) return undefined

    // if (providedSlot0s.some(slot => slot.loading)) {

    //   return undefined
    // }

    const { uniquePools, uniqueTokens, providedData, withdrawnData, addData, reduceData, useQueryChainId } = data

    if (chainId !== useQueryChainId) return undefined

    // const slot0ByPoolAddress: { [key: string]: any } = {}

    // uniquePools?.forEach((pool: any, index: any) => {
    //   const slot0 = providedSlot0s[index]
    //   if (slot0) {
    //     const poolAddress = ethers.utils.getAddress(pool)
    //     if (!slot0ByPoolAddress[poolAddress]) {
    //       slot0ByPoolAddress[poolAddress] = slot0.result
    //     }
    //   }
    // })


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
      let curTick = slot0ByPoolAddress[pool]?.tick
      
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
        amount0:
          (parseFloat(token0InfoFromUniswap?.lastPriceUSD) * Number(amount0)) / 10 ** token0InfoFromUniswap.decimals,
        amount1:
          (parseFloat(token1InfoFromUniswap?.lastPriceUSD) * Number(amount1)) / 10 ** token1InfoFromUniswap.decimals,
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
    const targetEntry1 = addData?.find((entry: any) => entry.pool.toLowerCase() === '0xba3f945812a83471d709bce9c3ca699a19fb46f7')
    const targetEntry = addDataProcessed?.find((entry: any) => entry.key.toLowerCase() === '0xba3f945812a83471d709bce9c3ca699a19fb46f7')


    const processEntry = async (entry: any) => {
      // const usdValueOfToken = usdValue[entry.token] || 0
      // const totalValue = (usdValueOfToken * entry.amount) / 10 ** tokenDecimal[entry.token]
      const pool = ethers.utils.getAddress(entry.key)

      const poolAddr = ethers.utils.getAddress("0xBA3F945812a83471d709BCe9C3CA699A19FB46f7")
      // console.log("0xBA3F945812a83471d709BCe9C3CA699A19FB46f7".toLowerCase())
      // if (uniqueTokens.get(poolAddr)) {
      //   const tokens = uniqueTokens?.get(poolAddr)
      //   console.log("TOKENNNN", tokens[3].symbol, tokens[4].symbol)
      // }
      if (uniqueTokens.get(pool)) {
        const tokens = uniqueTokens?.get(pool)
        let totalValue


        // if (tokens[3].symbol === 'BRETT' || tokens[4].symbol === 'BRETT')
        //   {
        //     console.log("TOKENS", tokens[3].symbol, tokens[4].symbol)
        //     console.log("TOTLA VAUE tokens3", (tokens[3].lastPriceUSD * entry.amount) / 10 ** tokens[3].decimals)
        //     console.log("TOTLA VAUE tokens4", (tokens[4].lastPriceUSD * entry.amount) / 10 ** tokens[4].decimals)
        //   }

        if (tokens[3]?.id.toString().toLowerCase() === entry.token.toString().toLowerCase()) {
          totalValue = (tokens[3].lastPriceUSD * entry.amount) / 10 ** tokens[3].decimals
        } else if (tokens[4]?.id.toString().toLowerCase() === entry.token.toString().toLowerCase()) {
          totalValue = (tokens[4].lastPriceUSD * entry.amount) / 10 ** tokens[4].decimals
        } else {
          totalValue = 0
        }

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
      poolToData[key.toLowerCase()] = { totalValueLocked: TVLDataPerPool[key], volume: totalAmountsByPool?.[key] ?? 0 }
    })

    return poolToData
  }, [data, isError, isLoading])

  return useMemo(() => {
    return {
      loading: isLoading,
      error: isError,
      result: poolToData,
    }
  }, [poolToData, isLoading, isError])
}
