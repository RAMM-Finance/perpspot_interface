import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Price, Token } from '@uniswap/sdk-core'
import { Pool, priceToClosestTick, Route } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { useMarginLMTPositionFromPositionId, useMarginOrderPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { usePoolParams } from 'hooks/usePools'
import JSBI from 'jsbi'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { LeverageTradeState } from 'state/routing/types'
import { Field } from 'state/swap/actions'
import { useBestPool, useSwapState } from 'state/swap/hooks'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'
import { MarginFacilitySDK } from 'utils/lmtSDK/MarginFacility'

import { useCurrency } from '../../hooks/Tokens'
import { useMarginFacilityContract } from '../../hooks/useContract'
import { useCurrencyBalances } from '../connection/hooks'
import { AppState } from '../types'
import { MarginField, setLimit, setLocked, typeInput } from './actions'
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
  }
}

export interface AddMarginTrade {
  margin: CurrencyAmount<Currency> // additional margin - fees
  borrowAmount: CurrencyAmount<Currency> // additional borrowAmount
  swapOutput: CurrencyAmount<Currency> // additional output amount
  swapInput: CurrencyAmount<Currency> // margin + borrowAmount - fees
  allowedSlippage: Percent // should be Percent
  executionPrice: Price<Currency, Currency>
}

export interface PreTradeInfo {
  premiumDeposit: CurrencyAmount<Currency>
  premiumNecessary: CurrencyAmount<Currency>
  additionalPremium: CurrencyAmount<Currency>
  approvalAmount: CurrencyAmount<Currency>
}

interface DerivedAddPositionResult {
  currencies: { [field in Field]?: Currency | null }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedMarginAmount: CurrencyAmount<Currency> | undefined
  parsedBorrowAmount: CurrencyAmount<Currency> | undefined
  parsedLeverageFactor: string | undefined
  positionKey?: TraderPositionKey
  allowedSlippage?: Percent
  allowedSlippedTick?: Percent
  allowedPremiumTolerance?: Percent
  inputError?: ReactNode
  trade?: AddMarginTrade
  preTradeInfo?: PreTradeInfo
  existingPosition?: MarginPositionDetails
  state: LeverageTradeState
}

export function useDerivedAddPositionInfo(): DerivedAddPositionResult {
  const { account } = useWeb3React()

  const {
    [MarginField.MARGIN]: margin,
    [MarginField.LEVERAGE_FACTOR]: leverageFactor,
    isLimitOrder,
  } = useMarginTradingState()

  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const pool = useBestPool(inputCurrency ?? undefined, outputCurrency ?? undefined)
  // user fund amount

  const marginAmount = useMemo(
    () => tryParseCurrencyAmount(margin ?? undefined, inputCurrency ?? undefined),
    [inputCurrency, margin]
  )

  const borrowAmount = useMemo(() => {
    if (!marginAmount || !leverageFactor || Number(leverageFactor) < 1) return undefined
    return marginAmount?.multiply(JSBI.BigInt(leverageFactor)).subtract(marginAmount)
  }, [leverageFactor, marginAmount])

  const [positionKey, orderPositionKey] = useMemo(() => {
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
      return [undefined, undefined]
    }
  }, [account, pool, outputCurrency])

  const allowedSlippedTick = useMemo(() => new Percent(1, 100), [])
  const allowedPremiumTolerance = useMemo(() => new Percent(1, 100), [])

  const { position: existingPosition } = useMarginLMTPositionFromPositionId(positionKey)
  const existingLimitPosition = useMarginOrderPositionFromPositionId(orderPositionKey)
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

  const inputIsToken0 = useMemo(() => {
    return outputCurrency?.wrapped ? inputCurrency?.wrapped.sortsBefore(outputCurrency?.wrapped) : false
  }, [outputCurrency, inputCurrency])

  const poolParams = usePoolParams(pool)

  const preTradeInfo: PreTradeInfo | undefined = useMemo(() => {
    if (
      !existingPosition ||
      !account ||
      !inputCurrency ||
      !outputCurrency ||
      !borrowAmount ||
      !poolParams ||
      !marginAmount
    )
      return undefined

    const _premiumDeposit = BnToCurrencyAmount(existingPosition.premiumDeposit, inputCurrency)
    const _premiumNecessary = BnToCurrencyAmount(
      new BN(borrowAmount.toExact()).multipliedBy(poolParams.minimumPremiumDeposit).plus(existingPosition.premiumOwed),
      inputCurrency
    )

    const _additionalPremium = _premiumNecessary.greaterThan(_premiumDeposit)
      ? _premiumNecessary.subtract(_premiumDeposit)
      : CurrencyAmount.fromRawAmount(inputCurrency, 0)

    const _approvalAmount = _additionalPremium ? _additionalPremium.add(marginAmount) : marginAmount
    return {
      premiumDeposit: _premiumDeposit,
      premiumNecessary: _premiumNecessary,
      additionalPremium: _additionalPremium,
      approvalAmount: _approvalAmount,
    }
  }, [existingPosition, marginAmount, account, inputCurrency, outputCurrency, borrowAmount, poolParams])

  // TODO calculate slippage from the pool
  const allowedSlippage = useMemo(() => new Percent(JSBI.BigInt(3), JSBI.BigInt(100)), [])
  const slippedTickTolerance = useMemo(() => new Percent(JSBI.BigInt(5), JSBI.BigInt(100)), [])

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? <Trans>Select a token</Trans>
    }

    if (!marginAmount) {
      inputError = inputError ?? <Trans>Enter a margin amount</Trans>
    }

    if (!leverageFactor) {
      inputError = inputError ?? <Trans>Enter a leverage factor</Trans>
    }

    if (Number(leverageFactor) <= 1) {
      inputError = inputError ?? <Trans>Leverage must be greater than 1</Trans>
    }

    // compare input balance to max input based on version
    const balanceIn = currencyBalances[Field.INPUT]
    const amountIn = marginAmount

    if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
      inputError = <Trans>Insufficient {balanceIn.currency.symbol} balance</Trans>
    }

    return inputError
  }, [account, currencies, marginAmount, currencyBalances, leverageFactor])

  const { state, result: trade } = useSimulateMarginTrade(
    pool,
    inputIsToken0,
    marginAmount,
    borrowAmount,
    existingPosition,
    allowedSlippage,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    preTradeInfo?.additionalPremium ?? undefined,
    inputError,
    slippedTickTolerance
  )

  return useMemo(
    () => ({
      currencies,
      currencyBalances,
      parsedMarginAmount: marginAmount,
      parsedBorrowAmount: borrowAmount,
      parsedLeverageFactor: leverageFactor ?? undefined,
      inputError,
      trade,
      preTradeInfo,
      positionKey,
      existingPosition,
      state,
      allowedSlippage,
      allowedSlippedTick,
      allowedPremiumTolerance,
    }),
    [
      currencies,
      currencyBalances,
      marginAmount,
      borrowAmount,
      leverageFactor,
      inputError,
      trade,
      existingPosition,
      preTradeInfo,
      state,
      allowedSlippage,
      positionKey,
      allowedSlippedTick,
      allowedPremiumTolerance,
    ]
  )
}

export const BnToCurrencyAmount = (x: BN, currency: Currency): CurrencyAmount<Currency> => {
  return CurrencyAmount.fromRawAmount(currency, x.shiftedBy(currency.decimals).toFixed(0))
}

type State = {
  lastBlock: number | undefined
  result: JSBI | undefined
  loading: boolean
  error: Error | undefined
  lastAmount: CurrencyAmount<Currency> | undefined
  lastRoute: Route<Token, Token> | undefined
}

const useEstimatedOutputAmount = (
  pool: Pool | undefined,
  zeroForOne: boolean | undefined,
  amount: CurrencyAmount<Currency> | undefined
): [boolean, JSBI | undefined] => {
  const { chainId, provider } = useWeb3React()
  const blockNumber = useBlockNumber()

  const [state, setState] = useState<State>({
    lastBlock: undefined,
    result: undefined,
    loading: false,
    error: undefined,
    lastAmount: undefined,
    lastRoute: undefined,
  })

  const swapRoute = useMemo(() => {
    if (pool) {
      return new Route([pool], zeroForOne ? pool.token0 : pool.token1, zeroForOne ? pool.token1 : pool.token0)
    }
    return undefined
  }, [pool, zeroForOne])

  useEffect(() => {
    const fetchEstimatedOutputAmount = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }))

        const amountOut = await getOutputQuote(amount ?? undefined, swapRoute, provider, chainId)

        setState({
          lastBlock: blockNumber,
          result: amountOut,
          loading: false,
          error: undefined,
          lastAmount: amount,
          lastRoute: swapRoute,
        })
      } catch (err) {
        console.error('Error fetching amountOut:', err)
        setState((prev) => ({ ...prev, loading: false, error: err, result: undefined, lastAmount: undefined }))
      }
    }

    fetchEstimatedOutputAmount()
  }, [chainId, provider, blockNumber, swapRoute, amount])

  return useMemo(() => {
    if (state.loading) return [true, undefined]
    if (state.error) return [false, undefined]
    return [false, state.result]
  }, [state])
}

const useSimulateMarginTrade = (
  pool?: Pool,
  inputIsToken0?: boolean,
  margin?: CurrencyAmount<Currency>,
  borrowAmount?: CurrencyAmount<Currency>,
  existingPosition?: MarginPositionDetails,
  allowedSlippage?: Percent,
  inputCurrency?: Currency,
  outputCurrency?: Currency,
  additionalPremium?: CurrencyAmount<Currency>,
  inputError?: ReactNode,
  slippedTickTolerance?: Percent
): {
  state: LeverageTradeState
  result?: {
    swapOutput: CurrencyAmount<Currency> // addditional output amount
    executionPrice: Price<Currency, Currency> // (margin + borrowAmount - fees) / outputAmount
    swapInput: CurrencyAmount<Currency> // margin + borrowAmount - fees
    borrowAmount: CurrencyAmount<Currency> // borrowAmount
    margin: CurrencyAmount<Currency> // additional margin - fees
    allowedSlippage: Percent
  }
} => {
  const { account } = useWeb3React()
  const marginFacility = useMarginFacilityContract()
  const blockNumber = useBlockNumber()

  const [tradeState, setTradeState] = useState<LeverageTradeState>(LeverageTradeState.INVALID)
  const [result, setResult] = useState<{
    swapOutput: CurrencyAmount<Currency>
    executionPrice: Price<Currency, Currency>
    swapInput: CurrencyAmount<Currency>
    margin: CurrencyAmount<Currency>
    borrowAmount: CurrencyAmount<Currency>
    allowedSlippage: Percent
  }>()

  const { provider, chainId } = useWeb3React()

  useEffect(() => {
    const lagged = async () => {
      if (
        !account ||
        !pool ||
        !margin ||
        !borrowAmount ||
        !account ||
        !blockNumber ||
        !existingPosition ||
        !inputCurrency ||
        !outputCurrency ||
        !additionalPremium ||
        !!inputError ||
        !marginFacility ||
        !existingPosition ||
        !inputCurrency ||
        !outputCurrency ||
        !allowedSlippage ||
        !slippedTickTolerance
      ) {
        return
      }
      const swapRoute = new Route(
        [pool],
        inputIsToken0 ? pool.token0 : pool.token1,
        inputIsToken0 ? pool.token1 : pool.token0
      )
      const amountOut = await getOutputQuote(margin.add(borrowAmount), swapRoute, provider, chainId)
      if (!amountOut) return

      console.log('amountOut', amountOut.toString())

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

      const calldata = MarginFacilitySDK.addPositionParameters({
        positionKey: {
          poolKey: {
            token0Address: pool.token0.address,
            token1Address: pool.token1.address,
            fee: pool.fee,
          },
          isToken0: !inputIsToken0,
          isBorrow: false,
          trader: account,
        },
        margin: margin.quotient,
        borrowAmount: borrowAmount.quotient,
        minimumOutput: JSBI.BigInt(0),
        deadline: Math.floor(new Date().getTime() / 1000 + 30 * 60).toString(),
        simulatedOutput: amountOut,
        executionOption: 1,
        maxSlippage: new BN(103).shiftedBy(16).toFixed(0),
        depositPremium: additionalPremium?.quotient,
        slippedTickMin,
        slippedTickMax,
      })

      try {
        setTradeState(LeverageTradeState.LOADING)
        const multicallResult = await marginFacility.callStatic.multicall(calldata)

        const { totalPosition, totalInputDebt, margin } = MarginFacilitySDK.decodeAddPositionResult(multicallResult[1])

        // compute the added output amount + the execution price. (margin + borrowAmount - fees) / outputAmount
        let swapInput: JSBI
        let swapOutput: JSBI
        let _margin: JSBI
        let _borrowAmount: JSBI
        if (existingPosition.openTime > 0) {
          swapOutput = JSBI.subtract(totalPosition, BnToJSBI(existingPosition.totalPosition, outputCurrency))

          _margin = JSBI.subtract(margin, BnToJSBI(existingPosition.margin, inputCurrency))

          // margin + borrowAmount - fees
          const borrowAmount = JSBI.subtract(totalInputDebt, BnToJSBI(existingPosition.totalDebtInput, inputCurrency))
          swapInput = JSBI.add(margin, borrowAmount)
          _borrowAmount = borrowAmount
        } else {
          swapOutput = totalPosition
          _margin = margin
          swapInput = JSBI.add(margin, totalInputDebt)
          _borrowAmount = totalInputDebt
        }

        const executionPrice = new Price<Currency, Currency>(inputCurrency, outputCurrency, swapInput, swapOutput)
        const simulation = {
          margin: CurrencyAmount.fromRawAmount(inputCurrency, _margin),
          borrowAmount: CurrencyAmount.fromRawAmount(inputCurrency, _borrowAmount),
          swapInput: CurrencyAmount.fromRawAmount(inputCurrency, swapInput),
          swapOutput: CurrencyAmount.fromRawAmount(outputCurrency, swapOutput),
          executionPrice,
          allowedSlippage,
        }
        setResult(simulation)
        setTradeState(LeverageTradeState.VALID)
      } catch (err) {
        setTradeState(LeverageTradeState.INVALID)
        setResult(undefined)
        console.log('useSimulateMarginTrade error', err)
      }
      return
    }

    lagged()
  }, [
    blockNumber,
    allowedSlippage,
    marginFacility,
    account,
    existingPosition,
    inputCurrency,
    outputCurrency,
    additionalPremium,
    inputIsToken0,
    borrowAmount,
    inputError,
    pool,
    margin,
    provider,
    chainId,
    slippedTickTolerance,
  ])

  return useMemo(() => {
    return {
      result,
      state: tradeState,
    }
  }, [result, tradeState])
}

export const BnToJSBI = (x: BN, currency: Currency): JSBI => {
  return JSBI.BigInt(x.shiftedBy(currency.decimals).toFixed(0))
}

// type AddPositionSimulationResult = {
//   margin: CurrencyAmount<Currency>
//   borrowAmount: CurrencyAmount<Currency>
//   swapInput: CurrencyAmount<Currency>
//   swapOutput: CurrencyAmount<Currency>
//   executionPrice: Price<Currency, Currency>
//   allowedSlippage: Percent
// }

// const simulateAddPosition = async (
//   marginFacility?: Contract,
//   callDatas?: string[],
//   existingPosition?: MarginPositionDetails,
//   inputCurrency?: Currency,
//   outputCurrency?: Currency,
//   allowedSlippage?: Percent
// ): Promise<AddPositionSimulationResult | undefined> => {
//   if (!marginFacility || !callDatas || !existingPosition || !inputCurrency || !outputCurrency || !allowedSlippage)
//     return undefined
//   const multicallResult = await marginFacility.callStatic.multicall(callDatas)
//   const { totalPosition, totalInputDebt, margin } = MarginFacilitySDK.decodeAddPositionResult(multicallResult[1])

//   // compute the added output amount + the execution price. (margin + borrowAmount - fees) / outputAmount
//   let swapInput: JSBI
//   let swapOutput: JSBI
//   let _margin: JSBI
//   let _borrowAmount: JSBI
//   if (existingPosition.openTime > 0) {
//     swapOutput = JSBI.subtract(totalPosition, BnToJSBI(existingPosition.totalPosition, outputCurrency))

//     _margin = JSBI.subtract(margin, BnToJSBI(existingPosition.margin, inputCurrency))

//     // margin + borrowAmount - fees
//     const borrowAmount = JSBI.subtract(totalInputDebt, BnToJSBI(existingPosition.totalDebtInput, inputCurrency))
//     swapInput = JSBI.add(margin, borrowAmount)
//     _borrowAmount = borrowAmount
//   } else {
//     swapOutput = totalPosition
//     _margin = margin
//     swapInput = JSBI.add(margin, totalInputDebt)
//     _borrowAmount = totalInputDebt
//   }

//   const executionPrice = new Price<Currency, Currency>(inputCurrency, outputCurrency, swapInput, swapOutput)
//   return {
//     margin: CurrencyAmount.fromRawAmount(inputCurrency, _margin),
//     borrowAmount: CurrencyAmount.fromRawAmount(inputCurrency, _borrowAmount),
//     swapInput: CurrencyAmount.fromRawAmount(inputCurrency, swapInput),
//     swapOutput: CurrencyAmount.fromRawAmount(outputCurrency, swapOutput),
//     executionPrice,
//     allowedSlippage,
//   }
// }
