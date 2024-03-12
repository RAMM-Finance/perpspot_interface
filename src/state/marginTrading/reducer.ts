import { createReducer } from '@reduxjs/toolkit'

import {
  MarginField,
  replaceMarginTradeState,
  setBaseCurrencyIsInputToken,
  setLimit,
  setLocked,
  setMarginInPosToken,
  setPrice,
  setRecipient,
  typeInput,
} from './actions'

export interface MarginTradeState {
  readonly lockedField: MarginField | undefined | null
  readonly [MarginField.MARGIN]: string | undefined | null
  readonly [MarginField.LEVERAGE_FACTOR]: string | null
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  readonly isLimitOrder: boolean
  readonly startingPrice: string | undefined
  readonly baseCurrencyIsInputToken: boolean
  readonly marginInPosToken: boolean
}

// const initialState: MarginTradeState = queryParametersToSwapState(parsedQueryString())
// const tabReducerInit = { tab: 'long' }
const initialState: MarginTradeState = {
  lockedField: MarginField.MARGIN,
  // typedValue: '',
  // inputCurrencyId: null,
  // outputCurrencyId: null,
  [MarginField.MARGIN]: null,
  // [MarginField.BORROW]: null,
  [MarginField.LEVERAGE_FACTOR]: null,
  recipient: null,
  isLimitOrder: false,
  startingPrice: undefined,
  marginInPosToken: false,
  baseCurrencyIsInputToken: false,
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
            recipient,
            leverageFactor,
            margin,
            premium,
            isLimitOrder,
            startingPrice,
            baseCurrencyIsInputToken,
            marginInPosToken,
          },
        }
      ) => {
        return {
          lockedField,
          // typedValue: '',
          // inputCurrencyId,
          // outputCurrencyId,
          [MarginField.MARGIN]: margin,
          // [MarginField.BORROW]: borrow,
          [MarginField.LEVERAGE_FACTOR]: leverageFactor,
          recipient,
          isLimitOrder,
          startingPrice,
          baseCurrencyIsInputToken,
          marginInPosToken,
        }
      }
    )
    .addCase(setMarginInPosToken, (state, { payload: { marginInPosToken } }) => {
      return {
        ...state,
        marginInPosToken,
      }
    })
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
    .addCase(setLimit, (state, { payload: { isLimit } }) => {
      return {
        ...state,
        isLimitOrder: isLimit,
      }
    })
    .addCase(setPrice, (state, { payload: { startingPrice } }) => {
      return {
        ...state,
        startingPrice,
      }
    })
    .addCase(setBaseCurrencyIsInputToken, (state, { payload: { baseCurrencyIsInputToken } }) => {
      return {
        ...state,
        baseCurrencyIsInputToken,
      }
    })
)
