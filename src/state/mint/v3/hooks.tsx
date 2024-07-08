import { defaultAbiCoder } from '@ethersproject/abi'
import { keccak256 } from '@ethersproject/solidity'
import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Currency, CurrencyAmount, Percent, Price, Rounding, Token, validateAndParseAddress } from '@uniswap/sdk-core'
import {
  encodeSqrtRatioX96,
  FeeAmount,
  nearestUsableTick,
  Pool,
  Position,
  priceToClosestTick,
  TickMath,
  tickToPrice,
  toHex,
} from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { LMT_NFPM_V2, LMT_NFT_POSITION_MANAGER } from 'constants/addresses'
import { id } from 'ethers/lib/utils'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useArgentWalletContract } from 'hooks/useArgentWalletContract'
import { useLmtPoolManagerContract, useNFPMV2 } from 'hooks/useContract'
import { useContractCallV2 } from 'hooks/useContractCall'
import { usePool } from 'hooks/usePools'
import JSBI from 'jsbi'
import { useSingleCallResult } from 'lib/hooks/multicall'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ReactNode, useCallback, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'
import { DecodedError } from 'utils/ethersErrorHandler/types'
import { getTickToPrice } from 'utils/getTickToPrice'
import { getErrorMessage, parseContractError } from 'utils/lmtSDK/errors'
import { LmtLpPosition } from 'utils/lmtSDK/LpPosition'
import { NonfungiblePositionManager } from 'utils/lmtSDK/NFTPositionManager'
import { useAccount, useChainId } from 'wagmi'

import { BIG_INT_ZERO, ZERO_PERCENT } from '../../../constants/misc'
import { PoolState } from '../../../hooks/usePools'
import { useCurrencyBalances } from '../../connection/hooks'
import { AppState } from '../../types'
import {
  Bound,
  Field,
  setFullRange,
  typeInput,
  typeLeftRangeInput,
  typeRightRangeInput,
  typeStartPriceInput,
} from './actions'
import { tryParseLmtTick } from './utils'

export function useV3MintState(): AppState['mintV3'] {
  return useAppSelector((state) => state.mintV3)
}

const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

export function useV3MintActionHandlers(noLiquidity: boolean | undefined): {
  onFieldAInput: (typedValue: string) => void
  onFieldBInput: (typedValue: string) => void
  onLeftRangeInput: (typedValue: string) => void
  onRightRangeInput: (typedValue: string) => void
  onStartPriceInput: (typedValue: string) => void
} {
  const dispatch = useAppDispatch()

  const onFieldAInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.CURRENCY_A, typedValue, noLiquidity: noLiquidity === true }))
    },
    [dispatch, noLiquidity]
  )

  const onFieldBInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ field: Field.CURRENCY_B, typedValue, noLiquidity: noLiquidity === true }))
    },
    [dispatch, noLiquidity]
  )

  const [searchParams, setSearchParams] = useSearchParams()

  const onLeftRangeInput = useCallback(
    (typedValue: string) => {
      dispatch(typeLeftRangeInput({ typedValue }))
      const paramMinPrice = searchParams.get('minPrice')
      if (!paramMinPrice || (paramMinPrice && paramMinPrice !== typedValue)) {
        searchParams.set('minPrice', typedValue)
        setSearchParams(searchParams)
      }
    },
    [dispatch, searchParams, setSearchParams]
  )

  const onRightRangeInput = useCallback(
    (typedValue: string) => {
      dispatch(typeRightRangeInput({ typedValue }))
      const paramMaxPrice = searchParams.get('maxPrice')
      if (!paramMaxPrice || (paramMaxPrice && paramMaxPrice !== typedValue)) {
        searchParams.set('maxPrice', typedValue)
        setSearchParams(searchParams)
      }
    },
    [dispatch, searchParams, setSearchParams]
  )

  const onStartPriceInput = useCallback(
    (typedValue: string) => {
      dispatch(typeStartPriceInput({ typedValue }))
    },
    [dispatch]
  )

  return {
    onFieldAInput,
    onFieldBInput,
    onLeftRangeInput,
    onRightRangeInput,
    onStartPriceInput,
  }
}

const useSimulateMint = (
  enabled: boolean,
  position?: LmtLpPosition,
  allowedSlippage?: Percent,
  account?: string
): { contractError: DecodedError | undefined; success: boolean } => {
  const nfpm = useNFPMV2(true)

  const simulate = useCallback(async () => {
    if (!position || !allowedSlippage || !account || !nfpm) {
      throw new Error('missing parameter')
    }
    const { amount0: amount0Max, amount1: amount1Max } = position.mintAmounts

    // adjust for slippage
    // const minimumAmounts = position.mintAmountsWithSlippage(options.slippageTolerance)

    const deadline = toHex(Math.floor(new Date().getTime() / 1000 + 20 * 60).toString())
    const amount0Desired = new BN(amount0Max.toString()).times(1000).div(1001).toFixed(0)
    const amount1Desired = new BN(amount1Max.toString()).times(1000).div(1001).toFixed(0)

    const minimumAmounts = position.customMintAmountsWithSlippage(
      JSBI.BigInt(amount0Desired),
      JSBI.BigInt(amount1Desired),
      allowedSlippage
    )

    const amount0Min = minimumAmounts.amount0.toString()
    const amount1Min = minimumAmounts.amount1.toString()

    const recipient: string = validateAndParseAddress(account)

    nfpm.callStatic.mint({
      token0: position.pool.token0.address,
      token1: position.pool.token1.address,
      fee: position.pool.fee,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      amount0Desired,
      amount1Desired,
      amount0Max: amount0Max.toString(),
      amount1Max: amount1Max.toString(),
      amount0Min,
      amount1Min,
      recipient,
      deadline,
    })

    return true
  }, [nfpm, position, allowedSlippage, account])

  const queryKey = useMemo(() => {
    if (enabled && position && allowedSlippage && account) {
      return ['simulateMint', position.amount0.toString(), position.amount1.toString(), allowedSlippage.toString()]
    } else {
      return []
    }
  }, [position, allowedSlippage, account, nfpm])
  const queryEnabled = queryKey.length > 0 && enabled
  const { isError, error } = useQuery({
    enabled: queryEnabled,
    queryKey,
    queryFn: simulate,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  return useMemo(() => {
    if (isError && enabled && error) {
      return { contractError: parseContractError(error), success: false }
    }
    return { contractError: undefined, success: true }
  }, [isError])
}

const useSimulateV1Mint = (
  enabled: boolean,
  hasExistingPosition?: boolean,
  tokenId?: string,
  position?: LmtLpPosition,
  allowedSlippage?: Percent,
  account?: string
): { contractError: DecodedError | undefined; success: boolean } => {
  const calldata = useMemo(() => {
    if (position && allowedSlippage && account) {
      return hasExistingPosition && tokenId
        ? NonfungiblePositionManager.addCallParameters(position, {
            tokenId,
            slippageTolerance: allowedSlippage,
            deadline: Math.floor(new Date().getTime() / 1000 + 20 * 60).toString(),
          }).calldata
        : NonfungiblePositionManager.addCallParameters(position, {
            slippageTolerance: allowedSlippage,
            recipient: account,
            deadline: Math.floor(new Date().getTime() / 1000 + 20 * 60).toString(),
          }).calldata
    } else {
      return undefined
    }
  }, [allowedSlippage, account, hasExistingPosition, position, tokenId])

  const { result, loading, error } = useContractCallV2(
    LMT_NFT_POSITION_MANAGER,
    calldata,
    ['addLiquidity', calldata ? id(calldata) : ''],
    true,
    enabled && !!calldata ? true : false
  )

  return useMemo(() => {
    if (error) {
      return { contractError: parseContractError(error), success: false }
    } else if (result && !loading) {
      return { contractError: undefined, success: true }
    }
    return { contractError: undefined, success: false }
  }, [error, loading, result])
}

export function useDerivedV1LmtMintInfo(
  currencyA?: Currency,
  currencyB?: Currency,
  feeAmount?: FeeAmount,
  baseCurrency?: Currency,
  existingPosition?: Position
): {
  pool?: Pool | null
  poolState: PoolState
  ticks: { [bound in Bound]?: number | undefined }
  price?: Price<Token, Token>
  pricesAtTicks: {
    [bound in Bound]?: Price<Token, Token> | undefined
  }
  pricesAtLimit: {
    [bound in Bound]?: Price<Token, Token> | undefined
  }
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  dependentField: Field
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  position: LmtLpPosition | undefined
  noLiquidity?: boolean
  errorMessage?: ReactNode
  invalidPool: boolean
  outOfRange: boolean
  invalidRange: boolean
  depositADisabled: boolean
  depositBDisabled: boolean
  invertPrice: boolean
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
  contractErrorMessage: ReactNode | undefined
} {
  const account = useAccount().address
  const chainId = useChainId()

  const { independentField, typedValue, leftRangeTypedValue, rightRangeTypedValue, startPriceTypedValue } =
    useV3MintState()

  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  const { tickDiscretization } = useTickDiscretization(
    currencyA?.wrapped.address,
    currencyB?.wrapped.address,
    feeAmount
  )

  // currencies
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA,
      [Field.CURRENCY_B]: currencyB,
    }),
    [currencyA, currencyB]
  )

  // formatted with tokens
  const [tokenA, tokenB, baseToken] = useMemo(
    () => [currencyA?.wrapped, currencyB?.wrapped, baseCurrency?.wrapped],
    [currencyA, currencyB, baseCurrency]
  )

  const [token0, token1] = useMemo(
    () =>
      tokenA && tokenB ? (tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]) : [undefined, undefined],
    [tokenA, tokenB]
  )

  // balances
  const balances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B]], [currencies])
  )
  const currencyBalances: { [field in Field]?: CurrencyAmount<Currency> } = {
    [Field.CURRENCY_A]: balances[0],
    [Field.CURRENCY_B]: balances[1],
  }

  // pool
  const [poolState, pool] = usePool(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B], feeAmount)
  const noLiquidity = poolState === PoolState.NOT_EXISTS

  // note to parse inputs in reverse
  const invertPrice = Boolean(baseToken && token0 && !baseToken.equals(token0))

  // always returns the price with 0 as base token
  const price: Price<Token, Token> | undefined = useMemo(() => {
    // if no liquidity use typed value
    if (noLiquidity) {
      const parsedQuoteAmount = tryParseCurrencyAmount(startPriceTypedValue, invertPrice ? token0 : token1)
      if (parsedQuoteAmount && token0 && token1) {
        const baseAmount = tryParseCurrencyAmount('1', invertPrice ? token1 : token0)
        const price =
          baseAmount && parsedQuoteAmount
            ? new Price(
                baseAmount.currency,
                parsedQuoteAmount.currency,
                baseAmount.quotient,
                parsedQuoteAmount.quotient
              )
            : undefined
        return (invertPrice ? price?.invert() : price) ?? undefined
      }
      return undefined
    } else {
      // get the amount of quote currency
      return pool && token0 ? pool.priceOf(token0) : undefined
    }
  }, [noLiquidity, startPriceTypedValue, invertPrice, token1, token0, pool])

  // check for invalid price input (converts to invalid ratio)
  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined
    return (
      price &&
      sqrtRatioX96 &&
      !(
        JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO) &&
        JSBI.lessThan(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)
      )
    )
  }, [price])

  // used for ratio calculation when pool not initialized
  const mockPool = useMemo(() => {
    if (tokenA && tokenB && feeAmount && price && !invalidPrice) {
      const currentTick = priceToClosestTick(price)
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick)
      return new Pool(tokenA, tokenB, feeAmount, currentSqrt, JSBI.BigInt(0), currentTick, [])
    } else {
      return undefined
    }
  }, [feeAmount, invalidPrice, price, tokenA, tokenB])

  // if pool exists use it, if not use the mock pool
  const poolForPosition: Pool | undefined = pool ?? mockPool

  // lower and upper limits in the tick space for `feeAmoun<Trans>
  const tickSpaceLimits = useMemo(
    () => ({
      [Bound.LOWER]: tickDiscretization ? nearestUsableTick(TickMath.MIN_TICK, tickDiscretization) : undefined,
      [Bound.UPPER]: tickDiscretization ? nearestUsableTick(TickMath.MAX_TICK, tickDiscretization) : undefined,
    }),
    [tickDiscretization]
  )

  // parse typed range values and determine closest ticks
  // lower should always be a smaller tick
  const ticks = useMemo(() => {
    return {
      [Bound.LOWER]:
        typeof existingPosition?.tickLower === 'number'
          ? existingPosition.tickLower
          : (invertPrice && typeof rightRangeTypedValue === 'boolean') ||
            (!invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.LOWER]
          : invertPrice
          ? tryParseLmtTick(token1, token0, feeAmount, rightRangeTypedValue.toString(), tickDiscretization, true)
          : tryParseLmtTick(token0, token1, feeAmount, leftRangeTypedValue.toString(), tickDiscretization, true),
      [Bound.UPPER]:
        typeof existingPosition?.tickUpper === 'number'
          ? existingPosition.tickUpper
          : (!invertPrice && typeof rightRangeTypedValue === 'boolean') ||
            (invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.UPPER]
          : invertPrice
          ? tryParseLmtTick(token1, token0, feeAmount, leftRangeTypedValue.toString(), tickDiscretization)
          : tryParseLmtTick(token0, token1, feeAmount, rightRangeTypedValue.toString(), tickDiscretization),
    }
  }, [
    existingPosition,
    feeAmount,
    invertPrice,
    leftRangeTypedValue,
    rightRangeTypedValue,
    token0,
    token1,
    tickSpaceLimits,
    tickDiscretization,
  ])

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {}

  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: feeAmount && tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: feeAmount && tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper, feeAmount]
  )

  // mark invalid range
  const invalidRange = Boolean(typeof tickLower === 'number' && typeof tickUpper === 'number' && tickLower >= tickUpper)

  const pricesAtLimit = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, tickSpaceLimits.LOWER),
      [Bound.UPPER]: getTickToPrice(token0, token1, tickSpaceLimits.UPPER),
    }
  }, [token0, token1, tickSpaceLimits.LOWER, tickSpaceLimits.UPPER])

  // always returns the price with 0 as base token
  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
    }
  }, [token0, token1, ticks])
  const { [Bound.LOWER]: lowerPrice, [Bound.UPPER]: upperPrice } = pricesAtTicks

  // liquidity range warning
  const outOfRange = Boolean(
    !invalidRange && price && lowerPrice && upperPrice && (price.lessThan(lowerPrice) || price.greaterThan(upperPrice))
  )

  // amounts
  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    typedValue,
    currencies[independentField]
  )

  // console.log(
  //   'zeke:',
  //   independentAmount,
  //   typeof tickLower === 'number',
  //   typeof tickUpper === 'number',
  //   poolForPosition,
  //   invalidRange,
  //   outOfRange
  // )
  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    // we wrap the currencies just to get the price in terms of the other token
    const wrappedIndependentAmount = independentAmount?.wrapped
    const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA
    if (
      independentAmount &&
      wrappedIndependentAmount &&
      typeof tickLower === 'number' &&
      typeof tickUpper === 'number' &&
      poolForPosition
    ) {
      // if price is out of range or invalid range - return 0 (single deposit will be independent)
      if (outOfRange || invalidRange) {
        return undefined
      }

      const position: Position | undefined = wrappedIndependentAmount.currency.equals(poolForPosition.token0)
        ? Position.fromAmount0({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount0: independentAmount.quotient,
            useFullPrecision: true, // we want full precision for the theoretical position
          })
        : Position.fromAmount1({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount1: independentAmount.quotient,
          })

      const dependentTokenAmount = wrappedIndependentAmount.currency.equals(poolForPosition.token0)
        ? position.amount1
        : position.amount0
      return dependentCurrency && CurrencyAmount.fromRawAmount(dependentCurrency, dependentTokenAmount.quotient)
    }

    return undefined
  }, [
    independentAmount,
    outOfRange,
    dependentField,
    currencyB,
    currencyA,
    tickLower,
    tickUpper,
    poolForPosition,
    invalidRange,
  ])

  const parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    }
  }, [dependentAmount, independentAmount, independentField])

  // single deposit only if price is out of range
  const deposit0Disabled = Boolean(
    typeof tickUpper === 'number' && poolForPosition && poolForPosition.tickCurrent >= tickUpper
  )
  const deposit1Disabled = Boolean(
    typeof tickLower === 'number' && poolForPosition && poolForPosition.tickCurrent <= tickLower
  )

  // sorted for token order
  const depositADisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenA && poolForPosition.token0.equals(tokenA)) ||
        (deposit1Disabled && poolForPosition && tokenA && poolForPosition.token1.equals(tokenA))
    )
  const depositBDisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenB && poolForPosition.token0.equals(tokenB)) ||
        (deposit1Disabled && poolForPosition && tokenB && poolForPosition.token1.equals(tokenB))
    )

  // create position entity based on users selection
  const position: LmtLpPosition | undefined = useMemo(() => {
    if (
      !poolForPosition ||
      !tokenA ||
      !tokenB ||
      typeof tickLower !== 'number' ||
      typeof tickUpper !== 'number' ||
      invalidRange
    ) {
      return undefined
    }

    // mark as 0 if disabled because out of range
    const amount0 = !deposit0Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_A : Field.CURRENCY_B]?.quotient
      : BIG_INT_ZERO
    const amount1 = !deposit1Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_B : Field.CURRENCY_A]?.quotient
      : BIG_INT_ZERO

    if (amount0 !== undefined && amount1 !== undefined) {
      return LmtLpPosition.fromAmounts({
        pool: poolForPosition,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        useFullPrecision: true, // we want full precision for the theoretical position
      })
    } else {
      return undefined
    }
  }, [
    parsedAmounts,
    poolForPosition,
    tokenA,
    tokenB,
    deposit0Disabled,
    deposit1Disabled,
    invalidRange,
    tickLower,
    tickUpper,
  ])

  let errorMessage: ReactNode | undefined
  if (!account) {
    errorMessage = <Trans>Connect Wallet</Trans>
  }

  if (poolState === PoolState.INVALID) {
    errorMessage = errorMessage ?? <Trans>Invalid pair</Trans>
  }

  if (invalidPrice) {
    errorMessage = errorMessage ?? <Trans>Invalid price input</Trans>
  }

  if (
    (!parsedAmounts[Field.CURRENCY_A] && !depositADisabled) ||
    (!parsedAmounts[Field.CURRENCY_B] && !depositBDisabled)
  ) {
    errorMessage = errorMessage ?? <Trans>Enter an amount</Trans>
  }

  const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts
  if (
    currencyA &&
    currencyAAmount &&
    currencyBalances?.[Field.CURRENCY_A]?.lessThan(
      currencyAAmount.add(CurrencyAmount.fromRawAmount(currencyA, JSBI.BigInt(0)))
    )
  ) {
    errorMessage = <Trans>Insufficient {currencies[Field.CURRENCY_A]?.symbol} balance</Trans>
  }

  if (
    currencyB &&
    currencyBAmount &&
    currencyBalances?.[Field.CURRENCY_B]?.lessThan(
      currencyBAmount.add(CurrencyAmount.fromRawAmount(currencyB, JSBI.BigInt(0)))
    )
  ) {
    errorMessage = <Trans>Insufficient {currencies[Field.CURRENCY_B]?.symbol} balance</Trans>
  }

  const invalidPool = poolState === PoolState.INVALID

  const argentWalletContract = useArgentWalletContract()
  const allowedSlippage = useUserSlippageToleranceWithDefault(
    outOfRange ? ZERO_PERCENT : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE
  )

  const [approvalAmountA, approvalAmountB] = useMemo(() => {
    return [parsedAmounts[Field.CURRENCY_A], parsedAmounts[Field.CURRENCY_B]]
  }, [parsedAmounts])
  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    argentWalletContract ? undefined : approvalAmountA,
    chainId ? LMT_NFT_POSITION_MANAGER[chainId] : undefined
  )

  const [approvalB, approveBCallback] = useApproveCallback(
    argentWalletContract ? undefined : approvalAmountB,
    chainId ? LMT_NFT_POSITION_MANAGER[chainId] : undefined
  )

  const showApprovalA =
    !argentWalletContract && approvalA !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_A]
  const showApprovalB =
    !argentWalletContract && approvalB !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_B]

  const simulateEnabled =
    !errorMessage && !invalidPool && !invalidRange && !showApprovalA && !showApprovalB && !!account

  const hasExistingPosition = !!existingPosition
  const { tokenId } = useParams<{ currencyIdA?: string; currencyIdB?: string; feeAmount?: string; tokenId?: string }>()

  const { contractError, success } = useSimulateV1Mint(
    simulateEnabled,
    hasExistingPosition,
    tokenId,
    position,
    allowedSlippage,
    account
  )

  const contractErrorMessage = useMemo(() => {
    let message: ReactNode | undefined
    if (contractError) {
      message = <Trans>{getErrorMessage(contractError)}</Trans>
    }
    return message
  }, [contractError])

  return {
    dependentField,
    currencies,
    pool,
    poolState,
    currencyBalances,
    parsedAmounts,
    ticks,
    price,
    pricesAtTicks,
    pricesAtLimit,
    position,
    noLiquidity,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
    contractErrorMessage,
  }
}

export function useDerivedLmtMintInfo(
  currencyA?: Currency,
  currencyB?: Currency,
  feeAmount?: FeeAmount,
  baseCurrency?: Currency,
  quoteCurrency?: Currency
): {
  pool?: Pool | null
  poolState: PoolState
  ticks: { [bound in Bound]?: number | undefined }
  price?: Price<Token, Token>
  pricesAtTicks: {
    [bound in Bound]?: Price<Token, Token> | undefined
  }
  pricesAtLimit: {
    [bound in Bound]?: Price<Token, Token> | undefined
  }
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  dependentField: Field
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  position: LmtLpPosition | undefined
  noLiquidity?: boolean
  errorMessage?: ReactNode
  invalidPool: boolean
  outOfRange: boolean
  invalidRange: boolean
  depositADisabled: boolean
  depositBDisabled: boolean
  invertPrice: boolean
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
  contractErrorMessage: ReactNode | undefined
} {
  const account = useAccount().address
  const chainId = useChainId()

  const { independentField, typedValue, leftRangeTypedValue, rightRangeTypedValue, startPriceTypedValue } =
    useV3MintState()

  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  const { tickDiscretization } = useTickDiscretization(
    currencyA?.wrapped.address,
    currencyB?.wrapped.address,
    feeAmount
  )

  // currencies
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA,
      [Field.CURRENCY_B]: currencyB,
    }),
    [currencyA, currencyB]
  )

  // formatted with tokens
  const [tokenA, tokenB, baseToken] = useMemo(
    () => [currencyA?.wrapped, currencyB?.wrapped, baseCurrency?.wrapped],
    [currencyA, currencyB, baseCurrency]
  )

  const [token0, token1] = useMemo(
    () =>
      tokenA && tokenB ? (tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]) : [undefined, undefined],
    [tokenA, tokenB]
  )

  // balances
  const balances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B]], [currencies])
  )
  const currencyBalances: { [field in Field]?: CurrencyAmount<Currency> } = {
    [Field.CURRENCY_A]: balances[0],
    [Field.CURRENCY_B]: balances[1],
  }

  // pool
  const [poolState, pool] = usePool(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B], feeAmount)
  const noLiquidity = poolState === PoolState.NOT_EXISTS

  // note to parse inputs in reverse
  const invertPrice = Boolean(baseToken && token0 && !baseToken.equals(token0))

  // always returns the price with 0 as base token
  const price: Price<Token, Token> | undefined = useMemo(() => {
    // if no liquidity use typed value
    if (noLiquidity) {
      const parsedQuoteAmount = tryParseCurrencyAmount(startPriceTypedValue, invertPrice ? token0 : token1)
      if (parsedQuoteAmount && token0 && token1) {
        const baseAmount = tryParseCurrencyAmount('1', invertPrice ? token1 : token0)
        const price =
          baseAmount && parsedQuoteAmount
            ? new Price(
                baseAmount.currency,
                parsedQuoteAmount.currency,
                baseAmount.quotient,
                parsedQuoteAmount.quotient
              )
            : undefined
        return (invertPrice ? price?.invert() : price) ?? undefined
      }
      return undefined
    } else {
      // get the amount of quote currency
      return pool && token0 ? pool.priceOf(token0) : undefined
    }
  }, [noLiquidity, startPriceTypedValue, invertPrice, token1, token0, pool])

  // check for invalid price input (converts to invalid ratio)
  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined
    return (
      price &&
      sqrtRatioX96 &&
      !(
        JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO) &&
        JSBI.lessThan(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)
      )
    )
  }, [price])

  // used for ratio calculation when pool not initialized
  const mockPool = useMemo(() => {
    if (tokenA && tokenB && feeAmount && price && !invalidPrice) {
      const currentTick = priceToClosestTick(price)
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick)
      return new Pool(tokenA, tokenB, feeAmount, currentSqrt, JSBI.BigInt(0), currentTick, [])
    } else {
      return undefined
    }
  }, [feeAmount, invalidPrice, price, tokenA, tokenB])

  // if pool exists use it, if not use the mock pool
  const poolForPosition: Pool | undefined = pool ?? mockPool

  // lower and upper limits in the tick space for `feeAmoun<Trans>
  const tickSpaceLimits = useMemo(
    () => ({
      [Bound.LOWER]: tickDiscretization ? nearestUsableTick(TickMath.MIN_TICK, tickDiscretization) : undefined,
      [Bound.UPPER]: tickDiscretization ? nearestUsableTick(TickMath.MAX_TICK, tickDiscretization) : undefined,
    }),
    [tickDiscretization]
  )

  // parse typed range values and determine closest ticks
  // lower should always be a smaller tick
  const ticks = useMemo(() => {
    return {
      [Bound.LOWER]:
        (invertPrice && typeof rightRangeTypedValue === 'boolean') ||
        (!invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.LOWER]
          : invertPrice
          ? tryParseLmtTick(token1, token0, feeAmount, rightRangeTypedValue.toString(), tickDiscretization, true)
          : tryParseLmtTick(token0, token1, feeAmount, leftRangeTypedValue.toString(), tickDiscretization, true),
      [Bound.UPPER]:
        (!invertPrice && typeof rightRangeTypedValue === 'boolean') ||
        (invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.UPPER]
          : invertPrice
          ? tryParseLmtTick(token1, token0, feeAmount, leftRangeTypedValue.toString(), tickDiscretization)
          : tryParseLmtTick(token0, token1, feeAmount, rightRangeTypedValue.toString(), tickDiscretization),
    }
  }, [
    feeAmount,
    invertPrice,
    leftRangeTypedValue,
    rightRangeTypedValue,
    token0,
    token1,
    tickSpaceLimits,
    tickDiscretization,
  ])

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {}

  // specifies whether the lower and upper ticks is at the exteme bounds
  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: feeAmount && tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: feeAmount && tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper, feeAmount]
  )

  // mark invalid range
  const invalidRange = Boolean(typeof tickLower === 'number' && typeof tickUpper === 'number' && tickLower >= tickUpper)

  const pricesAtLimit = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, tickSpaceLimits.LOWER),
      [Bound.UPPER]: getTickToPrice(token0, token1, tickSpaceLimits.UPPER),
    }
  }, [token0, token1, tickSpaceLimits.LOWER, tickSpaceLimits.UPPER])

  // always returns the price with 0 as base token
  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]: getTickToPrice(token0, token1, ticks[Bound.LOWER]),
      [Bound.UPPER]: getTickToPrice(token0, token1, ticks[Bound.UPPER]),
    }
  }, [token0, token1, ticks])
  const { [Bound.LOWER]: lowerPrice, [Bound.UPPER]: upperPrice } = pricesAtTicks

  // liquidity range warning
  const outOfRange = Boolean(
    !invalidRange && price && lowerPrice && upperPrice && (price.lessThan(lowerPrice) || price.greaterThan(upperPrice))
  )

  // amounts
  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    typedValue,
    currencies[independentField]
  )

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    // we wrap the currencies just to get the price in terms of the other token
    const wrappedIndependentAmount = independentAmount?.wrapped
    const dependentCurrency = dependentField === Field.CURRENCY_B ? currencyB : currencyA
    if (
      independentAmount &&
      wrappedIndependentAmount &&
      typeof tickLower === 'number' &&
      typeof tickUpper === 'number' &&
      poolForPosition
    ) {
      // if price is out of range or invalid range - return 0 (single deposit will be independent)
      if (outOfRange || invalidRange) {
        return undefined
      }

      const position: Position | undefined = wrappedIndependentAmount.currency.equals(poolForPosition.token0)
        ? Position.fromAmount0({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount0: independentAmount.quotient,
            useFullPrecision: true, // we want full precision for the theoretical position
          })
        : Position.fromAmount1({
            pool: poolForPosition,
            tickLower,
            tickUpper,
            amount1: independentAmount.quotient,
          })

      const dependentTokenAmount = wrappedIndependentAmount.currency.equals(poolForPosition.token0)
        ? position.amount1
        : position.amount0
      return dependentCurrency && CurrencyAmount.fromRawAmount(dependentCurrency, dependentTokenAmount.quotient)
    }

    return undefined
  }, [
    independentAmount,
    outOfRange,
    dependentField,
    currencyB,
    currencyA,
    tickLower,
    tickUpper,
    poolForPosition,
    invalidRange,
  ])

  const parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    }
  }, [dependentAmount, independentAmount, independentField])

  // single deposit only if price is out of range
  const deposit0Disabled = Boolean(
    typeof tickUpper === 'number' && poolForPosition && poolForPosition.tickCurrent >= tickUpper
  )
  const deposit1Disabled = Boolean(
    typeof tickLower === 'number' && poolForPosition && poolForPosition.tickCurrent <= tickLower
  )

  // sorted for token order
  const depositADisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenA && poolForPosition.token0.equals(tokenA)) ||
        (deposit1Disabled && poolForPosition && tokenA && poolForPosition.token1.equals(tokenA))
    )
  const depositBDisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && tokenB && poolForPosition.token0.equals(tokenB)) ||
        (deposit1Disabled && poolForPosition && tokenB && poolForPosition.token1.equals(tokenB))
    )

  // create position entity based on users selection
  const position: LmtLpPosition | undefined = useMemo(() => {
    if (
      !poolForPosition ||
      !tokenA ||
      !tokenB ||
      typeof tickLower !== 'number' ||
      typeof tickUpper !== 'number' ||
      invalidRange
    ) {
      return undefined
    }

    // mark as 0 if disabled because out of range
    const amount0 = !deposit0Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_A : Field.CURRENCY_B]?.quotient
      : BIG_INT_ZERO
    const amount1 = !deposit1Disabled
      ? parsedAmounts?.[tokenA.equals(poolForPosition.token0) ? Field.CURRENCY_B : Field.CURRENCY_A]?.quotient
      : BIG_INT_ZERO

    if (amount0 !== undefined && amount1 !== undefined) {
      return LmtLpPosition.fromAmounts({
        pool: poolForPosition,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        useFullPrecision: true, // we want full precision for the theoretical position
      })
    } else {
      return undefined
    }
  }, [
    parsedAmounts,
    poolForPosition,
    tokenA,
    tokenB,
    deposit0Disabled,
    deposit1Disabled,
    invalidRange,
    tickLower,
    tickUpper,
  ])

  let errorMessage: ReactNode | undefined
  if (!account) {
    errorMessage = <Trans>Connect Wallet</Trans>
  }

  if (poolState === PoolState.INVALID) {
    errorMessage = errorMessage ?? <Trans>Invalid pair</Trans>
  }

  if (invalidPrice) {
    errorMessage = errorMessage ?? <Trans>Invalid price input</Trans>
  }

  if (
    (!parsedAmounts[Field.CURRENCY_A] && !depositADisabled) ||
    (!parsedAmounts[Field.CURRENCY_B] && !depositBDisabled)
  ) {
    errorMessage = errorMessage ?? <Trans>Enter an amount</Trans>
  }

  const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts
  if (
    currencyA &&
    currencyAAmount &&
    currencyBalances?.[Field.CURRENCY_A]?.lessThan(
      currencyAAmount.add(CurrencyAmount.fromRawAmount(currencyA, JSBI.BigInt(0)))
    )
  ) {
    errorMessage = <Trans>Insufficient {currencies[Field.CURRENCY_A]?.symbol} balance</Trans>
  }

  if (
    currencyB &&
    currencyBAmount &&
    currencyBalances?.[Field.CURRENCY_B]?.lessThan(
      currencyBAmount.add(CurrencyAmount.fromRawAmount(currencyB, JSBI.BigInt(0)))
    )
  ) {
    errorMessage = <Trans>Insufficient {currencies[Field.CURRENCY_B]?.symbol} balance</Trans>
  }

  const invalidPool = poolState === PoolState.INVALID

  const argentWalletContract = useArgentWalletContract()
  const allowedSlippage = useUserSlippageToleranceWithDefault(
    outOfRange ? ZERO_PERCENT : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE
  )

  const [approvalAmountA, approvalAmountB] = useMemo(() => {
    return [parsedAmounts[Field.CURRENCY_A], parsedAmounts[Field.CURRENCY_B]]
  }, [parsedAmounts])
  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    argentWalletContract ? undefined : approvalAmountA,
    chainId ? LMT_NFPM_V2[chainId] : undefined
  )

  const [approvalB, approveBCallback] = useApproveCallback(
    argentWalletContract ? undefined : approvalAmountB,
    chainId ? LMT_NFPM_V2[chainId] : undefined
  )

  const showApprovalA =
    !argentWalletContract && approvalA !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_A]
  const showApprovalB =
    !argentWalletContract && approvalB !== ApprovalState.APPROVED && !!parsedAmounts[Field.CURRENCY_B]

  const simulateEnabled =
    !errorMessage && !invalidPool && !invalidRange && !showApprovalA && !showApprovalB && !!account

  const { contractError, success } = useSimulateMint(simulateEnabled, position, allowedSlippage, account)

  const contractErrorMessage = useMemo(() => {
    let message: ReactNode | undefined
    if (contractError) {
      message = <Trans>{getErrorMessage(contractError)}</Trans>
    }
    return message
  }, [contractError])

  return {
    dependentField,
    currencies,
    pool,
    poolState,
    currencyBalances,
    parsedAmounts,
    ticks,
    price,
    pricesAtTicks,
    pricesAtLimit,
    position,
    noLiquidity,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
    contractErrorMessage,
  }
}

export function useTickDiscretization(
  currencyA: string | undefined,
  currencyB: string | undefined,
  fee: FeeAmount | undefined
): {
  tickDiscretization: number | undefined
  loading: boolean
  error: boolean
} {
  const [token0, token1] = useMemo(
    () =>
      currencyA && currencyB
        ? currencyA.toLowerCase() < currencyB.toLowerCase()
          ? [currencyA, currencyB]
          : [currencyB, currencyA]
        : [undefined, undefined],
    [currencyA, currencyB]
  )
  const poolManager = useLmtPoolManagerContract()
  const hashedKey = useMemo(() => {
    if (token0 && token1 && fee) {
      return keccak256(
        ['bytes'],
        [defaultAbiCoder.encode(['address', 'address', 'uint24'], [token0, token1, Number(fee)])]
      )
    } else {
      return undefined
    }
  }, [token0, token1, fee])
  const { result, error, loading } = useSingleCallResult(poolManager, 'tickDiscretizations', [hashedKey])

  return useMemo(() => {
    if (result && !error && !loading) {
      const tickDiscretization = result?.[0]
      return { tickDiscretization, loading, error }
    } else {
      return { tickDiscretization: undefined, loading, error }
    }
  }, [result, error, loading])
}

export function useRangeHopCallbacks(
  baseCurrency: Currency | undefined,
  quoteCurrency: Currency | undefined,
  feeAmount: FeeAmount | undefined,
  tickLower: number | undefined,
  tickUpper: number | undefined,
  pool?: Pool | undefined | null
) {
  const dispatch = useAppDispatch()
  const { tickDiscretization } = useTickDiscretization(
    baseCurrency?.wrapped.address,
    quoteCurrency?.wrapped.address,
    feeAmount
  )

  const baseToken = useMemo(() => baseCurrency?.wrapped, [baseCurrency])
  const quoteToken = useMemo(() => quoteCurrency?.wrapped, [quoteCurrency])

  const getDecrementLower = useCallback(() => {
    if (baseToken && quoteToken && typeof tickLower === 'number' && feeAmount && tickDiscretization) {
      const newPrice = tickToPrice(baseToken, quoteToken, tickLower - tickDiscretization)
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickLower === 'number') && baseToken && quoteToken && feeAmount && pool && tickDiscretization) {
      const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent - tickDiscretization)
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    return ''
  }, [baseToken, quoteToken, tickLower, feeAmount, pool, tickDiscretization])

  const getIncrementLower = useCallback(() => {
    if (baseToken && quoteToken && typeof tickLower === 'number' && feeAmount && tickDiscretization) {
      const newPrice = tickToPrice(baseToken, quoteToken, tickLower + tickDiscretization)
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickLower === 'number') && baseToken && quoteToken && feeAmount && pool && tickDiscretization) {
      const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent + tickDiscretization)
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    return ''
  }, [baseToken, quoteToken, tickLower, feeAmount, pool, tickDiscretization])

  const getDecrementUpper = useCallback(() => {
    if (baseToken && quoteToken && typeof tickUpper === 'number' && feeAmount && tickDiscretization) {
      const newPrice = tickToPrice(baseToken, quoteToken, tickUpper - tickDiscretization)
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickUpper === 'number') && baseToken && quoteToken && feeAmount && pool && tickDiscretization) {
      const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent - tickDiscretization)
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    return ''
  }, [baseToken, quoteToken, tickUpper, feeAmount, pool, tickDiscretization])

  const getIncrementUpper = useCallback(() => {
    if (baseToken && quoteToken && typeof tickUpper === 'number' && feeAmount && tickDiscretization) {
      const newPrice = tickToPrice(baseToken, quoteToken, tickUpper + tickDiscretization)
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    // use pool current tick as starting tick if we have pool but no tick input
    if (!(typeof tickUpper === 'number') && baseToken && quoteToken && feeAmount && pool && tickDiscretization) {
      const newPrice = tickToPrice(baseToken, quoteToken, pool.tickCurrent + tickDiscretization)
      return newPrice.toSignificant(5, undefined, Rounding.ROUND_UP)
    }
    return ''
  }, [baseToken, quoteToken, tickUpper, feeAmount, pool, tickDiscretization])

  const getSetFullRange = useCallback(() => {
    dispatch(setFullRange())
  }, [dispatch])

  return { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange }
}
