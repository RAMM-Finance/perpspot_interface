import { BigNumber as BN } from 'bignumber.js'
import { POOL_PRICE_CHART_QUERY } from 'graphql/limitlessGraph/poolPriceData'
import { getUniswapUri } from 'graphql/limitlessGraph/uniswapClients'
import { GraphQLClient } from 'graphql-request'
import { useMemo } from 'react'
import { useQuery } from 'react-query'

// const client = new GraphQLClient('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3')

export function useLatestPoolPriceData(
  address: string | undefined | null,
  chainId?: number
): {
  data: {
    high24: BN
    low24: BN
    price24hAgo: BN
    priceNow: BN
  } | null
  error: any
  loading: boolean
} {
  const client = new GraphQLClient(getUniswapUri(chainId))
  const { data, error, isLoading } = useQuery(
    ['poolPriceData', address],
    async () => {
      if (!address) return null

      const result = await client.request(POOL_PRICE_CHART_QUERY, {
        startTime: Math.floor(Date.now() / 1000) - 60 * 60 * 24,
        endTime: Math.floor(Date.now() / 1000),
        amount: 24,
        address: address.toLowerCase(),
      })

      return result
    },
    {
      enabled: !!address,
    }
  )

  // fetching 24h data from
  return useMemo(() => {
    if (!data || data.poolHourDatas.length === 0)
      return {
        data: null,
        error,
        loading: isLoading,
      }
    // get 24h high, low
    const high24 = new BN(Math.max(...data.poolHourDatas.map((item: any) => Number(item.high))))
    const low24 = new BN(Math.min(...data.poolHourDatas.map((item: any) => Number(item.low))))
    const price24hAgo = new BN(data.poolHourDatas[0].open)
    const priceNow = new BN(data.poolHourDatas[data.poolHourDatas.length - 1].close)
    return {
      data: {
        high24,
        low24,
        price24hAgo,
        priceNow,
      },
      error,
      loading: isLoading,
    }
  }, [data, error, isLoading])
}
