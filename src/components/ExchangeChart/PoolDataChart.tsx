import { fadeInOut } from 'components/Loader/styled'
import { unsupportedChain } from 'components/NavBar/ChainSelector'
import { IChartingLibraryWidget, widget } from 'public/charting_library'
import { useEffect, useMemo, useRef } from 'react'
import { useState } from 'react'
import { AlertTriangle } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'
import { useChainId } from 'wagmi'

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

  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    width: 100%;
    height: 400px;
  }
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
  token0IsBase,
  currentPrice,
  tokenPrice,
}: {
  symbol?: string | null
  chartContainerRef: React.MutableRefObject<HTMLInputElement>
  entryPrices: number[] | undefined
  tokenPrice: number | undefined
  token0IsBase: boolean | undefined
  currentPrice?: number | undefined
}) => {
  const [isUSDChart, setUSDChart] = useState(false)
  const chainId = useChainId()
  const { datafeed } = useGeckoDatafeed(token0IsBase, isUSDChart)
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null)
  const [chartReady, setChartReady] = useState(false)
  const [chartDataLoading, setChartDataLoading] = useState(true)
  const symbolRef = useRef<string>() // Initialize symbolRef with symbol

  useEffect(() => {
    // Check if initialValue is not null and not undefined
    if (symbol !== null && symbol !== undefined) {
      symbolRef.current = symbol
      localStorage.setItem('chartData', symbol)
    }
  }, [symbol])
  const entryLength = useMemo(() => {
    if (!entryPrices || chartDataLoading || !chainId) return undefined
    return entryPrices.length
  }, [entryPrices, chartDataLoading, chainId])

  const entryPrice = entryPrices ? entryPrices[0] : undefined

  // const [rangeLow, rangeHigh] = useMemo(() => {
  //   if (!entryPrice || !currentPrice || !tokenPrice) return [undefined, undefined]

  //   if (entryPrice > currentPrice) {
  //     return [
  //       (isUSDChart ? entryPrice * tokenPrice : entryPrice) * 1.02,
  //       (isUSDChart ? currentPrice * tokenPrice : currentPrice) * 0.98,
  //     ]
  //   } else {
  //     return [
  //       (isUSDChart ? currentPrice * tokenPrice : currentPrice) * 1.02,
  //       (isUSDChart ? entryPrice * tokenPrice : entryPrice) * 0.98,
  //     ]
  //   }
  // }, [entryPrice, currentPrice, isUSDChart, !tokenPrice])

  const entries = useMemo(() => {
    if (!entryPrices || chartDataLoading || !chainId || !tokenPrice) return undefined
    if (entryPrices) {
      const id =
        tvWidgetRef.current?.chart().getAllShapes() && tvWidgetRef.current?.chart().getAllShapes().length > 0
          ? tvWidgetRef.current?.chart().getAllShapes()[0].id
          : undefined
      if (entryLength === 0) {
        tvWidgetRef.current?.chart().removeAllShapes()
      }
      if (entryLength === 1) {
        id ? tvWidgetRef.current?.chart().removeEntity(id) : undefined
        tvWidgetRef.current
          ?.chart()
          .createShape(
            { time: Date.now(), price: isUSDChart ? entryPrices[0] * tokenPrice : entryPrices[0] },
            { shape: 'horizontal_line', text: 'Entry Price', zOrder: 'top' }
          )
      }
      if (entryLength === 2) {
        tvWidgetRef.current
          ?.chart()
          .createShape(
            { time: Date.now(), price: isUSDChart ? entryPrices[0] * tokenPrice : entryPrices[0] },
            { shape: 'horizontal_line', text: 'Entry Price', zOrder: 'top' }
          )

        tvWidgetRef.current
          ?.chart()
          .createShape(
            { time: Date.now(), price: isUSDChart ? entryPrices[1] * tokenPrice : entryPrices[1] },
            { shape: 'horizontal_line', text: 'Entry Price', zOrder: 'top' }
          )
      }
    }
    return
  }, [chartDataLoading, entryLength, entryPrice])

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

        tvWidgetRef.current?.onChartReady(() => {
          const button = tvWidgetRef.current?.createButton()
          if (button) {
            button.setAttribute('title', isUSDChart ? 'Switch to price in WETH' : 'Switch to price in USD')
            button.classList.add('apply-common-tooltip')
            button.classList.add('clickable')
            button.onclick = function () {
              setUSDChart(!isUSDChart)
            }
            button.innerHTML = isUSDChart
              ? '<span style="color: blue;">USD</span> / WETH'
              : 'USD / <span style="color: blue;">WETH</span>'
          }
          setChartReady(true)
          tvWidgetRef.current?.applyOverrides({
            'mainSeriesProperties.minTick': '100000,1,false',
          })
          tvWidgetRef.current?.activeChart().dataReady(() => {
            setChartDataLoading(false)
          })
          const priceScale = tvWidgetRef?.current?.activeChart().getPanes()[0].getMainSourcePriceScale()
          if (priceScale && entryPrice) {
            const lowScale = priceScale.getVisiblePriceRange()?.from
            const highScale = priceScale.getVisiblePriceRange()?.to
            if (lowScale && highScale && entryPrice < lowScale) {
              priceScale.setVisiblePriceRange({ from: entryPrice, to: highScale })
            }
            if (lowScale && highScale && entryPrice > highScale) {
              priceScale.setVisiblePriceRange({ from: lowScale, to: entryPrice })
            }
          }
        })
      }

      if (tvWidgetRef.current) {
        setChartDataLoading(() => true)
        tvWidgetRef.current.remove()
        tvWidgetRef.current = null
      }

      if (chartContainerRef.current) {
        initTradingView()
        entries
      }
    }
    return () => {
      if (tvWidgetRef.current) {
        setChartDataLoading(() => true)
        tvWidgetRef.current.remove()
        tvWidgetRef.current = null
      }
    }
  }, [chainId, datafeed, symbol, isUSDChart])

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
