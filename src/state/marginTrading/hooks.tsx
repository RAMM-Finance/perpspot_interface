import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'
import { Pool, Route } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { unsupportedChain } from 'components/NavBar/ChainSelector'
import { getSlippedTicks } from 'components/PositionTable/LeveragePositionTable/DecreasePositionContent'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { ZERO_ADDRESS } from 'constants/misc'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useLmtQuoterContract, useMarginFacilityContract } from 'hooks/useContract'
import { useLmtFeePercent } from 'hooks/useLmtFeePercent'
import { useMarginLMTPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { useMaxLeverage } from 'hooks/useMaxLeverage'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import JSBI from 'jsbi'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { ReactNode, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { LeverageTradeState } from 'state/routing/types'
import { Field } from 'state/swap/actions'
import { useUserPremiumDepositPercent, useUserSlippageTolerance } from 'state/user/hooks'
import {
  MarginLimitOrder,
  MarginPositionDetails,
  OrderPositionKey,
  SerializableMarginPositionDetails,
  TraderPositionKey,
} from 'types/lmtv2position'
import { getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { MarginFacilitySDK } from 'utils/lmtSDK/MarginFacility'
import { useAccount, useChainId } from 'wagmi'
import { useEthersProvider } from 'wagmi-lib/adapters'

import { useCurrency } from '../../hooks/Tokens'
import { useCurrencyBalances } from '../connection/hooks'
import { AppState } from '../types'
import {
  addPreloadedLeveragePosition,
  MarginField,
  removeLeveragePosition,
  setBaseCurrencyIsInputToken,
  setIsSwap,
  setLeveragePositions,
  setLimit,
  setLocked,
  setMarginInPosToken,
  setPremiumInPosToken,
  setPrice,
  setUpdatedPremium,
  typeInput,
} from './actions'
import { getOutputQuote } from './getOutputQuote'
export function useMarginTradingState(): AppState['margin'] {
  const margin = useAppSelector((state) => state.margin)
  return margin
}

function serializeMarginPositionDetails(position: MarginPositionDetails): SerializableMarginPositionDetails {
  const inputDecimals = position.isToken0 ? position.token0Decimals : position.token1Decimals
  const outputDecimals = position.isToken0 ? position.token1Decimals : position.token0Decimals
  return {
    poolKey: position.poolKey,
    margin: position.margin.shiftedBy(position.marginInPosToken ? outputDecimals : inputDecimals).toFixed(0),
    totalDebtOutput: position.totalDebtOutput.shiftedBy(outputDecimals).toFixed(0),
    totalDebtInput: position.totalDebtInput.shiftedBy(inputDecimals).toFixed(0),
    openTime: position.openTime,
    repayTime: position.repayTime,
    isBorrow: position.isBorrow,
    premiumOwed: position.premiumOwed.shiftedBy(inputDecimals).toFixed(0),
    premiumDeposit: position.premiumDeposit.shiftedBy(inputDecimals).toFixed(0),
    premiumLeft: position.premiumLeft.shiftedBy(inputDecimals).toFixed(0),
    trader: position.trader,
    token0Decimals: position.token0Decimals,
    token1Decimals: position.token1Decimals,
    maxWithdrawablePremium: position.maxWithdrawablePremium.shiftedBy(inputDecimals).toFixed(0),
    borrowInfo: position.borrowInfo.map((item) => {
      return {
        tick: item.tick,
        liquidity: item.liquidity,
        premium: item.premium,
        feeGrowthInside0LastX128: item.feeGrowthInside0LastX128,
        feeGrowthInside1LastX128: item.feeGrowthInside1LastX128,
        lastGrowth: item.lastGrowth,
      }
    }),
    isToken0: position.isToken0,
    totalPosition: position.totalPosition.shiftedBy(outputDecimals).toFixed(0),
    apr: position.apr.shiftedBy(18).toFixed(0),
    marginInPosToken: position.marginInPosToken,
  }
}

export function useMarginTradingActionHandlers(): {
  onUserInput: (field: MarginField, typedValue: string) => void
  onLeverageFactorChange: (leverage: string) => void
  onEstimatedDurationChange: (estDurationFactor: string) => void
  onUpdatedPremiumChange: (updatedPremium: BN | undefined) => void
  onMarginChange: (margin: string) => void
  onLockChange: (locked: MarginField | null) => void
  onChangeTradeType: (isLimit: boolean) => void
  onPriceInput: (typedValue: string) => void
  onPriceToggle: (baseCurrencyIsInputToken: boolean) => void
  onPremiumCurrencyToggle: (premiumInPosToken: boolean) => void
  onSetMarginInPosToken: (marginInPosToken: boolean) => void
  onSetIsSwap: (isSwap: boolean) => void
  onSetLeveragePositions: (
    positions: {
      position: MarginPositionDetails
      lastUpdated: number
      preloaded: boolean
    }[]
  ) => void
  onAddPreloadedLeveragePosition: (position: MarginPositionDetails) => void
  onRemoveLeveragePosition: (positionId: string) => void
} {
  const dispatch = useAppDispatch()

  const onUserInput = useCallback(
    (field: MarginField, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onEstimatedDurationChange = useCallback(
    (selectedDuration: string) => {
      dispatch(typeInput({ field: MarginField.EST_DURATION, typedValue: selectedDuration }))
    },
    [dispatch]
  )

  const onUpdatedPremiumChange = useCallback(
    (updatedPremium: BN | undefined) => {
      dispatch(setUpdatedPremium({ updatedPremium }))
    },
    [dispatch]
  )

  const onLeverageFactorChange = useCallback(
    (leverageFactor: string) => {
      dispatch(typeInput({ field: MarginField.EST_DURATION, typedValue: '' }))
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

  const onSetMarginInPosToken = useCallback(
    (marginInPosToken: boolean) => {
      dispatch(setMarginInPosToken({ marginInPosToken }))
    },
    [dispatch]
  )

  const onPremiumCurrencyToggle = useCallback(
    (premiumInPosToken: boolean) => {
      dispatch(setPremiumInPosToken({ premiumInPosToken }))
    },
    [dispatch]
  )

  const onSetIsSwap = useCallback(
    (isSwap: boolean) => {
      dispatch(setIsSwap({ isSwap }))
    },
    [dispatch]
  )

  const onSetLeveragePositions = useCallback(
    (
      positions: {
        position: MarginPositionDetails
        lastUpdated: number
        preloaded: boolean
      }[]
    ) => {
      const list = positions.map((p) => {
        return {
          position: serializeMarginPositionDetails(p.position),
          lastUpdated: p.lastUpdated,
          preloaded: p.preloaded,
        }
      })
      dispatch(setLeveragePositions({ positions: list }))
    },
    [dispatch]
  )

  const onAddPreloadedLeveragePosition = useCallback(
    (position: MarginPositionDetails) => {
      dispatch(
        addPreloadedLeveragePosition({ position: serializeMarginPositionDetails(position), lastUpdated: Date.now() })
      )
    },
    [dispatch]
  )

  const onRemoveLeveragePosition = useCallback(
    (positionId: string) => {
      dispatch(removeLeveragePosition({ positionId }))
    },
    [dispatch]
  )

  return {
    onUserInput,
    onLeverageFactorChange,
    onEstimatedDurationChange,
    onMarginChange,
    onLockChange,
    onChangeTradeType,
    onPriceInput,
    onPriceToggle,
    onPremiumCurrencyToggle,
    onSetMarginInPosToken,
    onUpdatedPremiumChange,
    onSetIsSwap,
    onSetLeveragePositions,
    onAddPreloadedLeveragePosition,
    onRemoveLeveragePosition,
  }
}

export interface AddMarginTrade {
  margin: BN // additional margin
  fees: BN // fees
  borrowAmount: BN // additional borrowAmount
  minimumOutput: BN // minimum output amount
  expectedAddedOutput: BN // additional output (newTotalPosition - initialTotalPosition) amount
  swapInput: BN // swap input (for marginInPosToken, borrowAmount - fees, else margin + borrowAmount - fees)
  allowedSlippage: Percent // should be Percent
  executionPrice: Price<Currency, Currency>
  // swapRoute: Route<Currency, Currency>
  inputCurrencySymbol: string
  outputCurrencySymbol: string
  premium: BN
  inputIsToken0: boolean
  liquidityNotFound: boolean
  borrowRate: BN
  swapFee: BN
  marginInPosToken: boolean
  premiumInPosToken: boolean
  // premiumSwapRoute: Route<Currency, Currency>
  feePercent: BN
  marginInOutput: BN
  marginInInput: BN
}

export interface MarginTradeApprovalInfo {
  // current premium deposit
  premiumDeposit: CurrencyAmount<Currency>
  // additional premium for the trade
  additionalPremium: CurrencyAmount<Currency>
  // input token amount to approve
  inputApprovalAmount: CurrencyAmount<Currency>
  // output token amount to approve
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
  tradeApprovalInfo?: MarginTradeApprovalInfo
  existingPosition?: MarginPositionDetails
  state: LeverageTradeState
  existingLimitPosition?: MarginLimitOrder
  maxLeverage?: BN
  userHasSpecifiedInputOutput: boolean
  parsedMargin?: BN
  marginInPosToken: boolean
  leverageLoading?: boolean
}

export function useDerivedAddPositionInfo(
  margin?: string,
  leverageFactor?: string,
  updatedPremium?: BN | undefined,
  pool?: Pool,
  inputCurrencyId?: string, // addresses
  outputCurrencyId?: string,
  fee?: number
): DerivedAddPositionResult {
  const account = useAccount().address

  // if existing position then use marginInPosToken from existing position
  const { marginInPosToken: newMarginInPosToken, premiumInPosToken } = useMarginTradingState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const parsedMargin = useMemo(() => parseBN(margin), [margin])
  const parsedLeverageFactor = useMemo(() => parseBN(leverageFactor), [leverageFactor])

  const [positionKey] = useMemo(() => {
    if (outputCurrencyId && inputCurrencyId && account && fee) {
      const isToken0 = outputCurrencyId.toLowerCase() < inputCurrencyId.toLowerCase()
      const token0Address = isToken0 ? outputCurrencyId : inputCurrencyId
      const token1Address = isToken0 ? inputCurrencyId : outputCurrencyId
      const _positionKey = {
        poolKey: {
          token0: token0Address,
          token1: token1Address,
          fee,
        },
        isToken0,
        isBorrow: false,
        trader: account,
      }
      const _order = {
        poolKey: {
          token0: token0Address,
          token1: token1Address,
          fee,
        },
        isToken0,
        trader: account,
        isAdd: true,
      }
      return [_positionKey, _order]
    } else {
      return [undefined, undefined]
    }
  }, [account, inputCurrencyId, outputCurrencyId, fee])

  const inputIsToken0 = useMemo(() => {
    if (inputCurrencyId && outputCurrencyId) {
      return inputCurrencyId.toLowerCase() < outputCurrencyId.toLowerCase()
    }
    return true
  }, [outputCurrency, inputCurrency])

  const { position: existingPosition } = useMarginLMTPositionFromPositionId(positionKey)

  const marginInPosToken =
    existingPosition && existingPosition?.openTime > 0 ? existingPosition.marginInPosToken : newMarginInPosToken

  // in input currency
  const parsedBorrowAmount = useMemo(() => {
    if (parsedLeverageFactor && parsedMargin && parsedLeverageFactor.gt(1)) {
      if (marginInPosToken && pool) {
        const price = !inputIsToken0 ? new BN(pool.token0Price.toFixed(18)) : new BN(pool.token1Price.toFixed(18))

        return parsedLeverageFactor.minus(new BN(1)).times(parsedMargin).times(price)
      } else {
        return parsedMargin.times(parsedLeverageFactor).minus(parsedMargin)
      }
    } else {
      return undefined
    }
  }, [parsedLeverageFactor, parsedMargin, pool, marginInPosToken, inputIsToken0])

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
    if (userPremiumPercent === 'auto') return new Percent(JSBI.BigInt(150), JSBI.BigInt(10000))
    else return userPremiumPercent
  }, [userPremiumPercent])

  const token0Address = inputIsToken0 ? inputCurrencyId : outputCurrencyId
  const token1Address = !inputIsToken0 ? inputCurrencyId : outputCurrencyId

  const marginInInputToken = useMemo(() => {
    if (marginInPosToken && pool && outputCurrency && parsedMargin) {
      const isToken0 = outputCurrency.wrapped.address.toLowerCase() === pool.token0.address.toLowerCase()
      const price = isToken0 ? new BN(pool.token0Price.toFixed(18)) : new BN(pool.token1Price.toFixed(18))
      return parsedMargin.times(price)
    } else {
      return undefined
    }
  }, [marginInPosToken, pool, outputCurrency, parsedMargin])

  const { result: maxLeverage, loading: leverageLoading } = useMaxLeverage(
    marginInPosToken,
    token0Address,
    token1Address,
    pool?.fee,
    !inputIsToken0,
    parsedMargin,
    inputCurrency?.decimals,
    outputCurrency?.decimals
  )

  const tradeApprovalInfo: MarginTradeApprovalInfo | undefined = useMemo(() => {
    if (!inputCurrency || !outputCurrency || !parsedBorrowAmount || !parsedMargin || !pool) return undefined

    try {
      // premium to approve
      const _additionalPremiumInputToken = parsedBorrowAmount.times(new BN(rawUserPremiumPercent.toFixed(18)).div(100))

      const price = inputIsToken0 ? new BN(pool.token0Price.toFixed(18)) : new BN(pool.token1Price.toFixed(18))

      const _additionalPremium = premiumInPosToken
        ? _additionalPremiumInputToken.times(price)
        : _additionalPremiumInputToken

      let inputApprovalAmount: BN = new BN(0)
      let outputApprovalAmount: BN = new BN(0)
      if (marginInPosToken) {
        outputApprovalAmount = outputApprovalAmount.plus(parsedMargin)
      } else {
        inputApprovalAmount = inputApprovalAmount.plus(parsedMargin)
      }

      if (premiumInPosToken) {
        outputApprovalAmount = outputApprovalAmount.plus(_additionalPremium)
      } else {
        inputApprovalAmount = inputApprovalAmount.plus(_additionalPremium)
      }

      return {
        premiumDeposit:
          account && existingPosition
            ? BnToCurrencyAmount(existingPosition.premiumDeposit, inputCurrency)
            : BnToCurrencyAmount(new BN(0), inputCurrency),
        additionalPremium: BnToCurrencyAmount(
          updatedPremium ? updatedPremium : _additionalPremium,
          premiumInPosToken ? outputCurrency : inputCurrency
        ),
        inputApprovalAmount: BnToCurrencyAmount(inputApprovalAmount, inputCurrency),
        outputApprovalAmount: BnToCurrencyAmount(outputApprovalAmount, outputCurrency),
      }
    } catch (err) {
      return undefined
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
    updatedPremium,
  ])

  const chainId = useChainId()

  const [inputApprovalState] = useApproveCallback(
    tradeApprovalInfo?.inputApprovalAmount,
    LMT_MARGIN_FACILITY[chainId ?? SupportedChainId.ARBITRUM_ONE]
  )

  const [outputApprovalState] = useApproveCallback(
    tradeApprovalInfo?.outputApprovalAmount,
    LMT_MARGIN_FACILITY[chainId ?? SupportedChainId.ARBITRUM_ONE]
  )

  // get fee params
  const { chainId: accountChainId } = useAccount()
  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    if (accountChainId && unsupportedChain(accountChainId)) {
      inputError = <Trans>Switch User Chains</Trans>
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? <Trans>Select a token</Trans>
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

    if (balanceIn && tradeApprovalInfo) {
      const amountIn = tradeApprovalInfo.inputApprovalAmount
      if (Number(balanceIn.toExact()) < Number(amountIn.toExact())) {
        inputError = inputError ?? <Trans>Insufficient {balanceIn.currency.symbol}</Trans>
      }
    }

    if (balanceOut && tradeApprovalInfo) {
      const amountOut = tradeApprovalInfo.outputApprovalAmount
      if (Number(balanceOut.toExact()) < Number(amountOut.toExact())) {
        inputError = inputError ?? <Trans>Insufficient {balanceOut.currency.symbol}</Trans>
      }
    }

    return inputError
  }, [account, currencies, maxLeverage, parsedMargin, currencyBalances, parsedLeverageFactor, tradeApprovalInfo])

  // fetch trade outputs
  const retrieveTradeBool = useMemo(() => {
    if (
      !parsedMargin ||
      !parsedLeverageFactor ||
      parsedMargin.isLessThanOrEqualTo(0) ||
      !maxLeverage ||
      parsedMargin.isZero() ||
      (parsedLeverageFactor && maxLeverage && parsedLeverageFactor.gt(maxLeverage)) ||
      parsedLeverageFactor.isLessThanOrEqualTo(1)
    ) {
      return false
    } else {
      return true
    }
  }, [parsedMargin, parsedLeverageFactor, maxLeverage])

  // validate trade contract call
  const validateTradeBool = useMemo(() => {
    if (!inputError && retrieveTradeBool) {
      if (marginInPosToken && premiumInPosToken && outputApprovalState === ApprovalState.APPROVED) {
        return true
      } else if (
        marginInPosToken &&
        !premiumInPosToken &&
        inputApprovalState === ApprovalState.APPROVED &&
        outputApprovalState === ApprovalState.APPROVED
      ) {
        return true
      } else if (
        !marginInPosToken &&
        premiumInPosToken &&
        inputApprovalState === ApprovalState.APPROVED &&
        outputApprovalState === ApprovalState.APPROVED
      ) {
        return true
      } else if (!marginInPosToken && !premiumInPosToken && inputApprovalState === ApprovalState.APPROVED) {
        return true
      }
    }
    return false
  }, [inputError, retrieveTradeBool, marginInPosToken, premiumInPosToken, outputApprovalState, inputApprovalState])

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
    tradeApprovalInfo?.additionalPremium ?? undefined,
    retrieveTradeBool,
    validateTradeBool
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
      tradeApprovalInfo,
      positionKey,
      existingPosition,
      state,
      allowedSlippage,
      contractError,
      userPremiumPercent: rawUserPremiumPercent,
      maxLeverage,
      userHasSpecifiedInputOutput,
      parsedMargin,
      marginInPosToken,
      leverageLoading,
    }),
    [
      currencies,
      currencyBalances,
      inputError,
      trade,
      existingPosition,
      tradeApprovalInfo,
      state,
      allowedSlippage,
      positionKey,
      contractError,
      rawUserPremiumPercent,
      maxLeverage,
      userHasSpecifiedInputOutput,
      parsedMargin,
      marginInPosToken,
      leverageLoading,
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

const getLimitParamString = (margin: BN, leverageFactor: BN, limitPrice: BN, allowedSlippage: Percent) => {
  return `${margin.toString()}-${leverageFactor.toString()}-${limitPrice.toString()}-${allowedSlippage.toFixed(18)}`
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
  feePercent: BN
  deadline: string
  duration: number
  formattedLimitPrice: Price<Currency, Currency>
}

// const useSimulateAddLimitOrder = (
//   orderKey?: OrderPositionKey,
//   margin?: BN,
//   leverageFactor?: BN,
//   startingPrice?: BN,
//   baseCurrencyIsInputToken?: boolean,
//   pool?: Pool,
//   allowedSlippage?: Percent,
//   deadline?: BigNumber,
//   inputCurrency?: Currency,
//   outputCurrency?: Currency,
//   existingLimitPosition?: MarginLimitOrder,
//   additionalPremium?: CurrencyAmount<Currency>,
//   approvalState?: ApprovalState,
//   inputError?: ReactNode
// ): {
//   state: LimitTradeState
//   result?: AddLimitTrade
//   contractError?: ReactNode
// } => {
//   const chainId = useChainId()

//   const marginFacility = useMarginFacilityContract(true)
//   const blockNumber = useBlockNumber()
//   // const poolManager = useLmtPoolManagerContract()

//   // const [tradeState, setTradeState] = useState<LimitTradeState>(LimitTradeState.INVALID)
//   const [simulationError, setSimulationError] = useState<DecodedError>()
//   const [result, setResult] = useState<AddLimitTrade>()
//   const [syncing, setSyncing] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [lastBlockNumber, setBlockNumber] = useState<number>()
//   const [lastParams, setLastParams] = useState<string>()

//   const [orderDuration] = useUserLimitOrderTransactionTTL()
//   const feePercent = useLmtFeePercent(pool)

//   const computeData = useCallback(async () => {
//     if (
//       !pool ||
//       !margin ||
//       !blockNumber ||
//       !deadline ||
//       !orderKey ||
//       !leverageFactor ||
//       !startingPrice ||
//       !allowedSlippage ||
//       !inputCurrency ||
//       !outputCurrency ||
//       !marginFacility ||
//       !additionalPremium ||
//       !orderDuration ||
//       !feePercent ||
//       !chainId
//     ) {
//       return undefined
//     }

//     const poolAddress = computePoolAddress({
//       factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
//       tokenA: pool.token0,
//       tokenB: pool.token1,
//       fee: pool.fee,
//     })

//     const totalInput = new BN(margin).times(leverageFactor)
//     const totalInputWithFees = totalInput.times(new BN(1).minus(feePercent))
//     // if base is input then output / input.
//     const limitPrice = baseCurrencyIsInputToken ? startingPrice : new BN(1).div(startingPrice)

//     // we assume that starting price is output / input here.
//     const startOutput = totalInputWithFees.times(limitPrice)
//     const slippageBn = new BN(allowedSlippage.toFixed(18)).div(100)
//     const minOutput = totalInputWithFees.times(limitPrice).times(new BN(1).minus(slippageBn))

//     // decay rate defaults to zero
//     const decayRate = new BN('0')

//     const calldata = MarginFacilitySDK.submitLimitOrder({
//       orderKey,
//       margin: margin.shiftedBy(inputCurrency.decimals).toFixed(0),
//       pool: poolAddress,
//       isAdd: true,
//       deadline: deadline.toString(),
//       startOutput: startOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
//       minOutput: minOutput.shiftedBy(outputCurrency.decimals).toFixed(0),
//       inputAmount: totalInput.shiftedBy(inputCurrency.decimals).toFixed(0),
//       decayRate: decayRate.shiftedBy(18).toFixed(0),
//       depositPremium: new BN(additionalPremium.toExact()).shiftedBy(inputCurrency.decimals).toFixed(0),
//     })

//     setLastParams(getLimitParamString(margin, leverageFactor, limitPrice, allowedSlippage))

//     await marginFacility.callStatic.multicall(calldata)

//     const _result: AddLimitTrade = {
//       orderKey,
//       margin,
//       poolAddress,
//       startOutput,
//       decayRate,
//       allowedSlippage,
//       inputAmount: totalInput,
//       minOutput,
//       inputCurrencyId: inputCurrency.wrapped.address,
//       outputCurrencyId: outputCurrency.wrapped.address,
//       additionalPremium: new BN(additionalPremium.toExact()),
//       limitPrice,
//       duration: orderDuration,
//       deadline: deadline.toString(),
//       formattedLimitPrice: new Price(
//         outputCurrency,
//         inputCurrency,
//         limitPrice.shiftedBy(18).toFixed(0),
//         new BN(1).shiftedBy(18).toFixed(0)
//       ),
//       feePercent,
//     }

//     return {
//       result: _result,
//       params: getLimitParamString(margin, leverageFactor, limitPrice, allowedSlippage),
//     }
//   }, [
//     additionalPremium,
//     allowedSlippage,
//     baseCurrencyIsInputToken,
//     blockNumber,
//     chainId,
//     deadline,
//     feePercent,
//     inputCurrency,
//     leverageFactor,
//     margin,
//     marginFacility,
//     orderDuration,
//     orderKey,
//     outputCurrency,
//     pool,
//     startingPrice,
//   ])

//   const blocksPerFetch = 2

//   useEffect(() => {
//     if (!blockNumber || !chainId || !!inputError || approvalState !== ApprovalState.APPROVED) {
//       return
//     }

//     let paramsUnchanged = false
//     if (leverageFactor && startingPrice && margin && allowedSlippage) {
//       const limitPrice = baseCurrencyIsInputToken ? startingPrice : new BN(1).div(startingPrice)
//       const params = getLimitParamString(margin, leverageFactor, limitPrice, allowedSlippage)
//       if (lastParams === params) {
//         paramsUnchanged = true
//       }
//     }

//     // regardless of error or not, if the params are unchanged, don't refetch until next interval
//     if (paramsUnchanged && lastBlockNumber && lastBlockNumber + blocksPerFetch >= blockNumber) {
//       return
//     }

//     if (loading && !lastParams) {
//       return
//     }

//     if (syncing) {
//       return
//     }

//     if (lastParams && paramsUnchanged) {
//       setSyncing(true)
//     } else {
//       setLoading(true)
//     }

//     computeData()
//       .then((data) => {
//         if (!data) {
//           setSimulationError({
//             type: ErrorType.EmptyError,
//             error: 'missing params',
//             data: undefined,
//           })
//           setLastParams(undefined)
//           setResult(undefined)
//           setLoading(false)
//           setSyncing(false)
//         } else {
//           // console.log('fetching9', _result, to, calldata)
//           const { result: _result, params } = data
//           setResult(_result)
//           setSimulationError(undefined)
//           setLoading(false)
//           setSyncing(false)
//         }
//         setBlockNumber(blockNumber)
//       })
//       .catch((err) => {
//         // console.log('fetching10')
//         setSimulationError(parseContractError(err))
//         // setLastParams(undefined)
//         setResult(undefined)
//         setLoading(false)
//         setSyncing(false)
//         setBlockNumber(blockNumber)
//       })
//   }, [
//     baseCurrencyIsInputToken,
//     blockNumber,
//     chainId,
//     computeData,
//     inputError,
//     lastBlockNumber,
//     lastParams,
//     leverageFactor,
//     loading,
//     margin,
//     simulationError,
//     startingPrice,
//     syncing,
//     allowedSlippage,
//     approvalState,
//   ])

//   const contractError = useMemo(() => {
//     let error: ReactNode | undefined

//     if (simulationError) {
//       error = <Trans>{getErrorMessage(simulationError)}</Trans>
//     }

//     return error
//   }, [simulationError])

//   return useMemo(() => {
//     let tradeState: LimitTradeState = LimitTradeState.INVALID
//     if (loading) {
//       tradeState = LimitTradeState.LOADING
//     } else if (syncing) {
//       tradeState = LimitTradeState.SYNCING
//     } else if (simulationError) {
//       tradeState = LimitTradeState.INVALID
//     }

//     const limitPrice = startingPrice
//       ? baseCurrencyIsInputToken
//         ? startingPrice
//         : new BN(1).div(startingPrice)
//       : undefined

//     if (!margin || !leverageFactor || !startingPrice) {
//       return {
//         state: LimitTradeState.INVALID,
//         contractError,
//         result: undefined,
//       }
//     } else if (limitPrice && margin && leverageFactor && allowedSlippage) {
//       const params = getLimitParamString(margin, leverageFactor, limitPrice, allowedSlippage)
//       if (lastParams === params && !simulationError && result) {
//         return {
//           state: LimitTradeState.VALID,
//           contractError,
//           result,
//         }
//       }
//     }
//     return {
//       state: tradeState,
//       contractError,
//       result: undefined,
//     }
//   }, [
//     contractError,
//     result,
//     margin,
//     leverageFactor,
//     startingPrice,
//     allowedSlippage,
//     baseCurrencyIsInputToken,
//     loading,
//     lastParams,
//     syncing,
//     simulationError,
//   ])
// }

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
  retrieveTradeBool?: boolean,
  validateTradeBool?: boolean
): {
  state: LeverageTradeState
  result?: AddMarginTrade
  contractError?: ReactNode
} => {
  const marginFacility = useMarginFacilityContract(true)
  const chainId = useChainId()
  const blockNumber = useBlockNumber()

  const deadline = useTransactionDeadline()

  const account = useAccount().address

  const provider = useEthersProvider({ chainId })

  const feePercent = useLmtFeePercent(pool)

  const quoter = useLmtQuoterContract()

  const tradeQueryKey = useMemo(() => {
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
      !retrieveTradeBool ||
      !feePercent
    ) {
      return []
    }

    return [
      'fetchMarginTrade',
      marginInInput.toString(),
      marginInOutput.toString(),
      borrowAmount.toString(),
      inputCurrency.wrapped.address,
      outputCurrency.wrapped.address,
      pool.fee,
      allowedSlippage.toSignificant(5),
      additionalPremium.toExact(),
      marginInPosToken,
      feePercent.toString(),
      account ?? ZERO_ADDRESS,
      retrieveTradeBool,
    ]
  }, [
    validateTradeBool,
    retrieveTradeBool,
    marginInInput,
    marginInOutput,
    borrowAmount,
    inputCurrency,
    account,
    outputCurrency,
    pool,
    allowedSlippage,
    deadline,
    additionalPremium,
    quoter,
    marginInPosToken,
    blockNumber,
    feePercent,
  ])

  const getTrade = useCallback(async () => {
    if (retrieveTradeBool) {
      if (
        !quoter ||
        !pool ||
        !inputCurrency ||
        !outputCurrency ||
        !borrowAmount ||
        !additionalPremium ||
        !marginInInput ||
        !marginInOutput ||
        !feePercent
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
        trader: account ? account : ZERO_ADDRESS,
      })

      const swapInput = new BN(quoterResult.swapInput.toString()).shiftedBy(-inputDecimals)
      const minimumOutput = swapInput.times(currentPrice).times(new BN(1).minus(bnAllowedSlippage))

      const executionPrice = new Price<Currency, Currency>(
        inputCurrency,
        outputCurrency,
        quoterResult.swapInput.toString(),
        !marginInPosToken
          ? quoterResult.positionOutput.toString()
          : new BN(quoterResult.positionOutput.toString())
              .minus(marginInOutput.shiftedBy(outputCurrency.decimals))
              .toFixed(0)
      )

      const result: AddMarginTrade = {
        inputCurrencySymbol: inputCurrency.symbol ?? '',
        outputCurrencySymbol: outputCurrency.symbol ?? '',
        margin: marginInPosToken ? marginInOutput : marginInInput,
        borrowAmount,
        minimumOutput,
        expectedAddedOutput: new BN(quoterResult.positionOutput.toString()).shiftedBy(-outputCurrency.decimals),
        allowedSlippage,
        premium: new BN(additionalPremium.toExact()),
        fees: new BN(quoterResult.feeAmount.toString()).shiftedBy(-inputCurrency.decimals),
        swapInput: new BN(quoterResult.swapInput.toString()).shiftedBy(-inputCurrency.decimals),
        inputIsToken0,
        executionPrice,
        borrowRate: new BN(quoterResult.borrowRate.toString())
          .shiftedBy(-18)
          .div(365 * 24)
          .times(100),
        swapFee: new BN(swapInput.times(pool.fee).div(1e6)),
        marginInPosToken,
        premiumInPosToken,
        marginInInput,
        marginInOutput,
        feePercent,
        liquidityNotFound: Number(quoterResult.found.toString()) === 0,
      }

      return result
    }

    throw new Error('trade not enabled')
  }, [
    retrieveTradeBool,
    account,
    marginInPosToken,
    borrowAmount,
    feePercent,
    inputCurrency,
    outputCurrency,
    marginInOutput,
    marginInInput,
    allowedSlippage,
    pool,
    inputIsToken0,
    additionalPremium,
    existingPosition,
    quoter,
  ])

  const validateQueryKey = useMemo(() => {
    if (
      !pool ||
      !marginInInput ||
      !marginInOutput ||
      !borrowAmount ||
      !inputCurrency ||
      !outputCurrency ||
      !additionalPremium ||
      !marginFacility ||
      !allowedSlippage ||
      !deadline ||
      inputIsToken0 === undefined ||
      !feePercent ||
      !positionKey ||
      !account ||
      marginInPosToken === undefined ||
      premiumInPosToken === undefined
    ) {
      return []
    }

    return [
      'validateTrade',
      inputCurrency.wrapped.address,
      outputCurrency.wrapped.address,
      pool.fee,
      allowedSlippage.toSignificant(5),
      account,
      marginInPosToken,
      premiumInPosToken,
      marginInInput.toString(),
      marginInOutput.toString(),
      borrowAmount.toString(),
    ]
  }, [
    pool,
    inputIsToken0,
    marginInInput,
    marginInOutput,
    borrowAmount,
    inputCurrency,
    outputCurrency,
    additionalPremium,
    allowedSlippage,
    marginFacility,
    deadline,
    feePercent,
    positionKey,
    account,
    marginInPosToken,
    premiumInPosToken,
  ])

  const validateTrade = useCallback(async () => {
    if (
      !pool ||
      !marginInInput ||
      !marginInOutput ||
      !borrowAmount ||
      !inputCurrency ||
      !outputCurrency ||
      !additionalPremium ||
      !marginFacility ||
      !allowedSlippage ||
      !deadline ||
      inputIsToken0 === undefined ||
      !feePercent ||
      !positionKey ||
      !account ||
      !validateTradeBool
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

    const params = {
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
        .shiftedBy(premiumInPosToken ? outputCurrency.decimals : inputCurrency.decimals)
        .toFixed(0),
      slippedTickMin,
      slippedTickMax,
      marginInPosToken,
      premiumInPosToken,
      minPremiumOutput,
    }

    const calldata = MarginFacilitySDK.addPositionParameters(params)

    const multicallResult = await marginFacility.callStatic.multicall(calldata)

    const { totalPosition: newTotalPosition, fees } = MarginFacilitySDK.decodeAddPositionResult(multicallResult[1])

    let expectedAddedOutput: JSBI
    if (existingPosition && existingPosition.openTime > 0) {
      expectedAddedOutput = JSBI.subtract(newTotalPosition, BnToJSBI(existingPosition.totalPosition, outputCurrency))
    } else {
      expectedAddedOutput = newTotalPosition
    }

    const executionPrice = new Price<Currency, Currency>(
      inputCurrency,
      outputCurrency,
      swapInput.shiftedBy(inputCurrency.decimals).toFixed(0),
      !marginInPosToken
        ? expectedAddedOutput.toString()
        : new BN(expectedAddedOutput.toString()).minus(marginInOutput.shiftedBy(outputCurrency.decimals)).toFixed(0)
    )

    return {
      fees: new BN(fees.toString()).shiftedBy(-inputCurrency.decimals),
      expectedAddedOutput: new BN(expectedAddedOutput.toString()).shiftedBy(-outputCurrency.decimals),
      executionPrice,
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
    marginInInput,
    marginInOutput,
    provider,
    chainId,
    deadline,
    feePercent,
    marginInPosToken,
    premiumInPosToken,
    account,
    validateTradeBool,
  ])

  const {
    data: tradeData,
    error: tradeError,
    isLoading: tradeIsLoading,
  } = useQuery({
    queryKey: tradeQueryKey,
    queryFn: getTrade,
    enabled: tradeQueryKey.length > 0,
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 15,
  })

  const { error: validateError } = useQuery({
    queryKey: validateQueryKey,
    enabled: validateQueryKey.length > 0 && validateTradeBool,
    queryFn: validateTrade,
    retry: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 15,
  })

  const contractError = useMemo(() => {
    let _error: ReactNode | undefined

    if (retrieveTradeBool && tradeError && tradeQueryKey.length > 0) {
      _error = <Trans>{getErrorMessage(parseContractError(tradeError))}</Trans>
    }

    if (retrieveTradeBool && tradeData?.liquidityNotFound) {
      _error = <Trans>Insufficient Liquidity</Trans>
    }

    if (validateError && validateTradeBool && validateQueryKey.length > 0) {
      _error = <Trans>{getErrorMessage(parseContractError(validateError))}</Trans>
    }
    return _error
  }, [tradeError, validateTradeBool, retrieveTradeBool, tradeData])

  return useMemo(() => {
    if (retrieveTradeBool || validateTradeBool) {
      const error = contractError
      const loading = tradeIsLoading
      if (error) {
        return {
          state: LeverageTradeState.INVALID,
          contractError,
          result: undefined,
        }
      }
      return {
        state: loading ? LeverageTradeState.LOADING : LeverageTradeState.VALID,
        contractError,
        result: tradeData,
      }
    }
    return {
      state: LeverageTradeState.INVALID,
      contractError,
      result: undefined,
    }
  }, [contractError, tradeData, tradeIsLoading, retrieveTradeBool, validateTradeBool, tradeError])
}

export const BnToJSBI = (x: BN, currency: Currency): JSBI => {
  return JSBI.BigInt(x.shiftedBy(currency.decimals).toFixed(0))
}

export const BnToCurrencyAmount = (x: BN, currency: Currency): CurrencyAmount<Currency> => {
  return CurrencyAmount.fromRawAmount(currency, x.shiftedBy(currency.decimals).toFixed(0))
}
export const updatedPremiumFromAdjustedDuration = (
  duration: BN | undefined,
  executionPrice: Price<Currency, Currency>,
  borrowRate: BN,
  borrowAmount: BN,
  premiumInPosToken: boolean
) => {
  try {
    const result =
      duration && premiumInPosToken
        ? duration?.times(executionPrice.toFixed(8)).times(borrowRate).times(borrowAmount).div(100)
        : duration && !premiumInPosToken
        ? duration?.times(borrowRate).times(borrowAmount).div(100)
        : undefined
    return result
  } catch (err) {
    return undefined
  }
}
