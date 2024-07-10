import { Pool } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useCallback, useEffect, useState, useMemo } from 'react'

import { usePoolContract } from './useContract'

export function useLiveTick(poolAddress: string | undefined) {
  const pool = usePoolContract(poolAddress)
  const [tick, setTick] = useState<number | undefined>(undefined)

  const onSwap = useCallback((_sender: any, _recipient: any, _amount0: any, _amount1: any, _sqrtPriceX96: any, _liquidity: any, tick: any) => {
    setTick(tick)
  }, [])

  useEffect(() => {
    if (pool) {
      pool.on('Swap', onSwap)
      return () => {
        pool.removeListener('Swap', onSwap)
      }
    }
    return
  }, [pool, onSwap])

  return tick
}
