import axios from 'axios'
import { useMemo, useRef } from 'react'

import {
  HistoryCallback,
  LibrarySymbolInfo,
  PeriodParams,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../public/charting_library'

const endpoint = 'https://streaming.bitquery.io/graphql'

const getQuery = (
  from: string,
  to: string,
  baseAddress: string,
  quoteAddress: string,
  count: number,
  interval: 'minutes' | 'months' | 'hours'
): string => {
  return `
  {
    EVM(network: arbitrum, dataset: combined) {
      DEXTradeByTokens(
        where: {Trade: {Side: {Currency: {SmartContract: {is: "${baseAddress}"}}}, Currency: {SmartContract: {is: "${quoteAddress}"}}}, Block: {Time: {till: "${to}", since: "${from}"}}}
        orderBy: {ascending: Block_Time}
        limit: {count: ${count}}
      ) {
        Trade {
          high: Price(maximum: Trade_Price)
          low: Price(minimum: Trade_Price)
          open: Price(minimum: Block_Number)
          close: Price(maximum: Block_Number)
        }
         Block {
          Date(interval: { in: days, count: 1 })
        }
        count
      }
    }
  }
  `
}

const SUPPORTED_DETAILS = ['1', '5', '15', '30', '60', '240', '1D', '1W']

const configurationData = {
  supported_resolutions: SUPPORTED_DETAILS,
  supports_marks: false,
  supports_timescale_marks: false,
  supports_time: true,
  reset_cache_timeout: 100,

  session: '24x7',
  timezone: 'Etc/UTC',
  minmov: 1,
  pricescale: 10000, // Adjust as needed
  has_intraday: true,
  intraday_multipliers: ['1', '5', '15', '30', '60'],
  has_empty_bars: false,
  has_weekly_and_monthly: false,
  // supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M'],
  supported_intervals: ['1', '5', '15', '30', '60', '240', '1D', '1W'],
}

type SymbolInfo = LibrarySymbolInfo & {
  baseAddress: string
  quoteAddress: string
}

const fetchBitqueryBars = async (
  baseAddress: string,
  quoteAddress: string,
  interval: 'minutes' | 'months',
  from: number,
  count: number,
  to: number
) => {
  // console.log('fetchBitqueryBars', from, to, baseAddress, quoteAddress, interval)
  // return []
  console.log(
    'bitquery',
    from,
    new Date(from * 1000).toISOString(),
    to,
    new Date(to * 1000).toISOString(),
    getQuery(
      new Date(from * 1000).toISOString(),
      new Date(to * 1000).toISOString(),
      baseAddress,
      quoteAddress,
      count,
      interval
    )
  )
  const response = await axios.post(
    endpoint,
    {
      query: getQuery(
        new Date(from * 1000).toISOString(),
        new Date(to * 1000).toISOString(),
        baseAddress,
        quoteAddress,
        count,
        interval
      ),
      mode: 'cors',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_BITQUERY_ACCESS}`,
      },
    }
  )
  console.log('response', response)
  if (response.data.data.EVM.DEXTradeByTokens.length === 0) return []
  return response.data.data.EVM.DEXTradeByTokens.map((data: any) => {
    return {
      time: new Date(data.Block.Time).getTime(),
      open: Number(data.Trade.open.toFixed(18)),
      high: Number(data.Trade.high.toFixed(18)),
      low: Number(data.Trade.low.toFixed(18)),
      close: Number(data.Trade.close.toFixed(18)),
    }
  })
}

export function useBitQueryDataFeed() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>()
  // const resetCacheRef = useRef<() => void | undefined>()
  // const activeTicker = useRef<string | undefined>()
  // const shouldRefetchBars = useRef<boolean>(false)

  return useMemo(() => {
    return {
      datafeed: {
        onReady: (callback: any) => {
          console.log('[onReady]: Method call')
          setTimeout(() => callback(configurationData))
        },
        // symbolName => JSON obj. w/ token0Symbol, token1Symbol, poolAddress
        resolveSymbol: (symbolName: string, onSymbolResolvedCallback: any, onResolveErrorCallback: any) => {
          console.log('[resolveSymbol]: Method call', symbolName)
          if (symbolName === '') {
            return onResolveErrorCallback('Symbol cannot be empty')
          }
          const { baseSymbol, quoteSymbol, baseAddress, quoteAddress } = JSON.parse(symbolName)

          const symbolInfo = {
            name: baseSymbol + '/' + quoteSymbol,
            type: 'crypto',
            description: baseSymbol + '/' + quoteSymbol,
            ticker: baseSymbol + '/' + quoteSymbol,
            session: '24x7',
            minmov: 1,
            pricescale: 10000,
            timezone: 'Etc/UTC',
            has_intraday: true,
            has_daily: true,
            currency_code: quoteSymbol,
            visible_plots_set: 'ohlc',
            data_status: 'streaming',
            baseAddress,
            quoteAddress,
          }
          setTimeout(() => onSymbolResolvedCallback(symbolInfo))
        },
        searchSymbols: (userInput: any, exchange: any, symbolType: any, onResultReadyCallback: any) => {
          console.log('[searchSymbols]: Method call', userInput, exchange, symbolType)
        },
        getBars: async (
          symbolInfo: SymbolInfo,
          resolution: ResolutionString,
          periodParams: PeriodParams,
          onHistoryCallback: HistoryCallback,
          onErrorCallback: (error: string) => void
        ) => {
          console.log('[getBars]: Method call', resolution, symbolInfo, periodParams)
          const { from, to, countBack } = periodParams
          const { baseAddress, quoteAddress } = symbolInfo
          try {
            const interval = resolution === '1M' ? 'months' : 'minutes'
            console.log('getBars', resolution, baseAddress, quoteAddress, interval, from, countBack, to)
            const bars = await fetchBitqueryBars(baseAddress, quoteAddress, interval, from, countBack, to)
            if (bars.length === 0) {
              onHistoryCallback([], { noData: true })
            } else {
              onHistoryCallback(bars, { noData: false })
            }
          } catch (err) {
            onErrorCallback('Unable to load historical data!')
          }
        },
        subscribeBars: async (
          symbolInfo: SymbolInfo,
          resolution: ResolutionString,
          onRealtimeCallback: SubscribeBarsCallback
        ) => {
          console.log('[subscribeBars]: Method call with subscribe request', symbolInfo)
          // const { poolAddress } = symbolInfo
          // intervalRef.current && clearInterval(intervalRef.current)
          // intervalRef.current = setInterval(function () {
          //   fetchLiveBar(chainId, poolAddress, getUniswapSubgraph(chainId)).then((bar) => {
          //     if (bar) {
          //       onRealtimeCallback(bar)
          //     }
          //   })
          // }, 1000)
        },
        unsubscribeBars: () => {
          console.log('[unsubscribeBars]: Method call')
          intervalRef.current && clearInterval(intervalRef.current)
        },
      },
    }
  }, [])
}
