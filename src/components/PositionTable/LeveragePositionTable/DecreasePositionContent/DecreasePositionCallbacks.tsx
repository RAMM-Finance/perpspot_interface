import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Currency, Percent } from '@uniswap/sdk-core'
import { computePoolAddress, Pool } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { LMT_MARGIN_FACILITY, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { BigNumber, ethers } from 'ethers'
import useTransactionDeadline, { useLimitTransactionDeadline } from 'hooks/useTransactionDeadline'
import { useCallback } from 'react'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { GasEstimationError, getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { LimitOrderOptions, MarginFacilitySDK, ReducePositionOptions } from 'utils/lmtSDK/MarginFacility'
import { MulticallSDK } from 'utils/lmtSDK/multicall'

import { DerivedInfoState, getSlippedTicks } from '.'

export function useReducePositionCallback(
  positionKey: TraderPositionKey,
  parsedReduceAmount: BN | undefined,
  existingPosition: MarginPositionDetails | undefined,
  closePosition: boolean,
  pool: Pool | undefined,
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  tradeState: DerivedInfoState | undefined,
  allowedSlippage: Percent
) {
  const { account, chainId, provider } = useWeb3React()

  const deadline = useTransactionDeadline()

  const callback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!parsedReduceAmount) throw new Error('missing reduce amount')
      if (!existingPosition) throw new Error('missing position')
      if (!pool || !outputCurrency || !inputCurrency) throw new Error('missing pool')
      if (tradeState !== DerivedInfoState.VALID) throw new Error('invalid trade state')
      if (!deadline) throw new Error('missing deadline')
      if (!inputCurrency) throw new Error('missing input currency')

      // get reduce parameters
      const reducePercent = new BN(parsedReduceAmount).div(existingPosition.totalPosition).shiftedBy(18).toFixed(0)
      const { slippedTickMin, slippedTickMax } = getSlippedTicks(pool, allowedSlippage)
      const price = !existingPosition.isToken0 ? pool.token1Price.toFixed(18) : pool.token0Price.toFixed(18)

      const minOutput = new BN(parsedReduceAmount)
        .times(price)
        .times(new BN(1).minus(new BN(allowedSlippage.toFixed(18)).div(100)))

      const reduceParam: ReducePositionOptions = {
        positionKey,
        reducePercentage: reducePercent,
        minOutput: minOutput.shiftedBy(inputCurrency.decimals).toFixed(0),
        executionOption: 1,
        executionData: ethers.constants.HashZero,
        slippedTickMin,
        slippedTickMax,
        isClose: closePosition,
      }

      const calldatas = MarginFacilitySDK.reducePositionParameters(reduceParam)

      const calldata = MulticallSDK.encodeMulticall(calldatas)

      const tx = {
        from: account,
        to: LMT_MARGIN_FACILITY[chainId],
        data: MulticallSDK.encodeMulticall(calldata),
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
          return response
        })
      return response
    } catch (err) {
      throw new Error(getErrorMessage(parseContractError(err)))
    }
  }, [
    account,
    inputCurrency,
    outputCurrency,
    pool,
    positionKey,
    tradeState,
    provider,
    chainId,
    allowedSlippage,
    deadline,
    parsedReduceAmount,
    existingPosition,
    closePosition,
  ])

  return callback
}

export function useReduceLimitOrderCallback(
  reduceAmount: BN | undefined,
  positionKey: TraderPositionKey | undefined,
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  limitPrice: BN | undefined,
  baseIsInput: boolean | undefined,
  tradeState: DerivedInfoState | undefined
): {
  callback: null | (() => Promise<TransactionResponse>)
} {
  const { account, provider, chainId } = useWeb3React()
  const deadline = useLimitTransactionDeadline()
  const addLimitOrder = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!deadline) throw new Error('missing deadline')
      if (tradeState !== DerivedInfoState.VALID) throw new Error('invalid trade state')
      if (!inputCurrency || !outputCurrency) throw new Error('missing currencies')
      if (!positionKey) throw new Error('missing position key')
      if (!reduceAmount) throw new Error('missing reduce amount')
      if (!limitPrice) throw new Error('missing limit price')

      const price = baseIsInput ? new BN(1).div(limitPrice) : limitPrice

      const startOutput = reduceAmount.times(price).shiftedBy(inputCurrency.decimals).toFixed(0)
      const params: LimitOrderOptions = {
        orderKey: {
          poolKey: positionKey.poolKey,
          trader: positionKey.trader,
          isToken0: positionKey.isToken0,
          isAdd: false,
        },
        margin: '0',
        pool: computePoolAddress({
          factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
          tokenA: inputCurrency.wrapped,
          tokenB: outputCurrency.wrapped,
          fee: positionKey.poolKey.fee,
        }),
        deadline: deadline?.toString(),
        inputAmount: reduceAmount.shiftedBy(outputCurrency.decimals).toFixed(0),
        startOutput,
        minOutput: startOutput,
        decayRate: '0',
        isAdd: false,
      }

      const calldata = MarginFacilitySDK.submitLimitOrder(params)

      const tx = {
        from: account,
        to: LMT_MARGIN_FACILITY[chainId],
        data: MulticallSDK.encodeMulticall(calldata),
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
    } catch (err) {
      throw new Error(getErrorMessage(parseContractError(err)))
    }
  }, [
    account,
    inputCurrency,
    outputCurrency,
    positionKey,
    reduceAmount,
    limitPrice,
    baseIsInput,
    deadline,
    provider,
    chainId,
    tradeState,
  ])

  return { callback: addLimitOrder }
}
