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
  if (
    token0.toLowerCase() === '0x3c281a39944a2319aa653d81cfd93ca10983d234'.toLowerCase() || // BUILD
    token0.toLowerCase() === '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe'.toLowerCase() || // HIGHER
    token0.toLowerCase() === '0x1CD38856EE0fDFD65c757E530E3B1dE3061008d3'.toLowerCase() || // GROOVE
    token0.toLowerCase() === '0x38d513Ec43ddA20f323f26c7bef74c5cF80b6477'.toLowerCase() || // CARLO
    token0.toLowerCase() === '0x0c41F1FC9022FEB69aF6dc666aBfE73C9FFDA7ce'.toLowerCase() || // BTCB
    token0.toLowerCase() === '0x18A8BD1fe17A1BB9FFB39eCD83E9489cfD17a022'.toLowerCase() || // ANDY
    token0.toLowerCase() === '0x3B9728bD65Ca2c11a817ce39A6e91808CceeF6FD'.toLowerCase() || // IHF
    token0.toLowerCase() === '0x21eCEAf3Bf88EF0797E3927d855CA5bb569a47fc'.toLowerCase() || // void
    token0.toLowerCase() === '0x33ad778E6C76237d843c52d7cAfc972bB7cF8729'.toLowerCase() || //BOSHI
    token0.toLowerCase() === '0x71dbf0BfC49D9C7088D160eC3b8Bb0979556Ea96'.toLowerCase() //NZT
  ) {
    base = token0
    quote = token1
    inputInToken0 = false
  } else if (token0IsStable) {
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
