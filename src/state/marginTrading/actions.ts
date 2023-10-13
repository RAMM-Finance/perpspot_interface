import { createAction } from '@reduxjs/toolkit'
import { Field } from 'state/swap/actions'

export enum MarginField {
  MARGIN = 'MARGIN',
  BORROW = 'BORROW',
  LEVERAGE_FACTOR = 'LEVERAGE FACTOR',
}

export const selectCurrency = createAction<{ field: Field; currencyId: string }>('margin/selectCurrency')
export const switchCurrencies = createAction('margin/switchCurrencies')
export const typeInput = createAction<{ field: MarginField; typedValue: string }>('margin/typeInput')
export const replaceMarginTradeState = createAction<{
  lockedField: MarginField
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
  leverageFactor: string
  margin?: string
  borrow?: string
}>('margin/replaceMarginState')
export const setRecipient = createAction<{ recipient: string | null }>('margin/setRecipient')
export const setHideClosedLeveragePositions = createAction<{ hideClosedLeveragePositions: boolean }>(
  'swap/setHideClosedLeveragePositions'
)
export const setLocked = createAction<{ locked: MarginField | null }>('margin/setLocked')
