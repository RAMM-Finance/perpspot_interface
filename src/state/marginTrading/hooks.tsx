import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'
import { Pool, Route } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
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
import { MarginPositionDetails, RawPoolKey } from 'types/lmtv2position'
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
  // onBorrowChange: (borrow: string) => void
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

  // const onBorrowChange = useCallback(
  //   (borrow: string) => {
  //     dispatch(typeInput({ field: MarginField.BORROW, typedValue: borrow }))
  //   },
  //   [dispatch]
  // )

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
    // onBorrowChange,
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
  const { account } = useWeb3React()

  const {
    [MarginField.MARGIN]: margin,
    // [MarginField.BORROW]: borrow,
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

  const borrowAmount = useMemo(() => {
    if (!marginAmount || !leverageFactor || Number(leverageFactor) < 1) return undefined
    return marginAmount?.multiply(JSBI.BigInt(leverageFactor)).subtract(marginAmount)
  }, [leverageFactor, marginAmount])

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

  console.log('inputIsToken0', inputIsToken0)

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

  const { state, trade } = useSimulateMarginTrade(
    pool,
    inputIsToken0,
    marginAmount,
    borrowAmount,
    minEstimatedSlippage ?? undefined,
    existingPosition,
    allowedSlippage,
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
    additionalPremium ?? undefined
  )

  // console.log('derivedAddPosition', minEstimatedSlippage, state, trade)

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
        // console.log('actualOutput', actualOutput.toString())
        const price = zeroForOne ? pool.token0Price.toFixed(18) : pool.token1Price.toFixed(18)
        const expectedOutput = new BN(marginAmount.add(borrowAmount).quotient.toString()).multipliedBy(price)

        const minEstimatedSlippage = JSBI.BigInt(
          expectedOutput.minus(actualOutput).dividedBy(expectedOutput).shiftedBy(18).toFixed(0)
        )

        console.log('minEstimatedSlippage', minEstimatedSlippage.toString())
        // 999999999999999999
        setLoading(false)
        setResult(minEstimatedSlippage)
        setLastBlock(blockNumber)
      } catch (err) {
        // console.log('useMinEstimatedSlippage error', err)
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
  allowedSlippage?: Percent,
  inputCurrency?: Currency,
  outputCurrency?: Currency,
  additionalPremium?: CurrencyAmount<Currency>
): {
  state: LeverageTradeState
  trade: MarginTrade | undefined
} => {
  const { account, chainId } = useWeb3React()
  const marginFacility = useMarginFacilityContract()
  const blockNumber = useBlockNumber()

  const [tradeState, setTradeState] = useState<LeverageTradeState>(LeverageTradeState.INVALID)
  const [result, setResult] = useState<MarginTrade>()
  const [lastBlock, setLastBlock] = useState<any>()

  const callDatas = useMemo(() => {
    if (
      !account ||
      !pool ||
      !margin ||
      !borrowAmount ||
      !minimumEstimatedSlippage ||
      !account ||
      !blockNumber ||
      !existingPosition ||
      !inputCurrency ||
      !outputCurrency ||
      !additionalPremium
    ) {
      return []
    }
    return MarginFacilitySDK.addPositionParameters({
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
      minEstimatedSlippage: minimumEstimatedSlippage,
      executionOption: 1,
      maxSlippage: new BN(103).shiftedBy(16).toFixed(0),
      depositPremium: additionalPremium?.quotient,
    })
  }, [
    account,
    pool,
    margin,
    borrowAmount,
    minimumEstimatedSlippage,
    blockNumber,
    existingPosition,
    inputCurrency,
    outputCurrency,
    additionalPremium,
    inputIsToken0,
  ])

  useEffect(() => {
    const lagged = async () => {
      if (
        !account ||
        !marginFacility ||
        callDatas.length == 0 ||
        !blockNumber ||
        tradeState == LeverageTradeState.LOADING
      )
        return null
      if (lastBlock && lastBlock + 2 > blockNumber) return null

      try {
        setTradeState(LeverageTradeState.LOADING)
        console.log('useSimulateMarginTrade', callDatas)
        const result = await marginFacility.callStatic.multicall(callDatas)
        console.log('stuff', result)
        setTradeState(LeverageTradeState.VALID)
        setLastBlock(blockNumber)
      } catch (err) {
        setTradeState(LeverageTradeState.INVALID)
        console.log('useSimulateMarginTrade error', err)
      }
      return
    }

    lagged()
  }, [blockNumber, callDatas, marginFacility, account, tradeState, lastBlock])

  // const facilityResults = useSingleContractWithCallData(marginFacility, callDatas, {
  //   gasRequired: chainId ? QUOTE_GAS_OVERRIDES[chainId] ?? DEFAULT_GAS_QUOTE : undefined,
  // })

  // console.log('facilityResults', facilityResults)

  return useMemo(() => {
    return {
      trade: result,
      state: tradeState,
    }
  }, [result, tradeState])
}

// export function useAddMarginPositionCallback(trade: MarginTrade | undefined): {
//   callback: null | (() => Promise<string>)
// } {
//   const addTransaction = useTransactionAdder()
//   const { account, chainId, provider } = useWeb3React()
//   const addPositionCallback = useCallback(async () => {
//     try {
//       if (!account) throw new Error('missing account')
//       if (!chainId) throw new Error('missing chainId')
//       if (!provider) throw new Error('missing provider')
//       if (!trade) throw new Error('missing trade')

//       const { calldata: data, value } = MarginFacilitySDK.addPositionParameters({
//         positionKey: {
//           poolKey: trade.poolKey,
//           isToken0: trade.positionIsToken0,
//           isBorrow: false,
//           trader: account,
//         },
//         margin: trade.marginAmount.quotient,
//         borrowAmount: trade.borrowAmount.quotient,
//         minimumOutput: JSBI.BigInt(0),
//         deadline: trade.deadline,
//         executionOption: trade.executionOption,
//         maxSlippage: trade.allowedSlippage,
//         minEstimatedSlippage: trade.minimumEstimatedSlippage,
//       })

//       const tx = {
//         from: account,
//         to: LMT_MARGIN_FACILITY[chainId],
//         data,
//         ...(value && !isZero(value) ? { value: toHex(value) } : {}),
//       }

//       let gasEstimate: BigNumber
//       try {
//         gasEstimate = await provider.estimateGas(tx)
//       } catch (gasError) {
//         console.warn(gasError)
//         throw new Error('Unable to estimate gas')
//       }
//       const gasLimit = calculateGasMargin(gasEstimate)
//       const response = await provider
//         .getSigner()
//         .sendTransaction({ ...tx, gasLimit })
//         .then((response) => {
//           return response
//         })
//       return response
//     } catch (err) {
//       console.log(err)
//       throw new Error('Unable to send transaction')
//     }
//   }, [trade, account, chainId, provider])

//   const callback = useMemo(() => {
//     if (!trade || !addPositionCallback) return null
//     return () =>
//       addPositionCallback().then((response) => {
//         addTransaction(response, {
//           type: TransactionType.ADD_LEVERAGE,
//           inputAmount: trade.marginAmount.toFixed(18),
//           inputCurrencyId: currencyId(trade.marginAmount.currency),
//           outputCurrencyId: currencyId(trade.outputAmount.currency),
//           expectedAddedPosition: trade.outputAmount.toFixed(18),
//         })
//         return response.hash
//       })
//   }, [addTransaction, trade, addPositionCallback])
//   return {
//     callback,
//   }
// }
