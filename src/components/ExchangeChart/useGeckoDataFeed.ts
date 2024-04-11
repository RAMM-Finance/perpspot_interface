import axios from 'axios'
import { CHAIN_TO_NETWORK_ID } from 'hooks/usePoolsOHLC'
// import { fetchLiveBar } from 'graphql/limitlessGraph/poolPriceData'
import { useMemo, useRef } from 'react'

import {
  HistoryCallback,
  LibrarySymbolInfo,
  PeriodParams,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../public/charting_library'

const endpoint = 'https://pro-api.coingecko.com/api/v3/onchain'

const formatFetchBarEndpoint = (
  address: string,
  timeframe: 'day' | 'hour' | 'minute',
  aggregate: string,
  before_timestamp: number,
  limit: number,
  currency: string,
  token: 'base' | 'quote',
  chainId: number
) => {
  const network = CHAIN_TO_NETWORK_ID[chainId] ?? 'arbitrum'
  return `${endpoint}/networks/${network}/pools/${address}/ohlcv/${timeframe}?aggregate=${aggregate}&before_timestamp=${before_timestamp}&limit=${limit}&currency=${currency}&token=${token}`
}

const formatFetchLiveBarEndpoint = (
  address: string,
  timeframe: 'day' | 'hour' | 'minute',
  aggregate: string,
  currency: string,
  token: 'base' | 'quote',
  chainId: number
) => {
  const network = CHAIN_TO_NETWORK_ID[chainId] ?? 'arbitrum'
  return `${endpoint}/networks/${network}/pools/${address}/ohlcv/${timeframe}?aggregate=${aggregate}&currency=${currency}&token=${token}&limit=1`
}

const apiKey = process.env.REACT_APP_GECKO_API_KEY

const fetchBars = async (
  address: string,
  timeframe: 'day' | 'hour' | 'minute',
  aggregate: string,
  before_timestamp: number,
  limit: number,
  currency: string,
  token: 'base' | 'quote',
  chainId: number
): Promise<{
  bars: {
    open: number
    high: number
    low: number
    close: number
    time: number
  }[]
  error: any
}> => {
  try {
    // Check if the timeframe is '4h', then set the limit to 1000
    if (timeframe === 'hour' && aggregate === '4') {
      limit = 1000
    }

    // adjusted chainId
    const response = await axios.get(
      formatFetchBarEndpoint(
        address.toLocaleLowerCase(),
        timeframe,
        aggregate,
        before_timestamp,
        limit,
        currency,
        token,
        chainId
      ),
      {
        headers: {
          Accept: 'application/json',
          'x-cg-pro-api-key': apiKey,
        },
      }
    )

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
    console.log('gecko error on fetchBars: ', err)
    return {
      error: err,
      bars: [],
    }
  }
}

const fetchLiveGeckoBar = async (
  address: string,
  timeframe: 'day' | 'hour' | 'minute',
  aggregate: string,
  token: 'base' | 'quote',
  chainId: number
): Promise<{
  bar:
    | {
        open: number
        high: number
        low: number
        close: number
        time: number
      }
    | undefined
  error: any
}> => {
  try {
    console.log("gecko request")
    const response = await axios.get(
      formatFetchLiveBarEndpoint(address.toLocaleLowerCase(), timeframe, aggregate, 'token', token, chainId),
      {
        headers: {
          Accept: 'application/json',
          'x-cg-pro-api-key': apiKey,
        },
      }
    )

    console.log('gecko response: ', response)
    if (response.status === 200) {

      const candles = response.data.data.attributes.ohlcv_list
      const bar = {
        time: Number(candles[0][0]) * 1000,
        open: candles[0][1],
        high: candles[0][2],
        low: candles[0][3],
        close: candles[0][4],
      }
      return {
        error: null,
        bar,
      }
    }
    return {
      error: response.status,
      bar: undefined,
    }
  } catch (err) {
    console.log('gecko error on fetchLiveGeckoBar: ', err)
    return {
      error: err,
      bar: undefined,
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
  chainId: number
  invertPrice: boolean
}

export default function useGeckoDatafeed() {
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
          const { baseSymbol, quoteSymbol, poolAddress, chainId, invertPrice } = JSON.parse(chartData)
          const symbolInfo = {
            name: baseSymbol + '/' + quoteSymbol,
            type: 'crypto',
            description: baseSymbol + '/' + quoteSymbol,
            ticker: baseSymbol + '/' + quoteSymbol,
            session: '24x7',
            minmov: 1,
            pricescale: 1000000,
            timezone: 'Etc/UTC',
            has_intraday: true,
            has_daily: true,
            currency_code: quoteSymbol,
            invertPrice,
            visible_plots_set: 'ohlc',
            data_status: 'streaming',
            poolAddress,
            chainId,
            format: 'pricescale',
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
          const { poolAddress, chainId, invertPrice } = symbolInfo
          const { from, to, countBack } = periodParams
          // console.log(countBack, '-----countback----------');
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
            // console.log('poolAddress', poolAddress)
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

            const { bars, error } = await fetchBars(
              poolAddress.toLowerCase(),
              timeframe,
              aggregate,
              to,
              countBack,
              'token',
              denomination as 'base' | 'quote',
              chainId
            )
            const noData = bars.length === 0
            if (error) {
              return onErrorCallback('Unable to load historical data!')
            }

            const filteredBars = bars.map((bar, index, array) => {
              // Calculate wick lengths as a percentage of the bar's open-close range
              const highWickLength = Math.abs(bar.high - bar.close)
              const lowWickLength = Math.abs(bar.low - bar.close)

              // Define max and min wick length
              const maxWickLength = 0.4 // Maximum wick length as a percentage of the bar's open-close range
              const minWickLength = 0.3 // Minimum wick length as a percentage of the bar's open-close range

              let high = bar.high
              let low = bar.low

              // Adjust high and low prices if wick lengths exceed maximum or minimum values
              if (highWickLength > maxWickLength * (bar.close - bar.open)) {
                high = bar.close + maxWickLength * (bar.close - bar.open)
              } else if (highWickLength < minWickLength * (bar.close - bar.open)) {
                high = bar.close + minWickLength * (bar.close - bar.open)
              }
              if (lowWickLength > maxWickLength * (bar.close - bar.open)) {
                low = bar.close - maxWickLength * (bar.close - bar.open)
              } else if (lowWickLength < minWickLength * (bar.close - bar.open)) {
                low = bar.close - minWickLength * (bar.close - bar.open)
              }

              return {
                open: invertPrice ? 1 / bar.open : bar.open,
                close: invertPrice ? 1 / bar.close : bar.close,
                time: bar.time,
                high: invertPrice ? 1 / low : high,
                low: invertPrice ? 1 / high : low,
              }
            })

            // console.log(`[getBars]: returned ${data.length} bar(s)`, data[0]);
            onHistoryCallback(filteredBars, { noData })
          } catch (err) {
            onErrorCallback('Unable to load historical data!')
          }
        },
        subscribeBars: async (
          symbolInfo: SymbolInfo,
          resolution: ResolutionString,
          onRealtimeCallback: SubscribeBarsCallback
        ) => {
          const { chainId, invertPrice } = symbolInfo

          const { poolAddress, token0IsBase } = JSON.parse(localStorage.getItem('chartData') || '{}')

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


          intervalRef.current && clearInterval(intervalRef.current)
          intervalRef.current = setInterval(function () {
            fetchLiveGeckoBar(poolAddress.toLowerCase(), timeframe, aggregate, token0IsBase ? 'base' : 'quote', chainId).then((res) => {
              const bar = res.bar
              console.log("resbar", bar, invertPrice)
              if (bar) {
                const highWickLength = Math.abs(bar.high - bar.close)
                const lowWickLength = Math.abs(bar.low - bar.close)
  
                // Define max and min wick length
                const maxWickLength = 0.4 // Maximum wick length as a percentage of the bar's open-close range
                const minWickLength = 0.3 // Minimum wick length as a percentage of the bar's open-close range
  
                let high = bar.high
                let low = bar.low
  
                // Adjust high and low prices if wick lengths exceed maximum or minimum values
                if (highWickLength > maxWickLength * (bar.close - bar.open)) {
                  high = bar.close + maxWickLength * (bar.close - bar.open)
                } else if (highWickLength < minWickLength * (bar.close - bar.open)) {
                  high = bar.close + minWickLength * (bar.close - bar.open)
                }
                if (lowWickLength > maxWickLength * (bar.close - bar.open)) {
                  low = bar.close - maxWickLength * (bar.close - bar.open)
                } else if (lowWickLength < minWickLength * (bar.close - bar.open)) {
                  low = bar.close - minWickLength * (bar.close - bar.open)
                }
                const newBar = {
                  open: invertPrice ? 1 / bar.open : bar.open,
                  close: invertPrice ? 1 / bar.close : bar.close,
                  time: bar.time,
                  high: invertPrice ? 1 / low : high,
                  low: invertPrice ? 1 / high : low,
                }
                console.log("resbar newBar", newBar)
                onRealtimeCallback(newBar)
              }
            })
            // fetchLiveBar(chainId, poolAddress, customArbitrumClient, token0IsBase).then((bar) => {
            //   // console.log('bar', bar)
            //   if (bar) {
            //     onRealtimeCallback(bar)
            //   }
            // })
          }, 10000)
        },
        unsubscribeBars: () => {
          intervalRef.current && clearInterval(intervalRef.current)
        },
      },
    }
  }, [])
}

function filterOHLCBar(bar: any, index: number, array: any[]) {
  let prevBar
  let nextBar
  if (index === 0) {
    nextBar = array[index + 1]
  } else if (index === array.length - 1) {
    prevBar = array[index - 1]
  } else {
    prevBar = array[index - 1]
    nextBar = array[index + 1]
  }

  return true
}
