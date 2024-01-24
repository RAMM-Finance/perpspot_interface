import axios from 'axios'
import { useMemo, useRef } from 'react'

import {
  HistoryCallback,
  LibrarySymbolInfo,
  PeriodParams,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../public/charting_library'

const endpoint = 'https://api.geckoterminal.com/api/v2'

const formatEndpoint = (
  address: string,
  timeframe: 'day' | 'hour' | 'minute',
  aggregate: string,
  before_timestamp: number,
  limit: number,
  currency: string,
  token: 'base' | 'quote'
) => {
  return `${endpoint}/networks/arbitrum/pools/${address}/ohlcv/${timeframe}?aggregate=${aggregate}&before_timestamp=${before_timestamp}&limit=${limit}&currency=${currency}&token=${token}`
}

// const fetchLiveBar = async()

const fetchBars = async (
  address: string,
  timeframe: 'day' | 'hour' | 'minute',
  aggregate: string,
  before_timestamp: number,
  limit: number,
  currency: string,
  token: 'base' | 'quote',
  after_timestamp: number
) => {
  try {
    const response = await axios.get(
      formatEndpoint(address.toLocaleLowerCase(), timeframe, aggregate, before_timestamp, limit, currency, token),
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )

    console.log('gecko response: ', response)
    if (response.status === 200) {
      const candles = response.data.data.attributes.ohlcv_list
      const bars = candles
        .map((candle: any) => {
          return {
            time: Number(candle[0]) * 1000,
            open: candle[1],
            high: candle[2],
            low: candle[3],
            close: candle[4],
          }
        })
        .reverse()
      return {
        error: null,
        bars,
      }
    }
    return {
      error: response.status,
      bars: [],
    }
  } catch (err) {
    console.log('gecko error: ', err)
    return {
      error: err,
      bars: [],
    }
  }
}
// 5min, 15min, 1hr, 4hr
const SUPPORTED_RESOLUTIONS = { 5: '5m', 15: '15m', 60: '1h', 240: '4h', '1D': '1d' }

const configurationData = {
  supported_resolutions: Object.keys(SUPPORTED_RESOLUTIONS),
  supports_marks: false,
  supports_timescale_marks: false,
  supports_time: true,
  reset_cache_timeout: 100,
}

type SymbolInfo = LibrarySymbolInfo & {
  poolAddress: string
}

export default function useGeckoDatafeed({ chainId }: { chainId: number }) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>()

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
          const chartData = localStorage.getItem('chartData')
          if (!chartData || symbolName === '') {
            return onResolveErrorCallback('Symbol cannot be empty')
          }
          const { baseSymbol, quoteSymbol, poolAddress } = JSON.parse(chartData)

          const symbolInfo = {
            name: baseSymbol + '/' + quoteSymbol,
            type: 'crypto',
            description: baseSymbol + '/' + quoteSymbol,
            ticker: baseSymbol + '/' + quoteSymbol,
            session: '24x7',
            minmov: 1,
            pricescale: 100,
            timezone: 'Etc/UTC',
            has_intraday: true,
            has_daily: true,
            currency_code: quoteSymbol,
            visible_plots_set: 'ohlc',
            data_status: 'streaming',
            poolAddress,
          }
          setTimeout(() => onSymbolResolvedCallback(symbolInfo))
        },
        searchSymbols: (userInput: any, exchange: any, symbolType: any, onResultReadyCallback: any) => {
          // console.log('[searchSymbols]: Method call');
        },
        getBars: async (
          symbolInfo: SymbolInfo,
          resolution: ResolutionString,
          periodParams: PeriodParams,
          onHistoryCallback: HistoryCallback,
          onErrorCallback: (error: string) => void
        ) => {
          console.log('[getBars]: Method call', resolution)
          const { poolAddress } = symbolInfo
          const { from, to, countBack } = periodParams

          let timeframe: 'hour' | 'day' | 'minute' = 'hour'
          let aggregate = '1'
          if (resolution === '1D') {
            timeframe = 'day'
            aggregate = '1'
          } else if (resolution === '60') {
            timeframe = 'hour'
            aggregate = '1'
          } else if (resolution === '240') {
            timeframe = 'hour'
            aggregate = '4'
          } else if (resolution === '15') {
            timeframe = 'minute'
            aggregate = '15'
          } else if (resolution === '5') {
            timeframe = 'minute'
            aggregate = '5'
          }

          try {
            const { bars, error } = await fetchBars(
              poolAddress.toLowerCase(),
              timeframe,
              aggregate,
              to,
              countBack,
              'token',
              'quote',
              from
            )

            const noData = bars.length === 0
            if (error) {
              return onErrorCallback('Unable to load historical data!')
            }
            // console.log(`[getBars]: returned ${data.length} bar(s)`, data[0]);
            onHistoryCallback(bars, { noData })
          } catch (err) {
            onErrorCallback('Unable to load historical data!')
          }
        },
        subscribeBars: async (
          symbolInfo: SymbolInfo,
          resolution: ResolutionString,
          onRealtimeCallback: SubscribeBarsCallback
        ) => {
          // const { poolAddress } = JSON.parse(localStorage.getItem('chartData') || '{}')
          // intervalRef.current && clearInterval(intervalRef.current)
          // intervalRef.current = setInterval(function () {
          //   fetchLiveBar(chainId, poolAddress, getCustomApiSubgraph(chainId)).then((bar) => {
          //     if (bar) {
          //       onRealtimeCallback(bar)
          //     }
          //   })
          // }, 1000)
        },
        unsubscribeBars: () => {
          intervalRef.current && clearInterval(intervalRef.current)
        },
      },
    }
  }, [chainId])
}
