import { Pool } from '@uniswap/v3-sdk'
import { useMemo } from 'react'
import { useTickDiscretization } from 'state/mint/v3/hooks'
import { LiquidityLoan, MarginPositionDetails } from 'types/lmtv2position'

export enum BorrowedLiquidityRange {
  INVALID,
  IN_RANGE,
  BELOW_RANGE,
  ABOVE_RANGE,
}

export function useBorrowedLiquidityRange(
  position: MarginPositionDetails | undefined,
  pool: Pool | undefined
): BorrowedLiquidityRange {
  const { tickDiscretization } = useTickDiscretization(
    position?.poolKey.token0Address,
    position?.poolKey.token1Address,
    pool?.fee
  )

  return useMemo(() => {
    if (!position || !pool || !tickDiscretization) return BorrowedLiquidityRange.INVALID

    const [lowerTick, upperTick] = getLiquidityTicks(position.borrowInfo, tickDiscretization)
    const currentTick = pool.tickCurrent

    if (currentTick < lowerTick) return BorrowedLiquidityRange.BELOW_RANGE
    if (currentTick > upperTick) return BorrowedLiquidityRange.ABOVE_RANGE
    return BorrowedLiquidityRange.IN_RANGE
  }, [position, pool, tickDiscretization])
}

export function getLiquidityTicks(
  borrowInfo: LiquidityLoan[],
  tickDiscretization: number
): [lowerTick: number, upperTick: number] {
  const ticks = borrowInfo.map((info) => info.tick)
  const lowerTick = Math.min(...ticks)
  const upperTick = Math.max(...ticks)
  return [lowerTick, upperTick + tickDiscretization]
}
