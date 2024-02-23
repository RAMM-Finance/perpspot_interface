import axios from 'axios'
import { BigNumber as BN } from 'bignumber.js'
import { useMemo } from 'react'
import { useQuery } from 'react-query'

// const client = new GraphQLClient('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3')

const formatEndpoint = (address: string, currency: string, token: 'base' | 'quote') => {
  return `${endpoint}/networks/arbitrum/pools/${address}/ohlcv/day?limit=1&currency=${currency}&token=${token}`
}

const apiKey = process.env.REACT_APP_GECKO_API_KEY
const endpoint = 'https://pro-api.coingecko.com/api/v3/onchain'

// fetches 24h OHLCV data, in base token.
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
} {
  const { data } = useQuery(
    ['poolPriceData', poolAddress],
    async () => {
      if (!poolAddress) throw new Error('No pool address')
      try {
        if (!apiKey) throw new Error('missing key')
        let denomination
        if (
          poolAddress === '0x2f5e87C9312fa29aed5c179E456625D79015299c' ||
          poolAddress === '0x0E4831319A50228B9e450861297aB92dee15B44F' ||
          poolAddress === '0xC6962004f452bE9203591991D15f6b388e09E8D0'
        ) {
          denomination = 'quote'
        } else {
          denomination = 'base'
        }
        const response = await axios.get(
          formatEndpoint(poolAddress.toLocaleLowerCase(), 'token', denomination as 'base' | 'quote'),
          {
            headers: {
              Accept: 'application/json',
              'x-cg-pro-api-key': apiKey,
            },
          }
        )
        if (response.status === 200) {
          return response.data.data.attributes.ohlcv_list
        }
        throw new Error('Failed to fetch pool price data')
      } catch (err) {
        // console.log('poolPriceData err', err)
        throw new Error('Failed to fetch pool price data')
      }
    },
    {
      enabled: !!poolAddress,
      refetchInterval: 1000 * 20,
      keepPreviousData: true,
    }
  )

  // fetching 24h data from
  return useMemo(() => {
    if (!data) {
      return {
        data: null,
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
    }
  }, [data])
}
