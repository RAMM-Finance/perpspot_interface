import { createReducer } from '@reduxjs/toolkit'
import { SerializableMarginPositionDetails } from 'types/lmtv2position'
import { getLeveragePositionId } from 'utils/lmtSDK/LmtIds'

import {
  addPreloadedLeveragePosition,
  MarginField,
  removeLeveragePosition,
  replaceMarginTradeState,
  setBaseCurrencyIsInputToken,
  setIsSwap,
  setLeveragePositions,
  setLimit,
  setLocked,
  setMarginInPosToken,
  setPremiumInPosToken,
  setPrice,
  setRecipient,
  typeInput,
} from './actions'

export interface LeveragePositionInfo {
  position: SerializableMarginPositionDetails
  lastUpdated: number
  preloaded: boolean
}

export interface MarginTradeState {
  readonly lockedField: MarginField | undefined | null
  readonly [MarginField.MARGIN]: string | undefined | null
  readonly [MarginField.LEVERAGE_FACTOR]: string | null
  readonly [MarginField.EST_DURATION]: string | null
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  readonly isLimitOrder: boolean
  readonly startingPrice: string | undefined
  readonly baseCurrencyIsInputToken: boolean
  readonly marginInPosToken: boolean
  readonly premiumInPosToken: boolean
  readonly isSwap: boolean
  readonly positions: LeveragePositionInfo[]
}

const initialState: MarginTradeState = {
  lockedField: MarginField.MARGIN,
  [MarginField.MARGIN]: null,
  [MarginField.LEVERAGE_FACTOR]: null,
  [MarginField.EST_DURATION]: null,
  recipient: null,
  isLimitOrder: false,
  startingPrice: undefined,
  marginInPosToken: false,
  baseCurrencyIsInputToken: false,
  premiumInPosToken: false,
  isSwap: false,
  positions: [],
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
            selectedDuration,
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
          [MarginField.EST_DURATION]: selectedDuration,
          recipient,
          isLimitOrder,
          startingPrice,
          baseCurrencyIsInputToken,
          marginInPosToken,
          premiumInPosToken,
          isSwap,
          positions: state.positions,
        }
      }
    )
    .addCase(setMarginInPosToken, (state, { payload: { marginInPosToken } }) => {
      return {
        ...state,
        marginInPosToken,
      }
    })
    .addCase(setLeveragePositions, (state, { payload: { positions } }) => {
      return {
        ...state,
        positions,
      }
    })
    .addCase(addPreloadedLeveragePosition, (state, { payload: { position, lastUpdated } }) => {
      const found = state.positions.find(
        (p) =>
          getLeveragePositionId(p.position.poolKey, p.position.isToken0, p.position.trader) ===
          getLeveragePositionId(position.poolKey, position.isToken0, position.trader)
      )
      if (!found) {
        return {
          ...state,
          positions: [
            ...state.positions,
            {
              position,
              lastUpdated,
              preloaded: true,
            },
          ],
        }
      }
      return {
        ...state,
      }
    })
    .addCase(removeLeveragePosition, (state, { payload: { positionId } }) => {
      return {
        ...state,
        positions: state.positions.filter(
          (p) => getLeveragePositionId(p.position.poolKey, p.position.isToken0, p.position.trader) !== positionId
        ),
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
