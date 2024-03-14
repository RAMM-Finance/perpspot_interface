import { createAction } from '@reduxjs/toolkit'
import { RawPoolKey } from 'types/lmtv2position'

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
// export const selectPair = createAction<{
//   fieldIn: Field
//   fieldOut: Field
//   currencyIdIn: string
//   currencyIdOut: string
// }>('swap/selectPair')
export const selectPool = createAction<{
  inputCurrencyId: string
  outputCurrencyId: string
  poolKey: RawPoolKey
}>('swap/selectPool')
export const selectCurrency = createAction<{ field: Field; currencyId: string }>('swap/selectCurrency')
export const switchCurrencies = createAction<{
  leverage: boolean
}>('swap/switchCurrencies')
export const typeInput = createAction<{ field: Field; typedValue: string }>('swap/typeInput')
export const replaceSwapState = createAction<{
  field: Field
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
  leverage: boolean
  leverageFactor?: string
  activeTab: ActiveSwapTab
  ltv?: string
  poolKey?: RawPoolKey
}>('swap/replaceSwapState')
export const setRecipient = createAction<{ recipient: string | null }>('swap/setRecipient')
export const setLeverageFactor = createAction<{ leverageFactor: string }>('swap/setLeverageFactor')
export const setLeverage = createAction<{ leverage: boolean }>('swap/setLeverage')

export const setActiveTab = createAction<{ activeTab: ActiveSwapTab }>('swap/setActiveTab')
export const setLTV = createAction<{ ltv: string }>('swap/setLTV')
