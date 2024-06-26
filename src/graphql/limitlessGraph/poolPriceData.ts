import { gql } from '@apollo/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useEffect, useState } from 'react'

import { useLimitlessSubgraph } from './limitlessClients'

dayjs.extend(utc)
dayjs.extend(weekOfYear)

export type PriceChartEntry = {
  time: number // unix timestamp
  open: number
  close: number
  high: number
  low: number
}

const PRICE_CHART = gql`
  query tokenHourDatas($startTime: Int!, $skip: Int!, $address: Bytes!) {
    tokenHourDatas(
      first: 100
      skip: $skip
      where: { token: $address, periodStartUnix_gt: $startTime }
      orderBy: periodStartUnix
      orderDirection: asc
    ) {
      periodStartUnix
      high
      low
      open
      close
    }
  }
`

export const BITQUERY_PRICE_CHART = gql`
  query MyQuery {
    EVM(dataset: archive) {
      DEXTradeByTokens(
        where: {
          Trade: {
            Currency: { SmartContract: { is: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" } }
            Side: { Currency: { SmartContract: { is: "0xdac17f958d2ee523a2206206994597c13d831ec7" } } }
          }
        }
        limit: { count: 1 }
      ) {
        Block {
          Date(interval: { in: days, count: 1 })
        }
        Trade {
          high: Price(maximum: Trade_Price)
          low: Price(minimum: Trade_Price)
          open: Price(minimum: Block_Number)
          close: Price(maximum: Block_Number)
        }
      }
    }
  }
`

export const POOL_PRICE_CHART_QUERY = gql`
  query poolHourDatas($startTime: Int!, $endTime: Int!, $address: String!, $amount: Int!) {
    poolHourDatas(
      where: { pool: $address, periodStartUnix_gt: $startTime, periodStartUnix_lt: $endTime }
      orderBy: periodStartUnix
      orderDirection: asc
      first: $amount
    ) {
      periodStartUnix
      high
      low
      open
      close
    }
  }
`

const LATEST_BAR_QUERY = gql`
  query latestBarQuery($address: String!) {
    poolHourDatas(where: { pool: $address }, orderBy: periodStartUnix, orderDirection: desc, first: 1) {
      periodStartUnix
      high
      low
      open
      close
    }
  }
`

export const LATEST_POOL_DAY_QUERY = gql`
  query latestPoolDayInfoQuery($address: String!) {
    poolDayDatas(where: { pool: $address }, orderBy: date, orderDirection: desc, first: 1) {
      date
      high
      low
      open
      close
    }
  }
`

export const LATEST_POOL_INFO_QUERY = gql`
  query latestPoolQuery($address: ID!) {
    pool(id: $address) {
      token0Price
      token1Price
    }
  }
`

// interface PriceResults {
//   poolHourDatas: {
//     periodStartUnix: number
//     high: string
//     low: string
//     open: string
//     close: string
//   }[]
// }

const tokenSearch = gql`
  query findTokens($text: String!) {
    tokenSearch(text: $text) {
      id
      name
      symbol
      decimals
    }
  }
`

/// uses limitless subgraph for token search
export function useTokenSearchQuery(text: string) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const limitlessClient = useLimitlessSubgraph()

  useEffect(() => {
    let isMounted = true // add this flag to prevent state updates on unmounted components
    if (text.length > 0) {
      setLoading(true)
      setError(null)
      limitlessClient
        .query({
          query: tokenSearch,
          variables: { text: text.toLowerCase() + ':*' },
        })
        .then(({ data }) => {
          if (isMounted) {
            setData(data)
            setLoading(false)
          }
        })
        .catch((error) => {
          if (isMounted) {
            setError(error)
            setLoading(false)
          }
        })
    }

    return () => {
      isMounted = false
    } // cleanup function to avoid memory leaks
  }, [text, limitlessClient])

  return { loading, error, data }
}
