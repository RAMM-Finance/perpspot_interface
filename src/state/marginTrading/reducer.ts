import { createReducer } from '@reduxjs/toolkit'

import {
  MarginField,
  replaceMarginTradeState,
  setBaseCurrencyIsInputToken,
  setIsSwap,
  setLimit,
  setLocked,
  setMarginInPosToken,
  setPremiumInPosToken,
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
  readonly premiumInPosToken: boolean
  readonly isSwap: boolean
}

const initialState: MarginTradeState = {
  lockedField: MarginField.MARGIN,
  [MarginField.MARGIN]: null,
  [MarginField.LEVERAGE_FACTOR]: null,
  recipient: null,
  isLimitOrder: false,
  startingPrice: undefined,
  marginInPosToken: false,
  baseCurrencyIsInputToken: false,
  premiumInPosToken: false,
  isSwap: false,
}

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
            premiumInPosToken,
            isSwap,
          },
        }
      ) => {
        return {
          lockedField,
          [MarginField.MARGIN]: margin,
          [MarginField.LEVERAGE_FACTOR]: leverageFactor,
          recipient,
          isLimitOrder,
          startingPrice,
          baseCurrencyIsInputToken,
          marginInPosToken,
          premiumInPosToken,
          isSwap,
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
    .addCase(setPremiumInPosToken, (state, { payload: { premiumInPosToken } }) => {
      return {
        ...state,
        premiumInPosToken,
      }
    })
    .addCase(setIsSwap, (state, { payload: { isSwap } }) => {
      return {
        ...state,
        isSwap,
      }
    })
)
