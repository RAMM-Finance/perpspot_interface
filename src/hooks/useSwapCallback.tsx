import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { Contract } from 'ethers'
import { PermitSignature } from 'hooks/usePermitAllowance'
import { useMemo } from 'react'
import { TradeState } from 'state/routing/types'
import { BorrowCreationDetails, LeverageTrade } from 'state/swap/hooks'

import BorrowManagerData from '../perpspotContracts/BorrowManager.json'
import LeverageManagerData from '../perpspotContracts/LeverageManager.json'
import { useTransactionAdder } from '../state/transactions/hooks'
import { TransactionType } from '../state/transactions/types'
import { currencyId } from '../utils/currencyId'
import useTransactionDeadline from './useTransactionDeadline'
import { useUniversalRouterSwapCallback } from './useUniversalRouter'

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade<Currency, Currency, TradeType> | undefined, // trade to execute, required
  fiatValues: { amountIn: number | undefined; amountOut: number | undefined }, // usd values for amount in and out, logged for analytics
  allowedSlippage: Percent, // in bips
  permitSignature: PermitSignature | undefined
): { callback: null | (() => Promise<string>) } {
  const deadline = useTransactionDeadline()

  const addTransaction = useTransactionAdder()
  // console.log("allowedSlippage", allowedSlippage)
  const universalRouterSwapCallback = useUniversalRouterSwapCallback(trade, fiatValues, {
    slippageTolerance: allowedSlippage,
    deadline,
    permit: permitSignature,
  })
  const swapCallback = universalRouterSwapCallback

  const callback = useMemo(() => {
    if (!trade || !swapCallback) return null

    return () =>
      swapCallback().then((response) => {
        addTransaction(
          response,
          trade.tradeType === TradeType.EXACT_INPUT
            ? {
                type: TransactionType.SWAP,
                tradeType: TradeType.EXACT_INPUT,
                inputCurrencyId: currencyId(trade.inputAmount.currency),
                inputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
                expectedOutputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                outputCurrencyId: currencyId(trade.outputAmount.currency),
                minimumOutputCurrencyAmountRaw: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
              }
            : {
                type: TransactionType.SWAP,
                tradeType: TradeType.EXACT_OUTPUT,
                inputCurrencyId: currencyId(trade.inputAmount.currency),
                maximumInputCurrencyAmountRaw: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
                outputCurrencyId: currencyId(trade.outputAmount.currency),
                outputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
                expectedInputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
              }
        )
        return response.hash
      })
  }, [addTransaction, allowedSlippage, swapCallback, trade])

  return {
    callback,
  }
}

// function createLevPosition(
//   uint256 traderFund,
//   uint256 maxSlippage,
//   uint256 borrowAmount,
//   bool isLong // if long borrow token1 to buy token 0
// )

export function useAddLeveragePositionCallback(
  leverageManagerAddress: string | undefined,
  trade: Trade<Currency, Currency, TradeType> | undefined,
  leverageTrade: LeverageTrade | undefined,
  allowedSlippage: Percent,
  leverageFactor: string | undefined
): { callback: null | (() => Promise<string>) } {
  // const deadline = useTransactionDeadline()
  const { account, chainId, provider } = useWeb3React()

  const addTransaction = useTransactionAdder()

  const callback = useMemo(() => {
    return () => {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!leverageManagerAddress) throw new Error('missing leverage manager address')
      if (!trade) throw new Error('missing trade')
      if (!leverageTrade) throw new Error('missing leverage trade')

      let isLong = true
      const decimals = trade?.inputAmount.currency.decimals ?? 18
      if (trade?.inputAmount.currency.isToken && trade?.outputAmount.currency.isToken) {
        if (trade.inputAmount.currency.sortsBefore(trade.outputAmount.currency)) {
          isLong = false
        }
      }

      const input = new BN(leverageTrade.inputAmount.toExact()).shiftedBy(decimals).toFixed(0)
      const borrowedAmount = new BN(leverageTrade.inputAmount.toExact())
        .multipliedBy(Number(leverageFactor) - 1 ?? '0')
        .shiftedBy(decimals)
        .toFixed(0)
      const leverageManagerContract = new Contract(
        leverageManagerAddress,
        LeverageManagerData.abi,
        provider.getSigner()
      )
      const slippage = new BN(1 + Number(allowedSlippage.toFixed(6)) / 100).shiftedBy(decimals).toFixed(0)

      return leverageManagerContract.addPosition(input, slippage, borrowedAmount, isLong).then((response: any) => {
        // console.log('leverageResponse', response.hash, response)
        addTransaction(response, {
          type: TransactionType.ADD_LEVERAGE,
          inputCurrencyId: currencyId(trade.inputAmount.currency),
          outputCurrencyId: currencyId(trade.outputAmount.currency),
          inputAmount: Number(leverageTrade.inputAmount.toExact()),
          expectedAddedPosition: leverageTrade.expectedTotalPosition - leverageTrade.existingTotalPosition,
        })
        return response.hash
      })
    }
  }, [
    account,
    addTransaction,
    allowedSlippage,
    chainId,
    leverageFactor,
    leverageManagerAddress,
    leverageTrade,
    provider,
    trade,
  ])

  return {
    callback,
  }
}

export function useAddBorrowPositionCallback(
  borrowManagerAddress: string | undefined,
  allowedSlippage: Percent, // in bfips
  ltv: string | undefined,
  parsedAmount: CurrencyAmount<Currency> | undefined,
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  borrowState: TradeState,
  borrowTrade?: BorrowCreationDetails
): { callback: null | (() => Promise<string>) } {
  // const deadline = useTransactionDeadline()
  const { account, chainId, provider } = useWeb3React()

  const addTransaction = useTransactionAdder()

  const callback = useMemo(() => {
    return () => {
      if (
        !borrowManagerAddress ||
        !borrowTrade ||
        borrowState !== TradeState.VALID ||
        !inputCurrency ||
        !outputCurrency ||
        !ltv
      )
        return null
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')

      const decimals = inputCurrency?.decimals ?? 18

      // borrowBelow is true if input currency is token0.
      let borrowBelow = true
      if (inputCurrency?.isToken && outputCurrency?.isToken && inputCurrency?.wrapped && outputCurrency?.wrapped) {
        borrowBelow = inputCurrency?.wrapped.sortsBefore(outputCurrency?.wrapped)
      }

      const collateralAmount = new BN(parsedAmount?.toExact() ?? 0).shiftedBy(decimals).toFixed(0)
      const borrowManagerContract = new Contract(borrowManagerAddress, BorrowManagerData.abi, provider.getSigner())

      const formattedLTV = new BN(ltv).shiftedBy(16).toFixed(0)

      return borrowManagerContract
        .addBorrowPosition(borrowBelow, collateralAmount, formattedLTV, [])
        .then((response: any) => {
          console.log('borrowResponse', response)
          addTransaction(response, {
            type: TransactionType.ADD_BORROW,
            collateralAmount: Number(parsedAmount?.toExact()),
            inputCurrencyId: currencyId(inputCurrency),
            outputCurrencyId: currencyId(outputCurrency),
            borrowedAmount: borrowTrade.borrowedAmount,
          })
          return response.hash
        })
    }
  }, [
    account,
    addTransaction,
    borrowManagerAddress,
    borrowState,
    borrowTrade,
    chainId,
    inputCurrency,
    outputCurrency,
    ltv,
    parsedAmount,
    provider,
  ])

  return {
    callback,
  }

  // return {
  //   callback: (): any => {
  //     return borrowManagerContract
  //       .addBorrowPosition(borrowBelow, collateralAmount, formattedLTV, [])
  //       .then((response: any) => {
  //         console.log('borrowResponse', response)
  //         addTransaction(response, {
  //           type: TransactionType.ADD_BORROW,
  //           collateralAmount,
  //           inputCurrencyId: currencyId(inputCurrency),
  //           outputCurrencyId: currencyId(outputCurrency),
  //         })
  //         return response.hash
  //       })
  //   },
  // }
}
