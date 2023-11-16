import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { Percent, Price } from '@uniswap/sdk-core'
import { priceToClosestTick } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import JSBI from 'jsbi'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useCallback, useMemo } from 'react'
import { MarginField } from 'state/marginTrading/actions'
import { getOutputQuote } from 'state/marginTrading/getOutputQuote'
import { AddMarginTrade, useMarginTradingState } from 'state/marginTrading/hooks'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { TransactionType } from 'state/transactions/types'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { MarginFacilitySDK } from 'utils/lmtSDK/MarginFacility'
import { Multicall as MulticallSDK } from 'utils/lmtSDK/multicall'

// import BorrowManagerData from '../perpspotContracts/BorrowManager.json'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useCurrency } from './Tokens'
import useTransactionDeadline from './useTransactionDeadline'

export function useAddPositionCallback(
  trade: AddMarginTrade | undefined,
  allowedSlippage: Percent,
  allowedSlippedTick: Percent
): { callback: null | (() => Promise<string>) } {
  const deadline = useTransactionDeadline()
  const { account, chainId, provider } = useWeb3React()

  const {
    [MarginField.MARGIN]: margin,
    [MarginField.LEVERAGE_FACTOR]: leverageFactor,
    isLimitOrder,
  } = useMarginTradingState()

  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  // const outputCurrency = useCurrency(outputCurrencyId)

  const marginAmount = useMemo(
    () => tryParseCurrencyAmount(margin ?? undefined, inputCurrency ?? undefined),
    [inputCurrency, margin]
  )

  const borrowAmount = useMemo(() => {
    if (!marginAmount || !leverageFactor || Number(leverageFactor) < 1) return undefined
    return marginAmount?.multiply(JSBI.BigInt(leverageFactor)).subtract(marginAmount)
  }, [leverageFactor, marginAmount])

  const addTransaction = useTransactionAdder()
  // console.log("allowedSlippage", allowedSlippage)
  const addPositionCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!trade) throw new Error('missing trade')
      if (!deadline) throw new Error('missing deadline')
      if (!marginAmount || !borrowAmount) throw new Error('missing parameters')

      const { pool, swapInput, swapRoute, positionKey, premium } = trade

      const amountOut = await getOutputQuote(swapInput, swapRoute, provider, chainId)

      if (!amountOut) throw new Error('unable to get trade output')

      const pullUp = JSBI.BigInt(10_000 + Math.floor(Number(allowedSlippedTick.toFixed(18)) * 100))

      const pullDown = JSBI.BigInt(10_000 - Math.floor(Number(allowedSlippedTick.toFixed(18)) * 100))

      const minPrice = new Price(
        pool.token0,
        pool.token1,
        JSBI.multiply(pool.token0Price.denominator, JSBI.BigInt(10_000)),
        JSBI.multiply(pool.token0Price.numerator, pullDown)
      )

      const maxPrice = new Price(
        pool.token0,
        pool.token1,
        JSBI.multiply(pool.token0Price.denominator, JSBI.BigInt(10_000)),
        JSBI.multiply(pool.token0Price.numerator, pullUp)
      )

      const slippedTickMax = priceToClosestTick(maxPrice)
      const slippedTickMin = priceToClosestTick(minPrice)

      // console.log('real calldata', {
      //   positionKey,
      //   margin: marginAmount.quotient.toString(),
      //   borrowAmount: borrowAmount.quotient.toString(),
      //   minimumOutput: JSBI.BigInt(0),
      //   deadline: deadline.toString(),
      //   simulatedOutput: amountOut.toString(),
      //   executionOption: 1,
      //   depositPremium: premium.quotient.toString(),
      //   slippedTickMin,
      //   slippedTickMax,
      // })

      const calldatas = MarginFacilitySDK.addPositionParameters({
        positionKey,
        margin: marginAmount.quotient,
        borrowAmount: borrowAmount.quotient,
        minimumOutput: JSBI.BigInt(0),
        deadline: deadline.toString(),
        simulatedOutput: amountOut,
        executionOption: 1,
        depositPremium: premium.quotient,
        slippedTickMin,
        slippedTickMax,
      })

      const tx = {
        from: account,
        to: LMT_MARGIN_FACILITY[chainId],
        data: MulticallSDK.encodeMulticall(calldatas),
      }

      let gasEstimate: BigNumber

      try {
        gasEstimate = await provider.estimateGas(tx)
      } catch (gasError) {
        console.log('gasError', gasError)
        throw new Error('gasError')
      }

      const gasLimit = calculateGasMargin(gasEstimate)

      const response = await provider
        .getSigner()
        .sendTransaction({ ...tx, gasLimit })
        .then((response) => {
          return response
        })
      return response
    } catch (error: any) {
      throw new Error('Contract Error')
    }
  }, [allowedSlippedTick, deadline, account, chainId, provider, trade, marginAmount, borrowAmount])

  const callback = useMemo(() => {
    if (!trade || !addPositionCallback) return null

    return () =>
      addPositionCallback().then((response) => {
        addTransaction(response, {
          type: TransactionType.ADD_LEVERAGE,
          inputAmount: trade.margin.toExact(),
          inputCurrencyId: trade.margin.currency.wrapped.address,
          outputCurrencyId: trade.swapOutput.currency.wrapped.address,
          expectedAddedPosition: trade.swapOutput.toExact(),
        })
        return response.hash
      })
  }, [addPositionCallback, addTransaction, trade])

  return {
    callback,
  }
}
