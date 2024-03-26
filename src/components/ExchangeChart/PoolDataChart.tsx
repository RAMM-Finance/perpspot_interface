import { LoadingBubble } from 'components/Tokens/loading'
import moment from 'moment'
import { IChartingLibraryWidget, LanguageCode, widget } from 'public/charting_library'
import { useEffect, useRef } from 'react'
import { useState } from 'react'
import styled from 'styled-components/macro'

import { defaultChartProps } from './constants'
import useGeckoDatafeed from './useGeckoDataFeed'

// const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI)

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 1px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

// interface ChartContainerProps {
//  symbol: ChartingLibraryWidgetOptions['symbol'];
//  interval: ChartingLibraryWidgetOptions['interval'];

//  // BEWARE: no trailing slash is expected in feed URL
//  datafeedUrl: string;
//  libraryPath: ChartingLibraryWidgetOptions['library_path'];
//  chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
//  chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
//  clientId: ChartingLibraryWidgetOptions['client_id'];
//  userId: ChartingLibraryWidgetOptions['user_id'];
//  fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
//  autosize: ChartingLibraryWidgetOptions['autosize'];
//  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
//  container: ChartingLibraryWidgetOptions['container'];
// }

const getLanguageFromURL = (): LanguageCode | null => {
  const regex = new RegExp('[\\?&]lang=([^&#]*)')
  const results = regex.exec(location.search)
  return results === null ? null : (decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode)
}

export const PoolDataChart = ({ chainId, symbol }: { chainId: number; symbol: string }) => {
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>
  // const { datafeed } = useDatafeed({ chainId })
  let newChainId = chainId == 80085? 42161: chainId 
  const { datafeed } = useGeckoDatafeed({ chainId: newChainId })
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null)
  const [chartReady, setChartReady] = useState(false)
  const [chartDataLoading, setChartDataLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(moment.now())
  const symbolRef = useRef<string>(symbol) // Initialize symbolRef with symbol

  useEffect(() => {
    symbolRef.current = symbol
    localStorage.setItem('chartData', symbol)
    // You may need to reinitialize or update your chart here if necessary
  }, [symbol])

  useEffect(() => {
    // Function to initialize the TradingView widget
    const initTradingView = () => {
      const widgetOptions = {
        debug: false,
        symbol: symbolRef.current,
        datafeed,
        theme: defaultChartProps.theme,
        container: chartContainerRef.current,
        library_path: defaultChartProps.library_path,
        locale: defaultChartProps.locale,
        loading_screen: defaultChartProps.loading_screen,
        enabled_features: defaultChartProps.enabled_features,
        disabled_features: defaultChartProps.disabled_features,
        client_id: defaultChartProps.clientId,
        user_id: defaultChartProps.userId,
        description: 'https://www.geckoterminal.com/',
        custom_css_url: defaultChartProps.custom_css_url,
        autosize: true,
        fullscreen: false,
        overrides: {
          ...defaultChartProps.overrides,
        },
        interval: '60', //getObjectKeyFromValue(period, SUPPORTED_RESOLUTIONS),
        favorites: defaultChartProps.favorites,
        custom_formatters: defaultChartProps.custom_formatters,
      }

      tvWidgetRef.current = new widget(widgetOptions as any)

      tvWidgetRef.current?.onChartReady(function () {
        setChartReady(true)
        tvWidgetRef.current?.applyOverrides({ 'mainSeriesProperties.minTick': '100000,1,false' })
        tvWidgetRef.current?.activeChart().dataReady(() => {
          setChartDataLoading(false)
        })
      })
    }

    if (tvWidgetRef.current) {
      tvWidgetRef.current.remove()
      tvWidgetRef.current = null
    }

    if (chartContainerRef.current) {
      initTradingView()
    }

    return () => {
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove()
        tvWidgetRef.current = null
      }
    }
  }, [chainId, datafeed, symbol])

  return (
    <ChartContainer>
      <div
        style={{
          padding: '5px',
          height: '100%',
          width: '100%',
          border: 'solid #98A1C03d',
          borderWidth: '0 0 0 0',
        }}
        ref={chartContainerRef}
        className="TVChartContainer"
      />
    </ChartContainer>
  )
}

export function PoolDataChartLoading() {
  return (
    <ChartContainer>
      <Bubble></Bubble>
    </ChartContainer>
  )
}

const Bubble = styled(LoadingBubble)`
  height: 550px;
  width: 100%;
`
