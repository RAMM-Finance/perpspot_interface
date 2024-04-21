import { getNativeAddress, getStables } from 'constants/fake-tokens'
import { MarginPositionDetails, PoolKey } from 'types/lmtv2position'

export function getDefaultBaseQuote(
  tokenA: string,
  tokenB: string,
  chainId: number
): [base: string, quote: string, inputInToken0ByDefault: boolean] {
  const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA]
  const stables = getStables(chainId)
  const native = getNativeAddress(chainId)
  const token0IsStable = !!stables.find((stable) => stable.toLowerCase() === token0.toLowerCase())
  const token1IsStable = !!stables.find((stable) => stable.toLowerCase() === token1.toLowerCase())
  const token0IsNative = native.toLowerCase() === token0.toLowerCase()
  const token1IsNative = native.toLowerCase() === token1.toLowerCase()

  let base = token0
  let quote = token1
  let inputInToken0 = false
  if (token0IsStable) {
    base = token1
    quote = token0
    inputInToken0 = true
  } else if (token1IsStable) {
    base = token0
    quote = token1
  } else if (token0IsNative) {
    base = token1
    quote = token0
    inputInToken0 = true
  } else if (token1IsNative) {
    base = token0
    quote = token1
    inputInToken0 = true
  }

  return [base, quote, inputInToken0]
}

export function positionIsLong(chainId: number, position: MarginPositionDetails, poolKey: PoolKey): boolean {
  const [base, quote, inputIsToken0ByDefault] = getDefaultBaseQuote(poolKey.token0, poolKey.token1, chainId)
  const isToken0 = position.isToken0

  if ((!isToken0 && inputIsToken0ByDefault) || (isToken0 && !inputIsToken0ByDefault)) {
    return true
  }

  return false
}
