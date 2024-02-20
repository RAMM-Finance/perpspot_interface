import { createReducer } from '@reduxjs/toolkit'
import { FeeAmount } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { parsedQueryString } from 'hooks/useParsedQueryString'

import {
  ActiveSwapTab,
  Field,
  replaceSwapState,
  selectPool,
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
import { queryParametersToSwapState } from './hooks'

export interface SwapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly originInputId: string | undefined | null
  readonly originOutputId: string | undefined | null
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined | null
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined | null
  }
  readonly poolFee: FeeAmount | undefined | null
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  readonly leverageFactor: string | null
  readonly hideClosedLeveragePositions: boolean
  readonly leverage: boolean
  readonly leverageManagerAddress: string | undefined | null
  readonly activeTab: ActiveSwapTab
  readonly ltv: string | undefined | null
  readonly borrowManagerAddress: string | undefined | null
  readonly premium: BN | undefined | null
  tab: string
}

const initialState: SwapState = queryParametersToSwapState(parsedQueryString())
// const tabReducerInit = { tab: 'long' }

// export const tabReducer = createReducer(tabReducerInit, (builder) =>
//   builder.addCase(setSwapTab, (state, { payload: { tab } }) => ({ ...state, tab }))
// )

export default createReducer<SwapState>(initialState, (builder) =>
  builder
    .addCase(
      replaceSwapState,
      (
        state,
        {
          payload: {
            typedValue,
            recipient,
            field,
            inputCurrencyId,
            outputCurrencyId,
            leverage,
            leverageFactor,
            hideClosedLeveragePositions,
            leverageManagerAddress,
            activeTab,
            ltv,
            borrowManagerAddress,
            premium,
            tab,
            poolFee,
          },
        }
      ) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId ?? null,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId ?? null,
          },
          originInputId: inputCurrencyId,
          originOutputId: outputCurrencyId,
          independentField: field,
          typedValue: '',
          recipient,
          leverageFactor: leverageFactor ?? null,
          leverage,
          hideClosedLeveragePositions,
          leverageManagerAddress: leverageManagerAddress ?? null,
          activeTab,
          ltv: ltv ?? null,
          borrowManagerAddress: borrowManagerAddress ?? null,
          premium: premium ?? null,
          tab: tab ?? 'Long',
          poolFee: null,
        }
      }
    )
    .addCase(selectPool, (state, { payload: { inputCurrencyId, outputCurrencyId, poolFee } }) => {
      return {
        ...state,
        [Field.INPUT]: { currencyId: inputCurrencyId },
        [Field.OUTPUT]: { currencyId: outputCurrencyId },
        poolFee,
      }
    })
    .addCase(switchCurrencies, (state, { payload: { leverage } }) => {
      return {
        ...state,
        independentField: !leverage
          ? state.independentField === Field.INPUT
            ? Field.OUTPUT
            : Field.INPUT
          : Field.INPUT,
        typedValue: '',
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      }
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      }
    })
    .addCase(setLeverage, (state, { payload: { leverage } }) => ({
      ...state,
      leverage,
    }))
    .addCase(setLeverageFactor, (state, { payload: { leverageFactor } }) => {
      return {
        ...state,
        leverageFactor,
      }
    })
    .addCase(setLeverageManagerAddress, (state, { payload: { leverageManagerAddress } }) => {
      return {
        ...state,
        leverageManagerAddress,
      }
    })
    .addCase(setHideClosedLeveragePositions, (state, { payload: { hideClosedLeveragePositions } }) => {
      return {
        ...state,
        hideClosedLeveragePositions,
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
    .addCase(setActiveTab, (state, { payload: { activeTab } }) => {
      if (state.activeTab === ActiveSwapTab.LONG || state.activeTab === ActiveSwapTab.SHORT) {
        if (activeTab === ActiveSwapTab.LONG || activeTab === ActiveSwapTab.SHORT) {
          if (activeTab != state.activeTab) {
            return {
              ...state,
              activeTab,
              typedValue: '',
              independentField: Field.INPUT,
              [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
              [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
            }
          }
        }
      }
      return {
        ...state,
        activeTab,
      }
    })
    .addCase(setLTV, (state, { payload: { ltv } }) => ({
      ...state,
      ltv,
    }))
    .addCase(setBorrowManagerAddress, (state, { payload: { borrowManagerAddress } }) => ({
      ...state,
      borrowManagerAddress,
    }))
    .addCase(setPremium, (state, { payload: { premium } }) => ({
      ...state,
      premium,
    }))
    .addCase(setSwapTab, (state, { payload: { tab } }) => ({
      ...state,
      typedValue: '',
      tab,
    }))
)
