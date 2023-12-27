import { Pool } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useMemo } from 'react'

import { useLmtPoolManagerContract } from './useContract'

export function useLmtFeePercent(pool: Pool | undefined): BN | undefined {
  const poolManager = useLmtPoolManagerContract()
  // keccak256(abi.encode(key.token0, key.token1, key.fee))
  const params = useMemo(() => {
    if (!pool) return [undefined]
    return [
      keccak256(
        defaultAbiCoder.encode(['address', 'address', 'uint24'], [pool.token0.address, pool.token1.address, pool.fee])
      ),
    ]
  }, [pool])

  const { loading, error, result } = useSingleCallResult(poolManager, 'feeParams', params)

  return useMemo(() => {
    if (loading || error || !result) return undefined
    return new BN(result.openFee.toString()).shiftedBy(-18)
  }, [loading, error, result])
}
