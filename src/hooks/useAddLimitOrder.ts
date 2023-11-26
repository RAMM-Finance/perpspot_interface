import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import { useCallback, useMemo } from 'react'
import { AddLimitTrade } from 'state/marginTrading/hooks'
// import { AddMarginTrade } from 'state/marginTrading/hooks'
import { TransactionType } from 'state/transactions/types'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { MarginFacilitySDK } from 'utils/lmtSDK/MarginFacility'
import { Multicall as MulticallSDK } from 'utils/lmtSDK/multicall'

// import BorrowManagerData from '../perpspotContracts/BorrowManager.json'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useCurrency } from './Tokens'
import useTransactionDeadline from './useTransactionDeadline'

export function useAddLimitOrderCallback(
  trade: AddLimitTrade | undefined
  // preTradeInfo: PreTradeInfo | undefined
): {
  callback: null | (() => Promise<string>)
} {
  const deadline = useTransactionDeadline()
  const { account, chainId, provider } = useWeb3React()

  const addTransaction = useTransactionAdder()
  const inputCurrency = useCurrency(trade?.inputCurrencyId)
  const outputCurrency = useCurrency(trade?.outputCurrencyId)
  // console.log("allowedSlippage", allowedSlippage)
  const addLimitOrder = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!trade) throw new Error('missing trade')
      if (!deadline) throw new Error('missing deadline')
      if (!inputCurrency || !outputCurrency) throw new Error('missing currencies')

      const { poolAddress, startOutput, margin, orderKey, decayRate, inputAmount, minOutput, additionalPremium } = trade

      const calldatas = MarginFacilitySDK.submitLimitOrder({
        orderKey,
        margin: margin.shiftedBy(inputCurrency.decimals).toFixed(0),
        pool: poolAddress,
        isAdd: true,
        deadline: deadline.toString(),
        startOutput: startOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
        minOutput: minOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
        inputAmount: inputAmount.shiftedBy(inputCurrency.decimals).toFixed(0),
        decayRate: decayRate.shiftedBy(18).toFixed(0),
        depositPremium: additionalPremium.shiftedBy(inputCurrency.decimals).toFixed(0),
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
  }, [deadline, account, chainId, provider, trade, inputCurrency, outputCurrency])

  const callback = useMemo(() => {
    if (!trade || !addLimitOrder || !inputCurrency || !outputCurrency) return null

    return () =>
      addLimitOrder().then((response) => {
        addTransaction(response, {
          type: TransactionType.ADD_LIMIT_ORDER,
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
          margin: trade.margin.toString(),
          startingPrice: trade.limitPrice.toString(),
        })
        return response.hash
      })
  }, [addLimitOrder, addTransaction, trade, inputCurrency, outputCurrency])

  return {
    callback,
  }
}
