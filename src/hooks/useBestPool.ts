import { Currency } from '@uniswap/sdk-core'
import { FeeAmount, Pool } from '@uniswap/v3-sdk'
import JSBI from 'jsbi'
import { useMemo } from 'react'

import { PoolState, usePools } from './usePools'

export function useBestPool(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined
): [PoolState, Pool | undefined] {
  const currencyCombinations: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(() => {
    return [
      [inputCurrency, outputCurrency, FeeAmount.LOW],
      [inputCurrency, outputCurrency, FeeAmount.MEDIUM],
      [inputCurrency, outputCurrency, FeeAmount.HIGH],
    ]
  }, [inputCurrency, outputCurrency])

  const pools = usePools(currencyCombinations)

  return useMemo(() => {
    return pools
      .filter((tuple): tuple is [PoolState.EXISTS, Pool] => {
        return tuple[0] === PoolState.EXISTS && tuple[1] !== null
      })
      .reduce<[PoolState, Pool | undefined]>(
        (best, pool) => {
          if (!best[1]) {
            return pool
          } else if (pool[1] && JSBI.greaterThan(pool[1].liquidity, best[1]?.liquidity)) {
            return pool
          } else {
            return best
          }
        },
        [PoolState.NOT_EXISTS, undefined]
      )
  }, [pools])
}
