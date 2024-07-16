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

  console.log('token0', token0)

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
    token0.toLowerCase() === '0x71dbf0BfC49D9C7088D160eC3b8Bb0979556Ea96'.toLowerCase() || //NZT
    token0.toLowerCase() === '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8'.toLowerCase() || //PENDLE
    token0.toLowerCase() === '0x18c11fd286c5ec11c3b683caa813b77f5163a122'.toLowerCase() || //GNS
    token0.toLowerCase() === '0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60'.toLowerCase() || //LDO
    token0.toLowerCase() === '0x539bde0d7dbd336b79148aa742883198bbf60342'.toLowerCase() || //MAGIC
    token0.toLowerCase() === '0x6694340fc020c5e6b96567843da2df01b2ce1eb6'.toLowerCase() || //STG
    token0.toLowerCase() === '0x4cb9a7ae498cedcbb5eae9f25736ae7d428c9d66'.toLowerCase() || //XAI
    token0.toLowerCase() === '0x11cdb42b0eb46d95f990bedd4695a6e3fa034978'.toLowerCase() || //CRV
    token0.toLowerCase() === '0x3082cc23568ea640225c2467653db90e9250aaa0'.toLowerCase() || //RDNT
    token0.toLowerCase() === '0x00CBcF7B3d37844e44b888Bc747bDd75FCf4E555'.toLowerCase() //XPET
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
  } else if (
    token0IsNative ||
    (token0.toLowerCase() === '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'.toLowerCase() &&
      token1.toLowerCase() === '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'.toLowerCase())
  ) {
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
