import { atom, useAtom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { useCallback } from 'react'

export enum PositionSortMethod {
  VALUE = 'Net Value',
  COLLATERAL = 'Margin',
  // RECENT_PREMIUM = 'Recent Premium',
  REPAYTIME = 'Hourly Rate',
  PNL = 'PnL',
  ENTRYPRICE = 'Entry/Current Price',
  REMAINING = 'Int. Left',
  ACTIONS = '',
  // UNUSED_PREMIUM = 'Unused Premium'
}

export const filterStringAtom = atomWithReset<string>('')
export const sortMethodAtom = atom<PositionSortMethod>(PositionSortMethod.REPAYTIME)
export const sortAscendingAtom = atom<boolean>(false)

/* keep track of sort category for token table */
export function useSetSortMethod(newSortMethod: PositionSortMethod) {
  const [sortMethod, setSortMethod] = useAtom(sortMethodAtom)
  const [sortAscending, setSortAscending] = useAtom(sortAscendingAtom)

  return useCallback(() => {
    if (sortMethod === newSortMethod) {
      setSortAscending(!sortAscending)
    } else {
      setSortMethod(newSortMethod)
      setSortAscending(false)
    }
  }, [sortMethod, setSortMethod, setSortAscending, sortAscending, newSortMethod])
}
