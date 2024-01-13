import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import { computePoolAddress } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { POOL_INIT_CODE_HASH, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { getAddress } from 'ethers/lib/utils'
import { useAllV3Routes } from 'hooks/useAllV3Routes'
import useAutoSlippageTolerance from 'hooks/useAutoSlippageTolerance'
import { useBestTrade } from 'hooks/useBestTrade'
// import { useLimitlessPositionFromKeys } from 'hooks/useV3Positions'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ParsedQs } from 'qs'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'

import { TOKEN_SHORTHANDS } from '../../constants/tokens'
import { useCurrency } from '../../hooks/Tokens'
import useENS from '../../hooks/useENS'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress } from '../../utils'
import { useCurrencyBalances } from '../connection/hooks'
import { AppState } from '../types'
import {
  ActiveSwapTab,
  Field,
  replaceSwapState,
  selectCurrency,
  setActiveTab,
  setBorrowManagerAddress,
  setHideClosedLeveragePositions,
  setLeverage,
  setLeverageFactor,
  setLeverageManagerAddress,
  setLTV,
  setPremium,
  setRecipient,
  setSwapTab,
  switchCurrencies,
  typeInput,
} from './actions'
import { SwapState } from './reducer'

// import { useLeveragePosition } from 'hooks/useV3Positions'

export function useSwapState(): AppState['swap'] {
  return useAppSelector((state) => state.swap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: (leverage: boolean) => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
  onLeverageFactorChange: (leverage: string) => void
  onHideClosedLeveragePositions: (hide: boolean) => void
  onLeverageChange: (leverage: boolean) => void
  onLeverageManagerAddress: (leverageManagerAddress: string) => void
  onActiveTabChange: (activeTab: ActiveSwapTab) => void
  onLTVChange: (ltv: string) => void
  onBorrowManagerAddress: (borrowManagerAddress: string) => void
  onPremiumChange: (premium: BN) => void
  onSwitchSwapModalTab: (tab: string) => void
} {
  const dispatch = useAppDispatch()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency.isToken ? currency.address : currency.isNative ? 'ETH' : '',
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(
    (leverage: boolean) => {
      dispatch(switchCurrencies({ leverage }))
    },
    [dispatch]
  )

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  const onLeverageFactorChange = useCallback(
    (leverageFactor: string) => {
      dispatch(setLeverageFactor({ leverageFactor }))
    },
    [dispatch]
  )

  const onHideClosedLeveragePositions = useCallback(
    (hide: boolean) => {
      dispatch(setHideClosedLeveragePositions({ hideClosedLeveragePositions: hide }))
    },
    [dispatch]
  )

  const onLeverageChange = useCallback(
    (leverage: boolean) => {
      dispatch(setLeverage({ leverage }))
      dispatch(setLeverageFactor({ leverageFactor: '1' }))
    },
    [dispatch]
  )

  const onLeverageManagerAddress = useCallback(
    (leverageManagerAddress: string) => {
      dispatch(setLeverageManagerAddress({ leverageManagerAddress }))
    },
    [dispatch]
  )

  const onActiveTabChange = useCallback(
    (activeTab: ActiveSwapTab) => {
      dispatch(setActiveTab({ activeTab }))
    },
    [dispatch]
  )

  const onLTVChange = useCallback(
    (ltv: string) => {
      dispatch(setLTV({ ltv }))
    },
    [dispatch]
  )

  const onBorrowManagerAddress = useCallback(
    (borrowManagerAddress: string) => {
      dispatch(setBorrowManagerAddress({ borrowManagerAddress }))
    },
    [dispatch]
  )

  const onPremiumChange = useCallback(
    (premium: BN) => {
      dispatch(setPremium({ premium }))
    },
    [dispatch]
  )

  const onSwitchSwapModalTab = useCallback(
    (tab: string) => {
      dispatch(setSwapTab({ tab }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onLeverageFactorChange,
    onHideClosedLeveragePositions,
    onLeverageChange,
    onLeverageManagerAddress,
    onActiveTabChange,
    onLTVChange,
    onBorrowManagerAddress,
    onPremiumChange,

    onSwitchSwapModalTab,
  }
}

const BAD_RECIPIENT_ADDRESSES: { [address: string]: true } = {
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f': true, // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a': true, // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': true, // v2 router 02
}

export interface LeverageTrade {
  inputAmount: CurrencyAmount<Currency>
  borrowedAmount: CurrencyAmount<Currency>
  expectedTotalPosition: BN // new output. i.e. new position - existing position.
  strikePrice: BN
  quotedPremium: BN
  priceImpact: Percent
  remainingPremium: BN
  effectiveLeverage: number
  existingPosition: boolean
  existingTotalDebtInput: BN
  existingTotalPosition: BN
  existingCollateral: BN
  tokenId?: number // if not existing position then this will be undefined
}

export interface BorrowCreationDetails {
  collateralAmount: BN // CurrencyAmount<Currency> | undefined
  borrowedAmount: BN // totalDebtInput
  quotedPremium: BN
  unusedPremium: BN
  priceImpact: Percent
  // state: TradeState
  existingPosition: boolean
  existingTotalDebtInput: BN
  existingCollateral: BN
}

// in its return the pos, vars.prevRemainingPremium, vars.premium, the vars.premium is new quoted, prevRemaining is unused amount you get back,
// for pos struct totalDebtInput
// is the amount borrowed given collateral and ltv

export function useBestPoolAddress(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined
): string | undefined {
  const { loading, routes } = useAllV3Routes(inputCurrency, outputCurrency)
  const { chainId } = useWeb3React()
  if (loading || routes.length === 0 || !chainId || routes[0].pools.length === 0) {
    return undefined
  }

  const pool = routes[0].pools[0]

  return computePoolAddress({
    factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
    tokenA: pool.token0,
    tokenB: pool.token1,
    fee: pool.fee,
    initCodeHashManualOverride: POOL_INIT_CODE_HASH,
  })
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): {
  currencies: { [field in Field]?: Currency | null }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputError?: ReactNode
  trade: {
    trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
    state: TradeState
  }
  allowedSlippage: Percent
} {
  const { account } = useWeb3React()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()

  // console.log("currencyId", inputCurrencyId, outputCurrencyId)

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  // console.log('inputCurrency', inputCurrency)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [inputCurrency ?? undefined, outputCurrency ?? undefined], [inputCurrency, outputCurrency])
  )

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
    [inputCurrency, isExactIn, outputCurrency, typedValue]
  )

  const trade = useBestTrade(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    parsedAmount,
    (isExactIn ? outputCurrency : inputCurrency) ?? undefined
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

  // allowed slippage is either auto slippage, or custom user defined slippage if auto slippage disabled
  const autoSlippageTolerance = useAutoSlippageTolerance(trade.trade)
  const allowedSlippage = useUserSlippageToleranceWithDefault(autoSlippageTolerance)
  // console.log("allowedSlippage:", allowedSlippage)

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? <Trans>Select a token</Trans>
    }

    if (!parsedAmount) {
      inputError = inputError ?? <Trans>Enter an amount</Trans>
    }

    const formattedTo = isAddress(to)
    if (!to || !formattedTo) {
      inputError = inputError ?? <Trans>Enter a recipient</Trans>
    } else {
      if (BAD_RECIPIENT_ADDRESSES[formattedTo]) {
        inputError = inputError ?? <Trans>Invalid recipient</Trans>
      }
    }

    // if (leverage && Number(leverageFactor) <= 1) {
    //   inputError = inputError ?? <Trans>Invalid Leverage</Trans>
    // }

    // compare input balance to max input based on version
    const [balanceIn, amountIn] = [currencyBalances[Field.INPUT], trade.trade?.maximumAmountIn(allowedSlippage)]

    if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
      inputError = <Trans>Insufficient {amountIn.currency.symbol} balance</Trans>
    }

    return inputError
  }, [account, allowedSlippage, currencies, currencyBalances, parsedAmount, to, trade.trade])

  return useMemo(
    () => ({
      currencies,
      currencyBalances,
      parsedAmount,
      inputError,
      trade,
      allowedSlippage,
    }),
    [allowedSlippage, currencies, currencyBalances, inputError, parsedAmount, trade]
  )
}

function parseCurrencyFromURLParameter(urlParam: ParsedQs[string]): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    const upper = urlParam.toUpperCase()
    if (upper === 'ETH') return 'ETH'
    if (upper in TOKEN_SHORTHANDS) return upper
  }
  return ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}
const ENS_NAME_REGEX = /^(([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+)eth(\/.*)?$/

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  const inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  const typedValue = parseTokenAmountURLParameter(parsedQs.exactAmount)
  const independentField = parseIndependentFieldURLParameter(parsedQs.exactField)

  if (inputCurrency === '' && outputCurrency === '' && typedValue === '' && independentField === Field.INPUT) {
    // Defaults to having the native currency selected
    // inputCurrency = getAddress('0x569f3140FDc0f3B9Fc2E4919C35f35D39dd2B01A')
    // outputCurrency = getAddress('0x4E3F175b38098326a34F2C8B2D07AF5fFdfc6fA9')
    inputCurrency = getAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1')
    outputCurrency = getAddress('0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f')
  } else if (inputCurrency === outputCurrency) {
    // clear output if identical
    outputCurrency = ''
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency === '' ? null : inputCurrency ?? null,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency === '' ? null : outputCurrency ?? null,
    },
    originInputId: inputCurrency === '' ? null : inputCurrency ?? null,
    originOutputId: outputCurrency === '' ? null : outputCurrency ?? null,
    typedValue,
    independentField,
    recipient,
    leverageFactor: '1',
    leverage: false,
    hideClosedLeveragePositions: true,
    leverageManagerAddress: null,
    activeTab: ActiveSwapTab.LONG,
    ltv: null,
    borrowManagerAddress: null,
    premium: null,
    tab: 'Long',
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch(): SwapState {
  const { chainId } = useWeb3React()
  const dispatch = useAppDispatch()
  const parsedQs = useParsedQueryString()

  const parsedSwapState = useMemo(() => {
    return queryParametersToSwapState(parsedQs)
  }, [parsedQs])

  useEffect(() => {
    if (!chainId) return
    // const inputCurrencyId = chainId === SupportedChainId.SEPOLIA ? FUSDC_SEPOLIA.address : FUSDC_MUMBAI.address // parsedSwapState[Field.INPUT].currencyId ?? undefined
    // const outputCurrencyId = chainId === SupportedChainId.SEPOLIA ? FETH_SEPOLIA.address : FETH_MUMBAI.address // parsedSwapState[Field.OUTPUT].currencyId ?? undefined
    const inputCurrencyId = parsedSwapState[Field.INPUT].currencyId ?? undefined
    const outputCurrencyId = parsedSwapState[Field.OUTPUT].currencyId ?? undefined

    dispatch(
      replaceSwapState({
        typedValue: parsedSwapState.typedValue,
        field: parsedSwapState.independentField,
        originInputId: inputCurrencyId,
        originOutputId: outputCurrencyId,
        inputCurrencyId,
        outputCurrencyId,
        recipient: parsedSwapState.recipient,
        leverageFactor: '1',
        hideClosedLeveragePositions: true,
        leverage: true,
        activeTab: ActiveSwapTab.LONG,
        tab: 'Long',
      })
    )
  }, [dispatch, chainId, parsedSwapState])

  return parsedSwapState
}

// export async function estimateSlippage(
//   token0: Currency | undefined | null,
//   token1: Currency | undefined | null,
//   borrowAmount: BN,
//   margin: BN
// ) {
//   // margin, borrowamount. margin + borrow that swaps for some levered output. callstatic swap simulation of the pool you're using.
//   if (!token0 || !token1) {
//     return null
//   }
//   const poolToUse = useBestPool(token0, token1)
//   if (!poolToUse || !poolToUse.token0 || !poolToUse?.token1) {
//     return null
//   }
//   const poolAddress = Pool.getAddress(poolToUse?.token0, poolToUse?.token1, poolToUse?.fee)

//   //discussion around getting estimation from simulation without approval
//   //use the equation

//   return new BN(1).plus(0.03).shiftedBy(18).toFixed(0)
// }
