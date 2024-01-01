import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
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
import { GasEstimationError, getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { MarginFacilitySDK } from 'utils/lmtSDK/MarginFacility'
import { MulticallSDK } from 'utils/lmtSDK/multicall'

// import BorrowManagerData from '../perpspotContracts/BorrowManager.json'
import { useTransactionAdder } from '../state/transactions/hooks'
import useTransactionDeadline from './useTransactionDeadline'

class ModifiedAddPositionError extends Error {
  constructor() {
    super(
      t`Your swap was modified through your wallet. If this was a mistake, please cancel immediately or risk losing your funds.`
    )
  }
}

export function useAddPositionCallback(
  trade: AddMarginTrade | undefined,
  allowedSlippage: Percent
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
      // if (!marginAmount || !borrowAmount) throw new Error('missing parameters')

      const { pool, swapInput, swapRoute, positionKey, premium } = trade

      const amountOut = await getOutputQuote(swapInput, swapRoute, provider, chainId)

      if (!amountOut) throw new Error('unable to get trade output')

      // calculate max and minimum tick bounds (current price bounds)
      const pullUp = JSBI.BigInt(10_000 + Math.floor(Number(allowedSlippage.toFixed(18)) * 100))
      const pullDown = JSBI.BigInt(10_000 - Math.floor(Number(allowedSlippage.toFixed(18)) * 100))
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

      const inputDecimals = swapInput.currency.wrapped.decimals
      const outputDecimals = trade.swapOutput.currency.wrapped.decimals
      // calculate minimum output amount
      const currentPrice = trade.inputIsToken0
        ? new BN(pool.token0Price.toFixed(18))
        : new BN(pool.token1Price.toFixed(18))
      const bnAllowedSlippage = new BN(allowedSlippage.toFixed(18)).div(100)
      const totalInput = new BN(swapInput.quotient.toString()).shiftedBy(-inputDecimals)
      const minimumOutput = totalInput.times(currentPrice).times(new BN(1).minus(bnAllowedSlippage))

      const calldatas = MarginFacilitySDK.addPositionParameters({
        positionKey,
        margin: trade.margin.quotient.toString(),
        borrowAmount: trade.borrowAmount.quotient.toString(),
        minimumOutput: minimumOutput.shiftedBy(outputDecimals).toFixed(0),
        deadline: deadline.toString(),
        simulatedOutput: amountOut.toString(),
        executionOption: 1,
        depositPremium: premium.quotient.toString(),
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
        throw new GasEstimationError()
      }

      const gasLimit = calculateGasMargin(gasEstimate)

      const response = await provider
        .getSigner()
        .sendTransaction({ ...tx, gasLimit })
        .then((response) => {
          if (tx.data !== response.data) {
            if (!response.data || response.data.length === 0 || response.data === '0x') {
              throw new ModifiedAddPositionError()
            }
          }
          return response
        })
      return response
    } catch (error: unknown) {
      throw new Error(getErrorMessage(parseContractError(error)))
    }
  }, [deadline, account, chainId, provider, trade, allowedSlippage])

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
