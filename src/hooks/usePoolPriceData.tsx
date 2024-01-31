import axios from 'axios'
import { BigNumber as BN } from 'bignumber.js'
import { useMemo } from 'react'
import { useQuery } from 'react-query'

// const client = new GraphQLClient('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3')

const formatEndpoint = (address: string, currency: string, token: 'base' | 'quote') => {
  return `${endpoint}/networks/arbitrum/pools/${address}/ohlcv/day?limit=1&currency=${currency}&token=${token}`
}
const endpoint = 'https://api.geckoterminal.com/api/v2'

// const getQuery = (baseAddress: string, quoteAddress: string): string => {
//   return `
//   {
//     EVM(network: arbitrum, dataset: combined) {
//       DEXTradeByTokens(
//         where: {Trade: {Side: {Currency: {SmartContract: {is: "${baseAddress}"}}}, Currency: {SmartContract: {is: "${quoteAddress}"}}}}
//         limit: {count: 1}
//         orderBy: {descending: Block_Number}
//       ) {
//         Trade {
//           high: Price(maximum: Trade_Price)
//           low: Price(minimum: Trade_Price)
//           open: Price(minimum: Block_Number)
//           close: Price(maximum: Block_Number)
//         }
//          Block {
//           Date(interval: { in: days, count: 1 })
//         }
//       }
//     }
//   }
//   `
// }

// const endpoint = 'https://streaming.bitquery.io/graphql'

export function useLatestPoolPriceData(
  // address: string | undefined | null,
  // baseAddress: string | undefined,
  // quoteAddress: string | undefined,
  poolAddress: string | undefined
  // chainId?: number
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
  // const client = new GraphQLClient(getUniswapUri(chainId))
  // poolPriceData 0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
  const { isLoading, error, data } = useQuery(
    ['poolPriceData', poolAddress],
    async () => {
      console.log('poolPriceData', poolAddress)
      if (!poolAddress) return null
      try {
        const response = await axios.get(formatEndpoint(poolAddress.toLocaleLowerCase(), 'token', 'quote'), {
          headers: {
            Accept: 'application/json',
          },
        })

        if (response.status === 200) {
          return response.data.data.attributes.ohlcv_list
        }
        return null
      } catch (err) {
        console.log('poolPriceData err', err)
        return null
      }
    },
    {
      enabled: !!poolAddress,
      refetchInterval: 1000 * 20,
    }
  )

  // fetching 24h data from
  return useMemo(() => {
    if (isLoading || error || !data) {
      return {
        data: null,
        error,
        loading: isLoading,
      }
    }

    const high24 = new BN(data[0][2])
    const low24 = new BN(data[0][3])
    const price24hAgo = new BN(data[0][1])
    const priceNow = new BN(data[0][4])

    return {
      data: {
        high24,
        low24,
        price24hAgo,
        priceNow,
      },
      error: false,
      loading: false,
    }
  }, [data, isLoading, error])
}
