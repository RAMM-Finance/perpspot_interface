import { Currency, CurrencyAmount, Price, Token } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { BnToCurrencyAmount } from 'state/marginTrading/hooks'
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
  public readonly totalDebtOutput: CurrencyAmount<Currency>
  public readonly totalDebtInput: CurrencyAmount<Currency>
  public readonly openTime: number
  public readonly repayTime: number
  public readonly isBorrow: boolean
  public readonly premiumOwed: CurrencyAmount<Currency>
  public readonly premiumDeposit: CurrencyAmount<Currency>
  public readonly premiumLeft: CurrencyAmount<Currency>
  public readonly totalPosition: CurrencyAmount<Currency>
  public readonly margin: CurrencyAmount<Currency>

  constructor(pool: Pool, details: MarginPositionDetails) {
    this.pool = pool
    this.inputCurrency = details.isToken0 ? pool.token1 : pool.token0
    this.outputCurrency = details.isToken0 ? pool.token0 : pool.token1
    this.isToken0 = details.isToken0
    this.totalDebtOutput = BnToCurrencyAmount(details.totalDebtOutput, this.outputCurrency)
    this.totalDebtInput = BnToCurrencyAmount(details.totalDebtInput, this.inputCurrency)
    this.openTime = details.openTime
    this.repayTime = details.repayTime
    this.isBorrow = details.isBorrow
    this.premiumOwed = BnToCurrencyAmount(details.premiumOwed, this.inputCurrency)
    this.premiumDeposit = BnToCurrencyAmount(details.premiumDeposit, this.inputCurrency)
    this.premiumLeft = BnToCurrencyAmount(details.premiumLeft, this.inputCurrency)
    this.totalPosition = BnToCurrencyAmount(details.totalPosition, this.outputCurrency)
    this.margin = BnToCurrencyAmount(details.margin, this.inputCurrency)
  }

  // profit/loss in input token
  public PnL(): CurrencyAmount<Currency> {
    // price in token1 / token0 (token1 is quote currency)
    const entryPrice = this.entryPrice()
    const currentPrice = this.pool.token0Price

    const priceDiff = currentPrice.subtract(entryPrice)
    const tokenAmount = this.isToken0
      ? priceDiff.multiply(this.totalPosition)
      : priceDiff.invert().multiply(this.totalPosition)

    return CurrencyAmount.fromRawAmount(this.inputCurrency, tokenAmount.quotient)
  }

  public entryPrice(): Price<Currency, Currency> {
    if (this.isToken0) {
      return new Price(
        this.pool.token0,
        this.pool.token1,
        this.totalPosition.quotient,
        this.totalDebtInput.add(this.margin).quotient
      )
    } else {
      return new Price(
        this.pool.token0,
        this.pool.token1,
        this.totalDebtInput.add(this.margin).quotient,
        this.totalPosition.quotient
      )
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
