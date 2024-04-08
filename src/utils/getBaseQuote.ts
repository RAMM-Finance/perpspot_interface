import { getNativeAddress, getStables } from 'constants/fake-tokens'

export function getBaseQuote(tokenA: string, tokenB: string, chainId: number): [base: string, quote: string] {
  const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA]
  let quote = token1.toLowerCase()
  let base = token0.toLowerCase()
  const stables = getStables(chainId)
  const native = getNativeAddress(chainId)
  const quoteIsStable = !!stables.find((stable) => stable.toLowerCase() === token1.toLowerCase())
  const baseIsStable = !!stables.find((stable) => stable.toLowerCase() === token0.toLowerCase())
  const quoteIsNative = native.toLowerCase() === quote
  const baseIsNative = native.toLowerCase() === base

  if (baseIsStable) {
    ;[base, quote] = [quote, base]
  } else if (!quoteIsStable && baseIsNative) {
    ;[base, quote] = [quote, base]
  }

  return [base, quote]
}
