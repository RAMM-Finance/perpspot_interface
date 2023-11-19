import { Token } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { MarginPositionDetails } from 'types/lmtv2position'

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

export class MarginPosition {
  public readonly pool: Pool
  public readonly inputCurrency: Token
  public readonly outputCurrency: Token
  public readonly isToken0: boolean
  public readonly totalDebtOutput: BN
  public readonly totalDebtInput: BN
  public readonly openTime: number
  public readonly repayTime: number
  public readonly isBorrow: boolean
  public readonly premiumOwed: BN
  public readonly premiumDeposit: BN
  public readonly premiumLeft: BN
  public readonly totalPosition: BN
  public readonly margin: BN

  constructor(pool: Pool, details: MarginPositionDetails) {
    this.pool = pool
    this.inputCurrency = details.isToken0 ? pool.token1 : pool.token0
    this.outputCurrency = details.isToken0 ? pool.token0 : pool.token1
    this.isToken0 = details.isToken0
    this.totalDebtOutput = details.totalDebtOutput
    this.totalDebtInput = details.totalDebtInput
    this.openTime = details.openTime
    this.repayTime = details.repayTime
    this.isBorrow = details.isBorrow
    this.premiumOwed = details.premiumOwed
    this.premiumDeposit = details.premiumDeposit
    this.premiumLeft = details.premiumLeft
    this.totalPosition = details.totalPosition
    this.margin = details.margin
  }

  // profit/loss in input token
  public PnL(): BN {
    // input / output
    const entryPrice = this.isToken0 ? this.entryPrice() : new BN(1).div(this.entryPrice())

    const currentPrice = this.isToken0
      ? new BN(this.pool.token0Price.toFixed(18))
      : new BN(this.pool.token1Price.toFixed(18))

    return this.totalPosition.times(currentPrice.minus(entryPrice))
  }

  /**
   * @returns entry price in token1 per unit token0
   */
  public entryPrice(): BN {
    if (this.isToken0) {
      return this.totalDebtInput.plus(this.margin).div(this.totalPosition)
    } else {
      return this.totalPosition.div(this.totalDebtInput.plus(this.margin))
    }
  }

  // last repayment time + 1 day - now
  public timeLeft(): [boolean, string] {
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const duration = this.repayTime + 24 * 60 * 60 - nowInSeconds

    // Calculate hours and remaining minutes
    const durationHours = Math.floor(duration / 3600)
    const durationMinutes = Math.floor((duration % 3600) / 60)

    // Create the formatted string
    const formattedDuration = `${durationHours}hr ${durationMinutes}m`

    return [duration > 0, formattedDuration]
  }
}
