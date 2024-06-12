import axios from 'axios'
import { Bar } from 'public/charting_library/datafeed-api'
// import { fetchLiveBar } from 'graphql/limitlessGraph/poolPriceData'
import { useMemo, useRef, useState } from 'react'
import { formatFetchLiveBarEndpoint, formatGeckoOhlcEndpoint } from 'utils/geckoUtils'

import {
  HistoryCallback,
  LibrarySymbolInfo,
  PeriodParams,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../public/charting_library'
import { gql, useSubscription } from '@apollo/client'
import { resolve } from 'path'
import { setBaseCurrencyIsInputToken } from 'state/marginTrading/actions'

const apiKey = process.env.REACT_APP_GECKO_API_KEY
const apiKeyV3 = process.env.REACT_APP_DEFINEDFI_KEY
/*
 *
 * @param address: pool address
 * @param timeframe
 * @param aggregate
 * @param before_timestamp
 * @param limit
 * @param currency
 * @param token
 * @param chainId
 * @returns
 */


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
    // if (timeframe === 'hour' && aggregate === '4') {
    //   limit = 1000
    // }

    // adjusted chainId
    const response = await axios.get(
      formatGeckoOhlcEndpoint(
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

const fetchBarsV2 = async (
  poolAddress: string,
  chainId: number,
  periodParams: PeriodParams,
  resolution: ResolutionString
): Promise<{
  bars: Bar[]
  error: any
}> => {
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

  let numFetched = 0
  let before_timestamp = to
  const bars: Bar[] = []
  while (numFetched < countBack) {
    const limit = Math.min(1000, countBack - numFetched)

    const response = await axios.get(
      formatGeckoOhlcEndpoint(
        poolAddress.toLocaleLowerCase(),
        timeframe,
        aggregate,
        before_timestamp,
        limit,
        'token',
        'base',
        chainId
      ),
      {
        headers: {
          Accept: 'application/json',
          'x-cg-pro-api-key': apiKey,
        },
      }
    )
    console.log(
      'zeke:chart:[getBars]:axios',
      periodParams.countBack,
      response.data.data.attributes.ohlcv_list.length,
      numFetched
    )

    if (response.status !== 200) {
      console.log('zeke:1')
      return {
        error: 'failed to fetch bars',
        bars: [],
      }
    }

    if (response.data.data.attributes.ohlcv_list.length === 0) {
      return {
        error: null,
        bars,
      }
    }

    const candles = response.data.data.attributes.ohlcv_list
    const newBars: Bar[] = candles
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
    bars.push(...newBars)
    bars.sort((a, b) => a.time - b.time)
    numFetched += bars.length
    // !bars[bars.length - 1] && console.log('zeke:', before_timestamp, limit, response, bars[bars.length - 1], bars)
    before_timestamp = bars[bars.length - 1].time

    if (numFetched === countBack) {
      return {
        error: null,
        bars,
      }
    }

    if (newBars.length < limit) {
      return {
        error: null,
        bars,
      }
    }
  }

  return {
    error: 'failed to fetch bars',
    bars: [],
  }
}


const fetchBarsV3 = async (
  poolAddress: string,
  chainId: number,
  periodParams: PeriodParams,
  resolution: ResolutionString,
  token0IsBase: boolean | undefined,
  isUSDChart: boolean
): Promise<{
  bars: Bar[]
  error: any
}> => {
  const { from, to, countBack } = periodParams
  let numFetched = 0
  let before_timestamp = to
  const bars: Bar[] = []
  while (numFetched < countBack) {
    
    const limit = Math.min(1500, countBack - numFetched)
    // let isToken0 = token0IsBase
    let isToken0 = poolAddress.toLowerCase() !== '0xd0b53d9277642d899df5c87a3966a349a798f224'.toLowerCase() ? token0IsBase : !token0IsBase // WETH/USDC BASE
    const query = `
      {
        getBars(symbol:"${poolAddress}:${chainId}" countback:${limit} currencyCode:"${isUSDChart ? 'USD' : 'TOKEN'}" from:${from} to:${before_timestamp} resolution:"${resolution}" quoteToken:${isToken0 ? `token0` : `token1`}) {
          o h l c v s t liquidity
        }
      }
    `
    const response = await axios.post(
      'https://graph.defined.fi/graphql', {
        query: query
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: apiKeyV3, 
        },
      }
    )
    if (response.status !== 200) {
      console.log('zeke:1')
      return {
        error: 'failed to fetch bars',
        bars: [],
      }
    }

    // if (!response.data.data.getBars) {
    //   return {
    //     error: null,
    //     bars,
    //   }
    // }
    if (response.data.data.getBars.t.length === 0) {
      return {
        error: null,
        bars,
      }
    }


    const getBars = response.data.data.getBars
    const newBars: Bar[] = getBars.t
      .map((t: any, index: any) => {
        const open = getBars.o[index]
        const high = getBars.h[index]
        const low = getBars.l[index]
        const close = getBars.c[index]

        if (open === null || high === null || low === null || close === null) {
          return null
        }

        return {
          time: t * 1000,
          open,
          high,
          low,
          close
        };
      })
      .filter((bar: any) => bar !== null)
      .reverse()

    newBars.sort((a, b) => a.time - b.time)

    bars.push(...newBars)
    bars.sort((a, b) => a.time - b.time)
    
    numFetched += newBars.length
    // !bars[bars.length - 1] && console.log('zeke:', before_timestamp, limit, response, bars[bars.length - 1], bars)
    before_timestamp = Math.floor(bars[0]?.time / 1000)

    if (numFetched >= countBack) {
      return {
        error: null,
        bars,
      }
    }

    if (newBars.length < limit) {
      return {
        error: null,
        bars,
      }
    }

  }
  return {
    error: 'failed to fetch bars',
    bars: []
  }
}

const fetchLiveGeckoBar = async (
  address: string,
  timeframe: 'day' | 'hour' | 'minute',
  aggregate: string,
  token0IsBase: boolean | undefined,
  chainId: number,
  isUSDChart: boolean
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

    
    let isToken0 = address.toLowerCase() !== '0xd0b53d9277642d899df5c87a3966a349a798f224'.toLowerCase() ? token0IsBase : !token0IsBase // WETH/USDC BASE
    const tokenOrUSD = isUSDChart ? 'usd' : 'token'
    const response = await axios.get(
      formatFetchLiveBarEndpoint(address.toLocaleLowerCase(), timeframe, aggregate, tokenOrUSD, 'base', chainId),
      {
        headers: {
          Accept: 'application/json',
          'x-cg-pro-api-key': apiKey,
        },
      }
    )

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

let webSocket: WebSocket | null = null
let currentWebSocket: WebSocket | null = null
let currentChainId: number | null = null
let currentResolution: ResolutionString | null = null
let currentPoolAddress: string | null = null
let currentChart: boolean | null = null


const getWebSocket = () => {
  if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
    webSocket = new WebSocket(
      `wss://realtime-api.defined.fi/graphql`,
      "graphql-transport-ws"
    );
    webSocket.onopen = () => {
      console.log("WebSocket is open now.", webSocket, webSocket?.readyState, WebSocket.OPEN);
      if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(
          JSON.stringify({
            "type": "connection_init",
            "payload": {
              "Authorization": apiKeyV3
            }
          })
        )
      } else {
        webSocket!.addEventListener('open', () => {
          webSocket!.send(
            JSON.stringify({
              "type": "connection_init",
              "payload": {
                "Authorization": apiKeyV3
              }
            })
          );
        });
      }
    };

    webSocket.onclose = function(event) {
      console.log('WebSocket is closed. Reconnect will be attempted in 5 seconds.', event.reason);
      setTimeout(function() {
        getWebSocket();
      }, 5000);
    };
  
    webSocket.onerror = function(err) {
      console.error('WebSocket encountered error: ', err, 'Closing socket');
      webSocket!.close();
    };
  }
  return webSocket
};

const fetchLiveDefinedBar = async (
  poolAddress: string,
  chainId: number,
  resolution: ResolutionString,
  token0IsBase: boolean | undefined,
  isUSDChart: boolean,
  onData: (data: {
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
  }) => void
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
  return new Promise((resolve, reject) => {
    try { 
      console.log("WEBSOCKET IN FETCH", currentWebSocket)
      if (currentWebSocket) {

        currentWebSocket.onmessage = (event: any) => {
          const data = JSON.parse(event.data);    
          if (data.type === "connection_ack") {
            // let isToken0 = token0IsBase
            let isToken0 = (poolAddress.toLowerCase() === '0xd0b53d9277642d899df5c87a3966a349a798f224'.toLowerCase() && isUSDChart) ? !token0IsBase : token0IsBase // WETH/USDC BASE
            console.log("Connection acknowledged, subscribing...");

            const query = `
            subscription OnBarsUpdated($pairId: String) {
              onBarsUpdated(pairId: $pairId, quoteToken:${isToken0 ? `token0` : `token1`}) {
                eventSortKey
                networkId
                pairAddress
                pairId
                timestamp
                quoteToken
                aggregates {
                  r${resolution} {
                    t
                    ${isUSDChart ? 'usd' : 'token'} {
                      t
                      o
                      h
                      l
                      c
                      volume
                    }
                  }
                }
              }
            }
            `
            console.log("poolAddress", poolAddress)
            console.log("resolution", resolution)
            console.log("isUSDCHART", isUSDChart)
            console.log("QUERY", query)
            currentWebSocket!.send(
              JSON.stringify({
                id: "my_id",
                type: "subscribe",
                payload: {
                  variables: {
                    pairId: `${poolAddress}:${chainId}`
                  },
                  operationName: "OnBarsUpdated",
                    query: query
                }
              })
            );
          } else if (data.type === 'next') {
            const barData = isUSDChart
            ? data.payload.data.onBarsUpdated.aggregates['r' + resolution].usd
            : data.payload.data.onBarsUpdated.aggregates['r' + resolution].token

            const bar = {
              time: Number(barData.t) * 1000,
              open: barData.o,
              high: barData.h,
              low: barData.l,
              close: barData.c,
            }
            resolve({
              bar,
              error: undefined
            })

            onData({
              bar,
              error: undefined
            })
            
          } else {
            console.log("Other message received:", data);
            resolve({
              bar: undefined,
              error: undefined
            })
            onData({
              bar: undefined,
              error: undefined
            })
          }
        };
      }
    } catch (err) {
      console.log('gecko error on fetchLiveDefinedBar: ', err)
      resolve({
        error: err,
        bar: undefined,
      })
    }
  })

}

// 5min, 15min, 1hr, 4hr
const SUPPORTED_RESOLUTIONS = { 1: '1m', 5: '5m', 15: '15m', 30: '30m', 60: '1h', 240: '4h', '1D': '1d', '1W': '1w' }

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
  invertPrice: boolean // indicates whether to invert the gecko data
}

export default function useGeckoDatafeed(token0IsBase: boolean | undefined, isUSDChart: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>()
  let lastBarTime = 0

  return useMemo(() => {
    return {
      datafeed: {
        onReady: (callback: any) => {
          console.log('chart:[onReady]: Method call')
          setTimeout(() => callback(configurationData))
        },
        // symbolName => JSON obj. w/ token0Symbol, token1Symbol, poolAddress
        resolveSymbol: (symbolName: string, onSymbolResolvedCallback: any, onResolveErrorCallback: any) => {
          console.log('chart:[resolveSymbol]: Method call', symbolName)
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
            pricescale: 10000000000,
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
          const { poolAddress, chainId, invertPrice } = symbolInfo

          try {
            const { bars, error } = await fetchBarsV3(poolAddress.toLowerCase(), chainId, periodParams, resolution, token0IsBase, isUSDChart)

            // const { bars, error } = await fetchBarsV2(poolAddress.toLowerCase(), chainId, periodParams, resolution)
            console.log('chart:[getBars]', periodParams, bars?.length, error)
            const noData = bars.length === 0
            if (error) {
              return onErrorCallback('axios error!')
            }

            let filteredBars = bars.map((bar, index, array) => {
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
              if (index !== array.length - 1) {
                if (bar.close !== array[index + 1].open) {
                  bar.close = array[index + 1].open
                }
              }
              return {
                open: invertPrice ? 1 / bar.open : bar.open,
                close: invertPrice ? 1 / bar.close : bar.close,
                time: bar.time,
                high: invertPrice ? 1 / low : high,
                low: invertPrice ? 1 / high : low,
              }
            })

            const currentTime = Date.now();
            filteredBars = filteredBars.filter(bar => bar.time <= currentTime)
            // const filteredBarsWithoutLast = filteredBars.filter(bar => !bar.isLastBar)
            // onHistoryCallback(filteredBarsWithoutLast, { noData })
            
            if (periodParams.firstDataRequest) {
              const lastBar = filteredBars[filteredBars.length - 1]
              const initialBar = {
                open: lastBar.close,
                high: lastBar.close,
                low: lastBar.close,
                close: lastBar.close,
                time: filteredBars[filteredBars.length - 1].time,
              }
              localStorage.setItem('initialBar', JSON.stringify(initialBar))  
            }
            onHistoryCallback(filteredBars, { noData })

            // const filteredBarsWithoutLast = filteredBars.slice(0, -1);

            // console.log("FILTEREDBARS", filteredBarsWithoutLast)
            // onHistoryCallback(filteredBarsWithoutLast, { noData });
            
          } catch (err) {
            console.log('chart:[getBars]', err)
            onErrorCallback('Unable to load historical data!') 
          }
        },
        subscribeBars: async (
          symbolInfo: SymbolInfo,
          resolution: ResolutionString,
          onRealtimeCallback: SubscribeBarsCallback
        ) => {

          const { chainId, invertPrice } = symbolInfo
          const { poolAddress } = JSON.parse(localStorage.getItem('chartData') || '{}')

          // if (currentWebSocket) {
          //   if (currentChainId !== chainId || currentResolution !== resolution || currentPoolAddress !== poolAddress || currentChart !== isUSDChart) {
          //     console.log("CLOSE SOCkET!!")
          //     currentWebSocket.close()
          //     currentWebSocket = null
          //   }
          // }
          

          currentWebSocket = getWebSocket()
          currentChainId = chainId
          currentResolution = resolution
          currentPoolAddress = poolAddress
          currentChart = isUSDChart
          
          const resolutionBarData: { [key: string]: number } = {
            '1':  60 * 1000,
            '5': 300 * 1000,
            '15': 900 * 1000,
            '30': 1800 * 1000,
            '60': 3600 * 1000,
            '240': 14400 * 1000,
            '1D': 86400 * 1000,
            '7D': 604800 * 1000
          }

          intervalRef.current && clearInterval(intervalRef.current)

          const intervalTime = resolutionBarData[resolution]

          const now = new Date();
          
          let delay = intervalTime - (now.getTime() % intervalTime);
          // if (delay >= 3000) {
          //   delay = delay - 3000;
          // } else {
          //   delay = 57000 + delay;
          // } // for webSocket delay
          setTimeout(function update() {
            const currentTime = new Date();

            let minutes;
            let hours;
            switch (resolution) {
              case '1':
                minutes = Math.floor(currentTime.getMinutes());
                break;
              case '5':
                minutes = Math.floor(currentTime.getMinutes() / 5) * 5;
                break;
              case '15':
                minutes = Math.floor(currentTime.getMinutes() / 15) * 15;
                break;
              case '30':
                minutes = Math.floor(currentTime.getMinutes() / 30) * 30;
                break;
              case '60':
                minutes = 0;
                break;
              case '240':
                hours = Math.floor(currentTime.getHours() / 4) * 4;
                minutes = 0;
                break;
              case '1W':
                hours = 0;
                minutes = 0;
                break;
              default:
                minutes = currentTime.getMinutes();
            }
            
            if (hours !== undefined) {
              currentTime.setHours(hours);
            }
            currentTime.setMinutes(minutes, 0, 0);

            const initialLastBar = JSON.parse(localStorage.getItem('initialBar') || '{}');
          
            const emptyBar = {
              open: initialLastBar.close,
              close: initialLastBar.close,
              time: currentTime.getTime(),
              high: initialLastBar.close,
              low: initialLastBar.close,
            };
            
            onRealtimeCallback(emptyBar);
          
            setTimeout(update, intervalTime);
          }, delay);

          await fetchLiveDefinedBar(poolAddress.toLowerCase(), chainId, resolution, token0IsBase, isUSDChart, (res) => {
            const bar = res.bar
            if (bar) {
              console.log("ORIGINAL bar", bar)
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
                open: bar.open,
                close: bar.close,
                time: bar.time,
                high: bar.high, // from high to bar.high
                low: bar.low, // from low to bar.low
              }
              console.log("LAST BAR TIME AND ENW BAR", lastBarTime, newBar.time)
              if (lastBarTime <= newBar.time) {
                console.log("ADDING NEW BAR IN SUBSCRIBE", newBar)
                onRealtimeCallback(newBar)
                
                const initialBar = {
                  open: newBar.close,
                  high: newBar.close,
                  low: newBar.close,
                  close: newBar.close,
                  time: newBar.time,
                }
                localStorage.setItem('initialBar', JSON.stringify(initialBar))  
                lastBarTime = newBar.time
              } else {
                console.error('Time violation: new bar time should be greater than the last bar time')
              }
            }
          })
        },
        unsubscribeBars: () => {
          console.log('UNSUBSCRIBEEE')
          intervalRef.current && clearInterval(intervalRef.current)
          if (currentWebSocket) {
            currentWebSocket.close()
            currentWebSocket = null 
          }
        },
      },
    }
  }, [token0IsBase, isUSDChart])
}
