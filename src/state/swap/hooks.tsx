import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import useAutoSlippageTolerance from 'hooks/useAutoSlippageTolerance'
import { useBestTrade } from 'hooks/useBestTrade'
// import { useLimitlessPositionFromKeys } from 'hooks/useV3Positions'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ReactNode, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setMarginInPosToken } from 'state/marginTrading/actions'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import {
  useCurrentInputCurrency,
  useCurrentOutputCurrency,
  useUserSlippageToleranceWithDefault,
} from 'state/user/hooks'
import { PoolKey, RawPoolKey } from 'types/lmtv2position'

import useENS from '../../hooks/useENS'
import { isAddress } from '../../utils'
import { useCurrencyBalances } from '../connection/hooks'
import { AppState } from '../types'
import {
  ActiveSwapTab,
  Field,
  selectPool,
  setActiveTab,
  setLeverage,
  setLeverageFactor,
  setLTV,
  setRecipient,
  // setSwapTab,
  switchCurrencies,
  typeInput,
} from './actions'
import { SwapState } from './reducer'
// import { useLeveragePosition } from 'hooks/useV3Positions'

export function useSwapState(): AppState['swap'] {
  return useAppSelector((state) => state.swap)
}

export function useSwapActionHandlers(): {
  onPoolSelection(currencyIn: Currency, currencyOut: Currency, poolKey: RawPoolKey): void
  onSwitchTokens: (leverage: boolean) => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
  onLeverageFactorChange: (leverage: string) => void
  onLeverageChange: (leverage: boolean) => void
  onActiveTabChange: (activeTab: ActiveSwapTab) => void
  onLTVChange: (ltv: string) => void
  onSetMarginInPosToken: (marginInPosToken: boolean) => void
} {
  const dispatch = useAppDispatch()

  const onPoolSelection = useCallback(
    (currencyIn: Currency, currencyOut: Currency, poolKey: RawPoolKey) => {
      dispatch(
        selectPool({
          inputCurrencyId: currencyIn.isToken ? currencyIn.address : currencyIn.isNative ? 'ETH' : '',
          outputCurrencyId: currencyOut.isToken ? currencyOut.address : currencyOut.isNative ? 'ETH' : '',
          poolKey,
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

  const onSetMarginInPosToken = useCallback(
    (marginInPosToken: boolean) => {
      dispatch(setMarginInPosToken({ marginInPosToken }))
    },
    [dispatch]
  )

  const onLeverageFactorChange = useCallback(
    (leverageFactor: string) => {
      dispatch(setLeverageFactor({ leverageFactor }))
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

  return {
    onSwitchTokens,
    onUserInput,
    onChangeRecipient,
    onLeverageFactorChange,
    onLeverageChange,
    onActiveTabChange,
    onLTVChange,
    onPoolSelection,
    onSetMarginInPosToken,
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
  tokenId?: number
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

  const { independentField, typedValue, recipient } = useSwapState()
  const inputCurrency = useCurrentInputCurrency()
  const outputCurrency = useCurrentOutputCurrency()
  // console.log('---useDerivedSwapInfo----', currentPool, inputCurrency, outputCurrency)

  // console.log('inputCurrency', inputCurrency, outputCurrency)
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

export function getInitialSwapState(): SwapState {
  return {
    typedValue: '',
    independentField: Field.INPUT,
    recipient: null,
    leverageFactor: '1',
    leverage: false,
    activeTab: ActiveSwapTab.LONG,
    ltv: null,
    poolId: null,
    poolKey: null,
    [Field.INPUT]: {
      currencyId: null,
    },
    [Field.OUTPUT]: {
      currencyId: null,
    },
    // poolId: getPoolId('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', '0x912CE59144191C1204E64559FE8253a0e49E6548', 500),
    // poolKey: {
    //   token0: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    //   token1: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    //   fee: 500,
    // },
    // [Field.INPUT]: {
    //   currencyId: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    // },
    // [Field.OUTPUT]: {
    //   currencyId: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    // },
  }
}
