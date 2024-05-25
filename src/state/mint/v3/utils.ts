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
  if (baseToken?.symbol === 'BUILD' || quoteToken?.symbol === 'BUILD') console.log("11111111111")
  if (!baseToken || !quoteToken || !val) {
    return undefined
  }
  let value = val
  if (baseToken.symbol === 'BUILD' || quoteToken.symbol === 'BUILD') console.log("21222222")
  if (val && val.toLowerCase().includes('e')) {
    value = Number(val).toFixed(22)
    console.log("NUMMMM", value)
    // if (Number.isFinite(num)) {
    //   value = num.toString()
    // }
  }
  if (baseToken.symbol === 'BUILD' || quoteToken.symbol === 'BUILD') console.log("333333333", value)
  if (!value.match(/^\d*\.?\d+$/)) {
    return undefined
  }
  if (baseToken.symbol === 'BUILD' || quoteToken.symbol === 'BUILD') console.log("444444444444444")
  

  const [whole, fraction] = value.split('.')

  const decimals = fraction?.length ?? 0
  const withoutDecimals = JSBI.BigInt((whole ?? '') + (fraction ?? ''))
  if (baseToken.symbol === 'BUILD' || quoteToken.symbol === 'BUILD') console.log("55555555")
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
  if (baseToken?.symbol === "BUILD" || quoteToken?.symbol === "BUILD") console.log("5555 in tryParseLMT price", price)

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
  if (baseToken?.symbol === "BUILD" || quoteToken?.symbol === "BUILD") console.log("5555 in tryParseLMT", tick, tickSpacing)

  if (isLeft) {
    console.log('ticks:parse', value, tick, nearestUsableTick(tick, tickSpacing), price)
  } else {
  }

  return nearestUsableTick(tick, tickSpacing)
}
