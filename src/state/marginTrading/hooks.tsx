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
import { MarginField, setBaseCurrencyIsInputToken, setLimit, setLocked, setPrice, typeInput } from './actions'
import { getOutputQuote } from './getOutputQuote'
export function useMarginTradingState(): AppState['margin'] {
  return useAppSelector((state) => state.margin)
}

export function useMarginTradingActionHandlers(): {
  // onCurrencySelection: (field: Field, currency: Currency) => void
  // onSwitchTokens: () => void
  onUserInput: (field: MarginField, typedValue: string) => void
  // onChangeRecipient: (recipient: string | null) => void
  onLeverageFactorChange: (leverage: string) => void
  onMarginChange: (margin: string) => void
  // onBorrowChange: (borrow: string) => void
  onLockChange: (locked: MarginField | null) => void
  onChangeTradeType: (isLimit: boolean) => void
  onPriceInput: (typedValue: string) => void
  onPriceToggle: (baseCurrencyIsInputToken: boolean) => void
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

  return {
    // onSwitchTokens,
    // onCurrencySelection,
    onUserInput,
    // onChangeRecipient,
    onLeverageFactorChange,
    onMarginChange,
    // onBorrowChange,
    onLockChange,
    onChangeTradeType,
    onPriceInput,
    onPriceToggle,
  }
}

export interface AddMarginTrade {
  margin: TokenBN // additional margin
  fees: TokenBN //CurrencyAmount<Currency> // fees
  borrowAmount: TokenBN //CurrencyAmount<Currency> // additional borrowAmount
  minimumOutput: TokenBN //CurrencyAmount<Currency> // minimum output amount
  swapOutput: TokenBN //CurrencyAmount<Currency> // additional output amount
  swapInput: TokenBN // CurrencyAmount<Currency> // margin + borrowAmount - fees
  allowedSlippage: Percent // should be Percent
  executionPrice: Price<Currency, Currency>
  swapRoute: Route<Currency, Currency>
  premium: TokenBN // CurrencyAmount<Currency>
  // positionKey: TraderPositionKey
  pool: Pool
  inputIsToken0: boolean
  borrowRate: BN
  swapFee: TokenBN // CurrencyAmount<Currency>
}

export interface PreTradeInfo {
  // current premium deposit
  premiumDeposit: CurrencyAmount<Currency>
  // premium necessary for the transaction
  // premiumNecessary: CurrencyAmount<Currency>
  // additional premium (necessary - deposit)
  // additionalPremium: CurrencyAmount<Currency>
  // how much to approve (margin + additional premium)
  additionalPremium: CurrencyAmount<Currency>
  approvalAmount: CurrencyAmount<Currency>
}

interface DerivedAddPositionResult {
  currencies: { [field in Field]?: Currency | null }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  positionKey?: TraderPositionKey
  allowedSlippage: Percent
  // allowedSlippedTick: Percent
  userPremiumPercent: Percent
  // allowedPremiumTolerance?: Percent
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
  // const {
  //   [MarginField.MARGIN]: margin,
  //   [MarginField.LEVERAGE_FACTOR]: leverageFactor,
  //   isLimitOrder,
  // } = useMarginTradingState()

  // const {
  //   [Field.INPUT]: { currencyId: inputCurrencyId },
  //   [Field.OUTPUT]: { currencyId: outputCurrencyId },
  // } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const parsedMargin = useMemo(() => parseBN(margin), [margin])

  const parsedLeverageFactor = useMemo(() => parseBN(leverageFactor), [leverageFactor])

  const parsedBorrowAmount = useMemo(() => {
    if (parsedLeverageFactor && parsedMargin) {
      return parsedMargin.times(parsedLeverageFactor).minus(parsedMargin)
    } else {
      return undefined
    }
  }, [parsedLeverageFactor, parsedMargin])

  const [positionKey, orderKey] = useMemo(() => {
    if (outputCurrency && inputCurrency && account && pool) {
      const isToken0 = outputCurrency?.wrapped.sortsBefore(inputCurrency?.wrapped)
      const token0Address = isToken0 ? outputCurrency.wrapped.address : inputCurrency.wrapped.address
      const token1Address = isToken0 ? inputCurrency.wrapped.address : outputCurrency.wrapped.address
      const _positionKey = {
        poolKey: {
          token0Address,
          token1Address,
          fee: pool.fee,
        },
        isToken0,
        isBorrow: false,
        trader: account,
      }
      const _order = {
        poolKey: {
          token0Address,
          token1Address,
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

  const { position: existingPosition } = useMarginLMTPositionFromPositionId(positionKey)
  // const { position: existingLimitPosition } = useMarginOrderPositionFromPositionId(orderKey)

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

  // const poolParams = usePoolParams(pool)

  // TODO calculate slippage from the pool
  const allowedSlippage = useMemo(() => {
    if (userSlippageTolerance === 'auto') return new Percent(JSBI.BigInt(3), JSBI.BigInt(100))
    else return userSlippageTolerance
  }, [userSlippageTolerance])

  const rawUserPremiumPercent = useMemo(() => {
    if (userPremiumPercent === 'auto') return new Percent(JSBI.BigInt(5), JSBI.BigInt(10000))
    else return userPremiumPercent
  }, [userPremiumPercent])

  const inputIsToken0 = useMemo(() => {
    return outputCurrency?.wrapped ? inputCurrency?.wrapped.sortsBefore(outputCurrency?.wrapped) : false
  }, [outputCurrency, inputCurrency])
  const token0Address = inputIsToken0 ? inputCurrency?.wrapped.address : outputCurrency?.wrapped.address
  const token1Address = !inputIsToken0 ? inputCurrency?.wrapped.address : outputCurrency?.wrapped.address
  const { result: maxLeverage } = useMaxLeverage(
    token0Address,
    token1Address,
    pool?.fee,
    !inputIsToken0,
    parsedMargin,
    inputCurrency ?? undefined
  )

  const preTradeInfo: PreTradeInfo | undefined = useMemo(() => {
    if (!inputCurrency || !outputCurrency || !parsedBorrowAmount || !parsedMargin) return undefined

    // premium to approve
    const _additionalPremium = parsedBorrowAmount.times(new BN(rawUserPremiumPercent.toFixed(18)).div(100))
    // console.log('additional premium', _additionalPremium.toString())
    const _approvalAmount = _additionalPremium.isGreaterThan(0) ? _additionalPremium.plus(parsedMargin) : parsedMargin

    return {
      premiumDeposit: existingPosition
        ? BnToCurrencyAmount(existingPosition.premiumDeposit, inputCurrency)
        : CurrencyAmount.fromRawAmount(inputCurrency, '0'),
      additionalPremium: BnToCurrencyAmount(_additionalPremium, inputCurrency),
      approvalAmount: BnToCurrencyAmount(_approvalAmount, inputCurrency),
    }
  }, [existingPosition, inputCurrency, outputCurrency, parsedBorrowAmount, parsedMargin, rawUserPremiumPercent])

  const { chainId } = useWeb3React()

  const [approvalState] = useApproveCallback(
    preTradeInfo?.approvalAmount,
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
    if (balanceIn && preTradeInfo && parsedMargin) {
      const amountIn = preTradeInfo.approvalAmount
      if (balanceIn.lessThan(amountIn)) {
        inputError = <Trans>Insufficient {balanceIn.currency.symbol}</Trans>
      }
    }

    return inputError
  }, [account, usingCode, currencies, maxLeverage, parsedMargin, currencyBalances, parsedLeverageFactor, preTradeInfo])

  const {
    state,
    result: trade,
    contractError,
  } = useSimulateMarginTrade(
    allowedSlippage,
    rawUserPremiumPercent,
    positionKey,
    pool,
    inputIsToken0,
    parsedMargin,
    parsedBorrowAmount,
    existingPosition,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    preTradeInfo?.additionalPremium ?? undefined,
    inputError,
    approvalState
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

interface DerivedAddLimitPositionResult {
  inputError?: ReactNode
  contractError?: ReactNode
  trade?: AddLimitOrderInfo
}

interface AddLimitOrderInfo {
  deadline: number
  startOutput: BN
  minOutput: BN
  inputAmount: BN
  decayRate: BN
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
  const [traderKey, orderKey] = useMemo(() => {
    const isToken0 = outputCurrency?.wrapped.address === pool?.token0.address
    if (pool && account) {
      const _positionKey = {
        poolKey: {
          token0Address: pool.token0.address,
          token1Address: pool.token1.address,
          fee: pool.fee,
        },
        isToken0,
        isBorrow: false,
        trader: account,
      }
      const _order = {
        poolKey: {
          token0Address: pool.token0.address,
          token1Address: pool.token1.address,
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
  const { result: maxLeverage } = useMaxLeverage(
    token0Address,
    token1Address,
    pool?.fee,
    !inputIsToken0,
    parsedMargin,
    inputCurrency ?? undefined
  )

  const [userPremiumPercent] = useUserPremiumDepositPercent()

  const rawUserPremiumPercent = useMemo(() => {
    if (userPremiumPercent === 'auto') return new Percent(JSBI.BigInt(5), JSBI.BigInt(10000))
    else return userPremiumPercent
  }, [userPremiumPercent])

  const preTradeInfo: PreTradeInfo | undefined = useMemo(() => {
    if (!existingPosition || !account || !inputCurrency || !outputCurrency || !parsedBorrowAmount || !parsedMargin)
      return undefined

    // premium to approve
    const _additionalPremium = parsedBorrowAmount.times(new BN(rawUserPremiumPercent.toFixed(18)).div(100))
    // console.log('additional premium', _additionalPremium.toString())
    const _approvalAmount = _additionalPremium.isGreaterThan(0) ? _additionalPremium.plus(parsedMargin) : parsedMargin

    return {
      premiumDeposit: BnToCurrencyAmount(existingPosition.premiumDeposit, inputCurrency),
      additionalPremium: BnToCurrencyAmount(_additionalPremium, inputCurrency),
      approvalAmount: BnToCurrencyAmount(_approvalAmount, inputCurrency),
    }
  }, [
    existingPosition,
    account,
    inputCurrency,
    outputCurrency,
    parsedBorrowAmount,
    parsedMargin,
    rawUserPremiumPercent,
  ])

  const deadline = useLimitTransactionDeadline()

  const { position: existingLimitPosition } = useMarginOrderPositionFromPositionId(orderKey)

  const [approvalState] = useApproveCallback(
    preTradeInfo?.approvalAmount,
    LMT_MARGIN_FACILITY[chainId ?? SupportedChainId.SEPOLIA]
  )

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

const getLimitParamString = (margin: BN, leverageFactor: BN, limitPrice: BN, allowedSlippage: Percent) => {
  return `${margin.toString()}-${leverageFactor.toString()}-${limitPrice.toString()}-${allowedSlippage.toFixed(18)}`
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
  // const [lastUserParams, setLastUserParams] = useState<{
  //   margin: BN
  //   leverageFactor: BN
  //   startingPrice: BN
  //   orderKey: OrderPositionKey
  //   allowedSlippage: Percent
  // }>()

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

  // useEffect(() => {
  //   const lagged = async () => {
  //     if (
  //       !account ||
  //       !chainId ||
  //       !pool ||
  //       !margin ||
  //       !blockNumber ||
  //       !poolManager ||
  //       !deadline ||
  //       !orderKey ||
  //       !leverageFactor ||
  //       !startingPrice ||
  //       !allowedSlippage ||
  //       !inputCurrency ||
  //       !outputCurrency ||
  //       !marginFacility ||
  //       !additionalPremium ||
  //       !!inputError ||
  //       approvalState !== ApprovalState.APPROVED ||
  //       !orderDuration ||
  //       !feePercent
  //     ) {
  //       setTradeState(LimitTradeState.INVALID)
  //       setResult(undefined)
  //       setLastUserParams(undefined)
  //       return
  //     }
  //     try {
  //       const poolAddress = computePoolAddress({
  //         factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
  //         tokenA: pool.token0,
  //         tokenB: pool.token1,
  //         fee: pool.fee,
  //       })

  //       // const rawFeesResult = await poolManager.callStatic.getFeeParams({
  //       //   token0: pool.token0.address,
  //       //   token1: pool.token1.address,
  //       //   fee: pool.fee,
  //       // })
  //       // const feePercent = new BN(rawFeesResult[0].toString()).shiftedBy(-18).toString()

  //       const totalInput = new BN(margin).times(leverageFactor)
  //       const totalInputWithFees = totalInput.times(new BN(1).minus(feePercent))
  //       // if base is input then output / input.
  //       const limitPrice = baseCurrencyIsInputToken ? startingPrice : new BN(1).div(startingPrice)

  //       // we assume that starting price is output / input here.
  //       const startOutput = totalInputWithFees.times(limitPrice)
  //       const slippageBn = new BN(allowedSlippage.toFixed(18)).div(100)
  //       const minOutput = totalInputWithFees.times(limitPrice).times(new BN(1).minus(slippageBn))
  //       // decay rate defaults to zero
  //       const decayRate = new BN('0')

  //       const calldata = MarginFacilitySDK.submitLimitOrder({
  //         orderKey,
  //         margin: margin.shiftedBy(inputCurrency.decimals).toFixed(0),
  //         pool: poolAddress,
  //         isAdd: true,
  //         deadline: deadline.toString(),
  //         startOutput: startOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
  //         minOutput: minOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
  //         inputAmount: totalInput.shiftedBy(inputCurrency.decimals).toFixed(0),
  //         decayRate: decayRate.shiftedBy(18).toFixed(0),
  //         depositPremium: new BN(additionalPremium.toExact()).shiftedBy(inputCurrency.decimals).toFixed(0),
  //       })

  //       setTradeState(LimitTradeState.LOADING)
  //       await marginFacility.callStatic.multicall(calldata)
  //       setTradeState(LimitTradeState.VALID)
  //       setSimulationError(undefined)
  //       setResult({
  //         orderKey,
  //         margin,
  //         poolAddress,
  //         startOutput,
  //         decayRate,
  //         allowedSlippage,
  //         inputAmount: totalInput,
  //         minOutput,
  //         inputCurrencyId: inputCurrency.wrapped.address,
  //         outputCurrencyId: outputCurrency.wrapped.address,
  //         additionalPremium: new BN(additionalPremium.toExact()),
  //         limitPrice,
  //         duration: orderDuration,
  //         deadline: deadline.toString(),
  //         formattedLimitPrice: new Price(
  //           outputCurrency,
  //           inputCurrency,
  //           limitPrice.shiftedBy(18).toFixed(0),
  //           new BN(1).shiftedBy(18).toFixed(0)
  //         ),
  //       })
  //       setLastUserParams({
  //         margin,
  //         leverageFactor,
  //         startingPrice,
  //         orderKey,
  //         allowedSlippage,
  //       })
  //     } catch (err) {
  //       setTradeState(LimitTradeState.INVALID)
  //       setSimulationError(parseContractError(err))
  //       setResult(undefined)
  //       setLastUserParams(undefined)
  //     }
  //     return
  //   }

  //   if (existingLimitPosition && existingLimitPosition?.auctionStartTime > 0) {
  //     setTradeState(LimitTradeState.EXISTING_ORDER)
  //     return
  //   } else {
  //     lagged()
  //   }
  // }, [
  //   account,
  //   chainId,
  //   pool,
  //   margin,
  //   blockNumber,
  //   poolManager,
  //   deadline,
  //   orderKey,
  //   leverageFactor,
  //   startingPrice,
  //   allowedSlippage,
  //   inputCurrency,
  //   outputCurrency,
  //   marginFacility,
  //   existingLimitPosition,
  //   baseCurrencyIsInputToken,
  //   additionalPremium,
  //   inputError,
  //   approvalState,
  //   orderDuration,
  //   feePercent,
  // ])

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

const getAddUserParams = (
  margin: BN,
  inputAddress: string,
  outputAddress: string,
  fee: number,
  borrowAmount: BN,
  allowedSlippage: Percent
) => {
  return `${margin.toString()}-${inputAddress.toLowerCase()}-${outputAddress.toLowerCase()}-${fee}-${borrowAmount.toString()}-${allowedSlippage.toSignificant(
    5
  )}`
}

const useSimulateMarginTrade = (
  allowedSlippage: Percent,
  premiumPercent: Percent,
  positionKey?: TraderPositionKey,
  pool?: Pool,
  inputIsToken0?: boolean,
  margin?: BN,
  borrowAmount?: BN,
  existingPosition?: MarginPositionDetails,
  inputCurrency?: Currency,
  outputCurrency?: Currency,
  additionalPremium?: CurrencyAmount<Currency>,
  inputError?: ReactNode,
  approvalState?: ApprovalState
): {
  state: LeverageTradeState
  result?: AddMarginTrade
  contractError?: ReactNode
} => {
  const { account } = useWeb3React()
  const marginFacility = useMarginFacilityContract()
  const blockNumber = useBlockNumber()
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastBlockNumber, setBlockNumber] = useState<number>()
  const [lastParams, setLastParams] = useState<string>()
  const blocksPerFetch = 3
  // const poolManager = useLmtPoolManagerContract()

  // const [tradeState, setTradeState] = useState<LeverageTradeState>(LeverageTradeState.INVALID)
  const [result, setResult] = useState<AddMarginTrade>()
  const [simulationError, setSimulationError] = useState<DecodedError>()
  const deadline = useTransactionDeadline()

  const { provider, chainId } = useWeb3React()

  const dataProvider = useDataProviderContract()
  const feePercent = useLmtFeePercent(pool)

  const computeData = useCallback(async () => {
    if (existingPosition && existingPosition.isToken0 !== !inputIsToken0) {
      return
    }

    if (
      !pool ||
      !margin ||
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
      return undefined
    }

    const swapRoute = new Route(
      [pool],
      inputIsToken0 ? pool.token0 : pool.token1,
      inputIsToken0 ? pool.token1 : pool.token0
    )

    // const feePercent = new BN(rawFeesResult[0].toString()).shiftedBy(-18).toString()
    const swapInput = margin.plus(borrowAmount).times(new BN(1).minus(feePercent))
    const amountOut = await getOutputQuote(BnToCurrencyAmount(swapInput, inputCurrency), swapRoute, provider, chainId)

    if (!amountOut) return undefined

    const { slippedTickMax, slippedTickMin } = getSlippedTicks(pool, allowedSlippage)

    // min output = (margin + borrowAmount) * current price * (1 - slippage)
    const currentPrice = inputIsToken0 ? new BN(pool.token0Price.toFixed(18)) : new BN(pool.token1Price.toFixed(18))
    const bnAllowedSlippage = new BN(allowedSlippage.toFixed(18)).div(100)
    const minimumOutput = swapInput.times(currentPrice).times(new BN(1).minus(bnAllowedSlippage))
    // console.log('derived', swapInput.toString(), swapRoute, amountOut.toString())
    // calldata
    const calldata = MarginFacilitySDK.addPositionParameters({
      positionKey,
      margin: margin.shiftedBy(inputCurrency.decimals).toFixed(0),
      borrowAmount: borrowAmount.shiftedBy(inputCurrency.decimals).toFixed(0),
      minimumOutput: minimumOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
      deadline: deadline.toString(),
      simulatedOutput: amountOut.toString(),
      executionOption: 1,
      depositPremium: new BN(additionalPremium.toExact()).shiftedBy(inputCurrency.decimals).toFixed(0),
      slippedTickMin,
      slippedTickMax,
    })

    setLastParams(
      getAddUserParams(
        margin,
        inputCurrency.wrapped.address,
        outputCurrency.wrapped.address,
        pool.fee,
        borrowAmount,
        allowedSlippage
      )
    )

    const multicallResult = await marginFacility.callStatic.multicall(calldata)

    const {
      totalPosition: newTotalPosition,
      totalInputDebt: newTotalInputDebt,
      margin: newMargin,
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

    let swapOutput: JSBI
    if (existingPosition.openTime > 0) {
      swapOutput = JSBI.subtract(newTotalPosition, BnToJSBI(existingPosition.totalPosition, outputCurrency))
    } else {
      swapOutput = newTotalPosition
    }

    const executionPrice = new Price<Currency, Currency>(
      inputCurrency,
      outputCurrency,
      swapInput.shiftedBy(inputCurrency.decimals).toFixed(0),
      swapOutput
    )

    const simulation: AddMarginTrade = {
      margin: new TokenBN(margin, inputCurrency.wrapped, false), // CurrencyAmount.fromRawAmount(inputCurrency, _margin)
      fees: new TokenBN(fees.toString(), inputCurrency.wrapped, true),
      minimumOutput: new TokenBN(minimumOutput, outputCurrency.wrapped, false), //BnToCurrencyAmount(minimumOutput, outputCurrency),
      borrowAmount: new TokenBN(borrowAmount, inputCurrency.wrapped, false), // CurrencyAmount.fromRawAmount(inputCurrency, _borrowAmount),
      swapInput: new TokenBN(swapInput, inputCurrency.wrapped, false), // CurrencyAmount.fromRawAmount(inputCurrency, swapInput),
      swapOutput: new TokenBN(swapOutput.toString(), outputCurrency.wrapped, true), // CurrencyAmount.fromRawAmount(outputCurrency, swapOutput),
      executionPrice,
      allowedSlippage,
      // positionKey,
      swapRoute,
      premium: new TokenBN(additionalPremium.toExact(), inputCurrency.wrapped, false),
      pool,
      inputIsToken0,
      borrowRate: new BN(borrowRate.toString())
        .shiftedBy(-18)
        .div(365 * 24)
        .times(100),
      swapFee: new TokenBN(swapInput.times(pool.fee).div(1e6), inputCurrency.wrapped, false),
    }

    return {
      data: simulation,
      // userParams: `${margin.toString()}-${JSON.stringify(
      //   positionKey
      // )}-${borrowAmount.toString()}-${allowedSlippage.toSignificant(5)}`,
    }
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
    margin,
    provider,
    chainId,
    deadline,
    dataProvider,
    feePercent,
  ])

  const quoter = useLmtQuoterContract()

  const computeDataWithoutAccount = useCallback(
    async (
      inputCurrency: Currency | undefined,
      outputCurrency: Currency | undefined,
      pool: Pool | undefined,
      margin: BN | undefined,
      borrowAmount: BN | undefined
    ) => {
      if (!quoter || !pool || !inputCurrency || !outputCurrency || !margin || !borrowAmount || !additionalPremium) {
        return undefined
      }

      const inputIsToken0 = inputCurrency.wrapped.sortsBefore(outputCurrency.wrapped)

      const currentPrice = inputIsToken0 ? new BN(pool.token0Price.toFixed(18)) : new BN(pool.token1Price.toFixed(18))
      const bnAllowedSlippage = new BN(allowedSlippage.toFixed(18)).div(100)

      const inputDecimals = inputCurrency.wrapped.decimals

      setLastParams(
        getAddUserParams(
          margin,
          inputCurrency.wrapped.address,
          outputCurrency.wrapped.address,
          pool.fee,
          borrowAmount,
          allowedSlippage
        )
      )

      const quoterResult = await quoter.callStatic.quoteExactInput({
        poolKey: {
          token0: pool.token0.address,
          token1: pool.token1.address,
          fee: pool.fee,
        },
        isToken0: !inputIsToken0,
        margin: margin.shiftedBy(inputDecimals).toFixed(0),
        borrowAmount: borrowAmount.shiftedBy(inputDecimals).toFixed(0),
        quoter: ZERO_ADDRESS,
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
        swapInput.shiftedBy(inputCurrency.decimals).toFixed(0),
        quoterResult.positionOutput.toString()
      )

      const result: AddMarginTrade = {
        margin: new TokenBN(margin, inputCurrency.wrapped, false),
        borrowAmount: new TokenBN(borrowAmount, inputCurrency.wrapped, false),
        minimumOutput: new TokenBN(minimumOutput, outputCurrency.wrapped, false),
        swapOutput: new TokenBN(quoterResult.positionOutput.toString(), outputCurrency.wrapped, true),
        swapRoute,
        allowedSlippage,
        premium: new TokenBN(additionalPremium.toExact(), inputCurrency.wrapped, false),
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
      }

      return result
    },
    [quoter, allowedSlippage, additionalPremium]
  )

  useEffect(() => {
    if (!account) {
      if (!blockNumber) {
        return
      }

      const userInputError =
        !margin ||
        margin?.isZero() ||
        !borrowAmount ||
        borrowAmount?.isZero() ||
        !inputCurrency ||
        !outputCurrency ||
        !pool

      if (userInputError) {
        return
      }

      let paramsUnchanged = false
      if (borrowAmount && inputCurrency && outputCurrency && pool && margin) {
        const params = getAddUserParams(
          margin,
          inputCurrency.wrapped.address,
          outputCurrency.wrapped.address,
          pool.fee,
          borrowAmount,
          allowedSlippage
        )
        paramsUnchanged = lastParams === params
      }

      // if params unchanged and error then try again next block interval
      if (paramsUnchanged && simulationError && lastBlockNumber && lastBlockNumber + blocksPerFetch >= blockNumber) {
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

      computeDataWithoutAccount(inputCurrency, outputCurrency, pool, margin, borrowAmount)
        .then((data) => {
          if (!data) {
            // console.log('derived:missing')
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
            // console.log('derived:result', _result, userParams)
            setResult(data)
            // setLastParams(userParams)
            setSimulationError(undefined)
            setLoading(false)
            setSyncing(false)
          }
          setBlockNumber(blockNumber)
        })
        .catch((err) => {
          console.log('computeDataWithoutAccount', parseContractError(err), err)
          // console.log('fetching10')
          setSimulationError(parseContractError(err))
          // setLastParams(undefined)
          setResult(undefined)
          setLoading(false)
          setSyncing(false)
          setBlockNumber(blockNumber)
        })
    }
  }, [
    account,
    margin,
    borrowAmount,
    inputCurrency,
    outputCurrency,
    pool,
    allowedSlippage,
    blockNumber,
    lastBlockNumber,
    lastParams,
    loading,
    simulationError,
    syncing,
    computeDataWithoutAccount,
  ])

  useEffect(() => {
    // if invalid params before
    if (!!inputError || approvalState !== ApprovalState.APPROVED || !blockNumber) {
      return
    }

    let paramsUnchanged = false
    if (borrowAmount && inputCurrency && outputCurrency && pool && margin) {
      const params = getAddUserParams(
        margin,
        inputCurrency.wrapped.address,
        outputCurrency.wrapped.address,
        pool.fee,
        borrowAmount,
        allowedSlippage
      )
      paramsUnchanged = lastParams === params
    }

    // if params unchanged and error then try again next block interval
    if (paramsUnchanged && simulationError && lastBlockNumber && lastBlockNumber + blocksPerFetch >= blockNumber) {
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

    computeData()
      .then((data) => {
        if (!data) {
          // console.log('derived:missing')
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
          const { data: _result } = data
          // console.log('derived:result', _result, userParams)
          setResult(_result)
          // setLastParams(userParams)
          setSimulationError(undefined)
          setLoading(false)
          setSyncing(false)
        }
        setBlockNumber(blockNumber)
      })
      .catch((err) => {
        console.log('computeData:error', err)
        // console.log('fetching10')
        setSimulationError(parseContractError(err))
        // setLastParams(undefined)
        setResult(undefined)
        setLoading(false)
        setSyncing(false)
        setBlockNumber(blockNumber)
      })
  }, [
    allowedSlippage,
    approvalState,
    blockNumber,
    borrowAmount,
    computeData,
    inputError,
    lastBlockNumber,
    lastParams,
    loading,
    margin,
    positionKey,
    simulationError,
    syncing,
    inputCurrency,
    outputCurrency,
    pool,
  ])

  const contractError = useMemo(() => {
    let error: ReactNode | undefined

    if (simulationError) {
      error = <Trans>{getErrorMessage(simulationError)}</Trans>
    }

    return error
  }, [simulationError])

  return useMemo(() => {
    if (account) {
      let tradeState: LeverageTradeState = LeverageTradeState.INVALID
      if (loading) {
        tradeState = LeverageTradeState.LOADING
      } else if (syncing) {
        tradeState = LeverageTradeState.SYNCING
      } else if (simulationError) {
        tradeState = LeverageTradeState.INVALID
      }

      if (!margin || !borrowAmount || !positionKey) {
        return {
          state: LeverageTradeState.INVALID,
          contractError,
          result: undefined,
        }
      } else if (lastParams && result && !simulationError) {
        return {
          state: LeverageTradeState.VALID,
          contractError,
          result,
        }
      } else {
        return {
          state: tradeState,
          contractError,
          result: undefined,
        }
      }
    } else {
      let tradeState: LeverageTradeState = LeverageTradeState.INVALID
      if (loading) {
        tradeState = LeverageTradeState.LOADING
      } else if (syncing) {
        tradeState = LeverageTradeState.SYNCING
      } else if (simulationError) {
        tradeState = LeverageTradeState.INVALID
      } else if (result) {
        tradeState = LeverageTradeState.VALID
      }
      return {
        state: tradeState,
        contractError,
        result,
      }
    }
  }, [
    result,
    contractError,
    borrowAmount,
    positionKey,
    margin,
    allowedSlippage,
    lastParams,
    loading,
    syncing,
    simulationError,
    account,
  ])
}

export const BnToJSBI = (x: BN, currency: Currency): JSBI => {
  return JSBI.BigInt(x.shiftedBy(currency.decimals).toFixed(0))
}

export const BnToCurrencyAmount = (x: BN, currency: Currency): CurrencyAmount<Currency> => {
  return CurrencyAmount.fromRawAmount(currency, x.shiftedBy(currency.decimals).toFixed(0))
}
