import { Interface } from '@ethersproject/abi'
import { keepPreviousData } from '@tanstack/react-query'
import IUniswapV3PoolStateJSON from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { SqrtPriceMath, TickMath } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { LMT_QUOTER } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { ethers } from 'ethers'
import { client, clientBase, fetchAllData } from 'graphql/limitlessGraph/limitlessClients'
import { LiquidityProvidedQueryV2, LiquidityWithdrawnQueryV2 } from 'graphql/limitlessGraph/queries'
import JSBI from 'jsbi'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useQuery } from 'react-query'
import { PoolContractInfo, usePoolKeyList } from 'state/application/hooks'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { LmtQuoterSDK } from 'utils/lmtSDK/LmtQuoter'
import { useChainId } from 'wagmi'

import { useDataProviderContract, useLimweth, useLmtQuoterContract, useSharedLiquidity } from './useContract'
import { useContractCallV2 } from './useContractCall'
import { useAllPoolAndTokenPriceData } from './useUserPriceData'

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateJSON.abi)

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

export function usePoolsTVLandVolume(): {
  loading: boolean
  result: PoolTVLData | undefined
  error: boolean
} {
  const chainId = useChainId()
  const dataProvider = useDataProviderContract()
  const { tokens: tokenPriceData } = useAllPoolAndTokenPriceData()

  const queryKey = useMemo(() => {
    if (!chainId || !dataProvider || !tokenPriceData || Object.keys(tokenPriceData).length === 0) return []
    return ['queryPoolsData', chainId, dataProvider.address]
  }, [chainId, dataProvider, tokenPriceData])

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!dataProvider) throw Error('missing dataProvider')
      if (!chainId) throw Error('missing chainId')
      if (!tokenPriceData || Object.keys(tokenPriceData).length === 0) throw Error('missing price provider')
      try {
        const clientToUse = chainId === SupportedChainId.BASE ? clientBase : client

        const [ProvidedQueryData, WithdrawnQueryData] = await Promise.all([
          fetchAllData(LiquidityProvidedQueryV2, clientToUse),
          fetchAllData(LiquidityWithdrawnQueryV2, clientToUse),
        ])

        return {
          providedData: ProvidedQueryData,
          withdrawnData: WithdrawnQueryData,
          useQueryChainId: chainId,
        }
      } catch (err) {
        console.log('useLMTPool:', err)
        throw err
      }
    },
    refetchOnMount: false,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: queryKey.length > 0,
  })

  const { poolList } = usePoolKeyList()
  const limweth = useLimweth()
  const sharedLiq = useSharedLiquidity()
  const { result: limWethBalance } = useSingleCallResult(limweth, 'tokenBalance', [])
  const lmtQuoter = useLmtQuoterContract()

  const sharedLiquidityCallState = useContractCallV2(
    LMT_QUOTER,
    LmtQuoterSDK.INTERFACE.encodeFunctionData('getSharedLiquidityInfo'),
    ['getSharedLiquidityInfo'],
    false,
    true,
    (data) => {
      return LmtQuoterSDK.INTERFACE.decodeFunctionResult('getSharedLiquidityInfo', data)
    }
  )

  const sharedLiquidity = sharedLiquidityCallState?.result

  const limwethPrice = useMemo(() => {
    if (tokenPriceData && limweth && chainId) {
      const weth = WRAPPED_NATIVE_CURRENCY[chainId]?.address
      return weth ? tokenPriceData[weth.toLowerCase()]?.usdPrice : undefined
    }
    return undefined
  }, [tokenPriceData, limweth, chainId])

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
  }, [poolList])

  const availableLiquidities: { [poolId: string]: BN } | undefined = useMemo(() => {
    if (limWethBalance && sharedLiquidity && poolMap) {
      const result: { [poolId: string]: BN } = {}
      sharedLiquidity[0].forEach((info: any) => {
        const poolId = getPoolId(info[0][0], info[0][1], info[0][2])
        const maxPerPair = Number(info[1].toString())
        const exposure = Number(info[2].toString())
        result[poolId] = new BN(maxPerPair).shiftedBy(-18).times(new BN(limWethBalance[0].toString())).minus(exposure)
      })
      return result
    }

    return undefined
  }, [limWethBalance, sharedLiquidity, poolMap])

  const processLiqEntry = useCallback(
    (entry: any) => {
      if (!poolMap || !tokenPriceData || !Object.keys(poolMap).length || !Object.keys(tokenPriceData).length) return
      const pool = ethers.utils.getAddress(entry.pool)
      if (!poolMap[pool.toLowerCase()]) {
        return {
          pool,
          amount0: 0,
          amount1: 0,
        }
      }
      const curTick = poolMap[pool.toLowerCase()].tick

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

      // 0x0578d8a44db98b23bf096a382e016e29a5ce0ffe-0x4200000000000000000000000000000000000006-10000
      // :
      // longableLiquidity
      // :
      // 3.2726192155131287e+22
      // shortableLiquidity
      // :
      // 112869.18529308242
      // test0
      // :
      // 3.2726192155131287e+22
      // test1
      // :
      // 0
      // totalValueLocked
      // :
      // 212649.30191607663
      // volume
      // :
      // 0

      const token0 = poolMap[pool.toLowerCase()].token0.toLowerCase()
      const token1 = poolMap[pool.toLowerCase()].token1.toLowerCase()
      const token0Usd = tokenPriceData[token0].usdPrice
      const token1Usd = tokenPriceData[token1].usdPrice
      const decimals0 = poolMap[pool.toLowerCase()].decimals0
      const decimals1 = poolMap[pool.toLowerCase()].decimals1

      return {
        pool,
        amount0: (token0Usd * Number(amount0)) / 10 ** decimals0,
        amount1: (token1Usd * Number(amount1)) / 10 ** decimals1,
      }
    },
    [poolMap, tokenPriceData, limwethPrice, limWethBalance, sharedLiquidity, chainId, limweth, sharedLiq]
  )

  const poolToData:
    | {
        [key: string]: {
          totalValueLocked: number
          volume: number
          longableLiquidity: number
          shortableLiquidity: number
          test0: number
          test1: number
        }
      }
    | undefined = useMemo(() => {
    if (!data || !poolMap || !limwethPrice || !availableLiquidities) return undefined
    try {
      const { providedData, withdrawnData } = data as any

      const ProvidedDataProcessed = providedData?.map(processLiqEntry)
      const WithdrawDataProcessed = withdrawnData?.map(processLiqEntry)
      const totalAmountsByPool: { [key: string]: number } = {}
      const poolToData: {
        [key: string]: {
          totalValueLocked: number
          volume: number
          longableLiquidity: number
          shortableLiquidity: number
          test0: number
          test1: number
        }
      } = {}

      const TVLDataPerPool: { [key: string]: any } = {}
      const TVLDataLongable: { [key: string]: any } = {}
      const TVLDataShortable: { [key: string]: any } = {}

      ProvidedDataProcessed?.forEach((entry: any) => {
        if (!poolMap || !poolMap[entry.pool.toLowerCase()]) return
        const { token0, token1, fee } = poolMap[entry.pool.toLowerCase()]
        const key = getPoolId(token0, token1, fee).toLowerCase()

        if (!TVLDataPerPool[key]) {
          TVLDataPerPool[key] = 0
        }
        if (!TVLDataLongable[key]) {
          TVLDataLongable[key] = 0
        }
        if (!TVLDataShortable[key]) {
          TVLDataShortable[key] = 0
        }

        TVLDataPerPool[key] += entry.amount0
        TVLDataPerPool[key] += entry.amount1

        if (token1.toLowerCase() === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) {
          // when WETH/USDC pool in BASE
          TVLDataLongable[key] += entry.amount1
          TVLDataShortable[key] += entry.amount0
        } else if (token0.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token0 is WETH
          TVLDataLongable[key] += entry.amount0
          TVLDataShortable[key] += entry.amount1
        } else if (token1.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token1 is WETH
          TVLDataLongable[key] += entry.amount1
          TVLDataShortable[key] += entry.amount0
        }
      })

      WithdrawDataProcessed?.forEach((entry: any) => {
        if (!poolMap || !poolMap[entry.pool.toLowerCase()]) return

        const { token0, token1, fee } = poolMap[entry.pool.toLowerCase()]
        const key = getPoolId(token0, token1, fee).toLowerCase()

        TVLDataPerPool[key] -= entry.amount0
        TVLDataPerPool[key] -= entry.amount1

        if (token1.toLowerCase() === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) {
          // when WETH/USDC pool in BASE
          TVLDataLongable[key] -= entry.amount1
          TVLDataShortable[key] -= entry.amount0
        } else if (token0.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token0 is WETH
          TVLDataLongable[key] -= entry.amount0
          TVLDataShortable[key] -= entry.amount1
        } else if (token1.toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
          // when non-USDC/WETH pool in BASE and token1 is WETH
          TVLDataLongable[key] -= entry.amount1
          TVLDataShortable[key] -= entry.amount0
        } else {
        }
      })

      Object.keys(TVLDataPerPool).forEach((key) => {
        const isUSDC = key.toLowerCase().includes('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) // when WETH/USDC pool in BASE
        const availableLiquidity = limwethPrice * parseFloat(availableLiquidities[key].shiftedBy(-18).toFixed(0))
        if (!TVLDataPerPool[key] || !TVLDataLongable[key] || !TVLDataShortable[key]) {
          return
        }
        // if (key === '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe-0x4200000000000000000000000000000000000006-10000') {
        //   console.log(
        //     'zeke:v2',
        //     availableLiquidity,
        //     limwethPrice,
        //     parseFloat())
        //   )
        // }
        poolToData[key.toLowerCase()] = {
          totalValueLocked: TVLDataPerPool[key.toLowerCase()],
          volume: totalAmountsByPool?.[key.toLowerCase()] ?? 0,
          longableLiquidity: isUSDC
            ? TVLDataLongable[key.toLowerCase()]
            : TVLDataLongable[key.toLowerCase()] + availableLiquidity,
          shortableLiquidity: isUSDC
            ? TVLDataShortable[key.toLowerCase()] + availableLiquidity
            : TVLDataShortable[key.toLowerCase()],
          test0: isUSDC ? 0 : availableLiquidity,
          test1: isUSDC ? availableLiquidity : 0,
        }
      })

      return poolToData
    } catch (err) {
      console.log('zeke:', err)
    }
    return undefined
  }, [data, processLiqEntry])

  return useMemo(() => {
    return {
      loading: isLoading,
      result: poolToData,
      error: isError,
    }
  }, [poolToData])
}
