import { useQuery } from '@tanstack/react-query'
import { Currency, CurrencyAmount, Price, Token } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import { SupportedChainId } from 'constants/chains'
import { getTanTokenQueryKey } from 'lib/priceApi'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useCallback, useMemo } from 'react'
import { useChainId } from 'wagmi'

import { USDC_ARBITRUM, USDC_BASE } from '../constants/tokens'
import { getMultipleUsdPriceData } from './useUSDPrice'

// Stablecoin amounts used when calculating spot price for a given currency.
// The amount is large enough to filter low liquidity pairs.
const STABLECOIN_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Token> } = {
  // [SupportedChainId.MAINNET]: CurrencyAmount.fromRawAmount(USDC_MAINNET, 100_000e6),
  [SupportedChainId.ARBITRUM_ONE]: CurrencyAmount.fromRawAmount(USDC_ARBITRUM, 10_000e6),
  // [SupportedChainId.OPTIMISM]: CurrencyAmount.fromRawAmount(DAI_OPTIMISM, 10_000e18),
  // [SupportedChainId.POLYGON]: CurrencyAmount.fromRawAmount(USDC_POLYGON, 10_000e6),
  // [SupportedChainId.CELO]: CurrencyAmount.fromRawAmount(CUSD_CELO, 10_000e18),
  // [SupportedChainId.BNB]: CurrencyAmount.fromRawAmount(USDT_BSC, 100e18),
  [SupportedChainId.BASE]: CurrencyAmount.fromRawAmount(USDC_BASE, 10_000e6),
}

export default function useStablecoinPrice(currency?: Currency): Price<Currency, Token> | undefined {
  const chainId = useChainId()
  const amountOut = chainId ? STABLECOIN_AMOUNT_OUT[chainId] : undefined
  const stablecoin = amountOut?.currency
  const token = currency?.wrapped.address
  const enabled = useMemo(() => {
    if (!token || !chainId || !stablecoin || !currency) return false
    if (currency.wrapped.equals(stablecoin)) {
      return false
    }
    return true
  }, [token, chainId])

  const queryKey = useMemo(() => {
    if (!enabled) return []
    if (!token || !chainId) return []
    return getTanTokenQueryKey(token, chainId)
  }, [enabled, token, chainId])

  const fetchPrices = useCallback(async () => {
    if (!token || !chainId) return undefined
    const results = await getMultipleUsdPriceData(chainId, [token])
    return results[0]
  }, [chainId, token])

  const { data, isLoading, isError } = useQuery({
    queryKey,
    enabled,
    queryFn: async () => {
      const result = await fetchPrices()
      return result
    },
  })

  return useMemo(() => {
    if (!currency || !stablecoin) {
      return undefined
    }

    if (currency?.wrapped.equals(stablecoin)) {
      return new Price(stablecoin, stablecoin, '1', '1')
    }

    if (isLoading || isError || !data || !token || !chainId) return undefined

    const stableCoinAmount = new BN(data.priceUsd).shiftedBy(stablecoin.decimals).toFixed(0)
    const currencyAmount = new BN(1).shiftedBy(currency.decimals).toFixed(0)

    return new Price(currency, stablecoin, currencyAmount, stableCoinAmount)
  }, [isLoading, isError, data, token, chainId])
}

export function useStablecoinValue(currencyAmount: CurrencyAmount<Currency> | undefined | null) {
  const price = useStablecoinPrice(currencyAmount?.currency)

  return useMemo(() => {
    if (!price || !currencyAmount) return null
    try {
      return price.quote(currencyAmount)
    } catch (error) {
      return null
    }
  }, [currencyAmount, price])
}

/**
 *
 * @param fiatValue string representation of a USD amount
 * @returns CurrencyAmount where currency is stablecoin on active chain
 */
export function useStablecoinAmountFromFiatValue(fiatValue: string | null | undefined) {
  const chainId = useChainId()
  const stablecoin = chainId ? STABLECOIN_AMOUNT_OUT[chainId]?.currency : undefined

  return useMemo(() => {
    if (fiatValue === null || fiatValue === undefined || !chainId || !stablecoin) {
      return undefined
    }

    // trim for decimal precision when parsing
    const parsedForDecimals = parseFloat(fiatValue).toFixed(stablecoin.decimals).toString()
    try {
      // parse USD string into CurrencyAmount based on stablecoin decimals
      return tryParseCurrencyAmount(parsedForDecimals, stablecoin)
    } catch (error) {
      return undefined
    }
  }, [chainId, fiatValue, stablecoin])
}
