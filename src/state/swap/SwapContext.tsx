import { Currency, Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { Field, SwapTab } from 'components/swap/constants'
import { parsedQueryString } from 'hooks/useParsedQueryString'
import usePrevious from 'hooks/usePrevious'
import { SupportedChainId } from 'constants/chains'

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { TradeState } from 'state/routing/types'

import { queryParametersToSwapState, SwapInfo, SwapInfo2, useDerivedSwapInfo } from './hooks'

export interface SerializedCurrencyState {
  inputCurrencyId?: string
  outputCurrencyId?: string
}

export interface CurrencyState {
  inputCurrency?: Currency
  outputCurrency?: Currency
}

export interface SwapState {
  readonly independentField: Field
  readonly typedValue: string
}

const initialSwapState: SwapState = queryParametersToSwapState(parsedQueryString())


type SwapAndLimitContextType = {
  currencyState: CurrencyState
  prefilledState: {
    inputCurrency?: Currency
    outputCurrency?: Currency
  }
  setCurrencyState: Dispatch<SetStateAction<CurrencyState>>
  currentTab: SwapTab
  setCurrentTab: Dispatch<SetStateAction<SwapTab>>
  // The chainId of the page/context - can be different from the connected Chain ID if the
  // page is displaying content for a different chain
  chainId?: SupportedChainId
}


type SwapContextType = {
  swapState: SwapState
  derivedSwapInfo: SwapInfo2
  // derivedSwapInfo:  {
  //   currencies: { [field in Field]?: Currency | null }
  //   currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  //   parsedAmount: CurrencyAmount<Currency> | undefined
  //   inputError?: ReactNode
  //   trade: {
  //     trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
  //     state: TradeState
  //   }
  //   allowedSlippage: Percent
  // }
  setSwapState: Dispatch<SetStateAction<SwapState>>
}

export const SwapAndLimitContext = createContext<SwapAndLimitContextType>({
  currencyState: {
    inputCurrency: undefined,
    outputCurrency: undefined,
  },
  setCurrencyState: () => undefined,
  prefilledState: {
    inputCurrency: undefined,
    outputCurrency: undefined,
  },
  chainId: SupportedChainId.ARBITRUM_ONE,
  currentTab: SwapTab.Swap,
  setCurrentTab: () => undefined,
})

export const EMPTY_DERIVED_SWAP_INFO: SwapInfo2 = Object.freeze({
  currencies: {},
  currencyBalances: {},
  trade: {
    trade: undefined,
    state: TradeState.LOADING,
  },
  parsedAmount: undefined,
  allowedSlippage: new Percent(0),
})

export const SwapContext = createContext<SwapContextType>({
  swapState: initialSwapState,
  derivedSwapInfo: EMPTY_DERIVED_SWAP_INFO,
  setSwapState: () => undefined,
})


export function useSwapContext() {
  return useContext(SwapContext)
}

export function useSwapAndLimitContext() {
  return useContext(SwapAndLimitContext)
}

export function SwapAndLimitContextProvider({
  children,
  chainId,
  initialInputCurrency,
  initialOutputCurrency,
}: PropsWithChildren<{
  chainId?: SupportedChainId
  initialInputCurrency?: Currency
  initialOutputCurrency?: Currency
}>) {
  const { chainId: connectedChainId } = useWeb3React()
  const [currentTab, setCurrentTab] = useState<SwapTab>(SwapTab.Swap)

  const [currencyState, setCurrencyState] = useState<CurrencyState>({
    inputCurrency: initialInputCurrency,
    outputCurrency: initialOutputCurrency,
  })

  const prefilledState = useMemo(
    () => ({
      inputCurrency: initialInputCurrency,
      outputCurrency: initialOutputCurrency,
    }),
    [initialInputCurrency, initialOutputCurrency]
  )

  const previousConnectedChainId = usePrevious(connectedChainId)
  const previousPrefilledState = usePrevious(prefilledState)

  useEffect(() => {
    const combinedCurrencyState = { ...currencyState, ...prefilledState }
    const chainChanged = previousConnectedChainId && previousConnectedChainId !== connectedChainId
    const prefilledInputChanged = Boolean(
      previousPrefilledState?.inputCurrency
        ? !prefilledState.inputCurrency?.equals(previousPrefilledState.inputCurrency)
        : prefilledState.inputCurrency
    )
    const prefilledOutputChanged = Boolean(
      previousPrefilledState?.outputCurrency
        ? !prefilledState?.outputCurrency?.equals(previousPrefilledState.outputCurrency)
        : prefilledState.outputCurrency
    )

    if (chainChanged || prefilledInputChanged || prefilledOutputChanged) {
      setCurrencyState({
        inputCurrency: combinedCurrencyState.inputCurrency ?? undefined,
        outputCurrency: combinedCurrencyState.outputCurrency ?? undefined,
      })
    }
  }, [connectedChainId, currencyState, prefilledState, previousConnectedChainId, previousPrefilledState])

  const value = useMemo(() => {
    return {
      currencyState,
      setCurrencyState,
      currentTab,
      setCurrentTab,
      prefilledState,
      chainId,
    }
  }, [currencyState, setCurrencyState, currentTab, setCurrentTab, prefilledState, chainId])

  return <SwapAndLimitContext.Provider value={value}>{children}</SwapAndLimitContext.Provider>
}

export function SwapContextProvider({ children }: { children: React.ReactNode }) {
  const [swapState, setSwapState] = useState<SwapState>({
    ...initialSwapState,
  })
  const derivedSwapInfo = useDerivedSwapInfo()
  
  const { chainId: connectedChainId } = useWeb3React()
  const previousConnectedChainId = usePrevious(connectedChainId)

  useEffect(() => {
    const chainChanged = previousConnectedChainId && previousConnectedChainId !== connectedChainId
    if (chainChanged) {
      setSwapState((prev) => ({ ...prev, typedValue: '' }))
    }
  }, [connectedChainId, previousConnectedChainId])

  return <SwapContext.Provider value={{ swapState, setSwapState, derivedSwapInfo }}>{children}</SwapContext.Provider>
}
