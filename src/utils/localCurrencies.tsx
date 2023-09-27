import { Currency } from 'graphql/data/__generated__/types-and-hooks'
import { ReactNode } from 'react'

import {
  AUD_ICON,
  BRL_ICON,
  CAD_ICON,
  EUR_ICON,
  GBP_ICON,
  HKD_ICON,
  IDR_ICON,
  INR_ICON,
  JPY_ICON,
  NGN_ICON,
  PKR_ICON,
  RUB_ICON,
  SGD_ICON,
  THB_ICON,
  TRY_ICON,
  UAH_ICON,
  USD_ICON,
  VND_ICON,
} from './localCurrencyIcons'

export const SUPPORTED_LOCAL_CURRENCIES = [
  Currency.Usd
] as const

export type SupportedLocalCurrency = (typeof SUPPORTED_LOCAL_CURRENCIES)[number]

export const DEFAULT_LOCAL_CURRENCY: SupportedLocalCurrency = Currency.Usd

// some currencies need to be forced to use the narrow symbol and others need to be forced to use symbol
// for example: when CAD is set to narrowSymbol it is displayed as $ which offers no differentiation from USD
// but when set to symbol it is displayed as CA$ which is correct
// On the other hand when TBH is set to symbol it is displayed as THB, but when set to narrowSymbol it is ฿ which is correct
export const LOCAL_CURRENCY_SYMBOL_DISPLAY_TYPE: Record<SupportedLocalCurrency, 'narrowSymbol' | 'symbol'> = {
  USD: 'narrowSymbol',
  // EUR: 'narrowSymbol',
  // RUB: 'narrowSymbol',
  // INR: 'narrowSymbol',
  // GBP: 'narrowSymbol',
  // JPY: 'narrowSymbol',
  // VND: 'narrowSymbol',
  // SGD: 'symbol',
  // BRL: 'symbol',
  // HKD: 'symbol',
  // CAD: 'symbol',
  // IDR: 'narrowSymbol',
  // TRY: 'narrowSymbol',
  // NGN: 'narrowSymbol',
  // UAH: 'narrowSymbol',
  // PKR: 'narrowSymbol',
  // AUD: 'symbol',
  // THB: 'narrowSymbol',
}

export function getLocalCurrencyIcon(localCurrency: SupportedLocalCurrency, size = 20): ReactNode {
  switch (localCurrency) {
    case Currency.Usd:
      return <USD_ICON width={size} height={size} />
    default:
      return null
  }
}
