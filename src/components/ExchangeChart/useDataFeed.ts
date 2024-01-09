import { fetchLiveBar, fetchPoolPriceData } from 'graphql/limitlessGraph/poolPriceData'
import { getUniswapSubgraph } from 'graphql/limitlessGraph/uniswapClients'
import { useMemo, useRef } from 'react'

import {
  HistoryCallback,
  LibrarySymbolInfo,
  PeriodParams,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../public/charting_library'

export const SUPPORTED_RESOLUTIONS = { 60: '1h', 240: '4h', '1D': '1d' }

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

export default function useDatafeed({ chainId }: { chainId: number }) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>()
  // const resetCacheRef = useRef<() => void | undefined>()
  // const activeTicker = useRef<string | undefined>()
  // const shouldRefetchBars = useRef<boolean>(false)

  return useMemo(() => {
    return {
      datafeed: {
        onReady: (callback: any) => {
          // console.log('[onReady]: Method call');
          setTimeout(() => callback(configurationData))
        },
        // symbolName => JSON obj. w/ token0Symbol, token1Symbol, poolAddress
        resolveSymbol: (symbolName: string, onSymbolResolvedCallback: any, onResolveErrorCallback: any) => {
          console.log('[resolveSymbol]: Method call', symbolName)
          if (symbolName === '') {
            return onResolveErrorCallback('Symbol cannot be empty')
          }
          const { baseSymbol, quoteSymbol, poolAddress } = JSON.parse(symbolName)
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
          console.log('[getBars]: Method call', symbolInfo, periodParams)
          // if (Object.values(SUPPORTED_RESOLUTIONS).find(str => str === resolution) === undefined) {
          //   return onErrorCallback("[getBars] Invalid resolution");
          // }
          const { poolAddress } = symbolInfo
          const { from, to, countBack } = periodParams

          try {
            const { data, error } = await fetchPoolPriceData(
              poolAddress,
              from,
              to,
              countBack,
              getUniswapSubgraph(chainId)
            )
            // console.log("data", data)
            const noData = !data || data.length === 0
            if (error) {
              console.error('subgraph error: ', error, data)
              return onErrorCallback('Unable to load historical data!')
            }
            // console.log(`[getBars]: returned ${data.length} bar(s)`, data[0]);
            onHistoryCallback(data, { noData })
          } catch (err) {
            onErrorCallback('Unable to load historical data!')
          }
        },
        subscribeBars: async (
          symbolInfo: SymbolInfo,
          resolution: ResolutionString,
          onRealtimeCallback: SubscribeBarsCallback
        ) => {
          const { poolAddress } = symbolInfo
          // console.log("[subscribe bars]", useUniswapSubgraph)
          intervalRef.current && clearInterval(intervalRef.current)
          intervalRef.current = setInterval(function () {
            fetchLiveBar(chainId, poolAddress, getUniswapSubgraph(chainId)).then((bar) => {
              if (bar) {
                onRealtimeCallback(bar)
              }
            })
          }, 1000)
        },
        unsubscribeBars: () => {
          intervalRef.current && clearInterval(intervalRef.current)
        },
      },
    }
  }, [chainId])
}
