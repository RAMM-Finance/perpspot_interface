import { SupportedChainId } from 'constants/chains'
import { getNativeAddress, getStables } from 'constants/fake-tokens'

export function getDefaultBaseQuote(
  tokenA: string,
  tokenB: string,
  chainId: number
): [base: string, quote: string, inputInToken0: boolean] {
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
    base = token0
    quote = token1
    inputInToken0 = true
  } else if (token1IsNative) {
    base = token1
    quote = token0
    inputInToken0 = true
  }

  if (chainId === SupportedChainId.BASE) {
    if (token1.toLowerCase() === '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4'.toLowerCase()) {
      base = token0
      quote = token1
      inputInToken0 = true
    }
  }

  return [base, quote, inputInToken0]
}
