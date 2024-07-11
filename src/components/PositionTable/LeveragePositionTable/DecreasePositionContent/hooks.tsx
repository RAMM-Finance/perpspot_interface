import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Currency, Percent, Price } from '@uniswap/sdk-core'
import { computePoolAddress, Pool } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { ethers } from 'ethers'
import { useMarginFacilityContract } from 'hooks/useContract'
import { useEstimatedPnL } from 'hooks/useEstimatedPnL'
import { useMarginOrderPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { usePool, usePoolV2 } from 'hooks/usePools'
import { useLimitTransactionDeadline } from 'hooks/useTransactionDeadline'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { parseBN } from 'state/marginTrading/hooks'
import { MarginPositionDetails, OrderPositionKey, TraderPositionKey } from 'types/lmtv2position'
import { ErrorType } from 'utils/ethersErrorHandler'
import { DecodedError } from 'utils/ethersErrorHandler/types'
import { getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { TokenBN } from 'utils/lmtSDK/internalConstants'
import { LimitOrderOptions, MarginFacilitySDK, ReducePositionOptions } from 'utils/lmtSDK/MarginFacility'
import { useChainId } from 'wagmi'

import { AlteredPositionProperties } from '../LeveragePositionModal'
import { DerivedInfoState, DerivedLimitReducePositionInfo, DerivedReducePositionInfo, getSlippedTicks } from '.'

export function useDerivedReducePositionInfo(
  isLimit: boolean,
  reduceAmount: string,
  positionKey: TraderPositionKey,
  position: MarginPositionDetails | undefined,
  closePosition: boolean,
  allowedSlippage: Percent,
  onPositionChange: (newPosition: AlteredPositionProperties) => void,
  existingOrderBool: boolean | undefined,
  inputCurrency?: Currency,
  outputCurrency?: Currency
): {
  txnInfo: DerivedReducePositionInfo | undefined
  inputError: ReactNode | undefined
  contractError: ReactNode | undefined
  tradeState: DerivedInfoState
} {
  const marginFacility = useMarginFacilityContract(true)

  // const [, poolv1] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const [, pool] = usePoolV2(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)
  
  const parsedReduceAmount = useMemo(() => parseBN(reduceAmount), [reduceAmount])

  const inputError = useMemo(() => {
    let error: React.ReactNode | undefined

    if (!parsedReduceAmount || parsedReduceAmount.isLessThanOrEqualTo(0)) {
      error = <Trans>Enter an amount</Trans>
    }

    return error
  }, [parsedReduceAmount])

  const blockNumber = useBlockNumber()

  const simulate = useCallback(async () => {
    if (!marginFacility || !position || !parsedReduceAmount || !pool || !inputCurrency || !outputCurrency) {
      throw new Error('missing params')
    }
    const reducePercent = parsedReduceAmount.div(position.totalPosition).shiftedBy(18).toFixed(0)
    const { slippedTickMin, slippedTickMax } = getSlippedTicks(pool, allowedSlippage)
    // const pricev1 = !position.isToken0 ? poolv1?.token1Price.toFixed(18) : poolv1?.token0Price.toFixed(18)
    const price = !position.isToken0 ? pool?.token1Price.toFixed(18) : pool?.token0Price.toFixed(18)
    // console.log("PRICE V1 V2", pricev1, price)
    // console.log("TICKCURRENT V1 V2", poolv1?.tickCurrent, pool?.tickCurrent)
    // reducePercentage * totalPosition multiplied(or divided) current price

    const minOutput = position.marginInPosToken
      ? new BN(0)
      : parsedReduceAmount.times(price).times(new BN(1).minus(new BN(allowedSlippage.toFixed(18)).div(100)))

    const params: ReducePositionOptions = {
      positionKey,
      reducePercentage: reducePercent,
      executionOption: 1,
      slippedTickMin,
      slippedTickMax,
      executionData: ethers.constants.HashZero,
      minOutput: minOutput.shiftedBy(inputCurrency.decimals).toFixed(0),
      isClose: closePosition,
    }

    console.log('zeke:', blockNumber, pool.tickCurrent, {
      positionKey,
      reducePercentage: reducePercent,
      executionOption: 1,
      slippedTickMin,
      slippedTickMax,
      executionData: ethers.constants.HashZero,
      minOutput: minOutput.shiftedBy(inputCurrency.decimals).toFixed(0),
      isClose: closePosition,
    })

    const calldatas = MarginFacilitySDK.reducePositionParameters(params)

    const bytes = await marginFacility.callStatic.multicall(calldatas)

    const result = (MarginFacilitySDK.decodeReducePositionResult(bytes[0]) as any)[0]
    const amount0 = new BN(result.amount0.toString()).shiftedBy(
      position.isToken0 ? -outputCurrency.decimals : -inputCurrency.decimals
    )
    const amount1 = new BN(result.amount1.toString()).shiftedBy(
      position.isToken0 ? -inputCurrency.decimals : -outputCurrency.decimals
    )
    const premium = new BN(result.premium.toString()).shiftedBy(-inputCurrency.decimals)
    const reducePercentage = parsedReduceAmount.div(position.totalPosition)
    const executionPrice = new Price(
      outputCurrency,
      inputCurrency,
      position.isToken0 ? result.amount0.toString() : result.amount1.toString(),
      position.isToken0
        ? new BN(result.amount1.toString()).times(-1).toFixed(0)
        : new BN(result.amount0.toString()).times(-1).toFixed(0)
    )
    const marginDecimals = position.isToken0
      ? position.marginInPosToken
        ? position.token0Decimals
        : position.token1Decimals
      : position.marginInPosToken
      ? position.token1Decimals
      : position.token0Decimals

    const PnL = new BN(result.PnL.toString()).shiftedBy(-marginDecimals)

    let PnLWithPremium = null
    if (closePosition) {
      if (position.marginInPosToken) {
        const price = position.isToken0 ? pool.token1Price.toFixed(18) : pool.token0Price.toFixed(18)
        PnLWithPremium = PnL.minus(position.premiumOwed.times(price))
      } else {
        PnLWithPremium = PnL.minus(position.premiumOwed)
      }
    }
    // console.log('positionhereere', position?.premiumOwed.toString())
    const info: DerivedReducePositionInfo = {
      PnL,
      PnLWithPremium,
      returnedAmount: new BN(result.returnedAmount.toString()).shiftedBy(
        position.marginInPosToken ? outputCurrency.wrapped.decimals : inputCurrency.wrapped.decimals
      ),
      premium,
      profitFee: new BN(result.profitFee.toString()).shiftedBy(-inputCurrency.decimals),
      minimumOutput: minOutput,
      executionPrice,
      amount0,
      amount1,
      margin: position.margin.times(new BN(1).minus(reducePercentage)),
      totalPosition: position.totalPosition.minus(parsedReduceAmount),
      totalDebtInput: position.totalDebtInput.times(new BN(1).minus(reducePercentage)),
      totalDebtOutput: position.totalDebtOutput.times(new BN(1).minus(reducePercentage)),
      reduceAmount: new TokenBN(parsedReduceAmount, outputCurrency.wrapped, false),
      withdrawnPremium: closePosition
        ? new TokenBN(position.premiumLeft, inputCurrency.wrapped, false)
        : new TokenBN(0, inputCurrency.wrapped, false),
      closePosition,
    }

    const _newPosition = {
      margin: position.margin.times(new BN(1).minus(reducePercentage)),
      totalPosition: position.totalPosition.minus(parsedReduceAmount),
      totalDebtInput: position.totalDebtInput.times(new BN(1).minus(reducePercentage)),
      totalDebtOutput: position.totalDebtOutput.times(new BN(1).minus(reducePercentage)),
      premiumLeft: closePosition ? new BN(0) : undefined,
    }

    return {
      result: info,
      position: _newPosition,
    }
  }, [
    allowedSlippage,
    closePosition,
    inputCurrency,
    marginFacility,
    marginFacility?.signer,
    outputCurrency,
    parsedReduceAmount,
    pool,
    position,
    positionKey,
  ])

  const queryKey = useMemo(() => {
    if (!inputError && parsedReduceAmount && !isLimit && !existingOrderBool) {
      return ['reducePosition', parsedReduceAmount.toString(), closePosition]
    }
    return []
  }, [inputError, parsedReduceAmount, closePosition, isLimit, existingOrderBool])
  const enabled = queryKey.length > 0
  const { data, isError, isLoading, error } = useQuery({
    queryKey,
    enabled,
    queryFn: simulate,
    refetchInterval: 1000 * 4,
    staleTime: 10 * 1000,
  })

  useEffect(() => {
    if (!data || isError || !enabled) {
      return
    }
    if (data) {
      const { result, position } = data
      onPositionChange(position)
    }
  }, [data, enabled, isError, onPositionChange])

  const contractError = useMemo(() => {
    let message: ReactNode | undefined
    if (error) {
      message = <Trans>{getErrorMessage(parseContractError(error))}</Trans>
    }

    return message
  }, [error])

  return useMemo(() => {
    if (!enabled) {
      return {
        txnInfo: undefined,
        inputError: undefined,
        contractError: undefined,
        tradeState: DerivedInfoState.INVALID,
      }
    }

    return {
      txnInfo: !isError ? data?.result : undefined,
      inputError,
      contractError,
      tradeState: isLoading ? DerivedInfoState.LOADING : isError ? DerivedInfoState.INVALID : DerivedInfoState.VALID,
    }
  }, [contractError, data, enabled, inputError, isError, isLoading])
}

const getLimitUserParams = (reduceAmount: BN, limitPrice: BN) => {
  return `${reduceAmount.toString()}-${limitPrice.toString()}`
}

export function useDerivedReduceLimitPositionInfo(
  isLimit: boolean,
  reduceAmount: string,
  limitPrice: string,
  positionKey: OrderPositionKey,
  baseCurrencyIsInput: boolean,
  // setState: (state: DerivedInfoState) => void,
  onPositionChange: (newPosition: AlteredPositionProperties) => void,
  position: MarginPositionDetails | undefined,
  pool: Pool | undefined,
  existingOrderBool: boolean | undefined,
  inputCurrency?: Currency,
  outputCurrency?: Currency
): {
  txnInfo: DerivedLimitReducePositionInfo | undefined
  // txnInfo: DerivedReducePositionInfo | undefined
  inputError: ReactNode | undefined
  contractError: ReactNode | undefined
  tradeState: DerivedInfoState
} {
  const [txnInfo, setTxnInfo] = useState<DerivedLimitReducePositionInfo>()
  const [error, setError] = useState<DecodedError>()
  // const [, pool] = usePoolV2(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)
  const { position: existingLimitOrder } = useMarginOrderPositionFromPositionId(positionKey)
  const parsedAmount = useMemo(() => parseBN(reduceAmount), [reduceAmount])
  const parsedLimitPrice = useMemo(() => parseBN(limitPrice), [limitPrice])
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastBlockNumber, setBlockNumber] = useState<number>()
  const [lastParams, setLastParams] = useState<string>()
  const blocksPerFetch = 4
  const blockNumber = useBlockNumber()

  const inputError = useMemo(() => {
    let error: React.ReactNode | undefined

    if (!parsedAmount || parsedAmount.isLessThanOrEqualTo(0)) {
      error = error ?? <Trans>Enter an amount</Trans>
    }

    if (!parsedLimitPrice || parsedLimitPrice.isLessThanOrEqualTo(0)) {
      error = error ?? <Trans>Enter a limit price</Trans>
    }
    return error
  }, [parsedAmount, parsedLimitPrice])

  const chainId = useChainId()

  const deadline = useLimitTransactionDeadline()
  const marginFacility = useMarginFacilityContract(true)

  const { result: estimatedPnL } = useEstimatedPnL(
    positionKey,
    position,
    parsedAmount,
    parsedLimitPrice ? (baseCurrencyIsInput ? new BN(1).div(parsedLimitPrice) : parsedLimitPrice) : undefined,
    outputCurrency,
    inputCurrency
  )

  const simulate = useCallback(async () => {
    if (
      !parsedAmount ||
      !parsedLimitPrice ||
      !chainId ||
      !inputCurrency ||
      !outputCurrency ||
      !deadline ||
      !marginFacility ||
      !existingLimitOrder ||
      !position ||
      !estimatedPnL
    ) {
      return undefined
    }

    if (existingLimitOrder.auctionStartTime > 0) {
      return undefined
    }

    const price = baseCurrencyIsInput ? new BN(1).div(parsedLimitPrice) : parsedLimitPrice
    const startOutput = parsedAmount.times(price).shiftedBy(inputCurrency.decimals).toFixed(0)
    setLastParams(getLimitUserParams(parsedAmount, price))
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
      deadline: deadline.toString(),
      inputAmount: parsedAmount.shiftedBy(outputCurrency.decimals).toFixed(0),
      startOutput,
      minOutput: startOutput,
      decayRate: '0',
      isAdd: false,
    }

    const startingDebtReduceAmount = parsedAmount.times(price).gt(position.totalDebtInput)
      ? position.totalDebtInput
      : parsedAmount.times(price)

    const calldata = MarginFacilitySDK.submitLimitOrder(params)

    await marginFacility.callStatic.multicall(calldata)

    const reduceAmount = parsedAmount
    const reducePercentage = reduceAmount.div(position.totalPosition)

    const info = {
      margin: position.margin.times(new BN(1).minus(reducePercentage)),
      positionReduceAmount: parsedAmount,
      startingDebtReduceAmount,
      minimumDebtReduceAmount: startingDebtReduceAmount,
      estimatedPnL,
      newTotalPosition: new TokenBN(position.totalPosition.minus(reduceAmount), outputCurrency.wrapped, false),
    }

    const userParams = getLimitUserParams(parsedAmount, price)

    return {
      result: info,
      params: userParams,
      newPosition: {
        margin: position.margin.times(new BN(1).minus(reducePercentage)),
        totalDebtInput: position.totalDebtInput.times(new BN(1).minus(reducePercentage)),
        totalDebtOutput: position.totalDebtOutput.times(new BN(1).minus(reducePercentage)),
        totalPosition: position.totalPosition.minus(parsedAmount),
      },
    }
  }, [
    parsedAmount,
    parsedLimitPrice,
    chainId,
    inputCurrency,
    outputCurrency,
    deadline,
    marginFacility,
    baseCurrencyIsInput,
    positionKey,
    existingLimitOrder,
    position,
    estimatedPnL,
  ])

  useEffect(() => {
    if (!isLimit || existingOrderBool || !estimatedPnL) {
      return
    }

    if (!!inputError || !blockNumber) {
      return
    }

    let paramsUnchanged = false
    if (parsedAmount && parsedLimitPrice) {
      const price = baseCurrencyIsInput ? new BN(1).div(parsedLimitPrice) : parsedLimitPrice
      const params = getLimitUserParams(parsedAmount, price)
      paramsUnchanged = lastParams === params
    }

    if (paramsUnchanged && lastBlockNumber && lastBlockNumber + blocksPerFetch >= blockNumber) {
      return
    }

    if (loading && !lastParams) {
      return
    }

    if (syncing) {
      return
    }

    if (lastParams && paramsUnchanged) {
      setSyncing(true)
    } else {
      setLoading(true)
    }

    simulate()
      .then((data) => {
        if (!data) {
          setError({
            type: ErrorType.EmptyError,
            error: 'missing params',
            data: undefined,
          })
          onPositionChange({})
          setLastParams(undefined)
          setTxnInfo(undefined)
          setLoading(false)
          setSyncing(false)
        } else {
          const { result: _result, params, newPosition } = data
          setTxnInfo(_result)
          // setLastParams(params)
          setError(undefined)
          setLoading(false)
          setSyncing(false)
          onPositionChange(newPosition)
        }
        setBlockNumber(blockNumber)
      })
      .catch((err) => {
        setError(parseContractError(err))
        // setLastParams(undefined)
        setTxnInfo(undefined)
        setLoading(false)
        setSyncing(false)
        setBlockNumber(blockNumber)
      })
  }, [
    blockNumber,
    error,
    existingOrderBool,
    inputError,
    baseCurrencyIsInput,
    isLimit,
    lastBlockNumber,
    lastParams,
    loading,
    parsedAmount,
    parsedLimitPrice,
    position,
    simulate,
    syncing,
    onPositionChange,
    estimatedPnL,
  ])

  const contractError = useMemo(() => {
    let message: ReactNode | undefined

    if (error) {
      message = <Trans>{getErrorMessage(error)}</Trans>
    }
    return message
  }, [error])

  return useMemo(() => {
    if (!isLimit || existingOrderBool) {
      return {
        txnInfo: undefined,
        inputError: undefined,
        contractError: undefined,
        tradeState: DerivedInfoState.INVALID,
      }
    }
    if (loading || syncing) {
      return {
        txnInfo,
        inputError,
        contractError,
        tradeState: DerivedInfoState.LOADING,
      }
    } else if (error || !!inputError) {
      return {
        txnInfo: undefined,
        inputError,
        contractError,
        tradeState: DerivedInfoState.INVALID,
      }
    } else if (parsedAmount && parsedLimitPrice) {
      const price = baseCurrencyIsInput ? new BN(1).div(parsedLimitPrice) : parsedLimitPrice
      const params = getLimitUserParams(parsedAmount, price)
      if (lastParams === params) {
        return {
          txnInfo,
          inputError,
          contractError,
          tradeState: DerivedInfoState.VALID,
        }
      }
    }
    return {
      txnInfo: undefined,
      inputError,
      contractError,
      tradeState: DerivedInfoState.INVALID,
    }
  }, [
    txnInfo,
    inputError,
    contractError,
    existingOrderBool,
    isLimit,
    baseCurrencyIsInput,
    error,
    loading,
    syncing,
    parsedAmount,
    parsedLimitPrice,
    lastParams,
  ])
}
