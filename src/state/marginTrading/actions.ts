import { createAction } from '@reduxjs/toolkit'
import { BigNumber as BN } from 'bignumber.js'
import { SerializableMarginPositionDetails } from 'types/lmtv2position'

import { LeveragePositionInfo } from './reducer'

export enum MarginField {
  MARGIN = 'MARGIN',
  // BORROW = 'BORROW',
  LEVERAGE_FACTOR = 'LEVERAGE FACTOR',
  EST_DURATION = 'ESTIMATED DURATION',
}

// export const selectCurrency = createAction<{ field: Field; currencyId: string }>('margin/selectCurrency')
// export const switchCurrencies = createAction('margin/switchCurrencies')
export const typeInput = createAction<{ field: MarginField; typedValue: string }>('margin/typeInput')
export const replaceMarginTradeState = createAction<{
  lockedField: MarginField
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
  leverageFactor: string
  selectedDuration: string
  updatedPremium: BN | undefined
  margin?: string
  // borrow?: string
  premium?: string
  isLimitOrder: boolean
  startingPrice?: string
  baseCurrencyIsInputToken: boolean
  marginInPosToken: boolean
  premiumInPosToken: boolean
  isSwap: boolean
  pinnedPools?: string[]
}>('margin/replaceMarginState')
export const setRecipient = createAction<{ recipient: string | null }>('margin/setRecipient')
export const setHideClosedLeveragePositions = createAction<{ hideClosedLeveragePositions: boolean }>(
  'swap/setHideClosedLeveragePositions'
)
export const setMarginInPosToken = createAction<{ marginInPosToken: boolean }>('margin/setMarginInPostoken')
export const setLocked = createAction<{ locked: MarginField | null }>('margin/setLocked')
// export const setPremium = createAction<{ premium: string }>('margin/setPremium')

export const setLimit = createAction<{ isLimit: boolean }>('margin/setLimit')

export const setUpdatedPremium = createAction<{ updatedPremium: BN | undefined }>('margin/setUpdatedPremium')

export const setPrice = createAction<{ startingPrice: string }>('margin/setPrice')

export const setBaseCurrencyIsInputToken = createAction<{ baseCurrencyIsInputToken: boolean }>(
  'margin/setBaseCurrencyIsInputToken'
)

export const setPremiumInPosToken = createAction<{ premiumInPosToken: boolean }>('margin/setPremiumInPosToken')
export const setIsSwap = createAction<{ isSwap: boolean }>('margin/setIsSwap')

// assume not preloaded
export const setLeveragePositions = createAction<{ positions: LeveragePositionInfo[] }>('margin/setLeveragePositions')

// assume preloaded
export const addPreloadedLeveragePosition = createAction<{
  position: SerializableMarginPositionDetails
  lastUpdated: number
}>('margin/addPreloadedLeveragePosition')

// remove leverage position with this id
export const removeLeveragePosition = createAction<{ positionId: string }>('margin/removeLeveragePosition')
