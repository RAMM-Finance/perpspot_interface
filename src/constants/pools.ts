import { Currency } from '@uniswap/sdk-core'

export function getInputOutputCurrencies(
  currencyA: Currency,
  currencyB: Currency
): [inputCurrency: Currency, outputCurrency: Currency] {
  const currency0 = currencyA.wrapped.sortsBefore(currencyB.wrapped) ? currencyA : currencyB
  const currency1 = currencyA.wrapped.sortsBefore(currencyB.wrapped) ? currencyB : currencyA
  if (
    (currency0.symbol === 'LINK' && currency1.symbol === 'WETH') ||
    (currency0.symbol === 'WETH' && currency1.symbol === 'wBTC') ||
    (currency0.symbol === 'ARB' && currency1.symbol === 'WETH') ||
    (currency0.symbol === 'GMX' && currency1.symbol === 'WETH')
  ) {
    return [currency1, currency0]
  }
  return [currency0, currency1]
}
