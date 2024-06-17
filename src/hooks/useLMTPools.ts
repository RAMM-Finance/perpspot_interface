import { Interface } from '@ethersproject/abi'
import IUniswapV3PoolStateJSON from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { SqrtPriceMath, TickMath } from '@uniswap/v3-sdk'
import { SupportedChainId } from 'constants/chains'
import { VOLUME_STARTPOINT } from 'constants/misc'
import { BigNumber, ethers } from 'ethers'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { firestore } from 'firebaseConfig'
import { client, clientBase, fetchAllData } from 'graphql/limitlessGraph/limitlessClients'
import {
  AddVolumeQuery,
  LiquidityProvidedQueryV2,
  LiquidityWithdrawnQueryV2,
  ReduceVolumeQuery,
} from 'graphql/limitlessGraph/queries'
import JSBI from 'jsbi'
import { useMultipleContractSingleData } from 'lib/hooks/multicall'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { useChainId } from 'wagmi'

import { useDataProviderContract, useLimweth, useSharedLiquidity } from './useContract'
import { getDecimalAndUsdValueData, getMultipleUsdPriceData } from './useUSDPrice'

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

export function usePoolsData(): {
  loading: boolean
  result: PoolTVLData | undefined
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

        const [
          AddQueryData,
          ReduceQueryData,
          ProvidedQueryData,
          WithdrawnQueryData,
          addQuerySnapshot,
          reduceQuerySnapshot,
          prevPriceQuerySnapshot,
        ] = await Promise.all([
          fetchAllData(AddVolumeQuery, clientToUse),
          fetchAllData(ReduceVolumeQuery, clientToUse),
          fetchAllData(LiquidityProvidedQueryV2, clientToUse),
          fetchAllData(LiquidityWithdrawnQueryV2, clientToUse),
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

        const uniqueTokens_ = new Map<string, any>()
        await Promise.all(
          Array.from(pools).map(async (pool: any) => {
            const token = await dataProvider.getPoolkeys(pool)
            if (token) {
              // const poolAdress = ethers.utils.getAddress(pool)
              if (!uniqueTokens_.has(pool.toLowerCase())) {
                const [value0, value1] = await Promise.all([
                  getDecimalAndUsdValueData(chainId, token[0]),
                  getDecimalAndUsdValueData(chainId, token[1]),
                ])

                uniqueTokens_.set(pool.toLowerCase(), [
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
          addedVolumes: addData,
          reducedVolumes: reduceData,
          prevPriceData,
          useQueryChainId: chainId,
        }
      } catch (err) {
        console.log('useLMTPool:', err)
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
  const limweth = useLimweth()
  const sharedLiq = useSharedLiquidity()

  const poolKeyArr = useMemo(() => {
    if (chainId && data?.uniqueTokens && uniquePools) {
      const pools = uniquePools.map((pool) => {
        const poolData = data?.uniqueTokens.get(pool.toLowerCase())
        const poolKey = getPoolId(poolData[0], poolData[1], poolData[2])
        return {
          poolAddress: poolKey,
          token0: poolData[0],
          token1: poolData[1],
          fee: poolData[2],
        }
      })
      return pools
    } else return []
  }, [chainId, data?.uniqueTokens, uniquePools])

  const [availableLiquidities, setAvailableLiquidities] = useState<{ [key: string]: any }>({})
  const [limwethPrice, setLimwethPrice] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      if (chainId && sharedLiq && limweth && poolKeyArr.length > 0) {
        try {
          const startTime = performance.now()
          const [limwethUsdPrice, limwethBalance] = await Promise.all([
            getMultipleUsdPriceData(chainId, ['0x4200000000000000000000000000000000000006']),
            limweth.tokenBalance(),
          ])
          setLimwethPrice(limwethUsdPrice[0].priceUsd)
          const promises = poolKeyArr.map(async (poolKey) => {
            const hashKey = await sharedLiq.getHashedKey(poolKey)
            const [maxPerPair, exposureToPair] = await Promise.all([
              sharedLiq.maxPerPairs(hashKey),
              sharedLiq.exposureToPair(hashKey),
            ])
            return {
              poolAddress: poolKey.poolAddress,
              maxPerPair,
              exposureToPair,
            }
          })

          const results = await Promise.all(promises)

          const endTime = performance.now()
          const executionTime = endTime - startTime
          console.log(`Execution time: ${executionTime} milliseconds`)

          const newAvailableLiq = results.reduce((acc, { poolAddress, maxPerPair, exposureToPair }) => {
            acc[poolAddress] = {
              availableLiquidity: maxPerPair
                .mul(limwethBalance)
                .div(BigNumber.from('1000000000000000000'))
                .sub(exposureToPair),
            }
            return acc
          }, {} as { [key: string]: { availableLiquidity: any } })
          setAvailableLiquidities(newAvailableLiq)
        } catch (err) {
          console.error('ERROR', err)
        }
      }
    }
    fetchData()
  }, [chainId, sharedLiq, poolKeyArr, limweth])

  const poolToData = useMemo(() => {
    if (
      isLoading ||
      isError ||
      !data ||
      !limwethPrice ||
      slot0s.length === 0 ||
      slot0s.some((slot) => slot.loading) ||
      Object.keys(availableLiquidities).length === 0
    )
      return undefined

    const {
      uniquePools,
      uniqueTokens,
      providedData,
      withdrawnData,
      addData,
      reduceData,
      addedVolumes,
      reducedVolumes,
      prevPriceData,
      useQueryChainId,
    } = data

    // const slot0s = [] as any
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
    console.log('slot0ByPoolAddress', slot0ByPoolAddress)

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
        amount0:
          (parseFloat(token0InfoFromUniswap?.lastPriceUSD) * Number(amount0)) / 10 ** token0InfoFromUniswap.decimals,
        amount1:
          (parseFloat(token1InfoFromUniswap?.lastPriceUSD) * Number(amount1)) / 10 ** token1InfoFromUniswap.decimals,
      }
    }
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
      const pool = ethers.utils.getAddress(entry.key)

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

        if (totalAmountsByPool[newKey]) {
          totalAmountsByPool[newKey] += totalValue
        } else {
          totalAmountsByPool[newKey] = totalValue
        }
      }
    }

    addDataProcessed?.forEach(processEntry)
    reduceDataProcessed?.forEach(processEntry)

    const processVolume = (entry: any) => {
      if (entry.type === 'ADD') {
        if (totalAmountsByPool[entry.poolId]) {
          totalAmountsByPool[entry.poolId] += parseFloat(entry.volume)
        } else {
          totalAmountsByPool[entry.poolId] = parseFloat(entry.volume)
        }
      } else if (entry.type === 'REDUCE') {
        if (totalAmountsByPool[entry.poolId]) {
          totalAmountsByPool[entry.poolId] += parseFloat(entry.volume)
        } else {
          totalAmountsByPool[entry.poolId] = parseFloat(entry.volume)
        }
      }
    }
    addedVolumes.forEach(processVolume)
    reducedVolumes.forEach(processVolume)
    const TVLDataPerPool: { [key: string]: any } = {}
    const TVLDataLongable: { [key: string]: any } = {}
    const TVLDataShortable: { [key: string]: any } = {}

    ProvidedDataProcessed?.forEach((entry: any) => {
      const tokens = uniqueTokens.get(entry.pool.toLowerCase())
      // const key = `${ethers.utils.getAddress(tokens[0])}-${ethers.utils.getAddress(tokens[1])}-${tokens[2]}`

      const key = getPoolId(tokens[0], tokens[1], tokens[2])

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

      if (tokens[1].toLowerCase() === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) {
        // when WETH/USDC pool in BASE
        TVLDataLongable[key] += entry.amount1
        TVLDataShortable[key] += entry.amount0
      } else if (tokens[0].toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
        // when non-USDC/WETH pool in BASE and token0 is WETH
        TVLDataLongable[key] += entry.amount0
        TVLDataShortable[key] += entry.amount1
      } else if (tokens[1].toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
        // when non-USDC/WETH pool in BASE and token1 is WETH
        TVLDataLongable[key] += entry.amount1
        TVLDataShortable[key] += entry.amount0
      }
    })

    WithdrawDataProcessed?.forEach((entry: any) => {
      const tokens = uniqueTokens.get(entry.pool.toLowerCase())
      // const key = `${ethers.utils.getAddress(tokens[0])}-${ethers.utils.getAddress(tokens[1])}-${tokens[2]}`
      const key = getPoolId(tokens[0], tokens[1], tokens[2])

      TVLDataPerPool[key] -= entry.amount0
      TVLDataPerPool[key] -= entry.amount1

      if (tokens[1].toLowerCase() === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) {
        // when WETH/USDC pool in BASE
        TVLDataLongable[key] -= entry.amount1
        TVLDataShortable[key] -= entry.amount0
      } else if (tokens[0].toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
        // when non-USDC/WETH pool in BASE and token0 is WETH
        TVLDataLongable[key] -= entry.amount0
        TVLDataShortable[key] -= entry.amount1
      } else if (tokens[1].toLowerCase() === '0x4200000000000000000000000000000000000006'.toLowerCase()) {
        // when non-USDC/WETH pool in BASE and token1 is WETH
        TVLDataLongable[key] -= entry.amount1
        TVLDataShortable[key] -= entry.amount0
      } else {
      }
    })

    Object.keys(TVLDataPerPool).forEach((key) => {
      const isUSDC = key.toLowerCase().includes('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase()) // when WETH/USDC pool in BASE
      const availableLiq =
        limwethPrice * parseFloat(ethers.utils.formatEther(availableLiquidities[key].availableLiquidity))
      poolToData[key.toLowerCase()] = {
        totalValueLocked: TVLDataPerPool[key],
        volume: totalAmountsByPool?.[key] ?? 0,
        longableLiquidity: isUSDC ? TVLDataLongable[key] : TVLDataLongable[key] + availableLiq,
        shortableLiquidity: isUSDC ? TVLDataShortable[key] + availableLiq : TVLDataShortable[key],
        test0: isUSDC ? 0 : availableLiq,
        test1: isUSDC ? availableLiq : 0,
      }
    })
    console.log('POOLtoDATA', poolToData)
    return poolToData
  }, [data, isError, isLoading, slot0s, availableLiquidities, limwethPrice])

  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (poolToData && !isLoading) {
      setLoading(false)
    }
  }, [poolToData, isLoading])

  return useMemo(() => {
    return {
      loading,
      error: isError,
      result: poolToData,
    }
  }, [poolToData, loading, isError])
}
