import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Percent } from '@uniswap/sdk-core'
import { Pool, Route } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { getSlippedTicks } from 'components/PositionTable/LeveragePositionTable/DecreasePositionContent'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import { useCallback, useMemo } from 'react'
import { getOutputQuote } from 'state/marginTrading/getOutputQuote'
import { AddMarginTrade, BnToCurrencyAmount } from 'state/marginTrading/hooks'
import { TransactionType } from 'state/transactions/types'
import { TraderPositionKey } from 'types/lmtv2position'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { GasEstimationError, getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { MarginFacilitySDK } from 'utils/lmtSDK/MarginFacility'
import { MulticallSDK } from 'utils/lmtSDK/multicall'
import { useAccount, useChainId } from 'wagmi'
import { useEthersSigner } from 'wagmi-lib/adapters'

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
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  pool: Pool | undefined,
  allowedSlippage: Percent
): { callback: null | (() => Promise<string>) } {
  const deadline = useTransactionDeadline()
  const chainId = useChainId()
  const signer = useEthersSigner({ chainId })
  const account = useAccount().address

  const addTransaction = useTransactionAdder()
  // console.log("allowedSlippage", allowedSlippage)
  const addPositionCallback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!signer) throw new Error('missing provider')
      if (!trade) throw new Error('missing trade')
      if (!deadline) throw new Error('missing deadline')
      if (!inputCurrency || !outputCurrency) throw new Error('missing currencies')
      if (!pool) throw new Error('missing pool')

      const {
        premium,
        inputIsToken0,
        marginInPosToken,
        feePercent,
        premiumInPosToken,
        allowedSlippage,
        borrowAmount,
        marginInOutput,
        marginInInput,
      } = trade

      const swapRoute = new Route(
        [pool],
        inputIsToken0 ? pool.token0 : pool.token1,
        inputIsToken0 ? pool.token1 : pool.token0
      )

      const premiumSwapRoute = new Route(
        [pool],
        inputIsToken0 ? pool.token1 : pool.token0,
        inputIsToken0 ? pool.token0 : pool.token1
      )

      const positionKey: TraderPositionKey = {
        poolKey: {
          token0: pool.token0.address,
          token1: pool.token1.address,
          fee: pool.fee,
        },
        isToken0: !inputIsToken0,
        isBorrow: false,
        trader: account,
      }

      // amount of input (minus fees) swapped for position token.
      let swapInput: BN
      // simulatedOutput in contracts
      let amountOut: BN
      if (marginInPosToken) {
        swapInput = borrowAmount.times(new BN(1).minus(feePercent))
        // console.log('zeke:callback:swapInput', swapInput.toFixed(0))
        const output = await getOutputQuote(BnToCurrencyAmount(swapInput, inputCurrency), swapRoute, signer, chainId)
        if (!output) throw new Error('Quoter Error')
        amountOut = new BN(output.toString())
        amountOut = amountOut.plus(marginInOutput.shiftedBy(outputCurrency.decimals))
      } else {
        swapInput = marginInInput.plus(borrowAmount).times(new BN(1).minus(feePercent))
        const output = await getOutputQuote(BnToCurrencyAmount(swapInput, inputCurrency), swapRoute, signer, chainId)
        if (!output) throw new Error('Quoter Error')
        amountOut = new BN(output.toString())
      }

      let minPremiumOutput: string | undefined
      const bnAllowedSlippage = new BN(allowedSlippage.toFixed(18)).div(100)
      if (premiumInPosToken) {
        const output = await getOutputQuote(
          BnToCurrencyAmount(premium, outputCurrency),
          premiumSwapRoute,
          signer,
          chainId
        )
        if (!output) throw new Error('Quoter Error')

        const bnAllowedSlippage = new BN(allowedSlippage.toFixed(18)).div(100)
        minPremiumOutput = new BN(output.toString()).times(new BN(1).minus(bnAllowedSlippage)).toFixed(0)
      }

      const outputDecimals = outputCurrency.decimals

      // calculate minimum output amount
      const { slippedTickMax, slippedTickMin } = getSlippedTicks(pool, allowedSlippage)
      const currentPrice = trade.inputIsToken0
        ? new BN(pool.token0Price.toFixed(18))
        : new BN(pool.token1Price.toFixed(18))

      const minimumOutput = swapInput.times(currentPrice).times(new BN(1).minus(bnAllowedSlippage))

      const calldatas = MarginFacilitySDK.addPositionParameters({
        positionKey,
        margin: trade.margin.shiftedBy(marginInPosToken ? outputCurrency.decimals : inputCurrency.decimals).toFixed(0),
        borrowAmount: trade.borrowAmount.shiftedBy(inputCurrency.decimals).toFixed(0),
        minimumOutput: marginInPosToken ? '0' : minimumOutput.shiftedBy(outputDecimals).toFixed(0),
        deadline: deadline.toString(),
        simulatedOutput: amountOut.toFixed(0),
        executionOption: 1,
        depositPremium: premium.shiftedBy(inputCurrency.decimals).toFixed(0),
        slippedTickMin,
        slippedTickMax,
        marginInPosToken,
        premiumInPosToken,
        minPremiumOutput,
      })
      // throw Error('not Implemented')
      const tx = {
        from: account,
        to: LMT_MARGIN_FACILITY[chainId],
        data: MulticallSDK.encodeMulticall(calldatas),
      }

      let gasEstimate: BigNumber

      try {
        gasEstimate = await signer.estimateGas(tx)
      } catch (gasError) {
        throw new GasEstimationError()
      }
      const gasLimit = calculateGasMargin(gasEstimate)
      const response = await signer.sendTransaction({ ...tx }).then((response: any) => {
        if (tx.data !== response.data) {
          if (!response.data || response.data.length === 0 || response.data === '0x') {
            console.log('errorrrr')
            throw new ModifiedAddPositionError()
          }
        }
        return response
      })

      return response
    } catch (error: unknown) {
      console.log('ett', error, getErrorMessage(parseContractError(error)))
      throw new Error(getErrorMessage(parseContractError(error)))
    }
  }, [deadline, account, chainId, signer, trade, outputCurrency, inputCurrency, pool])

  const callback = useMemo(() => {
    if (!trade || !addPositionCallback || !outputCurrency || !inputCurrency) return null

    return () =>
      addPositionCallback().then((response) => {
        addTransaction(response, {
          type: TransactionType.ADD_LEVERAGE,
          margin: formatBNToString(trade.margin, NumberType.SwapTradeAmount),
          marginInPosToken: trade.marginInPosToken,
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
          expectedAddedPosition: formatBNToString(trade.expectedAddedOutput, NumberType.SwapTradeAmount),
        })
        return response.hash
      })
  }, [addPositionCallback, addTransaction, trade, inputCurrency, outputCurrency, signer, account, deadline, pool])

  return {
    callback,
  }
}
