import { keepPreviousData, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { useMemo } from 'react'
import { usePoolKeyList } from 'state/application/hooks'
import { usePinnedPools } from 'state/lists/hooks'
import { useCurrentPool } from 'state/user/hooks'
import { getDefaultBaseQuote } from 'utils/getBaseQuote'
import { getPoolId } from 'utils/lmtSDK/LmtIds'
import { useAccount, useChainId } from 'wagmi'

import { useLeveragedLMTPositions } from './useLMTV2Positions'
import { CHAIN_TO_NETWORK_ID, getPoolAddress } from './usePoolsOHLC'
import { chunk, getMultipleUsdPriceData } from './useUSDPrice'

/**
 * this hook fetches the price data from the currently selected pool/pair for the trade page, in addition to all the price data from the user
 * only for the trade modal page
 */
export const useAllPoolAndTokenPriceData = (
  refetchTime?: number
): {
  loading: boolean
  error: any
  tokens: { [token: string]: { usdPrice: number } } | null
  pools: {
    [poolId: string]: { priceNow: number; delta24h: number; token0IsBase: boolean; volumeUsd24h: number }
  } | null
} => {
  // fetch current token0, token1, and poolAddress
  const chainId = useChainId()
  const { poolList } = usePoolKeyList()

  // fetch user position tokens and pools
  const uniquePools:
    | {
        pool: string
        token0: string
        token1: string
        fee: number
      }[]
    | null = useMemo(() => {
    if (!poolList || !chainId) return null

    const result = poolList.map((pool) => {
      return {
        pool: getPoolAddress(pool.token0, pool.token1, pool.fee, V3_CORE_FACTORY_ADDRESSES[chainId]),
        token0: pool.token0,
        token1: pool.token1,
        fee: pool.fee,
      }
    })
    return result
  }, [poolList, chainId])

  const priceFetchEnabled = useMemo(() => {
    return Boolean(uniquePools && uniquePools.length > 0 && chainId)
  }, [uniquePools, chainId])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['price', uniquePools],
    queryFn: async () => {
      if (!uniquePools || !chainId) throw new Error('No unique pools or chainId')
      // coingecko api call
      const uniqueTokens = new Set<string>()
      const tokens: {
        [token: string]: {
          usdPrice: number
        }
      } = {}
      const pools: {
        [poolId: string]: {
          priceNow: number
          delta24h: number
          token0IsBase: boolean
          volumeUsd24h: number
        }
      } = {}
      const poolChunks = chunk(uniquePools, 30)
      const promises = poolChunks.map(async (poolChunk) => {
        const addresses = poolChunk.map((i) => i.pool)
        const response = await axios.get(formatPoolEndpoint(chainId, addresses), {
          headers: {
            Accept: 'application/json',
            'x-cg-pro-api-key': process.env.REACT_APP_GECKO_API_KEY,
          },
        })
        if (response.status === 200) {
          const { data } = response.data
          data.forEach((i: any, index: number) => {
            const { fee } = poolChunk[index]
            const {
              base_token_price_usd,
              base_token_price_quote_token,
              quote_token_price_usd,
              quote_token_price_base_token,
              price_change_percentage,
              volume_usd,
            } = i.attributes
            const { base_token, quote_token } = i.relationships
            const baseAddress = base_token.data.id.split('_')[1]
            const quoteAddress = quote_token.data.id.split('_')[1]
            const [defaultBase] = getDefaultBaseQuote(baseAddress, quoteAddress, chainId)
            const invert = defaultBase === quoteAddress
            const token0 = baseAddress.toLowerCase() < quoteAddress.toLowerCase() ? baseAddress : quoteAddress
            const token1 = baseAddress.toLowerCase() < quoteAddress.toLowerCase() ? quoteAddress : baseAddress
            const token0IsBase = token0 === defaultBase
            const { h24 } = price_change_percentage
            if (!uniqueTokens.has(baseAddress)) {
              uniqueTokens.add(baseAddress)
              // add the price data to the object
              tokens[baseAddress.toLowerCase()] = {
                usdPrice: parseFloat(base_token_price_usd),
              }
            }
            if (!uniqueTokens.has(quoteAddress)) {
              uniqueTokens.add(quoteAddress)
              // add the price data to the object
              tokens[quoteAddress.toLowerCase()] = {
                usdPrice: parseFloat(quote_token_price_usd),
              }
            }

            pools[getPoolId(token0, token1, fee)] = {
              priceNow: invert ? parseFloat(quote_token_price_base_token) : parseFloat(base_token_price_quote_token),
              delta24h: invert ? -(Number(h24) / (1 + Number(h24))) : Number(h24),
              token0IsBase,
              volumeUsd24h: Number(volume_usd.h24),
            }
          })
          return
        }
        throw new Error('Failed to fetch pool price data')
      })
      await Promise.all(promises)
      return { tokens, pools }
    },
    enabled: priceFetchEnabled,
    refetchOnMount: false,
    refetchInterval: refetchTime ?? 0,
    staleTime: 60 * 1000, // 1 minute
    placeholderData: keepPreviousData,
  })

  return useMemo(() => {
    if (!data)
      return {
        loading: isLoading,
        error: isError,
        tokens: null,
        pools: null,
      }
    const { tokens, pools } = data
    return { loading: isLoading, error: isError, tokens, pools }
  }, [data, isLoading, isError])
}

/**
 * ONLY USE WITH TRADE PAGE, queries are batched for efficiency.
 * fetches all the unique tokens from the users positions + the current pool
 *
 *  */
export const useUserAndCurrentTokenPriceData = (): {
  loading: boolean
  error: any
  tokens: {
    [token: string]: {
      usdPrice: number
      lastUpdated: number
    }
  } | null
} => {
  // fetch current token0, token1, and poolAddress
  const currentPool = useCurrentPool()
  const chainId = useChainId()
  const account = useAccount().address
  const [token0, token1] = useMemo(() => {
    if (!currentPool) return [null, null, null]
    const { token0, token1, fee } = currentPool.poolKey
    return [token0, token1]
  }, [currentPool])

  // fetch user position tokens and pools
  const { positions } = useLeveragedLMTPositions(account)
  const uniqueTokens = useMemo(() => {
    if (!positions || !token0 || !token1) return null
    const tokens = new Set<string>()
    tokens.add(token0)
    tokens.add(token1)
    positions.forEach((position) => {
      tokens.add(position.poolKey.token0)
      tokens.add(position.poolKey.token1)
    })

    return Array.from(tokens)
  }, [positions, token0, token1])

  const tokenPriceFetchEnabled = useMemo(() => {
    return Boolean(uniqueTokens && uniqueTokens.length > 0 && chainId)
  }, [uniqueTokens, chainId])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['userPriceData', 'tokens', uniqueTokens],
    queryFn: async () => {
      if (!uniqueTokens || !chainId) throw new Error('No unique pools or chainId')
      // defined.fi api call, batches in 25
      console.log('CALL in useUserAndCurrentTokenPriceData')
      return getMultipleUsdPriceData(chainId, uniqueTokens)
    },
    enabled: tokenPriceFetchEnabled,
    refetchOnMount: false,
    staleTime: 60 * 1000, // 1 minute
  })

  return useMemo(() => {
    if (!data) return { loading: isLoading, error: isError, tokens: null }
    const tokens = data.reduce((acc, token) => {
      const { address, priceUsd } = token
      acc[address.toLowerCase()] = {
        usdPrice: priceUsd,
        lastUpdated: Date.now(),
      }
      return acc
    }, {} as { [token: string]: { usdPrice: number; lastUpdated: number } })
    return { loading: isLoading, error: isError, tokens }
  }, [data, isLoading, isError])
}

const formatPoolEndpoint = (chainId: number, pools: string[]) => {
  const network = CHAIN_TO_NETWORK_ID[chainId]
  const addresses = pools.map((pool) => pool.toLowerCase()).join(',')
  return `https://pro-api.coingecko.com/api/v3/onchain/networks/${network}/pools/multi/${addresses}`
}

/**
 * ONLY USE WITH TRADE PAGE, queries are batched for efficiency.
 * fetches price data for the current pool + all the unique pools from the users positions + pinned pools
 */
export const useUserAndCurrentPoolPriceData = (): {
  loading: boolean
  error: any
  tokens: { [token: string]: { usdPrice: number } } | null
  pools: { [pool: string]: { priceNow: number; delta24h: number; token0IsBase: boolean } } | null
} => {
  // fetch current token0, token1, and poolAddress
  const currentPool = useCurrentPool()
  const chainId = useChainId()
  const account = useAccount().address
  const poolAddress = useMemo(() => {
    if (!currentPool || !chainId) return null
    const { token0, token1, fee } = currentPool.poolKey
    const poolAddress = getPoolAddress(token0, token1, fee, V3_CORE_FACTORY_ADDRESSES[chainId])
    return poolAddress
  }, [currentPool, chainId])
  const pinnedPools = usePinnedPools()

  // fetch user position tokens and pools
  const { positions } = useLeveragedLMTPositions(account)
  const uniquePools = useMemo(() => {
    if (!positions || !poolAddress || !chainId) return null
    const pools = new Set<string>()
    pools.add(poolAddress)
    positions.forEach((position) => {
      pools.add(
        getPoolAddress(
          position.poolKey.token0,
          position.poolKey.token1,
          position.poolKey.fee,
          V3_CORE_FACTORY_ADDRESSES[chainId]
        )
      )
    })
    pinnedPools.forEach((pool) => {
      pools.add(getPoolAddress(pool.token0, pool.token1, pool.fee, V3_CORE_FACTORY_ADDRESSES[chainId]))
    })

    return Array.from(pools)
  }, [positions, poolAddress, chainId])

  const priceFetchEnabled = useMemo(() => {
    return Boolean(uniquePools && uniquePools.length > 0 && chainId)
  }, [uniquePools, chainId])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['userPriceData', 'pools', uniquePools],
    queryFn: async () => {
      if (!uniquePools || !chainId) throw new Error('No unique pools or chainId')
      // coingecko api call
      const response = await axios.get(formatPoolEndpoint(chainId, uniquePools), {
        headers: {
          Accept: 'application/json',
          'x-cg-pro-api-key': process.env.REACT_APP_GECKO_API_KEY,
        },
      })

      if (response.status === 200) {
        const { data } = response.data
        const uniqueTokens = new Set<string>()
        const tokens: {
          [token: string]: {
            usdPrice: number
          }
        } = {}
        const pools: {
          [pool: string]: {
            priceNow: number
            delta24h: number
            token0IsBase: boolean
          }
        } = {}
        data.forEach((i: any) => {
          const {
            address,
            base_token_price_usd,
            base_token_price_quote_token,
            quote_token_price_usd,
            quote_token_price_base_token,
            price_change_percentage,
          } = i.attributes
          const { base_token, quote_token } = i.relationships
          const baseAddress = base_token.data.id.split('_')[1]
          const quoteAddress = quote_token.data.id.split('_')[1]
          const [defaultBase] = getDefaultBaseQuote(baseAddress, quoteAddress, chainId)
          const invert = defaultBase === quoteAddress
          const token0 = baseAddress.toLowerCase() < quoteAddress.toLowerCase() ? baseAddress : quoteAddress
          const token0IsBase = token0 === defaultBase
          const { h24 } = price_change_percentage
          if (!uniqueTokens.has(baseAddress)) {
            uniqueTokens.add(baseAddress)
            // add the price data to the object
            tokens[baseAddress.toLowerCase()] = {
              usdPrice: parseFloat(base_token_price_usd),
            }
          }
          if (!uniqueTokens.has(quoteAddress)) {
            uniqueTokens.add(quoteAddress)
            // add the price data to the object
            tokens[quoteAddress.toLowerCase()] = {
              usdPrice: parseFloat(quote_token_price_usd),
            }
          }

          pools[address.toLowerCase()] = {
            priceNow: invert ? parseFloat(quote_token_price_base_token) : parseFloat(base_token_price_quote_token),
            delta24h: invert ? -(Number(h24) / (1 + Number(h24))) : Number(h24),
            token0IsBase,
          }
        })

        return { tokens, pools }
      }
      throw new Error('Failed to fetch pool price data')
    },
    enabled: priceFetchEnabled,
    refetchOnMount: false,
    staleTime: 60 * 1000, // 1 minute
  })

  return useMemo(() => {
    if (!data)
      return {
        loading: isLoading,
        error: isError,
        tokens: null,
        pools: null,
      }
    const { tokens, pools } = data
    return { loading: isLoading, error: isError, tokens, pools }
  }, [data, isLoading, isError])
}

export const usePoolPriceData = (
  token0?: string,
  token1?: string,
  fee?: number
): {
  loading: boolean
  error: any
  data: { priceNow: number; delta24h: number; token0IsBase: boolean } | undefined
} => {
  const chainId = useChainId()
  const poolId = useMemo(() => {
    if (!chainId || !token0 || !token1 || !fee) return null
    return getPoolId(token0, token1, fee)
  }, [token0, token1, fee, chainId])

  const { loading, error, pools } = useAllPoolAndTokenPriceData()

  return useMemo(() => {
    if (!poolId || !pools) return { loading, error, data: undefined }
    const poolData = pools[poolId]
    if (!poolData) return { loading, error, data: undefined }
    return {
      loading,
      error,
      data: {
        priceNow: poolData.priceNow,
        delta24h: poolData.delta24h,
        token0IsBase: poolData.token0IsBase,
      },
    }
  }, [poolId, pools, loading, error])
}

export const useCurrentTokenPriceData = (
  token?: string
): {
  loading: boolean
  error: any
  data: { usdPrice: number } | undefined
} => {
  const { loading, error, tokens } = useAllPoolAndTokenPriceData()
  return useMemo(() => {
    if (!token || !tokens) return { loading, error, data: undefined }
    const tokenData = tokens[token.toLowerCase()]
    if (!tokenData) return { loading, error, data: undefined }
    return { loading, error, data: tokenData }
  }, [token, tokens, loading, error])
}
