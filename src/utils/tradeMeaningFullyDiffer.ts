// import { Trade } from '@uniswap/router-sdk'
import { Currency, TradeType } from '@uniswap/sdk-core'
import {
  DerivedLimitReducePositionInfo,
  DerivedReducePositionInfo,
} from 'components/PositionTable/LeveragePositionTable/DecreasePositionContent'
import { AddMarginTrade } from 'state/marginTrading/hooks'
import { SwapTrade } from 'state/routing/tradeEntity'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param args either a pair of V2 trades or a pair of V3 trades
 */
export function tradeMeaningfullyDiffers(
  ...args: [SwapTrade<Currency, Currency, TradeType>, SwapTrade<Currency, Currency, TradeType>]
): boolean {
  const [tradeA, tradeB] = args
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

export function marginTradeMeaningfullyDiffers(tradeA: AddMarginTrade, tradeB: AddMarginTrade): boolean {
  return (
    !tradeA.borrowAmount.eq(tradeB.borrowAmount) ||
    !tradeA.margin.eq(tradeB.margin) ||
    !tradeA.minimumOutput.eq(tradeB.minimumOutput)
  )
}

export function reduceTradeMeaningfullyDiffers(
  tradeA: DerivedReducePositionInfo,
  tradeB: DerivedReducePositionInfo
): boolean {
  return (
    tradeA.PnL !== tradeB.PnL ||
    // tradeA.returnedAmount !== tradeB.returnedAmount ||
    tradeA.profitFee !== tradeB.profitFee ||
    // tradeA.reduceAmount !== tradeB.reduceAmount ||
    tradeA.executionPrice !== tradeB.executionPrice
    // tradeA.totalPosition !== tradeB.totalPosition
    // tradeA.totalDebtInput !== tradeB.totalDebtInput ||
    // tradeA.totalDebtOutput !== tradeB.totalDebtOutput
  )
}

export function reduceLmtTradeMeaningfullyDiffers(
  tradeA: DerivedLimitReducePositionInfo,
  tradeB: DerivedLimitReducePositionInfo
): boolean {
  return (
    // tradeA.margin !== tradeB.margin ||
    // tradeA.startingDebtReduceAmount !== tradeB.startingDebtReduceAmount ||
    // tradeA.minimumDebtReduceAmount !== tradeB.minimumDebtReduceAmount ||
    !tradeA.newTotalPosition.eq(tradeB.newTotalPosition) || !tradeA.estimatedPnL.eq(tradeB.estimatedPnL)
  )
}
