import { Token } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import JSBI from 'jsbi'
// constants used internally but not expected to be used externally
export const NEGATIVE_ONE = JSBI.BigInt(-1)
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)

// used in liquidity amount math
export const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))
export const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2))

export class TokenBN extends BN {
  public tokenDecimals: number
  public tokenSymbol: string | undefined
  public tokenName: string | undefined
  public tokenAddress: string
  constructor(val: BN.Value, token: Token, isRaw: boolean) {
    if (isRaw) {
      super(new BN(val).shiftedBy(-token.decimals))
    } else {
      super(val)
    }
    this.tokenDecimals = token.decimals
    this.tokenSymbol = token.symbol
    this.tokenName = token.name
    this.tokenAddress = token.address
  }

  public rawAmount(): string {
    return this.shiftedBy(this.tokenDecimals).toFixed(0)
  }
}
