import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'
import { Pool, Route, toHex } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { LMT_MARGIN_FACILITY } from 'constants/addresses'
import { BigNumber } from 'ethers'
import { useMarginLMTPositionFromPositionId } from 'hooks/useLMTV2Positions'
import { usePoolParams } from 'hooks/usePools'
import JSBI from 'jsbi'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { LeverageTradeState } from 'state/routing/types'
import { Field } from 'state/swap/actions'
import { useBestPool, useSwapState } from 'state/swap/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { MarginPositionDetails, RawPoolKey } from 'types/lmtv2position'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { currencyId } from 'utils/currencyId'
import isZero from 'utils/isZero'
import { MarginFacilitySDK } from 'utils/lmtContracts/MarginFacility'

import { useCurrency } from '../../hooks/Tokens'
import { useMarginFacilityContract } from '../../hooks/useContract'
import { useCurrencyBalances } from '../connection/hooks'
import { AppState } from '../types'
import { MarginField, setLocked, typeInput } from './actions'
import { getOutputQuote } from './getOutputQuote'

// import { useLeveragePosition } from 'hooks/useV3Positions'

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
  onBorrowChange: (borrow: string) => void
  onLockChange: (locked: MarginField | null) => void
} {
  const dispatch = useAppDispatch()
  // const onCurrencySelection = useCallback(
  //   (field: Field, currency: Currency) => {
  //     dispatch(
  //       selectCurrency({
  //         field,
  //         currencyId: currency.isToken ? currency.address : currency.isNative ? 'ETH' : '',
  //       })
  //     )
  //   },
  //   [dispatch]
  // )

  // const onSwitchTokens = useCallback(() => {
  //   dispatch(switchCurrencies())
  // }, [dispatch])

  const onUserInput = useCallback(
    (field: MarginField, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  // const onChangeRecipient = useCallback(
  //   (recipient: string | null) => {
  //     dispatch(setRecipient({ recipient }))
  //   },
  //   [dispatch]
  // )

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

  const onBorrowChange = useCallback(
    (borrow: string) => {
      dispatch(typeInput({ field: MarginField.BORROW, typedValue: borrow }))
    },
    [dispatch]
  )

  const onLockChange = useCallback(
    (locked: MarginField | null) => {
      dispatch(setLocked({ locked }))
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
    onBorrowChange,
    onLockChange,
  }
}

export interface MarginTrade {
  marginAmount: CurrencyAmount<Currency>
  borrowAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency> // additional output amount
  existingPosition: boolean
  existingTotalDebtInput: CurrencyAmount<Currency> | undefined
  existingTotalPosition: CurrencyAmount<Currency> | undefined
  allowedSlippage: JSBI // should be Percent
  poolKey: RawPoolKey
  positionIsToken0: boolean
  deadline: number
  executionOption: number
  minimumEstimatedSlippage: JSBI
  executionPrice: Price<Currency, Currency>
}

export function useDerivedAddPositionInfo(): {
  currencies: { [field in Field]?: Currency | null }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedMarginAmount: CurrencyAmount<Currency> | undefined
  parsedBorrowAmount: CurrencyAmount<Currency> | undefined
  parsedLeverageFactor: string | undefined
  inputError?: ReactNode
  trade: MarginTrade | undefined
  state: LeverageTradeState
  premiumDeposit: CurrencyAmount<Currency> | undefined
  premiumNecessary: CurrencyAmount<Currency> | undefined
  additionalPremium: CurrencyAmount<Currency> | undefined
  approvalAmount: CurrencyAmount<Currency> | undefined
  allowedSlippage: Percent
} {
  const { account, chainId } = useWeb3React()

  const {
    [MarginField.MARGIN]: margin,
    [MarginField.BORROW]: borrow,
    [MarginField.LEVERAGE_FACTOR]: leverageFactor,
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

  const borrowAmount = useMemo(
    () => tryParseCurrencyAmount(borrow ?? undefined, inputCurrency ?? undefined),
    [inputCurrency, borrow]
  )

  const positionKey = useMemo(() => {
    const isToken0 = outputCurrency?.wrapped.address === pool?.token0.address
    if (pool && account) {
      return {
        poolKey: {
          token0Address: pool.token0.address,
          token1Address: pool.token1.address,
          fee: pool.fee,
        },
        isToken0,
        isBorrow: false,
        trader: account,
      }
    } else {
      return undefined
    }
  }, [account, pool, outputCurrency])

  const { position: existingPosition } = useMarginLMTPositionFromPositionId(positionKey)

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

  // const leverageManager = useLeverageManagerContract(leverageManagerAddress ?? undefined, true)
  // const poolAddress = useMemo(() => {
  //   if (pool && inputCurrency && outputCurrency && chainId) {
  //     computePoolAddress({
  //       factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId ?? SupportedChainId.SEPOLIA],
  //       tokenA: inputCurrency?.wrapped,
  //       tokenB: outputCurrency?.wrapped,
  //       fee: pool.fee,
  //     })
  //   } else {
  //     return undefined
  //   }
  // }, [pool, inputCurrency, outputCurrency, chainId])
  // const marginManager = useMarginFacilityContract()
  // const poolManager = useLmtPoolManagerContract()
  // const poolContract = usePoolContract(poolAddress)

  const inputIsToken0 = useMemo(() => {
    return outputCurrency?.wrapped ? inputCurrency?.wrapped.sortsBefore(outputCurrency?.wrapped) : false
  }, [outputCurrency, inputCurrency])

  // const initialPrice = useMemo(
  //   () => (pool ? (inputIsToken0 ? pool.token0Price : pool.token1Price) : undefined),
  //   [inputIsToken0, pool]
  // )

  const poolParams = usePoolParams(pool)

  const [premiumDeposit, premiumNecessary, additionalPremium, approvalAmount] = useMemo(() => {
    if (
      !existingPosition ||
      !account ||
      !inputCurrency ||
      !outputCurrency ||
      !borrowAmount ||
      !poolParams ||
      !marginAmount
    )
      return [undefined, undefined, undefined, undefined]

    const _premiumDeposit = BnToCurrencyAmount(existingPosition.premiumDeposit, inputCurrency)
    const _premiumNecessary = BnToCurrencyAmount(
      new BN(borrowAmount.toExact()).multipliedBy(poolParams.minimumPremiumDeposit).plus(existingPosition.premiumOwed),
      inputCurrency
    )
    const _additionalPremium = _premiumNecessary.greaterThan(_premiumDeposit)
      ? _premiumNecessary.subtract(_premiumDeposit)
      : undefined
    const _approvalAmount = _additionalPremium ? _additionalPremium.add(marginAmount) : marginAmount

    return [_premiumDeposit, _premiumNecessary, _additionalPremium, _approvalAmount]
  }, [existingPosition, marginAmount, account, inputCurrency, outputCurrency, borrowAmount, poolParams])

  // TODO calculate slippage from the pool
  const allowedSlippage = useMemo(() => new Percent(JSBI.BigInt(3), JSBI.BigInt(100)), [])

  const minEstimatedSlippage = useMinEstimatedSlippage(
    pool ?? null,
    inputIsToken0 ?? null,
    marginAmount ?? null,
    borrowAmount ?? null
  )

  // console.log("contractResultPost/tradestate", contractResult, tradeState, parsedAmount?.toExact())
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

    if (!borrowAmount) {
      inputError = inputError ?? <Trans>Enter a borrow amount</Trans>
    }

    // compare input balance to max input based on version
    const balanceIn = currencyBalances[Field.INPUT]
    const amountIn = marginAmount

    if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
      inputError = <Trans>Insufficient {balanceIn.currency.symbol} balance</Trans>
    }

    return inputError
  }, [account, currencies, borrowAmount, marginAmount, currencyBalances])

  const { state, trade } = useSimulateMarginTrade(
    pool,
    inputIsToken0,
    marginAmount,
    borrowAmount,
    minEstimatedSlippage ?? undefined,
    existingPosition,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    premiumNecessary ?? undefined
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
      // hack
      state: poolParams && poolParams.minimumPremiumDeposit.eq(0) ? LeverageTradeState.NO_ROUTE_FOUND : state,
      allowedSlippage,
      premiumDeposit,
      premiumNecessary,
      additionalPremium,
      approvalAmount,
    }),
    [
      currencies,
      currencyBalances,
      marginAmount,
      borrowAmount,
      leverageFactor,
      inputError,
      trade,
      state,
      allowedSlippage,
      premiumDeposit,
      premiumNecessary,
      additionalPremium,
      approvalAmount,
      poolParams,
    ]
  )
}

const useMinEstimatedSlippage = (
  pool: Pool | null,
  zeroForOne: boolean | null,
  marginAmount: CurrencyAmount<Currency> | null,
  borrowAmount: CurrencyAmount<Currency> | null
): JSBI | null => {
  const { chainId, provider } = useWeb3React()
  const blockNumber = useBlockNumber()
  const [lastBlock, setLastBlock] = useState<any>()
  const [result, setResult] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()

  useEffect(() => {
    const lagged = async () => {
      if (!marginAmount || !borrowAmount || !pool || !provider || !chainId || !blockNumber) return null
      if (lastBlock && (lastBlock == blockNumber || lastBlock + 2 > blockNumber)) return null
      try {
        setLoading(true)
        const swapRoute = new Route(
          [pool],
          zeroForOne ? pool.token0 : pool.token1,
          zeroForOne ? pool.token1 : pool.token0
        )
        const amountOut = await getOutputQuote(marginAmount.add(borrowAmount), swapRoute, provider, chainId)
        const actualOutput = new BN(
          CurrencyAmount.fromRawAmount(zeroForOne ? pool.token1 : pool.token0, JSBI.BigInt(amountOut)).toFixed(18)
        )
        const price = zeroForOne ? pool.token0Price.toFixed(18) : pool.token1Price.toFixed(18)
        const expectedOutput = new BN(marginAmount.add(borrowAmount).quotient.toString()).multipliedBy(price)

        const minEstimatedSlippage = JSBI.BigInt(
          expectedOutput.minus(actualOutput).dividedBy(expectedOutput).shiftedBy(18).toFixed(0)
        )
        setLoading(false)
        setResult(minEstimatedSlippage)
        setLastBlock(blockNumber)
      } catch (err) {
        setLoading(false)
        setError(err)
      }
      return
    }

    lagged()
  }, [zeroForOne, marginAmount, borrowAmount, chainId, provider, pool, blockNumber, lastBlock])

  return useMemo(() => {
    if (loading || error) return null
    return result
  }, [result, loading, error])
}

const BnToCurrencyAmount = (x: BN, currency: Currency): CurrencyAmount<Currency> => {
  return CurrencyAmount.fromRawAmount(currency, x.shiftedBy(18).toFixed(0))
}

const useSimulateMarginTrade = (
  pool?: Pool,
  inputIsToken0?: boolean,
  margin?: CurrencyAmount<Currency>,
  borrowAmount?: CurrencyAmount<Currency>,
  minimumEstimatedSlippage?: JSBI,
  existingPosition?: MarginPositionDetails,
  inputCurrency?: Currency,
  outputCurrency?: Currency,
  premiumNecessary?: CurrencyAmount<Currency>
): {
  state: LeverageTradeState
  trade: MarginTrade | undefined
} => {
  const { account } = useWeb3React()
  const marginFacilityContract = useMarginFacilityContract()
  const blockNumber = useBlockNumber()

  const [tradeState, setTradeState] = useState<LeverageTradeState>(LeverageTradeState.INVALID)
  const [result, setResult] = useState<MarginTrade>()
  const [lastBlock, setLastBlock] = useState<any>()

  useEffect(() => {
    const lagged = async () => {
      if (
        !account ||
        !pool ||
        !margin ||
        !borrowAmount ||
        !minimumEstimatedSlippage ||
        !marginFacilityContract ||
        !account ||
        !blockNumber ||
        !existingPosition ||
        !inputCurrency ||
        !outputCurrency
      )
        return null
      if (lastBlock == blockNumber || lastBlock + 2 > blockNumber) return null
      try {
        setTradeState(LeverageTradeState.LOADING)
        const trade = await marginFacilityContract.callStatic.addPosition(
          {
            token0: pool.token0.address,
            token1: pool.token1.address,
            fee: pool.fee,
          },
          {
            margin: toHex(margin.quotient),
            maxSlippage: new BN(101).shiftedBy(16).toFixed(0),
            minEstimatedSlippage: toHex(minimumEstimatedSlippage),
            borrowAmount: toHex(borrowAmount.quotient),
            positionIsToken0: !inputIsToken0,
            executionOption: 1,
            trader: account,
            minOutput: 0,
            deadline: new Date().getTime() / 1000 + 30 * 60,
          },
          []
        )

        // const value = currencyBAmount.divide(currencyAAmount)
        // return new Price(currencyAAmount.currency, currencyBAmount.currency, value.denominator, value.numerator)

        const outputAmount = BnToCurrencyAmount(
          // new position - existing position
          new BN(trade[0].totalPosition.toString()).shiftedBy(-18).minus(existingPosition.totalPosition),
          outputCurrency
        )
        const priceValue = margin.add(borrowAmount).divide(outputAmount)
        const executionPrice = new Price(inputCurrency, outputCurrency, priceValue.denominator, priceValue.numerator)
        const marginTrade: MarginTrade = {
          marginAmount: margin,
          borrowAmount,
          existingPosition: existingPosition.openTime > 0,
          // premiumDeposit: BnToCurrencyAmount(existingPosition.premiumDeposit, inputCurrency),
          existingTotalDebtInput: BnToCurrencyAmount(existingPosition.totalDebtInput, inputCurrency),
          existingTotalPosition: BnToCurrencyAmount(existingPosition.totalPosition, outputCurrency),
          allowedSlippage: JSBI.BigInt(new BN(101).shiftedBy(16).toFixed(0)),
          poolKey: {
            token0Address: pool.token0.address,
            token1Address: pool.token1.address,
            fee: pool.fee,
          },
          positionIsToken0: !inputIsToken0,
          // premiumNecessary,
          outputAmount,
          deadline: new Date().getTime() / 1000 + 30 * 60,
          executionOption: 1,
          minimumEstimatedSlippage,
          executionPrice,
        }
        setResult(marginTrade)
        setTradeState(LeverageTradeState.VALID)
        setLastBlock(blockNumber)
      } catch (err) {
        setTradeState(LeverageTradeState.INVALID)
      }
      return
    }

    lagged()
  }, [
    blockNumber,
    lastBlock,
    margin,
    borrowAmount,
    minimumEstimatedSlippage,
    pool,
    inputIsToken0,
    account,
    marginFacilityContract,
    existingPosition,
    inputCurrency,
    outputCurrency,
    premiumNecessary,
  ])

  return useMemo(() => {
    return {
      trade: result,
      state: tradeState,
    }
  }, [result, tradeState])
}

export function useAddMarginPositionCallback(trade: MarginTrade | undefined): {
  callback: null | (() => Promise<string>)
} {
  const addTransaction = useTransactionAdder()
  const { account, chainId, provider } = useWeb3React()
  const addPositionCallback = useCallback(async () => {
    try {
      if (!account) throw new Error('missing account')
      if (!chainId) throw new Error('missing chainId')
      if (!provider) throw new Error('missing provider')
      if (!trade) throw new Error('missing trade')

      const { calldata: data, value } = MarginFacilitySDK.addPositionParameters({
        positionKey: {
          poolKey: trade.poolKey,
          isToken0: trade.positionIsToken0,
          isBorrow: false,
          trader: account,
        },
        margin: trade.marginAmount.quotient,
        borrowAmount: trade.borrowAmount.quotient,
        minimumOutput: JSBI.BigInt(0),
        deadline: trade.deadline,
        executionOption: trade.executionOption,
        maxSlippage: trade.allowedSlippage,
        minEstimatedSlippage: trade.minimumEstimatedSlippage,
      })

      const tx = {
        from: account,
        to: LMT_MARGIN_FACILITY[chainId],
        data,
        ...(value && !isZero(value) ? { value: toHex(value) } : {}),
      }

      let gasEstimate: BigNumber
      try {
        gasEstimate = await provider.estimateGas(tx)
      } catch (gasError) {
        console.warn(gasError)
        throw new Error('Unable to estimate gas')
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
      console.log(err)
      throw new Error('Unable to send transaction')
    }
  }, [trade, account, chainId, provider])

  const callback = useMemo(() => {
    if (!trade || !addPositionCallback) return null

    return () =>
      addPositionCallback().then((response) => {
        addTransaction(response, {
          type: TransactionType.ADD_LEVERAGE,
          inputAmount: trade.marginAmount.toFixed(18),
          inputCurrencyId: currencyId(trade.marginAmount.currency),
          outputCurrencyId: currencyId(trade.outputAmount.currency),
          expectedAddedPosition: trade.outputAmount.toFixed(18),
        })
        return response.hash
      })
  }, [addTransaction, trade, addPositionCallback])
  return {
    callback,
  }
}
