import { Pool } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { MarginLimitOrder } from 'types/lmtv2position'

// export interface BaseFacilityPositionDetails {
//   poolKey: RawPoolKey
//   isToken0: boolean
//   totalDebtOutput: CurrencyAmount<Currency>
//   totalDebtInput: CurrencyAmount<Currency>
//   openTime: number
//   repayTime: number
//   isBorrow: boolean
//   premiumOwed: CurrencyAmount<Currency> // how much premium is owed since last repayment
//   premiumDeposit: CurrencyAmount<Currency>
//   premiumLeft: CurrencyAmount<Currency>
// }

// export interface MarginPositionDetails extends BaseFacilityPositionDetails {
//   totalPosition: CurrencyAmount<Currency>
//   margin: CurrencyAmount<Currency>
// }

export class OrderPosition {
  public readonly pool: Pool
  public readonly auctionDeadline: number
  public readonly auctionStartTime: number
  public readonly decayRate: BN
  public readonly inputAmount: BN
  public readonly isAdd: boolean
  public readonly margin: BN
  public readonly minOutput: BN
  public readonly startOutput: BN

  constructor(pool: Pool, details: MarginLimitOrder) {
    this.pool = pool
    this.auctionDeadline = details.auctionDeadline
    this.auctionStartTime = details.auctionStartTime
    this.decayRate = details.decayRate
    this.inputAmount = details.inputAmount
    this.isAdd = details.isAdd
    this.margin = details.margin
    this.minOutput = details.minOutput
    this.startOutput = details.startOutput
  }
}
