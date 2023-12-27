import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { Button } from '@mui/material'
import { NumberType } from '@uniswap/conedison/format'
import { Currency, Percent, Price } from '@uniswap/sdk-core'
import { computePoolAddress, Pool, priceToClosestTick } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import AnimatedDropdown from 'components/AnimatedDropdown'
import SwapCurrencyInputPanelV2 from 'components/BaseSwapPanel/CurrencyInputPanel'
import { ButtonError } from 'components/Button'
import { DarkCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import HoverInlineText, { TextWrapper } from 'components/HoverInlineText'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import {
  RotatingArrow,
  Spinner,
  StyledCard,
  StyledInfoIcon,
  StyledPolling,
  StyledPollingDot,
  TextWithLoadingPlaceholder,
  TransactionDetails,
} from 'components/modalFooters/common'
import Row, { RowStart } from 'components/Row'
import { RowBetween, RowFixed } from 'components/Row'
import { LmtSettingsTab } from 'components/Settings'
import { PercentSlider } from 'components/Slider/MUISlider'
import { ValueLabel } from 'components/swap/AdvancedSwapDetails'
import { TruncatedText } from 'components/swap/styleds'
import Toggle from 'components/Toggle'
import { ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle'
import { DeltaText } from 'components/Tokens/TokenDetails/PriceChart'
import { MouseoverTooltip } from 'components/Tooltip'
import { LMT_MARGIN_FACILITY, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { ethers } from 'ethers'
import { useCurrency } from 'hooks/Tokens'
import { BorrowedLiquidityRange, useBorrowedLiquidityRange } from 'hooks/useBorrowedLiquidityRange'
import { useMarginFacilityContract } from 'hooks/useContract'
import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
import { useMarginLMTPositionFromPositionId, useMarginOrderPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { usePool } from 'hooks/usePools'
import useTransactionDeadline, { useLimitTransactionDeadline } from 'hooks/useTransactionDeadline'
import { useUSDPrice } from 'hooks/useUSDPrice'
import JSBI from 'jsbi'
import { formatBNToString } from 'lib/utils/formatLocaleNumber'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { DynamicSection } from 'pages/Swap/tradeModal'
import { PriceToggleSection } from 'pages/Swap/tradeModal'
import { Filter, FilterWrapper, Selector, StyledSelectorText } from 'pages/Swap/tradeModal'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { parseBN } from 'state/marginTrading/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { useUserSlippageTolerance, useUserSlippedTickTolerance } from 'state/user/hooks'
import { useTheme } from 'styled-components/macro'
import styled from 'styled-components/macro'
import { HideSmall, ThemedText } from 'theme'
import { MarginPositionDetails, OrderPositionKey, TraderPositionKey } from 'types/lmtv2position'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { LimitOrderOptions, MarginFacilitySDK, ReducePositionOptions } from 'utils/lmtSDK/MarginFacility'
import { MulticallSDK } from 'utils/lmtSDK/multicall'

import { ConfirmLimitReducePositionHeader, ConfirmReducePositionHeader } from './ConfirmModalHeaders'
import { BaseFooter } from './DepositPremiumContent'
import { AlteredPositionProperties } from './LeveragePositionModal'
import ConfirmModifyPositionModal from './TransactionModal'

export interface DerivedReducePositionInfo {
  PnL: BN
  returnedAmount: BN
  premium: BN
  profitFee: BN
  // newPosition: MarginPositionDetails
  minimumOutput: BN
  executionPrice: Price<Currency, Currency>
  amount0: BN
  amount1: BN
  margin: BN
  totalPosition: BN
  totalDebtInput: BN
  totalDebtOutput: BN
}

export interface DerivedLimitReducePositionInfo {
  margin: BN
  totalPosition: BN
  totalDebtInput: BN
  totalDebtOutput: BN
}

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.backgroundSurface};
`

const CloseText = styled(ThemedText.LabelSmall)<{ isActive: boolean }>`
  color: ${({ theme, isActive }) => (isActive ? theme.textSecondary : theme.textPrimary)};
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`

const StyledHeaderRow = styled(RowBetween)<{ disabled: boolean; open: boolean }>`
  padding: 0;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`

const StyledBGCard = styled(StyledCard)`
  background: ${({ theme }) => theme.surface1};
`

enum DerivedInfoState {
  LOADING,
  VALID,
  INVALID,
  SYNCING, // syncing means already loaded valid info, but updating to newest info
}

function useDerivedReducePositionInfo(
  isLimit: boolean,
  reduceAmount: string,
  positionKey: TraderPositionKey,
  position: MarginPositionDetails | undefined,
  allowedSlippage: Percent,
  setState: (state: DerivedInfoState) => void,
  onPositionChange: (newPosition: AlteredPositionProperties) => void,
  inRange: boolean,
  inputCurrency?: Currency,
  outputCurrency?: Currency
): {
  txnInfo: DerivedReducePositionInfo | undefined
  inputError: ReactNode | undefined
} {
  const marginFacility = useMarginFacilityContract()

  const [txnInfo, setTxnInfo] = useState<DerivedReducePositionInfo>()
  const [contractError, setContractError] = useState<React.ReactNode>()
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
          position.isToken0 ? result.amount1.toString() : result.amount0.toString()
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
        setContractError(undefined)
      } catch (err) {
        onPositionChange({})
        console.log('reduce error', err)
        setState(DerivedInfoState.INVALID)
        setContractError(err)
        setTxnInfo(undefined)
      }
    }

    if (isLimit || inRange) {
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
  ])

  return useMemo(() => {
    return {
      txnInfo,
      inputError,
    }
  }, [txnInfo, inputError])
}

function useDerivedReduceLimitPositionInfo(
  isLimit: boolean,
  reduceAmount: string,
  limitPrice: string,
  positionKey: OrderPositionKey,
  baseCurrencyIsInput: boolean,
  setState: (state: DerivedInfoState) => void,
  onPositionChange: (newPosition: AlteredPositionProperties) => void,
  position: MarginPositionDetails | undefined,
  inputCurrency?: Currency,
  outputCurrency?: Currency
): {
  txnInfo: DerivedLimitReducePositionInfo | undefined
  // txnInfo: DerivedReducePositionInfo | undefined
  inputError: ReactNode | undefined
} {
  const [txnInfo, setTxnInfo] = useState<DerivedLimitReducePositionInfo>()
  const [contractError, setContractError] = useState<React.ReactNode>()
  // const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)
  const existingLimitOrder = useMarginOrderPositionFromPositionId(positionKey)
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
    return error
  }, [parsedAmount, parsedLimitPrice])
  const { chainId } = useWeb3React()

  const deadline = useLimitTransactionDeadline()
  const marginFacility = useMarginFacilityContract(true)

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
        !position
      ) {
        setState(DerivedInfoState.INVALID)
        setTxnInfo(undefined)
        onPositionChange({})
        setContractError(undefined)
        return
      }

      if (existingLimitOrder.auctionStartTime > 0) {
        setState(DerivedInfoState.INVALID)
        setTxnInfo(undefined)
        setContractError(undefined)
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
          deadline: deadline?.toString(),
          inputAmount: parsedAmount.shiftedBy(outputCurrency.decimals).toFixed(0),
          startOutput,
          minOutput: startOutput,
          decayRate: '0',
          isAdd: false,
        }

        const calldata = MarginFacilitySDK.submitLimitOrder(params)

        await marginFacility.callStatic.multicall(calldata)

        const reduceAmount = parsedAmount
        const reducePercentage = reduceAmount.div(position.totalPosition)

        setTxnInfo({
          margin: position.margin.times(new BN(1).minus(reducePercentage)),
          totalPosition: position.totalPosition.minus(parsedAmount),
          totalDebtInput: position.totalDebtInput.times(new BN(1).minus(reducePercentage)),
          totalDebtOutput: position.totalDebtOutput.times(new BN(1).minus(reducePercentage)),
        })

        onPositionChange({
          margin: position.margin.times(new BN(1).minus(reducePercentage)),
          totalDebtInput: position.totalDebtInput.times(new BN(1).minus(reducePercentage)),
          totalDebtOutput: position.totalDebtOutput.times(new BN(1).minus(reducePercentage)),
          totalPosition: position.totalPosition.minus(parsedAmount),
        })
        setState(DerivedInfoState.VALID)
        setContractError(undefined)
      } catch (err) {
        console.log('limit reduce error', err)
        onPositionChange({})
        setState(DerivedInfoState.INVALID)
        setContractError(err)
        setTxnInfo(undefined)
      }
    }

    if (!isLimit) {
      setState(DerivedInfoState.INVALID)
      setTxnInfo(undefined)
      setContractError(undefined)
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
    existingLimitOrder,
    position,
    isLimit,
    onPositionChange,
  ])

  return useMemo(() => {
    return {
      txnInfo,
      inputError,
    }
  }, [inputError, txnInfo])
}

// const InputHeader = styled.div`
//   padding-left: 6px;
//   padding-top: 3px;
// `

const InputSection = styled.div`
  background-color: ${({ theme }) => theme.surface1};
  margin-bottom: 10px;
  padding: 10px;
  margin-top: 5px;
  &:focus-within {
    border: 1px solid ${({ theme }) => theme.accentActive};
  }
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  color: ${({ theme }) => theme.textSecondary};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Hr = styled.hr`
  background-color: ${({ theme }) => theme.backgroundOutline};
  border: none;
  height: 0.5px;
  width: 90%;
`

export default function DecreasePositionContent({
  positionKey,
  onPositionChange,
}: {
  positionKey: TraderPositionKey
  onPositionChange: (newPosition: AlteredPositionProperties) => void
}) {
  // state inputs, derived, handlers for trade confirmation
  const [reduceAmount, setReduceAmount] = useState('')
  // const [attemptingTxn, setAttemptingTxn] = useState(false)
  // const [txHash, setTxHash] = useState<string>()
  // const [showDetails, setShowDetails] = useState(true)
  // const [showModal, setShowModal] = useState(false)
  const [currentState, setCurrentState] = useState<{
    showModal: boolean
    showLimitModal: boolean
    showDetails: boolean
    attemptingTxn: boolean
    attemptingLimitTxn: boolean
    txHash: string | undefined
    limitTxHash: string | undefined
    errorMessage: string | undefined
    limitErrorMessage: string | undefined
    isLimit: boolean
    originalTrade: DerivedReducePositionInfo | undefined
    originalLimitTrade: DerivedLimitReducePositionInfo | undefined
  }>({
    showModal: false,
    showLimitModal: false,
    showDetails: true,
    attemptingTxn: false,
    attemptingLimitTxn: false,
    txHash: undefined,
    limitTxHash: undefined,
    errorMessage: undefined,
    limitErrorMessage: undefined,
    isLimit: false,
    originalTrade: undefined,
    originalLimitTrade: undefined,
  })

  const orderKey: OrderPositionKey = useMemo(() => {
    return {
      poolKey: positionKey.poolKey,
      trader: positionKey.trader,
      isToken0: positionKey.isToken0,
      isAdd: false,
    }
  }, [positionKey])
  const [tradeState, setTradeState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const [lmtTradeState, setLmtTradeState] = useState<DerivedInfoState>(DerivedInfoState.INVALID)
  const { position } = useMarginLMTPositionFromPositionId(positionKey)
  // const [errorMessage, setErrorMessage] = useState<string>()
  const [showSettings, setShowSettings] = useState(false)
  // const [isLimit, setIsLimit] = useState(false)
  const [baseCurrencyIsInput, setBaseCurrencyIsInput] = useState(false)
  const [limitPrice, setLimitPrice] = useState<string>('')

  const inputCurrency = useCurrency(
    position?.isToken0 ? position?.poolKey?.token1Address : position?.poolKey.token0Address
  )
  const outputCurrency = useCurrency(
    position?.isToken0 ? position?.poolKey?.token0Address : position?.poolKey.token1Address
  )

  const [, pool] = usePool(inputCurrency ?? undefined, outputCurrency ?? undefined, positionKey.poolKey.fee)

  const [userSlippageTolerance] = useUserSlippageTolerance()
  const [userSlippedTickTolerance] = useUserSlippedTickTolerance()

  const allowedSlippage = useMemo(() => {
    if (userSlippageTolerance === 'auto') return new Percent(JSBI.BigInt(3), JSBI.BigInt(100))
    else return userSlippageTolerance
  }, [userSlippageTolerance])

  const borrowLiquidityRange = useBorrowedLiquidityRange(position, pool ?? undefined)
  const inRange = useMemo(() => {
    return borrowLiquidityRange === BorrowedLiquidityRange.IN_RANGE
  }, [borrowLiquidityRange])
  // const allowedSlippedTick = useMemo(() => {
  //   if (userSlippedTickTolerance === 'auto') return new Percent(JSBI.BigInt(3), JSBI.BigInt(100))
  //   else return userSlippedTickTolerance
  // }, [userSlippedTickTolerance])

  const onToggle = useCallback(() => {
    setShowSettings(!showSettings)
  }, [showSettings])

  const [closePosition, setClosePosition] = useState(false)

  const { txnInfo, inputError } = useDerivedReducePositionInfo(
    currentState.isLimit,
    reduceAmount,
    positionKey,
    position,
    allowedSlippage,
    setTradeState,
    onPositionChange,
    inRange,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  )

  const { inputError: lmtInputError, txnInfo: lmtTxnInfo } = useDerivedReduceLimitPositionInfo(
    currentState.isLimit,
    reduceAmount,
    limitPrice,
    orderKey,
    baseCurrencyIsInput,
    setLmtTradeState,
    onPositionChange,
    position,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  )
  const { position: existingPosition, loading: positionLoading } = useMarginLMTPositionFromPositionId(positionKey)

  const positionExists = useMemo(() => {
    if (!positionLoading && existingPosition?.openTime === 0) {
      return false
    } else {
      return true
    }
  }, [existingPosition, positionLoading])

  // const marginFacility = useMarginFacilityContract(true)

  const addTransaction = useTransactionAdder()

  // callback
  const { account, provider, chainId } = useWeb3React()

  const deadline = useTransactionDeadline()

  const parsedReduceAmount = useMemo(() => parseBN(reduceAmount), [reduceAmount])
  const parsedLimitPrice = useMemo(() => parseBN(limitPrice), [limitPrice])
  const { callback: limitCallback } = useReduceLimitOrderCallback(
    parsedReduceAmount,
    positionKey,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    parsedLimitPrice,
    baseCurrencyIsInput,
    lmtTradeState
  )

  const callback = useCallback(async (): Promise<TransactionResponse> => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!txnInfo) throw new Error('missing txn info')
      if (!parsedReduceAmount) throw new Error('missing reduce amount')
      // if (!marginFacility) throw new Error('missing marginFacility contract')
      if (!position) throw new Error('missing position')
      if (!pool || !outputCurrency || !inputCurrency) throw new Error('missing pool')
      if (tradeState !== DerivedInfoState.VALID) throw new Error('invalid trade state')
      if (!deadline) throw new Error('missing deadline')
      if (!inputCurrency) throw new Error('missing input currency')

      // get reduce parameters
      const reducePercent = new BN(parsedReduceAmount).div(position.totalPosition).shiftedBy(18).toFixed(0)
      const { slippedTickMin, slippedTickMax } = getSlippedTicks(pool, allowedSlippage)
      const price = !position.isToken0 ? pool.token1Price.toFixed(18) : pool.token0Price.toFixed(18)

      const minOutput = new BN(parsedReduceAmount)
        .times(price)
        .times(new BN(1).minus(new BN(allowedSlippage.toFixed(18)).div(100)))

      const isClose = parsedReduceAmount.isEqualTo(position.totalPosition)
      const removePremium =
        isClose && position.premiumLeft.isGreaterThan(0)
          ? position.premiumLeft.shiftedBy(inputCurrency.decimals).toFixed(0)
          : undefined

      const reduceParam: ReducePositionOptions = {
        positionKey,
        reducePercentage: reducePercent,
        minOutput: minOutput.shiftedBy(inputCurrency.decimals).toFixed(0),
        executionOption: 1,
        executionData: ethers.constants.HashZero,
        slippedTickMin,
        slippedTickMax,
        removePremium,
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
      console.log('reduce callback error', err)
      throw new Error('reduce callback error')
    }
  }, [
    account,
    inputCurrency,
    outputCurrency,
    pool,
    position,
    positionKey,
    txnInfo,
    tradeState,
    provider,
    chainId,
    // marginFacility,
    allowedSlippage,
    deadline,
    parsedReduceAmount,
  ])

  const handleReducePosition = useCallback(() => {
    if (!callback || !position || !txnInfo || !inputCurrency || !outputCurrency) {
      return
    }
    // setAttemptingTxn(true)
    setCurrentState((prev) => ({ ...prev, attemptingTxn: true }))

    callback()
      .then((response) => {
        // setAttemptingTxn(false)
        setCurrentState((prev) => ({ ...prev, attemptingTxn: false, txHash: response?.hash, errorMessage: undefined }))
        // setTxHash(response?.hash)
        // setErrorMessage(undefined)
        addTransaction(response, {
          type: TransactionType.REDUCE_LEVERAGE,
          reduceAmount: Number(reduceAmount),
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
          pnl: Number(txnInfo.PnL),
          timestamp: new Date().getTime().toString(),
        })
        setReduceAmount('')
      })
      .catch((error) => {
        console.error(error)
        setCurrentState((prev) => ({
          ...prev,
          attemptingTxn: false,
          txHash: undefined,
          errorMessage: error.message,
        }))
        // setAttemptingTxn(false)
        // setTxHash(undefined)
        // setErrorMessage(error.message)
        setReduceAmount('')
      })
  }, [
    callback,
    position,
    txnInfo,
    inputCurrency,
    outputCurrency,
    reduceAmount,
    addTransaction,
    // setAttemptingTxn,
    // setTxHash,
    // setErrorMessage,
  ])

  const handleReduceLimitPosition = useCallback(() => {
    if (!limitCallback || !inputCurrency || !outputCurrency) {
      return
    }
    setCurrentState((prev) => ({ ...prev, attemptingLimitTxn: true }))
    limitCallback()
      .then((response) => {
        setCurrentState((prev) => ({
          ...prev,
          attemptingLimitTxn: false,
          limitTxHash: response?.hash,
          limitErrorMessage: undefined,
        }))
        addTransaction(response, {
          type: TransactionType.REDUCE_LIMIT_ORDER,
          inputCurrencyId: inputCurrency.wrapped.address,
          outputCurrencyId: outputCurrency.wrapped.address,
        })
        setReduceAmount('')
        setLimitPrice('')
      })
      .catch((err) => {
        console.log('limit error', err)
        setCurrentState((prev) => ({
          ...prev,
          attemptingLimitTxn: false,
          limitTxHash: undefined,
          limitErrorMessage: err.message,
        }))
        setReduceAmount('')
        setLimitPrice('')
      })
  }, [limitCallback, inputCurrency, outputCurrency, addTransaction])

  const [debouncedReduceAmount, onDebouncedReduceAmount] = useDebouncedChangeHandler(
    reduceAmount ?? '',
    setReduceAmount
  )

  const theme = useTheme()

  const loading = useMemo(() => tradeState === DerivedInfoState.LOADING, [tradeState])

  const handleDismiss = useCallback(() => {
    setCurrentState((prev) => ({
      ...prev,
      showModal: false,
      attemptingTxn: false,
      txHash: undefined,
      errorMessage: undefined,
    }))
  }, [])

  const handleDismissLimit = useCallback(() => {
    setCurrentState((prev) => ({
      ...prev,
      showLimitModal: false,
      attemptingLimitTxn: false,
      limitTxHash: undefined,
      limitErrorMessage: undefined,
    }))
  }, [])

  // const { onChangeTradeType, onPriceToggle, onPriceInput } = useMarginTradingActionHandlers()

  // const { baseCurrencyIsInputToken, startingPrice } = useMarginTradingState()

  // console.log('lmtTradeState', lmtTradeState)

  const currentPrice = useMemo(() => {
    if (pool && inputCurrency && outputCurrency) {
      const inputIsToken0 = inputCurrency.wrapped.sortsBefore(outputCurrency.wrapped)
      const baseIsToken0 = (baseCurrencyIsInput && inputIsToken0) || (!baseCurrencyIsInput && !inputIsToken0)
      if (baseIsToken0) {
        return formatBNToString(new BN(pool.token0Price.toFixed(18)), NumberType.FiatTokenPrice, true)
      } else {
        return formatBNToString(new BN(pool.token1Price.toFixed(18)), NumberType.FiatTokenPrice, true)
      }
    }
    return undefined
  }, [baseCurrencyIsInput, inputCurrency, pool, outputCurrency])

  const [baseCurrency, quoteCurrency] = useMemo(() => {
    return baseCurrencyIsInput ? [inputCurrency, outputCurrency] : [outputCurrency, inputCurrency]
  }, [baseCurrencyIsInput, inputCurrency, outputCurrency])

  const fiatValueReduceAmount = useUSDPrice(tryParseCurrencyAmount(reduceAmount, outputCurrency ?? undefined))

  if (!positionExists) {
    return <PositionMissing />
  }

  return (
    <DarkCard width="100%" margin="0" padding="0" style={{ paddingRight: '1rem', paddingLeft: '1rem' }}>
      {currentState.showModal && (
        <ConfirmModifyPositionModal
          onDismiss={handleDismiss}
          isOpen={currentState.showModal}
          attemptingTxn={currentState.attemptingTxn}
          txHash={currentState.txHash}
          header={
            txnInfo ? (
              <ConfirmReducePositionHeader
                txnInfo={txnInfo}
                inputCurrency={inputCurrency ?? undefined}
                outputCurrency={outputCurrency ?? undefined}
                showAcceptChanges={false}
                onAcceptChanges={() => {}}
              />
            ) : null
          }
          bottom={
            <BaseFooter
              errorMessage={<Trans>{currentState.errorMessage}</Trans>}
              onConfirm={handleReducePosition}
              confirmText="Confirm Reduce Position"
              disabledConfirm={!!inputError || !txnInfo}
            />
          }
          title="Confirm Reduce Position"
          pendingText={<Trans>Reducing Position ...</Trans>}
          currencyToAdd={outputCurrency ?? undefined}
          recipient={account ?? null}
          errorMessage={currentState.errorMessage ? <Trans>{currentState.errorMessage}</Trans> : undefined}
        />
      )}
      {currentState.showLimitModal && (
        <ConfirmModifyPositionModal
          onDismiss={handleDismissLimit}
          title="Confirm Reduce Limit Order"
          isOpen={currentState.showLimitModal}
          txHash={currentState.limitTxHash}
          attemptingTxn={currentState.attemptingLimitTxn}
          header={
            lmtTxnInfo ? (
              <ConfirmLimitReducePositionHeader
                txnInfo={lmtTxnInfo}
                inputCurrency={inputCurrency ?? undefined}
                outputCurrency={outputCurrency ?? undefined}
                showAcceptChanges={false}
                onAcceptChanges={() => {}}
              />
            ) : null
          }
          bottom={
            <BaseFooter
              errorMessage={<Trans>{currentState.limitErrorMessage}</Trans>}
              onConfirm={handleReduceLimitPosition}
              confirmText="Confirm Reduce Limit Order"
              disabledConfirm={!!lmtInputError || lmtTradeState !== DerivedInfoState.VALID}
            />
          }
          pendingText={<Trans>Submitting Limit Order ...</Trans>}
          currencyToAdd={outputCurrency ?? undefined}
          recipient={account ?? null}
          errorMessage={currentState.limitErrorMessage ? <Trans>{currentState.limitErrorMessage}</Trans> : undefined}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '100px', alignItems: 'center' }}>
          <FilterWrapper>
            <Filter onClick={() => setCurrentState((prev) => ({ ...prev, isLimit: !prev.isLimit }))}>
              <Selector active={!currentState.isLimit}>
                <StyledSelectorText lineHeight="20px" active={!currentState.isLimit}>
                  Market
                </StyledSelectorText>
              </Selector>
              <Selector active={currentState.isLimit}>
                <StyledSelectorText lineHeight="20px" active={currentState.isLimit}>
                  Limit
                </StyledSelectorText>
              </Selector>
            </Filter>
          </FilterWrapper>
        </div>

        <LmtSettingsTab
          isOpen={showSettings}
          onToggle={onToggle}
          allowedSlippage={allowedSlippage}
          isLimitOrder={currentState.isLimit}
        />
      </div>
      <AutoColumn style={{ alignItems: 'flex-start' }}>
        <AnimatedDropdown open={currentState.isLimit}>
          <AutoColumn style={{ marginBottom: '20px' }}>
            <DynamicSection justify="start" gap="md" disabled={false}>
              <RowStart>
                {Boolean(inputCurrency && outputCurrency) && (
                  <PriceToggleSection>
                    <div
                      style={{ width: 'fit-content', display: 'flex', alignItems: 'center' }}
                      onClick={() => setBaseCurrencyIsInput(() => !baseCurrencyIsInput)}
                    >
                      <ToggleWrapper width="fit-content">
                        <ToggleElement isActive={!baseCurrencyIsInput}>
                          <CurrencyLogo currency={outputCurrency} size="15px" />
                        </ToggleElement>
                        <ToggleElement isActive={baseCurrencyIsInput}>
                          <CurrencyLogo currency={inputCurrency} size="15px" />
                        </ToggleElement>
                      </ToggleWrapper>
                    </div>
                  </PriceToggleSection>
                )}
                <Row justify="flex-end" align="start">
                  <ThemedText.DeprecatedMain fontWeight={535} fontSize={14} color="text1">
                    Current Price:
                  </ThemedText.DeprecatedMain>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', marginLeft: '10px' }}>
                    <ThemedText.DeprecatedBody fontWeight={535} fontSize={14} color="textSecondary">
                      {currentPrice && <HoverInlineText maxCharacters={20} text={currentPrice} />}
                    </ThemedText.DeprecatedBody>
                    {baseCurrency && (
                      <ThemedText.DeprecatedBody color="textSecondary" fontSize={12}>
                        {quoteCurrency?.symbol} per {baseCurrency.symbol}
                      </ThemedText.DeprecatedBody>
                    )}
                  </div>
                </Row>
              </RowStart>
            </DynamicSection>
          </AutoColumn>

          <DynamicSection gap="md" disabled={false}>
            <InputSection>
              <SwapCurrencyInputPanelV2
                value={limitPrice}
                onUserInput={(str: string) => {
                  setLimitPrice(str)
                }}
                showMaxButton={false}
                hideBalance={true}
                // fiatValue={fiatValueReduceAmount}
                // currency={outputCurrency}
                label="Limit price"
                id="limit-reduce-position-input"
                isPrice={
                  <Button
                    sx={{ textTransform: 'none' }}
                    style={{ display: 'flex', gap: '5px' }}
                    onClick={() => {
                      setBaseCurrencyIsInput(() => !baseCurrencyIsInput)
                      const val = parseBN(limitPrice)
                      if (val && !val?.isZero()) {
                        setLimitPrice(formatBNToString(new BN(1).div(val), NumberType.SwapTradeAmount))
                      }
                    }}
                  >
                    {quoteCurrency && <CurrencyLogo currency={quoteCurrency} size="15px" />}
                    <ThemedText.DeprecatedBody fontSize={14}>{quoteCurrency?.symbol} per </ThemedText.DeprecatedBody>
                    {baseCurrency && <CurrencyLogo currency={baseCurrency} size="15px" />}
                    <ThemedText.DeprecatedBody fontSize={14}>{baseCurrency?.symbol}</ThemedText.DeprecatedBody>
                  </Button>
                }
              />
            </InputSection>
          </DynamicSection>
        </AnimatedDropdown>
        <InputSection>
          <SwapCurrencyInputPanelV2
            value={reduceAmount}
            onUserInput={(str: string) => {
              if (closePosition) {
                setClosePosition(false)
              }
              if (position?.totalDebtInput) {
                if (str === '') {
                  onDebouncedReduceAmount('')
                } else if (new BN(str).isGreaterThan(new BN(position?.totalPosition))) {
                  return
                } else {
                  setReduceAmount(str)
                }
              }
            }}
            showMaxButton={false}
            hideBalance={true}
            fiatValue={fiatValueReduceAmount}
            currency={outputCurrency}
            label="Reduce Amount"
            id="reduce-position-input"
          />
        </InputSection>
        <PercentSlider
          initialValue={
            parseBN(debouncedReduceAmount) && position
              ? new BN(debouncedReduceAmount).div(position?.totalPosition).times(100).toFixed(1)
              : ''
          }
          onSlideChange={(val) => {
            if (val > 100 || val < 0) return
            position && onDebouncedReduceAmount(new BN(val).div(100).times(position?.totalPosition).toString())
          }}
          onInputChange={(val) => {
            const valBN = parseBN(val)
            if (!valBN) {
              onDebouncedReduceAmount('')
            } else if (position) {
              if (valBN.isGreaterThan(new BN(100)) || valBN.isLessThan(new BN(0))) return
              setReduceAmount(new BN(val).div(100).times(position.totalPosition).toString())
            }
          }}
        />
        <Row gap="5px">
          <Toggle
            id="toggle-local-routing-button"
            isActive={closePosition}
            toggle={() => {
              if (closePosition) {
                setClosePosition(false)
                setReduceAmount('')
              } else {
                setClosePosition(true)
                position && setReduceAmount(position?.totalPosition.toString())
              }
            }}
          />
          <CloseText isActive={closePosition}>Close Position</CloseText>
        </Row>

        <Hr />
        <AutoColumn justify="center" style={{ width: '100%', marginTop: '5px' }}>
          <TransactionDetails>
            <Wrapper>
              <AutoColumn gap="sm" style={{ width: '100%', marginBottom: '-8px' }}>
                <StyledHeaderRow
                  onClick={() => setCurrentState((prev) => ({ ...prev, showDetails: !prev.showDetails }))}
                  disabled={false}
                  open={currentState.showDetails}
                >
                  <RowFixed style={{ position: 'relative' }}>
                    {loading ? (
                      <StyledPolling>
                        <StyledPollingDot>
                          <Spinner />
                        </StyledPollingDot>
                        ``
                      </StyledPolling>
                    ) : (
                      <HideSmall>
                        <StyledInfoIcon color={theme.deprecated_bg3} />
                      </HideSmall>
                    )}
                    {position ? (
                      loading ? (
                        <ThemedText.BodySmall>
                          <Trans>Finding Best Price...</Trans>
                        </ThemedText.BodySmall>
                      ) : currentState.isLimit ? (
                        <LoadingOpacityContainer $loading={loading}>
                          <ThemedText.BodySmall>Order Details </ThemedText.BodySmall>
                        </LoadingOpacityContainer>
                      ) : (
                        <LoadingOpacityContainer $loading={loading}>
                          <ThemedText.BodySmall>Trade Details </ThemedText.BodySmall>
                        </LoadingOpacityContainer>
                      )
                    ) : null}
                  </RowFixed>
                  <RowFixed>
                    <RotatingArrow stroke={theme.textTertiary} open={Boolean(currentState.showDetails)} />
                  </RowFixed>
                </StyledHeaderRow>
                <AnimatedDropdown open={currentState.showDetails}>
                  <AutoColumn gap="sm" style={{ padding: '0', paddingBottom: '8px' }}>
                    {!currentState.isLimit ? (
                      <StyledBGCard style={{ width: '100%' }}>
                        <AutoColumn gap="sm">
                          <ValueLabel
                            label="Premium Owed"
                            description="Current amount of premium owed"
                            value={formatBNToString(txnInfo?.premium, NumberType.SwapTradeAmount)}
                            symbolAppend={inputCurrency?.symbol}
                            syncing={loading}
                          />
                          <ValueLabel
                            label="Collateral Returned"
                            description="Amount of collateral returned"
                            value={formatBNToString(txnInfo?.returnedAmount, NumberType.SwapTradeAmount)}
                            symbolAppend={inputCurrency?.symbol}
                            syncing={loading}
                          />
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip
                                text={<Trans>Estimated PnL when position is closed at current market price</Trans>}
                              >
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans> PnL</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                                <TruncatedText>
                                  <DeltaText delta={Number(txnInfo?.PnL)}>
                                    {txnInfo &&
                                      `${formatBNToString(txnInfo?.PnL, NumberType.SwapTradeAmount)} (${(
                                        (Number(txnInfo?.PnL.toNumber()) / Number(position?.margin.toNumber())) *
                                        100
                                      ).toFixed(2)}%) ${inputCurrency?.symbol}`}
                                  </DeltaText>{' '}
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                        </AutoColumn>
                      </StyledBGCard>
                    ) : (
                      <StyledBGCard style={{ width: '100%' }}>
                        <AutoColumn gap="sm">
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip text={<Trans>Amount of position reduced</Trans>}>
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Reduced Position</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                                <TruncatedText>
                                  {txnInfo && `${Number(txnInfo?.returnedAmount)}  ${outputCurrency?.symbol}`}
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip text={<Trans>Your specified order price</Trans>}>
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Order Price</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right">
                                <TruncatedText>
                                  <DeltaText delta={Number(txnInfo?.PnL)}>
                                    {txnInfo &&
                                      `${formatBNToString(txnInfo?.PnL, NumberType.SwapTradeAmount)} (${(
                                        (Number(txnInfo?.PnL.toNumber()) / Number(position?.margin.toNumber())) *
                                        100
                                      ).toFixed(2)}%) ${inputCurrency?.symbol}`}
                                  </DeltaText>
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip
                                text={<Trans>Amount the reduced position converts to, given your order price </Trans>}
                              >
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Desired Output</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                                <TruncatedText>
                                  {txnInfo && `${Number(txnInfo?.premium)}  ${inputCurrency?.symbol}`}
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                          <RowBetween>
                            <RowFixed>
                              <MouseoverTooltip
                                text={<Trans>Estimated PnL when position is closed at specified price</Trans>}
                              >
                                <ThemedText.BodySmall color="textPrimary">
                                  <Trans>Estimated PnL</Trans>
                                </ThemedText.BodySmall>
                              </MouseoverTooltip>
                            </RowFixed>
                            <TextWithLoadingPlaceholder syncing={loading} width={65}>
                              <ThemedText.BodySmall textAlign="right" color="textSecondary">
                                <TruncatedText>
                                  <DeltaText delta={Number(txnInfo?.PnL)}>
                                    {txnInfo &&
                                      `${formatBNToString(txnInfo?.PnL, NumberType.SwapTradeAmount)} (${(
                                        (Number(txnInfo?.PnL.toNumber()) / Number(position?.margin.toNumber())) *
                                        100
                                      ).toFixed(2)}%) ${inputCurrency?.symbol}`}
                                  </DeltaText>{' '}
                                </TruncatedText>
                              </ThemedText.BodySmall>
                            </TextWithLoadingPlaceholder>
                          </RowBetween>
                        </AutoColumn>
                      </StyledBGCard>
                    )}
                  </AutoColumn>
                </AnimatedDropdown>
              </AutoColumn>
            </Wrapper>
          </TransactionDetails>
        </AutoColumn>
      </AutoColumn>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <ButtonError
          style={{
            fontSize: '12px',
            borderRadius: '10px',
            width: 'fit-content',
            height: '15px',
          }}
          padding=".25rem"
          onClick={() => {
            if (!currentState.isLimit) {
              setCurrentState((prev) => ({ ...prev, showModal: true, originalTrade: txnInfo }))
            } else {
              setCurrentState((prev) => ({ ...prev, showLimitModal: true, originalLimitTrade: lmtTxnInfo }))
            }
          }}
          id="leverage-button"
          disabled={
            !currentState.isLimit
              ? !!inputError || !txnInfo
              : !!lmtInputError || lmtTradeState !== DerivedInfoState.VALID
          }
        >
          <ThemedText.BodySmall fontWeight={600}>
            {!currentState.isLimit ? (
              inputError ? (
                inputError
              ) : tradeState === DerivedInfoState.INVALID ? (
                <Trans>Invalid Trade</Trans>
              ) : (
                <Trans>Execute</Trans>
              )
            ) : lmtInputError ? (
              lmtInputError
            ) : lmtTradeState === DerivedInfoState.INVALID ? (
              <Trans>Invalid Order</Trans>
            ) : (
              <Trans>Execute</Trans>
            )}
          </ThemedText.BodySmall>
        </ButtonError>
      </div>
    </DarkCard>
  )
}

function useReduceLimitOrderCallback(
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
  const deadline = useTransactionDeadline()
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

      return null as any

      // const response = await provider
      //   .getSigner()
      //   .sendTransaction({ ...tx, gasLimit })
      //   .then((response) => {
      //     return response
      //   })

      // return response
    } catch (err) {
      console.log('reduce limit callback error', err)
      throw new Error('reduce limit callback error')
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

export function getSlippedTicks(
  pool: Pool,
  slippedTickTolerance: Percent
): { slippedTickMin: number; slippedTickMax: number } {
  const pullUp = JSBI.BigInt(10_000 + Math.floor(Number(slippedTickTolerance.toFixed(18)) * 100))

  const pullDown = JSBI.BigInt(10_000 - Math.floor(Number(slippedTickTolerance.toFixed(18)) * 100))

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

  // get slipped min/max tick
  const slippedTickMax = priceToClosestTick(maxPrice)
  const slippedTickMin = priceToClosestTick(minPrice)

  return {
    slippedTickMax,
    slippedTickMin,
  }
}

export function PositionMissing() {
  return (
    <AutoColumn gap="lg" justify="center">
      <AutoColumn gap="md" style={{ width: '100%' }}>
        <TextWrapper margin={false}>
          <ThemedText.BodySecondary color="neutral2" textAlign="center">
            <Trans>Missing Position</Trans>
          </ThemedText.BodySecondary>
        </TextWrapper>
      </AutoColumn>
    </AutoColumn>
  )
}
