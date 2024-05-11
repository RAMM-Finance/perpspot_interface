import { formatNumberOrString, NumberType } from '@uniswap/conedison/format'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from 'constants/locales'

interface FormatLocaleNumberArgs {
  number: CurrencyAmount<Currency> | Price<Currency, Currency> | number
  locale: string | null | undefined
  options?: Intl.NumberFormatOptions
  sigFigs?: number
  fixedDecimals?: number
}

export default function formatLocaleNumber({
  number,
  locale,
  sigFigs,
  fixedDecimals,
  options = {},
}: FormatLocaleNumberArgs): string {
  let localeArg: string | string[]
  if (!locale || (locale && !SUPPORTED_LOCALES.includes(locale))) {
    localeArg = DEFAULT_LOCALE
  } else {
    localeArg = [locale, DEFAULT_LOCALE]
  }
  options.minimumFractionDigits = options.minimumFractionDigits || fixedDecimals
  options.maximumFractionDigits = options.maximumFractionDigits || fixedDecimals

  // Fixed decimals should override significant figures.
  options.maximumSignificantDigits = options.maximumSignificantDigits || fixedDecimals ? undefined : sigFigs

  let numberString: number
  if (typeof number === 'number') {
    numberString = fixedDecimals ? parseFloat(number.toFixed(fixedDecimals)) : number
  } else {
    const baseString = parseFloat(number.toSignificant(sigFigs))
    numberString = fixedDecimals ? parseFloat(baseString.toFixed(fixedDecimals)) : baseString
  }

  return numberString.toLocaleString(localeArg, options)
}

BN.config({ EXPONENTIAL_AT: 1e9 })

export function formatBNToString(
  n: BN | undefined,
  type = NumberType.SwapTradeAmount,
  isPrice?: boolean,
  liqNumber = 0,
  placeholder = ''
): string {
  if (n === undefined) return placeholder
  if (n.isNaN()) return placeholder
  if (isPrice) {
    if (liqNumber) {
      return formatNumberOrString(n?.toNumber() / Number(`1e${liqNumber}`), type)
        .split('$')
        .join('')
    } else {
      if (n.lt(0.0000001)) {
        return new Intl.NumberFormat('en-US', {
          notation: 'scientific',
          minimumSignificantDigits: 3,
          maximumSignificantDigits: 4,
        }).format(n.toNumber())
      } else if (n.lt(1)) {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6, minimumFractionDigits: 3 }).format(
          n.toNumber()
        )
      } else {
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n.toNumber())
      }
    }
  }
  if (liqNumber) {
    return formatNumberOrString(n.toNumber() / Number(`1e${liqNumber}`), type)
  }
  return formatNumberOrString(n.toNumber(), type)
}
