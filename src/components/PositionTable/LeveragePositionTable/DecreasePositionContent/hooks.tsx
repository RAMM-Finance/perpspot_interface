import { Trans } from '@lingui/macro'
import { Currency, Percent, Price } from '@uniswap/sdk-core'
import { computePoolAddress, Pool } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { ethers } from 'ethers'
import { useMarginFacilityContract } from 'hooks/useContract'
import { useEstimatedPnL } from 'hooks/useEstimatedPnL'
import { useMarginOrderPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
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

import { AlteredPositionProperties } from '../LeveragePositionModal'
import { DerivedInfoState, DerivedLimitReducePositionInfo, DerivedReducePositionInfo, getSlippedTicks } from '.'

const getReduceUserParams = (reduceAmount: BN, allowedSlippage: Percent) => {
  return `${reduceAmount.toString()}-${allowedSlippage.toFixed(18)}`
}

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
  const marginFacility = useMarginFacilityContract()
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastBlockNumber, setBlockNumber] = useState<number>()
  const [lastParams, setLastParams] = useState<string>()
  const blocksPerFetch = 4
  const blockNumber = useBlockNumber()

  const [txnInfo, setTxnInfo] = useState<DerivedReducePositionInfo>()
  const [error, setError] = useState<DecodedError>()
  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const parsedReduceAmount = useMemo(() => parseBN(reduceAmount), [reduceAmount])

  const inputError = useMemo(() => {
    let error: React.ReactNode | undefined

    if (!parsedReduceAmount || parsedReduceAmount.isLessThanOrEqualTo(0)) {
      error = <Trans>Enter an amount</Trans>
    }

    return error
  }, [parsedReduceAmount])

  const simulate = useCallback(async () => {
    if (!marginFacility || !position || !parsedReduceAmount || !pool || !inputCurrency || !outputCurrency) {
      return undefined
    }
    const reducePercent = parsedReduceAmount.div(position.totalPosition).shiftedBy(18).toFixed(0)
    const { slippedTickMin, slippedTickMax } = getSlippedTicks(pool, allowedSlippage)
    const price = !position.isToken0 ? pool.token1Price.toFixed(18) : pool.token0Price.toFixed(18)
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

    setLastParams(getReduceUserParams(parsedReduceAmount, allowedSlippage))

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

    const PnL = new BN(result.PnL.toString())
      .shiftedBy(-18)
      .times(position.margin.times(new BN(reducePercent).shiftedBy(-18)))

    let PnLWithPremium = null
    if (closePosition) {
      if (position.marginInPosToken) {
        const price = position.isToken0 ? pool.token1Price.toFixed(18) : pool.token0Price.toFixed(18)
        PnLWithPremium = PnL.plus(position.premiumLeft.times(price))
      } else {
        PnLWithPremium = PnL.plus(position.premiumLeft)
      }
    }

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
      params: getReduceUserParams(parsedReduceAmount, allowedSlippage),
      position: _newPosition,
    }
  }, [
    allowedSlippage,
    closePosition,
    inputCurrency,
    marginFacility,
    outputCurrency,
    parsedReduceAmount,
    pool,
    position,
    positionKey,
  ])

  useEffect(() => {
    if (isLimit || existingOrderBool) {
      return
    }

    if (!!inputError || !blockNumber) {
      onPositionChange({})
      return
    }

    let paramsUnchanged = false
    if (parsedReduceAmount && allowedSlippage) {
      const params = getReduceUserParams(parsedReduceAmount, allowedSlippage)
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

    if (lastBlockNumber && lastBlockNumber + blocksPerFetch >= blockNumber && lastParams && paramsUnchanged) {
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
          const { result: _result, params, position } = data
          setTxnInfo(_result)
          // setLastParams(params)
          setError(undefined)
          setLoading(false)
          setSyncing(false)
          onPositionChange(position)
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
    allowedSlippage,
    blockNumber,
    error,
    existingOrderBool,
    // inRange,
    inputError,
    isLimit,
    lastBlockNumber,
    lastParams,
    loading,
    parsedReduceAmount,
    position,
    simulate,
    syncing,
    onPositionChange,
  ])

  const contractError = useMemo(() => {
    let message: ReactNode | undefined
    if (error) {
      message = <Trans>{getErrorMessage(error)}</Trans>
    }

    return message
  }, [error])

  return useMemo(() => {
    if (isLimit || existingOrderBool) {
      return {
        txnInfo: undefined,
        inputError: undefined,
        contractError: undefined,
        tradeState: DerivedInfoState.INVALID,
      }
    }

    const tradeState: DerivedInfoState = DerivedInfoState.INVALID
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
    } else if (parsedReduceAmount && allowedSlippage) {
      const params = getReduceUserParams(parsedReduceAmount, allowedSlippage)
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
      tradeState,
    }
  }, [
    txnInfo,
    inputError,
    contractError,
    existingOrderBool,
    // inRange,
    isLimit,
    allowedSlippage,
    error,
    loading,
    syncing,
    parsedReduceAmount,
    lastParams,
  ])
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
  // const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)
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
  const { chainId } = useWeb3React()

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
