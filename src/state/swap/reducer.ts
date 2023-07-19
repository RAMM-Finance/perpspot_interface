import { createReducer } from '@reduxjs/toolkit'
import { parsedQueryString } from 'hooks/useParsedQueryString'

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
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  readonly leverageFactor: string | null
  readonly hideClosedLeveragePositions: boolean
  readonly leverage: boolean
  readonly leverageManagerAddress: string | undefined | null
  readonly activeTab: ActiveSwapTab
  readonly ltv: string | undefined | null
  readonly borrowManagerAddress: string | undefined | null
  readonly premium: number | undefined | null
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
            originInputId,
            originOutputId,
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
          originInputId,
          originOutputId,
          independentField: field,
          typedValue,
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
        }
      }
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      //필드가 input이면 아웃풋 아우풋이면 인풋
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId },
          [otherField]: { currencyId: state[field].currencyId },
        }
      } else if (field === Field.INPUT) {
        // the normal case
        return {
          ...state,
          originInputId: currencyId,
          [field]: { currencyId },
        }
      } else if (field === Field.OUTPUT) {
        return {
          ...state,
          originInputId: currencyId,
          [field]: { currencyId },
        }
      } else {
        return {
          ...state,
          [field]: { currencyId },
        }
      }
    })
    .addCase(switchCurrencies, (state, { payload: { leverage } }) => {
      if (state.tab === 'Long') {
        return {
          ...state,
          independentField: Field.INPUT,
          [Field.INPUT]: { currencyId: state.originInputId },
          [Field.OUTPUT]: { currencyId: state.originOutputId },
        }
      } else if (state.tab === 'Short') {
        return {
          ...state,
          independentField: Field.OUTPUT,
          [Field.INPUT]: { currencyId: state.originOutputId },
          [Field.OUTPUT]: { currencyId: state.originInputId },
        }
      } else {
        return {
          ...state,
          independentField: !leverage
            ? state.independentField === Field.INPUT
              ? Field.OUTPUT
              : Field.INPUT
            : Field.INPUT,

          [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
          [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
        }
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
    .addCase(setActiveTab, (state, { payload: { activeTab } }) => ({
      ...state,
      activeTab,
    }))
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
      tab,
    }))
)
