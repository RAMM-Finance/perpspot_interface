import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useMemo } from 'react'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { useChainId } from 'wagmi'

import useAutoRouterSupported from './useAutoRouterSupported'
import { useClientSideV3Trade } from './useClientSideV3Trade'
import useDebounce from './useDebounce'
import useIsWindowVisible from './useIsWindowVisible'

/**
 * Returns the best v2+v3 trade for a desired swap.
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useBestTrade(
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency
): {
  state: TradeState
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
} {
  const chainId = useChainId()
  const autoRouterSupported = useAutoRouterSupported()
  const isWindowVisible = useIsWindowVisible()

  const [debouncedAmount, debouncedOtherCurrency] = useDebounce(
    useMemo(() => [amountSpecified, otherCurrency], [amountSpecified, otherCurrency]),
    200
  )

  const isAWrapTransaction = useMemo(() => {
    if (!chainId || !amountSpecified || !debouncedOtherCurrency) return false
    const weth = WRAPPED_NATIVE_CURRENCY[chainId]
    return (
      (amountSpecified.currency.isNative && weth?.equals(debouncedOtherCurrency)) ||
      (debouncedOtherCurrency.isNative && weth?.equals(amountSpecified.currency))
    )
  }, [amountSpecified, chainId, debouncedOtherCurrency])

  const shouldGetTrade = !isAWrapTransaction && isWindowVisible

  const useFallback = shouldGetTrade

  // only use client side router if routing api trade failed or is not supported
  const bestV3Trade = useClientSideV3Trade(
    tradeType,
    useFallback ? debouncedAmount : undefined,
    useFallback ? debouncedOtherCurrency : undefined
  )
  // console.log('zeke-start:', bestV3Trade, isLoading, routingAPITrade, useFallback, shouldGetTrade)
  // only return gas estimate from api if routing api trade is used
  return useMemo(
    () => ({
      ...bestV3Trade,
    }),
    [bestV3Trade, useFallback]
  )
}
