import { atom, useAtom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { useCallback } from 'react'

export enum OrderSortMethod {
  PAIR = 'Pair',
  LEVERAGE = 'Leverage',
  INPUT = 'Input',
  OUTPUT = 'Output',
}

export const filterStringAtom = atomWithReset<string>('')
export const sortMethodAtom = atom<OrderSortMethod>(OrderSortMethod.OUTPUT)
export const sortAscendingAtom = atom<boolean>(false)

/* keep track of sort category for token table */
export function useSetSortMethod(newSortMethod: OrderSortMethod) {
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
