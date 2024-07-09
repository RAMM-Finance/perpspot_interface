import { atom, useAtom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { useCallback } from 'react'

export enum PoolSortMethod {
  PRICE = 'Price',
  DELTA = 'Delta',
}

export enum PoolFilterByCategory {
  ALL = '',
  AI = 'AI',
  DEFI = 'DeFi',
  MEME = 'Meme',
}

export const poolFilterStringAtom = atomWithReset<string>('')
export const poolFilterByCategory = atom<PoolFilterByCategory>(PoolFilterByCategory.ALL)
export const poolSortMethodAtom = atom<PoolSortMethod>(PoolSortMethod.PRICE)
export const poolSortAscendingAtom = atom<boolean>(false)

/* keep track of sort category for token table */
export function useSetPoolSortMethod(newSortMethod: PoolSortMethod) {
  const [sortMethod, setSortMethod] = useAtom(poolSortMethodAtom)
  const [sortAscending, setSortAscending] = useAtom(poolSortAscendingAtom)

  return useCallback(() => {
    if (sortMethod === newSortMethod) {
      setSortAscending(!sortAscending)
    } else {
      setSortMethod(newSortMethod)
      setSortAscending(false)
    }
  }, [sortMethod, setSortMethod, setSortAscending, sortAscending, newSortMethod])
}
