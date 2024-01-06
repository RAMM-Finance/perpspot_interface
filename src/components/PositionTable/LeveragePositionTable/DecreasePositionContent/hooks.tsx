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
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { parseBN } from 'state/marginTrading/hooks'
import { MarginPositionDetails, OrderPositionKey, TraderPositionKey } from 'types/lmtv2position'
import { DecodedError } from 'utils/ethersErrorHandler/types'
import { getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { TokenBN } from 'utils/lmtSDK/internalConstants'
import { LimitOrderOptions, MarginFacilitySDK, ReducePositionOptions } from 'utils/lmtSDK/MarginFacility'

import { AlteredPositionProperties } from '../LeveragePositionModal'
import { DerivedInfoState, DerivedLimitReducePositionInfo, DerivedReducePositionInfo, getSlippedTicks } from '.'

export function useDerivedReducePositionInfo(
  isLimit: boolean,
  reduceAmount: string,
  positionKey: TraderPositionKey,
  position: MarginPositionDetails | undefined,
  allowedSlippage: Percent,
  setState: (state: DerivedInfoState) => void,
  onPositionChange: (newPosition: AlteredPositionProperties) => void,
  inRange: boolean,
  existingOrderBool: boolean | undefined,
  inputCurrency?: Currency,
  outputCurrency?: Currency
): {
  txnInfo: DerivedReducePositionInfo | undefined
  inputError: ReactNode | undefined
  contractError: ReactNode | undefined
} {
  const marginFacility = useMarginFacilityContract()

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

  useEffect(() => {
    const lagged = async () => {
      if (
        !marginFacility ||
        !position ||
        !parsedReduceAmount ||
        !!inputError ||
        !pool ||
        !inputCurrency ||
        !outputCurrency
      ) {
        setState(DerivedInfoState.INVALID)
        setTxnInfo(undefined)
        onPositionChange({})
        setError(undefined)
        return
      }

      setState(DerivedInfoState.LOADING)

      try {
        const reducePercent = parsedReduceAmount.div(position.totalPosition).shiftedBy(18).toFixed(0)
        const { slippedTickMin, slippedTickMax } = getSlippedTicks(pool, allowedSlippage)
        const price = !position.isToken0 ? pool.token1Price.toFixed(18) : pool.token0Price.toFixed(18)

        // reducePercentage * totalPosition multiplied(or divided) current price
        const minOutput = parsedReduceAmount
          .times(price)
          .times(new BN(1).minus(new BN(allowedSlippage.toFixed(18)).div(100)))

        const isClose = parsedReduceAmount.isEqualTo(position.totalPosition)
        const removePremium =
          isClose && position.premiumLeft.isGreaterThan(0)
            ? position.premiumLeft.shiftedBy(inputCurrency.decimals).toFixed(0)
            : undefined

        const params: ReducePositionOptions = {
          positionKey,
          reducePercentage: reducePercent,
          executionOption: 1,
          slippedTickMin,
          slippedTickMax,
          executionData: ethers.constants.HashZero,
          minOutput: minOutput.shiftedBy(inputCurrency.decimals).toFixed(0),
          removePremium,
        }

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

        const info: DerivedReducePositionInfo = {
          PnL: new BN(result.PnL.toString()).shiftedBy(-inputCurrency.decimals),
          returnedAmount: new BN(result.returnedAmount.toString()).shiftedBy(-outputCurrency.decimals),
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
          withdrawnPremium: removePremium
            ? new TokenBN(removePremium, inputCurrency.wrapped, true)
            : new TokenBN(0, inputCurrency.wrapped, false),
        }

        onPositionChange({
          margin: position.margin.times(new BN(1).minus(reducePercentage)),
          totalPosition: position.totalPosition.minus(parsedReduceAmount),
          totalDebtInput: position.totalDebtInput.times(new BN(1).minus(reducePercentage)),
          totalDebtOutput: position.totalDebtOutput.times(new BN(1).minus(reducePercentage)),
          premiumLeft: removePremium
            ? position.premiumLeft.minus(new BN(removePremium).shiftedBy(-inputCurrency.decimals))
            : undefined,
        })
        setTxnInfo(info)
        setState(DerivedInfoState.VALID)
        setError(undefined)
      } catch (err) {
        onPositionChange({})
        setState(DerivedInfoState.INVALID)
        setError(parseContractError(err))
        setTxnInfo(undefined)
      }
    }

    if (isLimit || inRange || existingOrderBool) {
      setState(DerivedInfoState.INVALID)
      setTxnInfo(undefined)
      return
    }

    lagged()
  }, [
    setState,
    pool,
    marginFacility,
    parsedReduceAmount,
    position,
    positionKey,
    inputCurrency,
    outputCurrency,
    allowedSlippage,
    isLimit,
    onPositionChange,
    inputError,
    inRange,
    existingOrderBool,
  ])

  const contractError = useMemo(() => {
    let message: ReactNode | undefined
    if (error) {
      message = <Trans>{getErrorMessage(error)}</Trans>
    }
    return message
  }, [error])

  return useMemo(() => {
    return {
      txnInfo,
      inputError,
      contractError,
    }
  }, [txnInfo, inputError, contractError])
}

export function useDerivedReduceLimitPositionInfo(
  isLimit: boolean,
  reduceAmount: string,
  limitPrice: string,
  positionKey: OrderPositionKey,
  baseCurrencyIsInput: boolean,
  setState: (state: DerivedInfoState) => void,
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
} {
  const [txnInfo, setTxnInfo] = useState<DerivedLimitReducePositionInfo>()
  const [error, setError] = useState<DecodedError>()
  // const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)
  const { position: existingLimitOrder } = useMarginOrderPositionFromPositionId(positionKey)
  const parsedAmount = useMemo(() => parseBN(reduceAmount), [reduceAmount])
  const parsedLimitPrice = useMemo(() => parseBN(limitPrice), [limitPrice])

  const inputError = useMemo(() => {
    let error: React.ReactNode | undefined

    if (!parsedAmount || parsedAmount.isLessThanOrEqualTo(0)) {
      error = error ?? <Trans>Enter an amount</Trans>
    }

    if (!parsedLimitPrice || parsedLimitPrice.isLessThanOrEqualTo(0)) {
      error = error ?? <Trans>Enter a limit price</Trans>
    }

    if (parsedLimitPrice && pool && position && parsedAmount) {
      /**
       * isToken0: limit price (t1 / t0) must be gte current price (t1 / t0)
       * !isToken0: limit price (t0 / t1) must be gte current price ( t0 / t1)
       *
       * isToken0 -> output is t0, input is t1
       * !isToken0 -> output is t1, input is t0
       * baseTokenIsToken0 -> baseCurrencyIsInput && !isToken0 || !baseCurrencyIsInput && isToken0
       */
      const baseIsToken0 =
        (baseCurrencyIsInput && !positionKey.isToken0) || (!baseCurrencyIsInput && positionKey.isToken0)

      /**
       *
       * if baseIsToken0 then limitPrice is in t1 / t0
       * if !baseIsToken0 then limitPrice is in t0 / t1
       *
       * if baseIsT0 and isToken0 then no flip
       * if baseIsT0 and !isToken0 then flip
       * if !baseIsT0 and isToken0 then flip
       * if !baseIsT0 and !isToken0 then no flip
       */
      const flippedPrice = (baseIsToken0 && !positionKey.isToken0) || (!baseIsToken0 && positionKey.isToken0)
      const price = flippedPrice ? new BN(1).div(parsedLimitPrice) : parsedLimitPrice

      if (positionKey.isToken0) {
        const currentPrice = new BN(pool.token0Price.toFixed(18))
        if (!price.gte(currentPrice)) {
          if (baseIsToken0) {
            error = error ?? <Trans>Order Price must be greater than or equal to the mark price.</Trans>
          } else {
            error = error ?? <Trans>Order Price must be less than or equal to the mark price.</Trans>
          }
        }
      } else {
        const currentPrice = new BN(pool.token1Price.toFixed(18))
        if (!price.gte(currentPrice)) {
          if (baseIsToken0) {
            error = error ?? <Trans>Order Price must be less than or equal to the mark price.</Trans>
          } else {
            error = error ?? <Trans>Order Price must be greater than or equal to the mark price.</Trans>
          }
        }
      }
    }

    return error
  }, [parsedAmount, parsedLimitPrice, baseCurrencyIsInput, pool, positionKey, position])
  const { chainId } = useWeb3React()

  const deadline = useLimitTransactionDeadline()
  const marginFacility = useMarginFacilityContract(true)

  const { result: estimatedPnL } = useEstimatedPnL(
    positionKey,
    position,
    parsedAmount,
    parsedLimitPrice,
    outputCurrency
  )

  useEffect(() => {
    const lagged = async () => {
      if (
        !!inputError ||
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
        setState(DerivedInfoState.INVALID)
        setTxnInfo(undefined)
        onPositionChange({})
        setError(undefined)
        return
      }

      if (existingLimitOrder.auctionStartTime > 0) {
        setState(DerivedInfoState.INVALID)
        setTxnInfo(undefined)
        setError(undefined)
        onPositionChange({})
        return
      }

      setState(DerivedInfoState.LOADING)

      try {
        // price should be input / output, if baseCurrencyIsInput then price is output / input
        const price = baseCurrencyIsInput ? new BN(1).div(parsedLimitPrice) : parsedLimitPrice
        const startOutput = parsedAmount.times(price).shiftedBy(inputCurrency.decimals).toFixed(0)

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

        setTxnInfo({
          margin: position.margin.times(new BN(1).minus(reducePercentage)),
          positionReduceAmount: parsedAmount,
          startingDebtReduceAmount,
          minimumDebtReduceAmount: startingDebtReduceAmount,
          startingTriggerPrice: new Price(
            outputCurrency,
            inputCurrency,
            new BN(1).shiftedBy(18).toFixed(0),
            price.shiftedBy(18).toFixed(0)
          ),
          estimatedPnL,
          newTotalPosition: new TokenBN(position.totalPosition.minus(reduceAmount), outputCurrency.wrapped, false),
        })

        onPositionChange({
          margin: position.margin.times(new BN(1).minus(reducePercentage)),
          totalDebtInput: position.totalDebtInput.times(new BN(1).minus(reducePercentage)),
          totalDebtOutput: position.totalDebtOutput.times(new BN(1).minus(reducePercentage)),
          totalPosition: position.totalPosition.minus(parsedAmount),
        })
        setState(DerivedInfoState.VALID)
        setError(undefined)
      } catch (err) {
        onPositionChange({})
        setState(DerivedInfoState.INVALID)
        setError(parseContractError(err))
        setTxnInfo(undefined)
      }
    }

    if (!isLimit || existingOrderBool) {
      setState(DerivedInfoState.INVALID)
      setTxnInfo(undefined)
      setError(undefined)
      return
    }

    lagged()
  }, [
    inputError,
    setState,
    parsedAmount,
    parsedLimitPrice,
    chainId,
    inputCurrency,
    outputCurrency,
    deadline,
    marginFacility,
    baseCurrencyIsInput,
    positionKey,
    existingOrderBool,
    existingLimitOrder,
    position,
    isLimit,
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
    return {
      txnInfo,
      inputError,
      contractError,
    }
  }, [inputError, txnInfo, contractError])
}
