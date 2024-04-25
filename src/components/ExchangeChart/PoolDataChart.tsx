import { useWeb3React } from '@web3-react/core'
// const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateABI)
import { fadeInOut } from 'components/Loader/styled'
import { unsupportedChain } from 'components/NavBar/ChainSelector'
import moment from 'moment'
import { IChartingLibraryWidget, widget } from 'public/charting_library'
import { useEffect, useMemo, useRef } from 'react'
import { useState } from 'react'
import { AlertTriangle } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { ReactComponent as ChartLoader } from '../../assets/images/chartLoader.svg'
import { defaultChartProps } from './constants'
import useGeckoDatafeed from './useGeckoDataFeed'
const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 1px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const ChartLoadingBar = styled(ChartLoader)`
  animation: ${fadeInOut} 2s infinite;
`

const UnsupportedChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border: solid ${({ theme }) => theme.backgroundOutline};
  border-width: 1px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.backgroundSurface};
`

export const PoolDataChart = ({
  symbol,
  chartContainerRef,
  entryPrices,
}: {
  symbol?: string | null
  chartContainerRef: React.MutableRefObject<HTMLInputElement>
  entryPrices: number[] | undefined
}) => {
  const { chainId } = useWeb3React()

  const { datafeed } = useGeckoDatafeed()
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null)
  const [chartReady, setChartReady] = useState(false)
  const [chartDataLoading, setChartDataLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(moment.now())
  const symbolRef = useRef<string>() // Initialize symbolRef with symbol

  useEffect(() => {
    // Check if initialValue is not null and not undefined
    if (symbol !== null && symbol !== undefined) {
      symbolRef.current = symbol
      localStorage.setItem('chartData', symbol)
    }
  }, [symbol])

  const entryLength = useMemo(() => {
    if (!entryPrices) return 0
    return entryPrices.length
  }, [entryPrices])

  const entries = useMemo(() => {
    if (!entryLength || !entryPrices || !tvWidgetRef.current) return
    if (entryLength > 0) {
      const newPos = entryLength - 1
      return tvWidgetRef.current
        ?.activeChart()
        .createPositionLine()
        .setPrice(entryPrices[newPos])
        .setText('Entry Price')
        .setLineColor('#3a3e5e')
        .setLineWidth(0.5)
        .setQuantityBackgroundColor('#3A404F23')
        .setQuantityBorderColor('#3A404F23')
        .setQuantityTextColor('#3A404F23')
        .setBodyFont('courier, courier new, serif')
        .setBodyBackgroundColor('#3a3e5e')
        .setBodyBorderColor('#3a3e5e')
        .setBodyTextColor('white')
    } else {
      return
    }
  }, [tvWidgetRef, entryLength])

  useEffect(() => {
    // Function to initialize the TradingView widget
    if (symbolRef.current) {
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

          entries

          {
            if (entryPrices?.length === 1) {
              return tvWidgetRef.current
                ?.activeChart()
                .createPositionLine()
                .setPrice(entryPrices[0])
                .setText('Entry Price')
                .setLineColor('#3a3e5e')
                .setLineWidth(0.5)
                .setQuantityBackgroundColor('#3A404F23')
                .setQuantityBorderColor('#3A404F23')
                .setQuantityTextColor('#3A404F23')
                .setBodyFont('courier, courier new, serif')
                .setBodyBackgroundColor('#3a3e5e')
                .setBodyBorderColor('#3a3e5e')
                .setBodyTextColor('white')
            } else if (entryPrices?.length === 2) {
              return (
                tvWidgetRef.current
                  ?.activeChart()
                  .createPositionLine()
                  .setPrice(entryPrices[0])
                  .setText('Entry Price')
                  .setLineColor('#3a3e5e')
                  .setLineWidth(0.5)
                  .setQuantityBackgroundColor('#3A404F23')
                  .setQuantityBorderColor('#3A404F23')
                  .setQuantityTextColor('#3A404F23')
                  .setBodyFont('courier, courier new, serif')
                  .setBodyBackgroundColor('#3a3e5e')
                  .setBodyBorderColor('#3a3e5e')
                  .setBodyTextColor('white') &&
                tvWidgetRef.current
                  ?.activeChart()
                  .createPositionLine()
                  .setPrice(entryPrices[1])
                  .setText('Entry Price')
                  .setLineColor('#3a3e5e')
                  .setLineWidth(0.5)
                  .setQuantityBackgroundColor('#3A404F23')
                  .setQuantityBorderColor('#3A404F23')
                  .setQuantityTextColor('#3A404F23')
                  .setBodyFont('courier, courier new, serif')
                  .setBodyBackgroundColor('#3a3e5e')
                  .setBodyBorderColor('#3a3e5e')
                  .setBodyTextColor('white')
              )
            } else {
              return
            }
          }
        })
      }

      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove()
        tvWidgetRef.current = null
      }

      if (chartContainerRef.current) {
        initTradingView()
      }
    }
    return () => {
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove()
        tvWidgetRef.current = null
      }
    }
  }, [chainId, datafeed, symbol])

  const theme = useTheme()

  if (!chainId) {
    return null
  }

  if (unsupportedChain(chainId)) {
    return (
      <UnsupportedChartContainer>
        <ThemedText.DeprecatedLabel>Unsupported Chain</ThemedText.DeprecatedLabel>
        <AlertTriangle size={18} color={theme.textSecondary} />
      </UnsupportedChartContainer>
    )
  }

  if (!symbol) {
    return (
      <ChartContainer>
        <div
          style={{
            padding: '5px',
            height: '100%',
            width: '100%',
            border: 'solid #98A1C03d',
            borderWidth: '0 0 0 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ChartLoadingBar />
          {/* <span>Icon by Solar Icons from SVG Repo (https://www.svgrepo.com)</span> */}
        </div>
      </ChartContainer>
    )
  }

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
