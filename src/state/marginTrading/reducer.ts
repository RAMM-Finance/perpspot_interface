import { createReducer } from '@reduxjs/toolkit'

import { MarginField, replaceMarginTradeState, setLocked, setRecipient, typeInput } from './actions'

export interface MarginTradeState {
  readonly lockedField: MarginField | undefined | null
  // readonly typedValue: string
  // readonly inputCurrencyId: string | undefined | null
  // readonly outputCurrencyId: string | undefined | null
  readonly [MarginField.MARGIN]: string | undefined | null
  readonly [MarginField.BORROW]: string | undefined | null
  readonly [MarginField.LEVERAGE_FACTOR]: string | null
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  // readonly premium: string | null
}

// const initialState: MarginTradeState = queryParametersToSwapState(parsedQueryString())
// const tabReducerInit = { tab: 'long' }
const initialState: MarginTradeState = {
  lockedField: null,
  // typedValue: '',
  // inputCurrencyId: null,
  // outputCurrencyId: null,
  [MarginField.MARGIN]: null,
  [MarginField.BORROW]: null,
  [MarginField.LEVERAGE_FACTOR]: null,
  recipient: null,
  // premium: null,
}

// export const tabReducer = createReducer(tabReducerInit, (builder) =>
//   builder.addCase(setSwapTab, (state, { payload: { tab } }) => ({ ...state, tab }))
// )

export default createReducer<MarginTradeState>(initialState, (builder) =>
  builder
    .addCase(
      replaceMarginTradeState,
      (
        state,
        {
          payload: {
            lockedField,
            // inputCurrencyId,
            // outputCurrencyId,
            recipient,
            leverageFactor,
            margin,
            borrow,
            premium,
          },
        }
      ) => {
        return {
          lockedField,
          // typedValue: '',
          // inputCurrencyId,
          // outputCurrencyId,
          [MarginField.MARGIN]: margin,
          [MarginField.BORROW]: borrow,
          [MarginField.LEVERAGE_FACTOR]: leverageFactor,
          recipient,
          // premium: premium ?? null,
        }
      }
    )
    // .addCase(selectCurrency, (state, { payload: { field, currencyId } }) => {
    //   const isInput = field === Field.INPUT
    //   const otherCurrencyId = isInput ? state.inputCurrencyId : state.outputCurrencyId
    //   if (currencyId === otherCurrencyId) {
    //     // the case where we have to swap the order
    //     return {
    //       ...state,
    //       inputCurrencyId: isInput ? currencyId : otherCurrencyId,
    //       outputCurrencyId: isInput ? otherCurrencyId : currencyId,
    //     }
    //   } else if (field === Field.INPUT) {
    //     // the normal case
    //     return {
    //       ...state,
    //       inputCurrencyId: currencyId,
    //     }
    //   } else if (field === Field.OUTPUT) {
    //     return {
    //       ...state,
    //       outputCurrencyId: currencyId,
    //     }
    //   } else {
    //     return state
    //   }
    // })
    // .addCase(switchCurrencies, (state) => {
    //   return {
    //     ...state,
    //     inputCurrencyId: state.outputCurrencyId,
    //     outputCurrencyId: state.inputCurrencyId,
    //   }
    // })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        [field]: typedValue,
      }
    })
    .addCase(setLocked, (state, { payload: { locked } }) => {
      return {
        ...state,
        lockedField: locked,
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
)
