import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { t } from '@lingui/macro'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
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
  allowedSlippage: Percent,
  refetchLeveragePosition?: () => any | undefined
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
      if (!inputCurrency || !outputCurrency) throw new Error('missing currencies')

      const {
        pool,
        swapRoute,
        premium,
        inputIsToken0,
        marginInPosToken,
        margin,
        feePercent,
        premiumInPosToken,
        premiumSwapRoute,
        allowedSlippage,
        borrowAmount,
        marginInOutput,
        marginInInput,
      } = trade

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
        const output = await getOutputQuote(BnToCurrencyAmount(swapInput, inputCurrency), swapRoute, provider, chainId)
        if (!output) throw new Error('Quoter Error')
        amountOut = new BN(output.toString())
        amountOut = amountOut.plus(marginInOutput.shiftedBy(outputCurrency.decimals))
      } else {
        swapInput = marginInInput.plus(borrowAmount).times(new BN(1).minus(feePercent))
        const output = await getOutputQuote(BnToCurrencyAmount(swapInput, inputCurrency), swapRoute, provider, chainId)
        if (!output) throw new Error('Quoter Error')
        amountOut = new BN(output.toString())
      }

      // if (!swapOutput) throw new Error('unable to get trade output')

      // let amountOut: BN = new BN(swapOutput.toString())
      // if (marginInPosToken) {
      //   amountOut = new BN(swapOutput.toString()).plus(margin.rawAmount())
      // }

      // console.log('zeke:callback', amountOut.toFixed(0))

      let minPremiumOutput: string | undefined
      const bnAllowedSlippage = new BN(allowedSlippage.toFixed(18)).div(100)
      if (premiumInPosToken) {
        const output = await getOutputQuote(
          BnToCurrencyAmount(premium, outputCurrency),
          premiumSwapRoute,
          provider,
          chainId
        )
        if (!output) throw new Error('Quoter Error')
        // const output = await getOutputQuote(additionalPremium, premiumSwapRoute, provider, chainId)
        // if (!output) throw new Error('Quoter Error')
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
        margin: trade.margin.rawAmount(),
        borrowAmount: trade.borrowAmount.rawAmount(),
        minimumOutput: marginInPosToken ? '0' : minimumOutput.shiftedBy(outputDecimals).toFixed(0),
        deadline: deadline.toString(),
        simulatedOutput: amountOut.toFixed(0),
        executionOption: 1,
        depositPremium: premium.rawAmount(),
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
        gasEstimate = await provider.estimateGas(tx)
      } catch (gasError) {
        throw new GasEstimationError()
      }
      const gasLimit = calculateGasMargin(gasEstimate)
      const response = await provider
        .getSigner()
        .sendTransaction({ ...tx })
        .then((response) => {
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
  }, [deadline, account, chainId, provider, trade, outputCurrency, inputCurrency])

  const callback = useMemo(() => {
    if (!trade || !addPositionCallback || !outputCurrency || !inputCurrency || !refetchLeveragePosition) return null

    return () =>
      addPositionCallback().then((response) => {
        addTransaction(response, {
          type: TransactionType.ADD_LEVERAGE,
          margin: formatBNToString(trade.margin, NumberType.SwapTradeAmount),
          marginInPosToken: trade.marginInPosToken,
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
          expectedAddedPosition: formatBNToString(trade.expectedAddedOutput, NumberType.SwapTradeAmount),
          callback: refetchLeveragePosition,
        })
        return response.hash
      })
  }, [addPositionCallback, addTransaction, trade, inputCurrency, outputCurrency, refetchLeveragePosition])

  return {
    callback,
  }
}
