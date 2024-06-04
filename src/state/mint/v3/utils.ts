import { Price, Token } from '@uniswap/sdk-core'
import {
  encodeSqrtRatioX96,
  FeeAmount,
  nearestUsableTick,
  priceToClosestTick,
  TICK_SPACINGS,
  TickMath,
} from '@uniswap/v3-sdk'
import JSBI from 'jsbi'

export function tryParsePrice(baseToken?: Token, quoteToken?: Token, val?: string) {
  if (!baseToken || !quoteToken || !val) {
    return undefined
  }
  let value = val
  if (val && val.toLowerCase().includes('e')) {
    value = Number(val).toFixed(22)
    // if (Number.isFinite(num)) {
    //   value = num.toString()
    // }
  }
  if (!value.match(/^\d*\.?\d+$/)) {
    return undefined
  }
  
  const [whole, fraction] = value.split('.')

  const decimals = fraction?.length ?? 0
  const withoutDecimals = JSBI.BigInt((whole ?? '') + (fraction ?? ''))
  return new Price(
    baseToken,
    quoteToken,
    JSBI.multiply(JSBI.BigInt(10 ** decimals), JSBI.BigInt(10 ** baseToken.decimals)),
    JSBI.multiply(withoutDecimals, JSBI.BigInt(10 ** quoteToken.decimals))
  )
}

export function tryParseTick(
  baseToken?: Token,
  quoteToken?: Token,
  feeAmount?: FeeAmount,
  value?: string
): number | undefined {
  if (!baseToken || !quoteToken || !feeAmount || !value) {
    return undefined
  }
  const price = tryParsePrice(baseToken, quoteToken, value)

  if (!price) {
    return undefined
  }

  let tick: number

  // check price is within min/max bounds, if outside return min/max
  const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator)

  if (JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)) {
    tick = TickMath.MAX_TICK
  } else if (JSBI.lessThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO)) {
    tick = TickMath.MIN_TICK
  } else {
    // this function is agnostic to the base, will always return the correct tick
    tick = priceToClosestTick(price)
  }

  return nearestUsableTick(tick, TICK_SPACINGS[feeAmount])
}

export function tryParseLmtTick(
  baseToken?: Token,
  quoteToken?: Token,
  feeAmount?: FeeAmount,
  value?: string,
  tickSpacing?: number,
  isLeft?: boolean
): number | undefined {
  if (!baseToken || !quoteToken || !feeAmount || !value) {
    return undefined
  }

  const price = tryParsePrice(baseToken, quoteToken, value)

  if (!price || !tickSpacing) {
    return undefined
  }

  let tick: number

  // check price is within min/max bounds, if outside return min/max
  const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator)

  if (JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)) {
    tick = TickMath.MAX_TICK
  } else if (JSBI.lessThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO)) {
    tick = TickMath.MIN_TICK
  } else {
    // this function is agnostic to the base, will always return the correct tick
    tick = priceToClosestTick(price)
  }

  if (isLeft) {
    console.log('ticks:parse', value, tick, nearestUsableTick(tick, tickSpacing), price)
  } else {
  }

  return nearestUsableTick(tick, tickSpacing)
}
