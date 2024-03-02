import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client'
import { Interface } from '@ethersproject/abi'
import { Token } from '@uniswap/sdk-core'
import { abi as IUniswapV3PoolStateABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { computePoolAddress, FeeAmount } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import {
  POOL_INIT_CODE_HASH,
  UNISWAP_POOL_INIT_CODE_HASH,
  V3_CORE_FACTORY_ADDRESSES as LIMITLESS_FACTORIES,
} from 'constants/addresses'
import { V3_CORE_FACTORY_ADDRESSES as UNISWAP_FACTORIES } from 'constants/addresses-uniswap'
import dayjs, { OpUnitType } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useContract } from 'hooks/useContract'
import { useEffect, useMemo, useState } from 'react'

import { useLimitlessSubgraph } from './limitlessClients'

dayjs.extend(utc)
dayjs.extend(weekOfYear)

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI)

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

interface PriceResults {
  poolHourDatas: {
    periodStartUnix: number
    high: string
    low: string
    open: string
    close: string
  }[]
}

export async function fetchPoolPriceData(
  address: string,
  startTimestamp: number,
  endTimestamp: number,
  countBack: number,
  dataClient: ApolloClient<NormalizedCacheObject>
): Promise<{
  data: PriceChartEntry[]
  error: boolean
}> {
  // start and end bounds

  try {
    // const endTimestamp = dayjs.utc().unix()

    if (!startTimestamp) {
      console.log('Error constructing price start timestamp')
      return {
        data: [],
        error: false,
      }
    }

    const {
      data: result,
      errors,
      loading,
      error,
    } = await dataClient.query({
      query: POOL_PRICE_CHART_QUERY,
      variables: {
        address: address.toLowerCase(),
        startTime: startTimestamp,
        endTime: endTimestamp,
        amount: countBack > 950 ? 950 : countBack,
      },
      fetchPolicy: 'cache-first',
    })
    const invertPrice = parseFloat(result.poolHourDatas[result.poolHourDatas.length - 1].close) < 1

    const formattedHistory = result.poolHourDatas.map((d: any) => {
      return {
        time: d.periodStartUnix * 1000,
        open: invertPrice ? 1 / parseFloat(d.open) : parseFloat(d.open),
        close: invertPrice ? 1 / parseFloat(d.close) : parseFloat(d.close),
        high: invertPrice ? 1 / parseFloat(d.low) : parseFloat(d.high),
        low: invertPrice ? 1 / parseFloat(d.high) : parseFloat(d.low),
      }
    })

    if (formattedHistory.length === 0) {
      return {
        data: [],
        error: false,
      }
    }

    if (formattedHistory.length <= countBack) {
      return {
        data: formattedHistory,
        error: false,
      }
    }

    if (formattedHistory.length > countBack) {
      return {
        data: formattedHistory.slice(formattedHistory.length - countBack, formattedHistory.length),
        error: false,
      }
    }
  } catch (e) {
    console.log('subgraph error:', e)
    return {
      data: [],
      error: true,
    }
  }

  return {
    data: [],
    error: true,
  }
}

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

export async function fetchLiveBar(
  chainId: number,
  poolAddress: string,
  dataClient: ApolloClient<NormalizedCacheObject>,
  token0IsBase: boolean
) {
  try {
    const barData = await dataClient.query({
      query: LATEST_BAR_QUERY,
      variables: {
        address: poolAddress.toLowerCase(),
      },
      fetchPolicy: 'network-only',
    })
    const price = await dataClient.query({
      query: LATEST_POOL_INFO_QUERY,
      variables: {
        address: poolAddress.toLowerCase(),
      },
      fetchPolicy: 'network-only',
    })

    // console.log("price: ", barData, price)
    if (price.data && barData.data && !price.error && !barData.error) {
      const {
        pool: { token0Price, token1Price },
      } = price.data
      const poolHourDatas = barData.data?.poolHourDatas
      if (poolHourDatas.length === 0 || (!token0Price && !token1Price)) {
        return undefined
      }

      let lastBar = poolHourDatas[0]

      const invertPrice = token0IsBase

      lastBar = {
        time: lastBar.periodStartUnix * 1000,
        open: invertPrice ? 1 / parseFloat(lastBar.open) : parseFloat(lastBar.open),
        close: invertPrice ? 1 / parseFloat(lastBar.close) : parseFloat(lastBar.close),
        high: invertPrice ? 1 / parseFloat(lastBar.high) : parseFloat(lastBar.high),
        low: invertPrice ? 1 / parseFloat(lastBar.low) : parseFloat(lastBar.low),
      }

      const currentPrice = invertPrice ? token1Price : token0Price

      const result = {
        time: Date.now(),
        open: lastBar.close,
        close: currentPrice,
        high: Math.max(lastBar.close, currentPrice),
        low: Math.min(lastBar.close, currentPrice),
      }

      return result
    }
  } catch (err) {
    console.log('error fetching live bar', err)
  }
  return
}

interface PoolPrice {
  oldestFetchedTimestamp: number
  priceData: PriceChartEntry[]
}

/**
 * Get top pools addresses that token is included in
 * If not loaded, fetch and store
 * @param address
 */
export function usePoolPriceData(
  //address: string, // pool address
  token0: Token | undefined,
  token1: Token | undefined,
  fee: FeeAmount | undefined,
  interval: number,
  timeWindow: OpUnitType
): PriceChartEntry[] | undefined {
  const { chainId } = useWeb3React()

  const [priceData, setPriceData] = useState<PoolPrice>()
  const [error, setError] = useState(false)

  const uniswapPoolAddress = useMemo(() => {
    if (chainId && token0 && token1 && fee) {
      return computePoolAddress({
        factoryAddress: UNISWAP_FACTORIES[chainId],
        tokenA: token0,
        tokenB: token1,
        fee,
        initCodeHashManualOverride: UNISWAP_POOL_INIT_CODE_HASH,
      }).toLowerCase()
    }
    return undefined
  }, [chainId, token0, token1, fee])

  const limitlessPoolAddress = useMemo(() => {
    if (chainId && token0 && token1 && fee) {
      return computePoolAddress({
        factoryAddress: LIMITLESS_FACTORIES[chainId],
        tokenA: token0,
        tokenB: token1,
        fee,
        initCodeHashManualOverride: POOL_INIT_CODE_HASH,
      }).toLowerCase()
    }
    return undefined
  }, [chainId, token0, token1, fee])

  const uniswapPoolContract = useContract(uniswapPoolAddress, POOL_STATE_INTERFACE)

  const [uniswapPoolExists, setUniswapPoolExists] = useState(false)

  // console.log("poolPriceData: ", error, uniswapPoolAddress, uniswapPoolContract, uniswapPoolExists, limitlessPoolAddress)

  useEffect(() => {
    async function fetch() {
      if (uniswapPoolAddress && uniswapPoolContract) {
        try {
          const feeGrowthGlobal0X128 = await uniswapPoolContract.callStatic.feeGrowthGlobal0X128()
          if (feeGrowthGlobal0X128) {
            setUniswapPoolExists(true)
          }
        } catch (err) {
          console.log('err: ', err)
        }
      }
    }
    fetch()
  }, [uniswapPoolAddress])

  // construct timestamps and check if we need to fetch more data
  const oldestTimestampFetched = priceData?.oldestFetchedTimestamp
  const utcCurrentTime = dayjs()
  const startTimestamp = utcCurrentTime.subtract(1, timeWindow).startOf('hour').unix()
  return priceData?.priceData ?? []
}
