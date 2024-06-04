// import { ARBITRUM, AVALANCHE } from "config/chains";

import { formatTVDate, formatTVTime } from './dateFormatters'

const RED = '#fa3c58'
const GREEN = '#0ecc83'
export const DEFAULT_PERIOD = '4h'

const chartStyleOverrides = ['candleStyle', 'hollowCandleStyle', 'haStyle'].reduce((acc: any, cv: any) => {
  acc[`mainSeriesProperties.${cv}.drawWick`] = true
  acc[`mainSeriesProperties.${cv}.drawBorder`] = false
  acc[`mainSeriesProperties.${cv}.upColor`] = GREEN
  acc[`mainSeriesProperties.${cv}.downColor`] = RED
  acc[`mainSeriesProperties.${cv}.wickUpColor`] = GREEN
  acc[`mainSeriesProperties.${cv}.wickDownColor`] = RED
  acc[`mainSeriesProperties.${cv}.borderUpColor`] = GREEN
  acc[`mainSeriesProperties.${cv}.borderDownColor`] = RED
  // acc[`mainSeriesProperties.${cv}.candleStyle.wickSize`] = 1
  // acc[`mainSeriesProperties.${cv}.wick.maxTick'`] = 1
  // acc[`mainSeriesProperties.${cv}.drawBorder`] = false
  // acc[`mainSeriesProperties.${cv}.wickSize`] = 1
  return acc
}, {})

// darkTheme;
const chartOverrides = {
  'paneProperties.background': '#040609',
  'paneProperties.backgroundGradientStartColor': '#000',
  'paneProperties.backgroundGradientEndColor': '#16182e',
  'paneProperties.backgroundType': 'solid',
  'paneProperties.vertGridProperties.color': '#1e2129',
  'paneProperties.vertGridProperties.width': 3,
  'paneProperties.vertGridProperties.style': 2,
  'paneProperties.horzGridProperties.color': '#3A404F23',
  'paneProperties.horzGridProperties.style': 2,
  'mainSeriesProperties.priceLineColor': '#4c4f6e',
  'scalesProperties.textColor': '#fff',
  'scalesProperties.lineColor': '#16182e',
  'linetoolhorzline.showLabel': true,
  'linetoolhorzline.textcolor': 'white',
  'linetoolhorzline.linecolor': 'white',
  'linetoolhorzline.linewidth': 1,
  'linetoolhorzline.linestyle': 1,
  'linetoolhorzline.fontsize': 11,
  'linetoolhorzline.horzLabelsAlign': 'right',
  ...chartStyleOverrides,
}

// limitlessTheme
// const chartOverrides = {
//   'paneProperties.background': '#141414',
//   'paneProperties.backgroundGradientStartColor': '#141414',
//   'paneProperties.backgroundGradientEndColor': '#141414',
//   'paneProperties.backgroundType': 'solid',
//   'paneProperties.vertGridProperties.color': '#141414',
//   'paneProperties.vertGridProperties.style': 2,
//   'paneProperties.horzGridProperties.color': '#141414',
//   'paneProperties.horzGridProperties.style': 2,
//   'mainSeriesProperties.priceLineColor': '#141414',
//   'scalesProperties.textColor': '#fff',
//   'scalesProperties.lineColor': '#141414',
//   ...chartStyleOverrides,
// }

export const disabledFeaturesOnMobile = ['header_saveload', 'header_fullscreen_button']

// const disabledFeatures = [
//   'volume_force_overlay',
//   'show_logo_on_all_charts',
//   'caption_buttons_text_if_possible',
//   'create_volume_indicator_by_default',
//   'header_compare',
//   'compare_symbol',
//   'display_market_status',
//   'header_interval_dialog_button',
//   'show_interval_dialog_on_key_press',
//   'header_symbol_search',
//   'popup_hints',
//   'header_in_fullscreen_mode',
//   'use_localstorage_for_settings',
//   'right_bar_stays_on_scroll',
//   'symbol_info',
// ]
// const enabledFeatures = [
//   'side_toolbar_in_fullscreen_mode',
//   'header_in_fullscreen_mode',
//   'hide_resolution_in_legend',
//   'items_favoriting',
//   'hide_left_toolbar_by_default',
// ]
const disabledFeatures = [
  'volume_force_overlay',
  'show_logo_on_all_charts',
  'caption_buttons_text_if_possible',
  'create_volume_indicator_by_default',
  'header_compare',
  'compare_symbol',
  'display_market_status',
  'header_interval_dialog_button',
  'show_interval_dialog_on_key_press',
  'header_symbol_search',
  'popup_hints',
  'header_in_fullscreen_mode',
  'use_localstorage_for_settings',
  'right_bar_stays_on_scroll',
  'symbol_info',
]
const enabledFeatures = [
  'side_toolbar_in_fullscreen_mode',
  'header_in_fullscreen_mode',
  'hide_resolution_in_legend',
  'items_favoriting',
  'hide_left_toolbar_by_default',
  '',
]

export const defaultChartProps = {
  theme: 'Dark',
  locale: 'en',
  library_path: '/charting_library/',
  clientId: 'tradingview.com',
  userId: 'public_user_id',
  fullscreen: false,
  autosize: true,
  header_widget_dom_node: false,
  overrides: chartOverrides,
  enabled_features: enabledFeatures,
  disabled_features: disabledFeatures,
  custom_css_url: '../tradingview-chart.css',
  loading_screen: { backgroundColor: '#040609', foregroundColor: '#040609' },
  favorites: {
    intervals: ['15'],
  },
  custom_formatters: {
    timeFormatter: {
      format: (date: any) => formatTVTime(date),
    },
    dateFormatter: {
      format: (date: any) => formatTVDate(date),
    },
    priceFormatterFactory: (symbolInfo: any, minTick: any) => {
      if (symbolInfo === null) {
        return null
      }
      return {
        format: (price: any, signPositive: any) => {
          if (price < 0.0000001) {
            return new Intl.NumberFormat('en-US', {
              notation: 'scientific',
              minimumSignificantDigits: 3,
              maximumSignificantDigits: 4,
            }).format(price)
          } else if (price < 0.0001) {
            return new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 9,
            }).format(price)
          } else if (price < 1) {
            return new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 8,
            }).format(price)
          } else {
            return new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 2,
            }).format(price)
          }
        },
      }
      // if (symbolInfo.format === 'minmov') {

      // }
      // return null // The default formatter will be used.
    },
  },
}
