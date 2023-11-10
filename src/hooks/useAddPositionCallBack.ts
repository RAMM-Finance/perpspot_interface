import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { Percent, Price } from '@uniswap/sdk-core'
import { priceToClosestTick } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import JSBI from 'jsbi'
import { useCallback, useMemo } from 'react'
import { getOutputQuote } from 'state/marginTrading/getOutputQuote'
import { AddMarginTrade } from 'state/marginTrading/hooks'
import { TransactionType } from 'state/transactions/types'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { MarginFacilitySDK } from 'utils/lmtSDK/MarginFacility'

// import BorrowManagerData from '../perpspotContracts/BorrowManager.json'
import { useTransactionAdder } from '../state/transactions/hooks'
import useTransactionDeadline from './useTransactionDeadline'

export function useAddPositionCallback(
  trade: AddMarginTrade | undefined,
  allowedSlippage: Percent,
  allowedSlippedTick: Percent
): { callback: null | (() => Promise<string>) } {
  const deadline = useTransactionDeadline()
  const { account, chainId, provider } = useWeb3React()

  const addTransaction = useTransactionAdder()
  // console.log("allowedSlippage", allowedSlippage)
  const addPositionCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!trade) throw new Error('missing trade')
      if (!deadline) throw new Error('missing deadline')

      const { pool, swapInput, swapRoute, margin, borrowAmount, positionKey, premium } = trade

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

      const calldata = MarginFacilitySDK.addPositionParameters({
        positionKey,
        margin: margin.quotient,
        borrowAmount: borrowAmount.quotient,
        minimumOutput: JSBI.BigInt(0),
        deadline: deadline.toString(),
        simulatedOutput: amountOut,
        executionOption: 1,
        maxSlippage: new BN(allowedSlippage.toFixed(18)).shiftedBy(18).toFixed(0),
        depositPremium: premium.quotient,
        slippedTickMin,
        slippedTickMax,
      })

      const tx = {
        from: account,
        to: LMT_MARGIN_FACILITY[chainId],
        data: calldata[0],
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
    } catch (swapError: unknown) {
      console.log('swapError', swapError)
      throw new Error('swapError')
    }
  }, [allowedSlippage, allowedSlippedTick, deadline, account, chainId, provider, trade])

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
