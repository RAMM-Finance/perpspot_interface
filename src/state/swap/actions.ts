import { createAction } from '@reduxjs/toolkit'
import { BigNumber as BN } from 'bignumber.js'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export enum ActiveSwapTab {
  LONG,
  SHORT,
  BORROW,
  SWAP,
}

export const selectCurrency = createAction<{ field: Field; currencyId: string }>('swap/selectCurrency')
export const switchCurrencies = createAction<{
  leverage: boolean
}>('swap/switchCurrencies')
export const typeInput = createAction<{ field: Field; typedValue: string }>('swap/typeInput')
export const replaceSwapState = createAction<{
  field: Field
  typedValue: string
  originInputId?: string
  originOutputId?: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
  leverage: boolean
  leverageFactor?: string
  hideClosedLeveragePositions: boolean
  leverageManagerAddress?: string
  activeTab: ActiveSwapTab
  ltv?: string
  borrowManagerAddress?: string
  premium?: BN
  tab: string
}>('swap/replaceSwapState')
export const setRecipient = createAction<{ recipient: string | null }>('swap/setRecipient')
export const setLeverageFactor = createAction<{ leverageFactor: string }>('swap/setLeverageFactor')
export const setHideClosedLeveragePositions = createAction<{ hideClosedLeveragePositions: boolean }>(
  'swap/setHideClosedLeveragePositions'
)
export const setLeverage = createAction<{ leverage: boolean }>('swap/setLeverage')
export const setLeverageManagerAddress = createAction<{ leverageManagerAddress: string }>(
  'swap/setLeverageManagerAddress'
)
export const setActiveTab = createAction<{ activeTab: ActiveSwapTab }>('swap/setActiveTab')
export const setLTV = createAction<{ ltv: string }>('swap/setLTV')
export const setBorrowManagerAddress = createAction<{ borrowManagerAddress: string }>('swap/setBorrowManagerAddress')
export const setPremium = createAction<{ premium: BN }>('swap/setPremium')
export const setSwapTab = createAction<{ tab: string }>('swap/setSwapTab')
