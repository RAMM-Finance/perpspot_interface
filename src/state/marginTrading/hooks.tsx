import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'
import { computePoolAddress, Pool, Route } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { getSlippedTicks } from 'components/PositionTable/LeveragePositionTable/DecreasePositionContent'
import { LMT_MARGIN_FACILITY, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { ZERO_ADDRESS } from 'constants/misc'
import { BigNumber } from 'ethers'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useDataProviderContract, useLmtQuoterContract, useMarginFacilityContract } from 'hooks/useContract'
import { useLmtFeePercent } from 'hooks/useLmtFeePercent'
import { useMarginLMTPositionFromPositionId, useMarginOrderPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { useMaxLeverage } from 'hooks/useMaxLeverage'
import { useUsingCode } from 'hooks/usePointsInfo'
import useTransactionDeadline, { useLimitTransactionDeadline } from 'hooks/useTransactionDeadline'
import JSBI from 'jsbi'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { LeverageTradeState, LimitTradeState } from 'state/routing/types'
import { Field } from 'state/swap/actions'
import {
  useUserLimitOrderTransactionTTL,
  useUserPremiumDepositPercent,
  useUserSlippageTolerance,
} from 'state/user/hooks'
import { MarginLimitOrder, MarginPositionDetails, OrderPositionKey, TraderPositionKey } from 'types/lmtv2position'
import { ErrorType } from 'utils/ethersErrorHandler'
import { DecodedError } from 'utils/ethersErrorHandler/types'
import { getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { TokenBN } from 'utils/lmtSDK/internalConstants'
import { MarginFacilitySDK } from 'utils/lmtSDK/MarginFacility'

import { useCurrency } from '../../hooks/Tokens'
import { useCurrencyBalances } from '../connection/hooks'
import { AppState } from '../types'
import {
  MarginField,
  setBaseCurrencyIsInputToken,
  setLimit,
  setLocked,
  setPremiumInPosToken,
  setPrice,
  typeInput,
} from './actions'
import { getOutputQuote } from './getOutputQuote'
export function useMarginTradingState(): AppState['margin'] {
  return useAppSelector((state) => state.margin)
}

export function useMarginTradingActionHandlers(): {
  onUserInput: (field: MarginField, typedValue: string) => void
  onLeverageFactorChange: (leverage: string) => void
  onMarginChange: (margin: string) => void
  onLockChange: (locked: MarginField | null) => void
  onChangeTradeType: (isLimit: boolean) => void
  onPriceInput: (typedValue: string) => void
  onPriceToggle: (baseCurrencyIsInputToken: boolean) => void
  onPremiumCurrencyToggle: (premiumInPosToken: boolean) => void
} {
  const dispatch = useAppDispatch()

  const onUserInput = useCallback(
    (field: MarginField, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onLeverageFactorChange = useCallback(
    (leverageFactor: string) => {
      dispatch(typeInput({ field: MarginField.LEVERAGE_FACTOR, typedValue: leverageFactor }))
    },
    [dispatch]
  )

  const onMarginChange = useCallback(
    (margin: string) => {
      dispatch(typeInput({ field: MarginField.MARGIN, typedValue: margin }))
    },
    [dispatch]
  )

  const onLockChange = useCallback(
    (locked: MarginField | null) => {
      dispatch(setLocked({ locked }))
    },
    [dispatch]
  )

  const onChangeTradeType = useCallback(
    (isLimit: boolean) => {
      dispatch(setLimit({ isLimit }))
    },
    [dispatch]
  )

  const onPriceInput = useCallback(
    (typedValue: string) => {
      dispatch(setPrice({ startingPrice: typedValue }))
    },
    [dispatch]
  )

  const onPriceToggle = useCallback(
    (baseCurrencyIsInputToken: boolean) => {
      dispatch(setBaseCurrencyIsInputToken({ baseCurrencyIsInputToken }))
    },
    [dispatch]
  )

  const onPremiumCurrencyToggle = useCallback(
    (premiumInPosToken: boolean) => {
      dispatch(setPremiumInPosToken({ premiumInPosToken }))
    },
    [dispatch]
  )
  return {
    onUserInput,
    onLeverageFactorChange,
    onMarginChange,
    onLockChange,
    onChangeTradeType,
    onPriceInput,
    onPriceToggle,
    onPremiumCurrencyToggle,
  }
}

export interface AddMarginTrade {
  margin: TokenBN // additional margin
  fees: TokenBN // fees
  borrowAmount: TokenBN // additional borrowAmount
  minimumOutput: TokenBN // minimum output amount
  expectedAddedOutput: TokenBN // additional output amount
  swapInput: TokenBN // swap input (for marginInPosToken, borrowAmount - fees, else margin + borrowAmount - fees)
  allowedSlippage: Percent // should be Percent
  executionPrice: Price<Currency, Currency>
  swapRoute: Route<Currency, Currency>
  premium: TokenBN
  pool: Pool
  inputIsToken0: boolean
  premiumInPosToken: boolean
  borrowRate: BN
  swapFee: TokenBN
  marginInPosToken: boolean
  premiumSwapRoute: Route<Currency, Currency>
}

export interface PreTradeInfo {
  premiumDeposit: CurrencyAmount<Currency>
  additionalPremium: CurrencyAmount<Currency>
  inputApprovalAmount: CurrencyAmount<Currency>
  outputApprovalAmount: CurrencyAmount<Currency>
}

interface DerivedAddPositionResult {
  currencies: { [field in Field]?: Currency | null }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  positionKey?: TraderPositionKey
  allowedSlippage: Percent
  userPremiumPercent: Percent
  inputError?: ReactNode
  contractError?: ReactNode
  trade?: AddMarginTrade
  preTradeInfo?: PreTradeInfo
  existingPosition?: MarginPositionDetails
  state: LeverageTradeState
  existingLimitPosition?: MarginLimitOrder
  maxLeverage?: BN
  userHasSpecifiedInputOutput: boolean
}

export function useDerivedAddPositionInfo(
  margin?: string,
  leverageFactor?: string,
  pool?: Pool,
  inputCurrencyId?: string,
  outputCurrencyId?: string
): DerivedAddPositionResult {
  const { account } = useWeb3React()
  const usingCode = useUsingCode()
  const { marginInPosToken, premiumInPosToken } = useMarginTradingState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const parsedMargin = useMemo(() => parseBN(margin), [margin])

  const parsedLeverageFactor = useMemo(() => parseBN(leverageFactor), [leverageFactor])

  const [positionKey] = useMemo(() => {
    if (outputCurrency && inputCurrency && account && pool) {
      const isToken0 = outputCurrency?.wrapped.sortsBefore(inputCurrency?.wrapped)
      const token0Address = isToken0 ? outputCurrency.wrapped.address : inputCurrency.wrapped.address
      const token1Address = isToken0 ? inputCurrency.wrapped.address : outputCurrency.wrapped.address
      const _positionKey = {
        poolKey: {
          token0: token0Address,
          token1: token1Address,
          fee: pool.fee,
        },
        isToken0,
        isBorrow: false,
        trader: account,
      }
      const _order = {
        poolKey: {
          token0: token0Address,
          token1: token1Address,
          fee: pool.fee,
        },
        isToken0,
        trader: account,
        isAdd: true,
      }
      return [_positionKey, _order]
    } else {
      return [undefined, undefined]
    }
  }, [account, inputCurrency, outputCurrency, pool])

  const parsedBorrowAmount = useMemo(() => {
    if (parsedLeverageFactor && parsedMargin && parsedLeverageFactor.gt(1)) {
      if (marginInPosToken && pool && outputCurrency) {
        const isToken0 = outputCurrency.wrapped.address.toLowerCase() === pool.token0.address.toLowerCase()
        const price = isToken0 ? new BN(pool.token0Price.toFixed(18)) : new BN(pool.token1Price.toFixed(18))
        return parsedLeverageFactor.minus(new BN(1)).times(parsedMargin).times(price)
      } else {
        return parsedMargin.times(parsedLeverageFactor).minus(parsedMargin)
      }
    } else {
      return undefined
    }
  }, [parsedLeverageFactor, parsedMargin, pool, marginInPosToken, outputCurrency])

  const { position: existingPosition } = useMarginLMTPositionFromPositionId(positionKey)
  const [userSlippageTolerance] = useUserSlippageTolerance()
  const [userPremiumPercent] = useUserPremiumDepositPercent()

  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [inputCurrency ?? undefined, outputCurrency ?? undefined], [inputCurrency, outputCurrency])
  )

  const currencyBalances = useMemo(
    () => ({
      [Field.INPUT]: relevantTokenBalances[0],
      [Field.OUTPUT]: relevantTokenBalances[1],
    }),
    [relevantTokenBalances]
  )

  const currencies: { [field in Field]?: Currency | null } = useMemo(
    () => ({
      [Field.INPUT]: inputCurrency,
      [Field.OUTPUT]: outputCurrency,
    }),
    [inputCurrency, outputCurrency]
  )

  // TODO calculate slippage from the pool
  const allowedSlippage = useMemo(() => {
    if (userSlippageTolerance === 'auto') return new Percent(JSBI.BigInt(3), JSBI.BigInt(100))
    else return userSlippageTolerance
  }, [userSlippageTolerance])

  const rawUserPremiumPercent = useMemo(() => {
    if (userPremiumPercent === 'auto') return new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))
    else return userPremiumPercent
  }, [userPremiumPercent])

  const inputIsToken0 = useMemo(() => {
    return outputCurrency?.wrapped ? inputCurrency?.wrapped.sortsBefore(outputCurrency?.wrapped) : false
  }, [outputCurrency, inputCurrency])
  const token0Address = inputIsToken0 ? inputCurrency?.wrapped.address : outputCurrency?.wrapped.address
  const token1Address = !inputIsToken0 ? inputCurrency?.wrapped.address : outputCurrency?.wrapped.address

  const marginInInputToken = useMemo(() => {
    if (marginInPosToken && pool && outputCurrency && parsedMargin) {
      const isToken0 = outputCurrency.wrapped.address.toLowerCase() === pool.token0.address.toLowerCase()
      const price = isToken0 ? new BN(pool.token0Price.toFixed(18)) : new BN(pool.token1Price.toFixed(18))
      return parsedMargin.times(price)
    } else {
      return undefined
    }
  }, [marginInPosToken, pool, outputCurrency, parsedMargin])

  const { result: maxLeverage } = useMaxLeverage(
    marginInPosToken,
    token0Address,
    token1Address,
    pool?.fee,
    !inputIsToken0,
    marginInPosToken ? marginInInputToken : parsedMargin,
    marginInPosToken ? parsedMargin : undefined,
    inputCurrency?.decimals,
    outputCurrency?.decimals
  )

  const preTradeInfo: PreTradeInfo | undefined = useMemo(() => {
    if (!inputCurrency || !outputCurrency || !parsedBorrowAmount || !parsedMargin || !pool) return undefined

    // premium to approve
    const _additionalPremiumInputToken = parsedBorrowAmount.times(new BN(rawUserPremiumPercent.toFixed(18)).div(100))
    const price = inputIsToken0 ? new BN(pool.token0Price.toFixed(18)) : new BN(pool.token1Price.toFixed(18))
    const _additionalPremium = premiumInPosToken
      ? _additionalPremiumInputToken.times(price)
      : _additionalPremiumInputToken

    let inputApprovalAmount: CurrencyAmount<Currency>
    let outputApprovalAmount: CurrencyAmount<Currency>
    if (marginInPosToken) {
      if (premiumInPosToken) {
        inputApprovalAmount = BnToCurrencyAmount(new BN(0), outputCurrency)
        outputApprovalAmount = BnToCurrencyAmount(parsedMargin.plus(_additionalPremium), outputCurrency)
      } else {
        inputApprovalAmount = BnToCurrencyAmount(_additionalPremium, inputCurrency)
        outputApprovalAmount = BnToCurrencyAmount(parsedMargin, outputCurrency)
      }
    } else {
      if (premiumInPosToken) {
        inputApprovalAmount = BnToCurrencyAmount(parsedMargin, inputCurrency)
        outputApprovalAmount = BnToCurrencyAmount(_additionalPremium, outputCurrency)
      } else {
        inputApprovalAmount = BnToCurrencyAmount(parsedMargin.plus(_additionalPremium), inputCurrency)
        outputApprovalAmount = BnToCurrencyAmount(new BN(0), outputCurrency)
      }
    }
    return {
      premiumDeposit:
        account && existingPosition
          ? BnToCurrencyAmount(existingPosition.premiumDeposit, inputCurrency)
          : BnToCurrencyAmount(new BN(0), inputCurrency),
      additionalPremium: BnToCurrencyAmount(_additionalPremium, premiumInPosToken ? outputCurrency : inputCurrency),
      inputApprovalAmount,
      outputApprovalAmount,
    }
  }, [
    existingPosition,
    inputCurrency,
    outputCurrency,
    marginInPosToken,
    parsedBorrowAmount,
    parsedMargin,
    rawUserPremiumPercent,
    account,
    pool,
    inputIsToken0,
    premiumInPosToken,
  ])

  const { chainId } = useWeb3React()

  const [inputApprovalState] = useApproveCallback(
    preTradeInfo?.inputApprovalAmount,
    LMT_MARGIN_FACILITY[chainId ?? SupportedChainId.SEPOLIA]
  )

  const [outputApprovalState] = useApproveCallback(
    preTradeInfo?.outputApprovalAmount,
    LMT_MARGIN_FACILITY[chainId ?? SupportedChainId.SEPOLIA]
  )

  // get fee params
  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? <Trans>Select a token</Trans>
    }

    if (!usingCode) {
      inputError = inputError ?? <Trans>Not whitelisted nor using code</Trans>
    }

    if (!parsedMargin || parsedMargin.isZero()) {
      inputError = inputError ?? <Trans>Enter a margin amount</Trans>
    }

    if (!parsedLeverageFactor) {
      inputError = inputError ?? <Trans>Enter a leverage factor</Trans>
    }

    if (parsedLeverageFactor && parsedLeverageFactor.isLessThanOrEqualTo(1)) {
      inputError = inputError ?? <Trans>Leverage factor must be greater than 1</Trans>
    }

    if (parsedLeverageFactor && maxLeverage && parsedLeverageFactor.gt(maxLeverage)) {
      inputError = inputError ?? <Trans>Leverage factor exceeds max</Trans>
    }

    // compare input balance to max input based on version
    const balanceIn = currencyBalances[Field.INPUT]
    const balanceOut = currencyBalances[Field.OUTPUT]
    if (balanceIn && preTradeInfo) {
      const amountIn = preTradeInfo.inputApprovalAmount
      if (balanceIn.lessThan(amountIn)) {
        inputError = inputError ?? <Trans>Insufficient {balanceIn.currency.symbol}</Trans>
      }
    } else if (balanceOut && preTradeInfo && parsedMargin) {
      const amountOut = preTradeInfo.outputApprovalAmount
      if (balanceOut.lessThan(amountOut)) {
        inputError = inputError ?? <Trans>Insufficient {balanceOut.currency.symbol}</Trans>
      }
    }

    return inputError
  }, [account, usingCode, currencies, maxLeverage, parsedMargin, currencyBalances, parsedLeverageFactor, preTradeInfo])

  const txnWillFail = useMemo(() => {
    if (!account) {
      if (
        !parsedMargin ||
        !parsedLeverageFactor ||
        !maxLeverage ||
        parsedMargin.isZero() ||
        (parsedLeverageFactor && maxLeverage && parsedLeverageFactor.gt(maxLeverage)) ||
        parsedLeverageFactor.isLessThanOrEqualTo(1)
      ) {
        return true
      } else {
        return false
      }
    } else {
      if (
        !parsedMargin ||
        !parsedLeverageFactor ||
        !maxLeverage ||
        parsedMargin.isZero() ||
        (parsedLeverageFactor &&
          maxLeverage &&
          parsedLeverageFactor.gt(maxLeverage) &&
          parsedLeverageFactor.isLessThanOrEqualTo(1))
      ) {
        return true
      }
      if (
        marginInPosToken &&
        inputApprovalState !== ApprovalState.APPROVED &&
        outputApprovalState !== ApprovalState.APPROVED
      ) {
        return true
      }

      if (!marginInPosToken && inputApprovalState !== ApprovalState.APPROVED) {
        return true
      }
      return false
    }
  }, [
    parsedMargin,
    parsedLeverageFactor,
    maxLeverage,
    account,
    inputApprovalState,
    outputApprovalState,
    marginInPosToken,
  ])

  const {
    state,
    result: trade,
    contractError,
  } = useSimulateMarginTrade(
    allowedSlippage,
    marginInPosToken,
    premiumInPosToken,
    positionKey,
    pool,
    inputIsToken0,
    marginInPosToken ? marginInInputToken : parsedMargin,
    parsedMargin,
    parsedBorrowAmount,
    existingPosition,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    preTradeInfo?.additionalPremium ?? undefined,
    inputApprovalState,
    outputApprovalState,
    txnWillFail
  )

  const userHasSpecifiedInputOutput = useMemo(() => {
    return Boolean(
      inputCurrency &&
        outputCurrency &&
        parsedMargin?.gt(0) &&
        parsedLeverageFactor?.gt(1) &&
        maxLeverage &&
        parsedLeverageFactor?.lt(maxLeverage)
    )
  }, [parsedMargin, parsedLeverageFactor, inputCurrency, outputCurrency, maxLeverage])

  return useMemo(
    () => ({
      currencies,
      currencyBalances,
      inputError,
      trade,
      preTradeInfo,
      positionKey,
      existingPosition,
      state,
      allowedSlippage,
      contractError,
      userPremiumPercent: rawUserPremiumPercent,
      maxLeverage,
      userHasSpecifiedInputOutput,
    }),
    [
      currencies,
      currencyBalances,
      inputError,
      trade,
      existingPosition,
      preTradeInfo,
      state,
      allowedSlippage,
      positionKey,
      contractError,
      rawUserPremiumPercent,
      maxLeverage,
      userHasSpecifiedInputOutput,
    ]
  )
}

export function parseBN(value: string | undefined): BN | undefined {
  // Number.isNaN()
  if (!value) return undefined

  const bn = new BN(value)

  if (bn.isNaN()) return undefined

  return bn
}

export function useDerivedLimitAddPositionInfo(
  margin: string | undefined,
  leverageFactor: string | undefined,
  startingPrice: string | undefined,
  baseCurrencyIsInputToken: boolean,
  pool: Pool | undefined,
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  allowedSlippage: Percent
): {
  inputError: ReactNode | undefined
  trade: AddLimitTrade | undefined
  state: LimitTradeState
  preTradeInfo: PreTradeInfo | undefined
  orderKey: OrderPositionKey | undefined
  contractError?: ReactNode
  userHasSpecifiedInputOutput: boolean
} {
  const { account, provider, chainId } = useWeb3React()
  const { marginInPosToken } = useMarginTradingState()
  const [traderKey, orderKey] = useMemo(() => {
    const isToken0 = outputCurrency?.wrapped.address === pool?.token0.address
    if (pool && account) {
      const _positionKey = {
        poolKey: {
          token0: pool.token0.address,
          token1: pool.token1.address,
          fee: pool.fee,
        },
        isToken0,
        isBorrow: false,
        trader: account,
      }
      const _order = {
        poolKey: {
          token0: pool.token0.address,
          token1: pool.token1.address,
          fee: pool.fee,
        },
        isToken0,
        trader: account,
        isAdd: true,
      }
      return [_positionKey, _order]
    } else {
      return [undefined]
    }
  }, [account, pool, outputCurrency])

  const parsedMargin = useMemo(() => parseBN(margin), [margin])
  const parsedLeverageFactor = useMemo(() => parseBN(leverageFactor), [leverageFactor])
  const parsedBorrowAmount = useMemo(
    () =>
      parsedMargin && parsedLeverageFactor ? parsedMargin.times(parsedLeverageFactor).minus(parsedMargin) : undefined,
    [parsedMargin, parsedLeverageFactor]
  )
  const parsedStartingPrice = useMemo(() => parseBN(startingPrice), [startingPrice])
  // const poolParams = usePoolParams(pool)

  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [inputCurrency ?? undefined, outputCurrency ?? undefined], [inputCurrency, outputCurrency])
  )

  const currencyBalances = useMemo(
    () => ({
      [Field.INPUT]: relevantTokenBalances[0],
      [Field.OUTPUT]: relevantTokenBalances[1],
    }),
    [relevantTokenBalances]
  )

  const { position: existingPosition } = useMarginLMTPositionFromPositionId(traderKey)

  const inputIsToken0 = useMemo(() => {
    return outputCurrency?.wrapped ? inputCurrency?.wrapped.sortsBefore(outputCurrency?.wrapped) : false
  }, [outputCurrency, inputCurrency])

  const token0Address = inputIsToken0 ? inputCurrency?.wrapped.address : outputCurrency?.wrapped.address
  const token1Address = !inputIsToken0 ? inputCurrency?.wrapped.address : outputCurrency?.wrapped.address

  const marginInInputToken = useMemo(() => {
    if (marginInPosToken && pool && outputCurrency && parsedMargin) {
      const isToken0 = outputCurrency.wrapped.address.toLowerCase() === pool.token0.address.toLowerCase()
      const price = isToken0 ? new BN(pool.token0Price.toFixed(18)) : new BN(pool.token1Price.toFixed(18))
      return parsedMargin.times(price)
    } else {
      return undefined
    }
  }, [marginInPosToken, pool, outputCurrency, parsedMargin])

  const { result: maxLeverage } = useMaxLeverage(
    marginInPosToken,
    token0Address,
    token1Address,
    pool?.fee,
    !inputIsToken0,
    marginInPosToken ? marginInInputToken : parsedMargin,
    marginInPosToken ? parsedMargin : undefined,
    inputCurrency?.decimals,
    outputCurrency?.decimals
  )

  const [userPremiumPercent] = useUserPremiumDepositPercent()

  const rawUserPremiumPercent = useMemo(() => {
    if (userPremiumPercent === 'auto') return new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))
    else return userPremiumPercent
  }, [userPremiumPercent])

  const preTradeInfo: PreTradeInfo | undefined = useMemo(() => {
    if (!inputCurrency || !outputCurrency || !parsedBorrowAmount || !parsedMargin || !existingPosition) return undefined

    // premium to approve
    const _additionalPremium = parsedBorrowAmount.times(new BN(rawUserPremiumPercent.toFixed(18)).div(100))
    if (marginInPosToken) {
      return {
        premiumDeposit: BnToCurrencyAmount(existingPosition.premiumDeposit, inputCurrency),
        additionalPremium: BnToCurrencyAmount(_additionalPremium, inputCurrency),
        inputApprovalAmount: BnToCurrencyAmount(_additionalPremium, inputCurrency),
        outputApprovalAmount: BnToCurrencyAmount(parsedMargin, outputCurrency),
      }
    } else {
      return {
        premiumDeposit: BnToCurrencyAmount(existingPosition.premiumDeposit, inputCurrency),
        additionalPremium: BnToCurrencyAmount(_additionalPremium, inputCurrency),
        inputApprovalAmount: BnToCurrencyAmount(parsedMargin.plus(_additionalPremium), inputCurrency),
        outputApprovalAmount: CurrencyAmount.fromRawAmount(outputCurrency, '0'),
      }
    }
  }, [
    existingPosition,
    inputCurrency,
    outputCurrency,
    marginInPosToken,
    parsedBorrowAmount,
    parsedMargin,
    rawUserPremiumPercent,
  ])

  const deadline = useLimitTransactionDeadline()

  const { position: existingLimitPosition } = useMarginOrderPositionFromPositionId(orderKey)

  // const [approvalState] = useApproveCallback(
  //   preTradeInfo?.approvalAmount,
  //   LMT_MARGIN_FACILITY[chainId ?? SupportedChainId.SEPOLIA]
  // )
  const approvalState = ApprovalState.UNKNOWN

  // get fee params
  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    if (!inputCurrency || !outputCurrency) {
      inputError = inputError ?? <Trans>Select a token</Trans>
    }

    if (existingLimitPosition && existingLimitPosition.auctionStartTime > 0) {
      inputError = inputError ?? <Trans>Active limit order must be filled</Trans>
    }

    if (!parsedMargin || parsedMargin.isZero()) {
      inputError = inputError ?? <Trans>Enter a margin amount</Trans>
    }

    if (!parsedLeverageFactor || parsedLeverageFactor.isZero()) {
      inputError = inputError ?? <Trans>Enter a leverage factor</Trans>
    }

    if (parsedLeverageFactor && parsedLeverageFactor.isLessThanOrEqualTo(1)) {
      inputError = inputError ?? <Trans>Leverage factor must be greater than 1</Trans>
    }

    if (parsedLeverageFactor && maxLeverage && parsedLeverageFactor.gt(maxLeverage)) {
      inputError = inputError ?? <Trans>Leverage factor exceeds max</Trans>
    }

    if (!parsedStartingPrice || parsedStartingPrice.isZero()) {
      inputError = inputError ?? <Trans>Enter a starting price</Trans>
    }

    // if (parsedStartingPrice && pool && parsedMargin && traderKey) {
    //   /**
    //    * isToken0: limit price (t1 / t0) must be gte current price (t1 / t0)
    //    * !isToken0: limit price (t0 / t1) must be gte current price ( t0 / t1)
    //    *
    //    * isToken0 -> output is t0, input is t1
    //    * !isToken0 -> output is t1, input is t0
    //    * baseTokenIsToken0 -> baseCurrencyIsInput && !isToken0 || !baseCurrencyIsInput && isToken0
    //    */
    //   const baseIsToken0 =
    //     (baseCurrencyIsInputToken && !traderKey.isToken0) || (!baseCurrencyIsInputToken && traderKey.isToken0)

    //   /**
    //    *
    //    * if baseIsToken0 then limitPrice is in t1 / t0
    //    * if !baseIsToken0 then limitPrice is in t0 / t1
    //    *
    //    * if baseIsT0 and isToken0 then no flip
    //    * if baseIsT0 and !isToken0 then flip
    //    * if !baseIsT0 and isToken0 then flip
    //    * if !baseIsT0 and !isToken0 then no flip
    //    */
    //   const flippedPrice = (baseIsToken0 && !traderKey.isToken0) || (!baseIsToken0 && traderKey.isToken0)
    //   const price = flippedPrice ? new BN(1).div(parsedStartingPrice) : parsedStartingPrice

    //   if (traderKey.isToken0) {
    //     const currentPrice = new BN(pool.token0Price.toFixed(18))
    //     if (!price.gte(currentPrice)) {
    //       if (baseIsToken0) {
    //         inputError = inputError ?? <Trans>Order Price must be greater than or equal to the mark price.</Trans>
    //       } else {
    //         inputError = inputError ?? <Trans>Order Price must be less than or equal to the mark price.</Trans>
    //       }
    //     }
    //   } else {
    //     const currentPrice = new BN(pool.token1Price.toFixed(18))
    //     if (!price.gte(currentPrice)) {
    //       if (baseIsToken0) {
    //         inputError = inputError ?? <Trans>Order Price must be less than or equal to the mark price.</Trans>
    //       } else {
    //         inputError = inputError ?? <Trans>Order Price must be greater than or equal to the mark price.</Trans>
    //       }
    //     }
    //   }
    // }

    // show warning if the starting price is lower/higher than the current price?

    if (inputCurrency && parsedMargin) {
      const balanceIn = currencyBalances[Field.INPUT]
      const amountIn = BnToCurrencyAmount(parsedMargin, inputCurrency)
      if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
        inputError = <Trans>Insufficient {inputCurrency.symbol} balance</Trans>
      }
    }

    return inputError
  }, [
    account,
    inputCurrency,
    outputCurrency,
    parsedMargin,
    parsedLeverageFactor,
    currencyBalances,
    parsedStartingPrice,
    existingLimitPosition,
    maxLeverage,
  ])

  const {
    state,
    contractError,
    result: trade,
  } = useSimulateAddLimitOrder(
    orderKey,
    parsedMargin,
    parsedLeverageFactor,
    parsedStartingPrice,
    baseCurrencyIsInputToken,
    pool,
    allowedSlippage,
    deadline,
    inputCurrency,
    outputCurrency,
    existingLimitPosition,
    preTradeInfo?.additionalPremium,
    approvalState,
    inputError
  )

  const userHasSpecifiedInputOutput = useMemo(() => {
    return Boolean(
      inputCurrency &&
        outputCurrency &&
        parsedMargin?.gt(0) &&
        parsedLeverageFactor?.gt(1) &&
        maxLeverage &&
        parsedLeverageFactor.lt(maxLeverage) &&
        parsedStartingPrice?.gt(0)
    )
  }, [parsedMargin, parsedLeverageFactor, inputCurrency, outputCurrency, maxLeverage, parsedStartingPrice])

  return useMemo(
    () => ({
      inputError,
      orderKey,
      state,
      contractError,
      preTradeInfo,
      trade,
      userHasSpecifiedInputOutput,
    }),
    [inputError, state, contractError, orderKey, preTradeInfo, trade, userHasSpecifiedInputOutput]
  )
}

export interface AddLimitTrade {
  orderKey: OrderPositionKey
  margin: BN
  poolAddress: string
  startOutput: BN
  minOutput: BN
  decayRate: BN
  allowedSlippage: Percent
  inputAmount: BN
  inputCurrencyId: string
  outputCurrencyId: string
  additionalPremium: BN
  limitPrice: BN
  deadline: string
  duration: number
  formattedLimitPrice: Price<Currency, Currency>
}

const useSimulateAddLimitOrder = (
  orderKey?: OrderPositionKey,
  margin?: BN,
  leverageFactor?: BN,
  startingPrice?: BN,
  baseCurrencyIsInputToken?: boolean,
  pool?: Pool,
  allowedSlippage?: Percent,
  deadline?: BigNumber,
  inputCurrency?: Currency,
  outputCurrency?: Currency,
  existingLimitPosition?: MarginLimitOrder,
  additionalPremium?: CurrencyAmount<Currency>,
  approvalState?: ApprovalState,
  inputError?: ReactNode
): {
  state: LimitTradeState
  result?: AddLimitTrade
  contractError?: ReactNode
} => {
  const { account, chainId } = useWeb3React()
  const marginFacility = useMarginFacilityContract()
  const blockNumber = useBlockNumber()
  // const poolManager = useLmtPoolManagerContract()

  // const [tradeState, setTradeState] = useState<LimitTradeState>(LimitTradeState.INVALID)
  const [simulationError, setSimulationError] = useState<DecodedError>()
  const [result, setResult] = useState<AddLimitTrade>()
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastBlockNumber, setBlockNumber] = useState<number>()
  const [lastParams, setLastParams] = useState<string>()

  const [orderDuration] = useUserLimitOrderTransactionTTL()
  const feePercent = useLmtFeePercent(pool)

  const computeData = useCallback(async () => {
    if (
      !pool ||
      !margin ||
      !blockNumber ||
      !deadline ||
      !orderKey ||
      !leverageFactor ||
      !startingPrice ||
      !allowedSlippage ||
      !inputCurrency ||
      !outputCurrency ||
      !marginFacility ||
      !additionalPremium ||
      !orderDuration ||
      !feePercent ||
      !chainId
    ) {
      return undefined
    }

    const poolAddress = computePoolAddress({
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
      tokenA: pool.token0,
      tokenB: pool.token1,
      fee: pool.fee,
    })

    const totalInput = new BN(margin).times(leverageFactor)
    const totalInputWithFees = totalInput.times(new BN(1).minus(feePercent))
    // if base is input then output / input.
    const limitPrice = baseCurrencyIsInputToken ? startingPrice : new BN(1).div(startingPrice)

    // we assume that starting price is output / input here.
    const startOutput = totalInputWithFees.times(limitPrice)
    const slippageBn = new BN(allowedSlippage.toFixed(18)).div(100)
    const minOutput = totalInputWithFees.times(limitPrice).times(new BN(1).minus(slippageBn))

    // decay rate defaults to zero
    const decayRate = new BN('0')

    const calldata = MarginFacilitySDK.submitLimitOrder({
      orderKey,
      margin: margin.shiftedBy(inputCurrency.decimals).toFixed(0),
      pool: poolAddress,
      isAdd: true,
      deadline: deadline.toString(),
      startOutput: startOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
      minOutput: minOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
      inputAmount: totalInput.shiftedBy(inputCurrency.decimals).toFixed(0),
      decayRate: decayRate.shiftedBy(18).toFixed(0),
      depositPremium: new BN(additionalPremium.toExact()).shiftedBy(inputCurrency.decimals).toFixed(0),
    })

    setLastParams(getLimitParamString(margin, leverageFactor, limitPrice, allowedSlippage))

    await marginFacility.callStatic.multicall(calldata)

    const _result: AddLimitTrade = {
      orderKey,
      margin,
      poolAddress,
      startOutput,
      decayRate,
      allowedSlippage,
      inputAmount: totalInput,
      minOutput,
      inputCurrencyId: inputCurrency.wrapped.address,
      outputCurrencyId: outputCurrency.wrapped.address,
      additionalPremium: new BN(additionalPremium.toExact()),
      limitPrice,
      duration: orderDuration,
      deadline: deadline.toString(),
      formattedLimitPrice: new Price(
        outputCurrency,
        inputCurrency,
        limitPrice.shiftedBy(18).toFixed(0),
        new BN(1).shiftedBy(18).toFixed(0)
      ),
    }

    return {
      result: _result,
      params: getLimitParamString(margin, leverageFactor, limitPrice, allowedSlippage),
    }
  }, [
    additionalPremium,
    allowedSlippage,
    baseCurrencyIsInputToken,
    blockNumber,
    chainId,
    deadline,
    feePercent,
    inputCurrency,
    leverageFactor,
    margin,
    marginFacility,
    orderDuration,
    orderKey,
    outputCurrency,
    pool,
    startingPrice,
  ])

  const blocksPerFetch = 2

  useEffect(() => {
    if (!blockNumber || !chainId || !!inputError || approvalState !== ApprovalState.APPROVED) {
      return
    }

    let paramsUnchanged = false
    if (leverageFactor && startingPrice && margin && allowedSlippage) {
      const limitPrice = baseCurrencyIsInputToken ? startingPrice : new BN(1).div(startingPrice)
      const params = getLimitParamString(margin, leverageFactor, limitPrice, allowedSlippage)
      if (lastParams === params) {
        paramsUnchanged = true
      }
    }

    // regardless of error or not, if the params are unchanged, don't refetch until next interval
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

    computeData()
      .then((data) => {
        if (!data) {
          setSimulationError({
            type: ErrorType.EmptyError,
            error: 'missing params',
            data: undefined,
          })
          setLastParams(undefined)
          setResult(undefined)
          setLoading(false)
          setSyncing(false)
        } else {
          // console.log('fetching9', _result, to, calldata)
          const { result: _result, params } = data
          setResult(_result)
          // setLastParams(params)
          setSimulationError(undefined)
          setLoading(false)
          setSyncing(false)
        }
        setBlockNumber(blockNumber)
      })
      .catch((err) => {
        // console.log('fetching10')
        setSimulationError(parseContractError(err))
        // setLastParams(undefined)
        setResult(undefined)
        setLoading(false)
        setSyncing(false)
        setBlockNumber(blockNumber)
      })
  }, [
    baseCurrencyIsInputToken,
    blockNumber,
    chainId,
    computeData,
    inputError,
    lastBlockNumber,
    lastParams,
    leverageFactor,
    loading,
    margin,
    simulationError,
    startingPrice,
    syncing,
    allowedSlippage,
    approvalState,
  ])

  const contractError = useMemo(() => {
    let error: ReactNode | undefined

    if (simulationError) {
      error = <Trans>{getErrorMessage(simulationError)}</Trans>
    }

    return error
  }, [simulationError])

  return useMemo(() => {
    let tradeState: LimitTradeState = LimitTradeState.INVALID
    if (loading) {
      tradeState = LimitTradeState.LOADING
    } else if (syncing) {
      tradeState = LimitTradeState.SYNCING
    } else if (simulationError) {
      tradeState = LimitTradeState.INVALID
    }

    const limitPrice = startingPrice
      ? baseCurrencyIsInputToken
        ? startingPrice
        : new BN(1).div(startingPrice)
      : undefined

    if (!margin || !leverageFactor || !startingPrice) {
      return {
        state: LimitTradeState.INVALID,
        contractError,
        result: undefined,
      }
    } else if (limitPrice && margin && leverageFactor && allowedSlippage) {
      const params = getLimitParamString(margin, leverageFactor, limitPrice, allowedSlippage)
      if (lastParams === params && !simulationError && result) {
        return {
          state: LimitTradeState.VALID,
          contractError,
          result,
        }
      }
    }
    return {
      state: tradeState,
      contractError,
      result: undefined,
    }
  }, [
    contractError,
    result,
    margin,
    leverageFactor,
    startingPrice,
    allowedSlippage,
    baseCurrencyIsInputToken,
    loading,
    lastParams,
    syncing,
    simulationError,
  ])
}

const useSimulateMarginTrade = (
  allowedSlippage: Percent,
  marginInPosToken: boolean,
  premiumInPosToken: boolean,
  positionKey?: TraderPositionKey,
  pool?: Pool,
  inputIsToken0?: boolean,
  marginInInput?: BN,
  marginInOutput?: BN,
  borrowAmount?: BN,
  existingPosition?: MarginPositionDetails,
  inputCurrency?: Currency,
  outputCurrency?: Currency,
  additionalPremium?: CurrencyAmount<Currency>,
  inputApprovalState?: ApprovalState,
  outputApprovalState?: ApprovalState,
  txnWillFail?: boolean
): {
  state: LeverageTradeState
  result?: AddMarginTrade
  contractError?: ReactNode
} => {
  const { account } = useWeb3React()
  const marginFacility = useMarginFacilityContract()
  const blockNumber = useBlockNumber()
  const [lastBlockNumber, setBlockNumber] = useState<number>()

  // const blocksPerFetch = 3
  const deadline = useTransactionDeadline()

  const { provider, chainId } = useWeb3React()

  const dataProvider = useDataProviderContract()
  const feePercent = useLmtFeePercent(pool)

  const computeData = useCallback(async () => {
    if (existingPosition && existingPosition.isToken0 !== !inputIsToken0) {
      throw new Error('Invalid position')
    }

    if (
      !pool ||
      !marginInInput ||
      !marginInOutput ||
      !borrowAmount ||
      !existingPosition ||
      !inputCurrency ||
      !outputCurrency ||
      !additionalPremium ||
      !marginFacility ||
      !allowedSlippage ||
      !deadline ||
      inputIsToken0 === undefined ||
      !dataProvider ||
      !feePercent ||
      !positionKey
    ) {
      throw new Error('Invalid position')
    }

    const swapRoute = new Route(
      [pool],
      inputIsToken0 ? pool.token0 : pool.token1,
      inputIsToken0 ? pool.token1 : pool.token0
    )

    // amount of input (minus fees) swapped for position token.
    let swapInput: BN
    // simulatedOutput in contracts
    let amountOut: BN
    if (marginInPosToken) {
      swapInput = borrowAmount.times(new BN(1).minus(feePercent))
      const output = await getOutputQuote(BnToCurrencyAmount(swapInput, inputCurrency), swapRoute, provider, chainId)
      if (!output) throw new Error('Quoter Error')
      amountOut = new BN(output.toString())
      // add margin to simulatedOutput
      amountOut = amountOut.plus(marginInOutput.shiftedBy(outputCurrency.decimals))
    } else {
      swapInput = marginInInput.plus(borrowAmount).times(new BN(1).minus(feePercent))
      const output = await getOutputQuote(BnToCurrencyAmount(swapInput, inputCurrency), swapRoute, provider, chainId)
      if (!output) throw new Error('Quoter Error')
      amountOut = new BN(output.toString())
    }

    const { slippedTickMax, slippedTickMin } = getSlippedTicks(pool, allowedSlippage)

    // min output = (margin + borrowAmount) * current price * (1 - slippage)
    const currentPrice = inputIsToken0 ? new BN(pool.token0Price.toFixed(18)) : new BN(pool.token1Price.toFixed(18))
    const bnAllowedSlippage = new BN(allowedSlippage.toFixed(18)).div(100)
    const minimumOutput = swapInput.times(currentPrice).times(new BN(1).minus(bnAllowedSlippage))

    let minPremiumOutput: string | undefined

    const premiumSwapRoute = new Route(
      [pool],
      inputIsToken0 ? pool.token1 : pool.token0,
      inputIsToken0 ? pool.token0 : pool.token1
    )

    if (premiumInPosToken) {
      const output = await getOutputQuote(additionalPremium, premiumSwapRoute, provider, chainId)
      if (!output) throw new Error('Quoter Error')
      minPremiumOutput = new BN(output.toString()).times(new BN(1).minus(bnAllowedSlippage)).toFixed(0)
    }

    const calldata = MarginFacilitySDK.addPositionParameters({
      positionKey,
      margin: marginInPosToken
        ? marginInOutput.shiftedBy(outputCurrency.decimals).toFixed(0)
        : marginInInput.shiftedBy(inputCurrency.decimals).toFixed(0),
      borrowAmount: borrowAmount.shiftedBy(inputCurrency.decimals).toFixed(0),
      minimumOutput: minimumOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
      deadline: deadline.toString(),
      simulatedOutput: amountOut.toFixed(0),
      executionOption: 1,
      depositPremium: new BN(additionalPremium.toExact())
        .shiftedBy(premiumInPosToken ? inputCurrency.decimals : outputCurrency.decimals)
        .toFixed(0),
      slippedTickMin,
      slippedTickMax,
      marginInPosToken,
      premiumInPosToken,
      minPremiumOutput,
    })

    const multicallResult = await marginFacility.callStatic.multicall(calldata)

    const {
      totalPosition: newTotalPosition,
      borrowInfo,
      fees,
    } = MarginFacilitySDK.decodeAddPositionResult(multicallResult[1])

    const poolKey = {
      token0: pool.token0.address,
      token1: pool.token1.address,
      fee: pool.fee,
    }

    const newBorrowInfo: any[] = borrowInfo.map((borrowItem) => {
      const existingItem = existingPosition.borrowInfo.find((item) => item.tick === borrowItem.tick)
      const liquidityDifference = existingItem
        ? new BN(borrowItem.liquidity).minus(existingItem.liquidity)
        : new BN(borrowItem.liquidity)

      return {
        tick: borrowItem.tick,
        liquidity: liquidityDifference.toString(),
        premium: '0',
        feeGrowthInside0LastX128: '0',
        feeGrowthInside1LastX128: '0',
        lastGrowth: '0',
      }
    })

    const borrowRate = await dataProvider.callStatic.getPreInstantaeneousRate(poolKey, newBorrowInfo)

    let expectedAddedOutput: JSBI
    if (existingPosition.openTime > 0) {
      expectedAddedOutput = JSBI.subtract(newTotalPosition, BnToJSBI(existingPosition.totalPosition, outputCurrency))
    } else {
      expectedAddedOutput = newTotalPosition
    }

    const executionPrice = new Price<Currency, Currency>(
      inputCurrency,
      outputCurrency,
      swapInput.shiftedBy(inputCurrency.decimals).toFixed(0),
      marginInPosToken
        ? JSBI.subtract(expectedAddedOutput, BnToJSBI(marginInOutput, outputCurrency))
        : expectedAddedOutput.toString()
    )

    const result: AddMarginTrade = {
      margin: new TokenBN(
        marginInPosToken ? marginInOutput : marginInInput,
        marginInPosToken ? outputCurrency.wrapped : inputCurrency.wrapped,
        false
      ),
      fees: new TokenBN(fees.toString(), inputCurrency.wrapped, true),
      minimumOutput: new TokenBN(minimumOutput, outputCurrency.wrapped, false),
      borrowAmount: new TokenBN(borrowAmount, inputCurrency.wrapped, false),
      swapInput: new TokenBN(swapInput, inputCurrency.wrapped, false),
      expectedAddedOutput: new TokenBN(expectedAddedOutput.toString(), outputCurrency.wrapped, true),
      executionPrice,
      allowedSlippage,
      swapRoute,
      premium: new TokenBN(
        additionalPremium.toExact(),
        premiumInPosToken ? outputCurrency.wrapped : inputCurrency.wrapped,
        false
      ),
      pool,
      inputIsToken0,
      borrowRate: new BN(borrowRate.toString())
        .shiftedBy(-18)
        .div(365 * 24)
        .times(100),
      swapFee: new TokenBN(swapInput.times(pool.fee).div(1e6), inputCurrency.wrapped, false),
      marginInPosToken,
      premiumInPosToken,
      premiumSwapRoute,
    }

    return result
  }, [
    positionKey,
    allowedSlippage,
    marginFacility,
    existingPosition,
    inputCurrency,
    outputCurrency,
    additionalPremium,
    inputIsToken0,
    borrowAmount,
    pool,
    marginInInput,
    marginInOutput,
    provider,
    chainId,
    deadline,
    dataProvider,
    feePercent,
    marginInPosToken,
    premiumInPosToken,
  ])

  const quoter = useLmtQuoterContract()

  const computeDataWithoutAccount = useCallback(async (): Promise<AddMarginTrade | undefined> => {
    if (
      !quoter ||
      !pool ||
      !inputCurrency ||
      !outputCurrency ||
      !borrowAmount ||
      !additionalPremium ||
      !marginInInput ||
      !marginInOutput
    ) {
      throw new Error('missing params')
    }
    const inputIsToken0 = inputCurrency.wrapped.sortsBefore(outputCurrency.wrapped)

    const currentPrice = inputIsToken0 ? new BN(pool.token0Price.toFixed(18)) : new BN(pool.token1Price.toFixed(18))
    const bnAllowedSlippage = new BN(allowedSlippage.toFixed(18)).div(100)

    const inputDecimals = inputCurrency.wrapped.decimals
    const outputDecimals = outputCurrency.wrapped.decimals
    const quoterResult = await quoter.callStatic.quoteExactInput({
      poolKey: {
        token0: pool.token0.address,
        token1: pool.token1.address,
        fee: pool.fee,
      },
      isToken0: !inputIsToken0,
      marginInInput: marginInInput.shiftedBy(inputDecimals).toFixed(0),
      marginInOutput: marginInOutput.shiftedBy(outputDecimals).toFixed(0),
      borrowAmount: borrowAmount.shiftedBy(inputDecimals).toFixed(0),
      quoter: ZERO_ADDRESS,
      marginInPosToken,
    })

    const swapInput = new BN(quoterResult.swapInput.toString()).shiftedBy(-inputDecimals)
    const minimumOutput = swapInput.times(currentPrice).times(new BN(1).minus(bnAllowedSlippage))

    const swapRoute = new Route(
      [pool],
      inputIsToken0 ? pool.token0 : pool.token1,
      inputIsToken0 ? pool.token1 : pool.token0
    )

    const executionPrice = new Price<Currency, Currency>(
      inputCurrency,
      outputCurrency,
      inputIsToken0 ? new BN(1).shiftedBy(18).toFixed(0) : quoterResult.avgPrice.toString(),
      !inputIsToken0 ? new BN(1).shiftedBy(18).toFixed(0) : quoterResult.avgPrice.toString()
    )

    const result: AddMarginTrade = {
      margin: new TokenBN(
        marginInPosToken ? marginInOutput : marginInInput,
        marginInPosToken ? outputCurrency.wrapped : inputCurrency.wrapped,
        false
      ),
      borrowAmount: new TokenBN(borrowAmount, inputCurrency.wrapped, false),
      minimumOutput: new TokenBN(minimumOutput, outputCurrency.wrapped, false),
      expectedAddedOutput: new TokenBN(quoterResult.positionOutput.toString(), outputCurrency.wrapped, true),
      swapRoute,
      allowedSlippage,
      premium: new TokenBN(additionalPremium.toExact(), additionalPremium.currency.wrapped, false),
      pool,
      fees: new TokenBN(quoterResult.feeAmount.toString(), inputCurrency.wrapped, true),
      swapInput: new TokenBN(quoterResult.swapInput.toString(), inputCurrency.wrapped, true),
      inputIsToken0,
      executionPrice,
      borrowRate: new BN(quoterResult.borrowRate.toString())
        .shiftedBy(-18)
        .div(365 * 24)
        .times(100),
      swapFee: new TokenBN(swapInput.times(pool.fee).div(1e6), inputCurrency.wrapped, false),
      marginInPosToken,
      premiumSwapRoute: swapRoute,
      premiumInPosToken,
    }

    return result
  }, [
    allowedSlippage,
    borrowAmount,
    additionalPremium,
    inputCurrency,
    outputCurrency,
    marginInInput,
    marginInOutput,
    pool,
    quoter,
    marginInPosToken,
    premiumInPosToken,
  ])

  const noAccountQueryKey = useMemo(() => {
    if (account) return []
    if (
      !marginInInput ||
      !marginInOutput ||
      !borrowAmount ||
      !inputCurrency ||
      !outputCurrency ||
      !pool ||
      !allowedSlippage ||
      !deadline ||
      !additionalPremium ||
      !quoter ||
      !blockNumber ||
      txnWillFail
    ) {
      return []
    }

    return [
      'addMarginTradeWithoutCompute',
      marginInInput.toString(),
      marginInOutput.toString(),
      borrowAmount.toString(),
      inputCurrency.wrapped.address,
      outputCurrency.wrapped.address,
      pool.fee,
      allowedSlippage.toSignificant(5),
      additionalPremium.toExact(),
      marginInPosToken,
      quoter.address,
    ]
  }, [
    marginInInput,
    marginInOutput,
    borrowAmount,
    inputCurrency,
    outputCurrency,
    pool,
    allowedSlippage,
    deadline,
    additionalPremium,
    quoter,
    marginInPosToken,
    blockNumber,
    account,
    txnWillFail,
  ])

  const {
    data: noAccData,
    isLoading: noAccLoading,
    isError: noAccIsError,
    error: noAccError,
  } = useQuery(
    noAccountQueryKey,
    async () => {
      if (!blockNumber) throw new Error('missing block number')
      try {
        const result = await computeDataWithoutAccount()
        if (!result) throw new Error('missing result')
        setBlockNumber(blockNumber)
        return result
      } catch (e) {
        console.log('noAccError', e)
        throw e
      }
    },
    {
      enabled: noAccountQueryKey.length > 0,
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchInterval: 1000 * 15,
    }
  )

  const queryKey = useMemo(() => {
    if (!account) return []
    if (existingPosition && existingPosition.isToken0 !== !inputIsToken0) {
      return []
    }
    if (
      !pool ||
      !marginInInput ||
      !marginInOutput ||
      !borrowAmount ||
      !existingPosition ||
      !inputCurrency ||
      !outputCurrency ||
      !additionalPremium ||
      !marginFacility ||
      !allowedSlippage ||
      !deadline ||
      inputIsToken0 === undefined ||
      !dataProvider ||
      !feePercent ||
      !positionKey ||
      !blockNumber ||
      txnWillFail
    ) {
      return []
    }

    if (marginInPosToken && inputApprovalState !== ApprovalState.APPROVED) {
      return []
    } else if (
      !marginInPosToken &&
      outputApprovalState !== ApprovalState.APPROVED &&
      inputApprovalState !== ApprovalState.APPROVED
    ) {
      return []
    }
    return [
      'addMarginTrade',
      positionKey,
      marginInInput.toString(),
      marginInOutput.toString(),
      borrowAmount.toString(),
      inputCurrency.wrapped.address,
      outputCurrency.wrapped.address,
      pool.fee,
      allowedSlippage.toSignificant(5),
      deadline.toString(),
      additionalPremium.toExact(),
      marginInPosToken,
    ]
  }, [
    positionKey,
    marginInInput,
    marginInOutput,
    borrowAmount,
    inputCurrency,
    outputCurrency,
    pool,
    allowedSlippage,
    deadline,
    additionalPremium,
    marginInPosToken,
    blockNumber,
    inputApprovalState,
    outputApprovalState,
    account,
    dataProvider,
    existingPosition,
    inputIsToken0,
    feePercent,
    marginFacility,
    txnWillFail,
  ])

  const {
    data: data,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey,
    enabled: queryKey.length > 0,
    queryFn: async () => {
      if (!blockNumber) throw new Error('missing block number')
      try {
        const result = await computeData()
        setBlockNumber(blockNumber)
        return result
      } catch (err) {
        console.log('addPosition:error', err)
        throw err
      }
    },
    keepPreviousData: true,
  })

  const contractError = useMemo(() => {
    let _error: ReactNode | undefined

    if (account && error) {
      _error = <Trans>{getErrorMessage(parseContractError(error))}</Trans>
    } else if (!account && noAccError) {
      _error = <Trans>{getErrorMessage(parseContractError(noAccError))}</Trans>
    }
    return _error
  }, [error, noAccError, account])

  return useMemo(() => {
    if (account) {
      const disabled = queryKey.length === 0

      if (disabled) {
        return {
          state: LeverageTradeState.INVALID,
          contractError: undefined,
          result: undefined,
        }
      }
      let tradeState: LeverageTradeState = LeverageTradeState.VALID
      if (loading) {
        tradeState = LeverageTradeState.LOADING
      } else if (isError) {
        tradeState = LeverageTradeState.INVALID
      }
      return {
        state: tradeState,
        contractError,
        result: data,
      }
    } else {
      const disabled = noAccountQueryKey.length === 0

      if (disabled) {
        return {
          state: LeverageTradeState.INVALID,
          contractError: undefined,
          result: undefined,
        }
      }

      let tradeState: LeverageTradeState = LeverageTradeState.VALID
      if (noAccLoading) {
        tradeState = LeverageTradeState.LOADING
      } else if (noAccIsError) {
        tradeState = LeverageTradeState.INVALID
      }
      return {
        state: tradeState,
        contractError,
        result: noAccData,
      }
    }
  }, [
    data,
    noAccData,
    isError,
    noAccIsError,
    contractError,
    loading,
    account,
    noAccLoading,
    noAccountQueryKey,
    queryKey,
  ])
}

const getLimitParamString = (margin: BN, leverageFactor: BN, limitPrice: BN, allowedSlippage: Percent) => {
  return `${margin.toString()}-${leverageFactor.toString()}-${limitPrice.toString()}-${allowedSlippage.toFixed(18)}`
}

export const BnToJSBI = (x: BN, currency: Currency): JSBI => {
  return JSBI.BigInt(x.shiftedBy(currency.decimals).toFixed(0))
}

export const BnToCurrencyAmount = (x: BN, currency: Currency): CurrencyAmount<Currency> => {
  return CurrencyAmount.fromRawAmount(currency, x.shiftedBy(currency.decimals).toFixed(0))
}
