import { formatPrice, NumberType } from '@uniswap/conedison/format'
import { Price, Token } from '@uniswap/sdk-core'

import { Bound } from '../state/mint/v3/actions'
import { BigNumber } from '@ethersproject/bignumber';
import { formatBNToString } from 'lib/utils/formatLocaleNumber';

interface FormatTickPriceArgs {
  price: Price<Token, Token> | undefined
  atLimit: { [bound in Bound]?: boolean | undefined }
  direction: Bound
  placeholder?: string
  numberType?: NumberType
}

export function formatTickPrice({ price, atLimit, direction, placeholder, numberType }: FormatTickPriceArgs) {
  if (!price || !price.numerator || !price.denominator) {
    throw new Error('Price object is undefined or invalid');
  }
  if (atLimit[direction]) {
    return direction === Bound.LOWER ? '0' : '∞'
  }

  if (!price && placeholder !== undefined) {
    return placeholder
  }
  // console.log('formatTickPrice',  formatBNToString(price,NumberType.TokenNonTx, true) )
  
  return formatPrice(price, numberType ?? NumberType.TokenNonTx)
}