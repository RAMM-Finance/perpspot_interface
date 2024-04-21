import { BigNumber as BN } from 'bignumber.js'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useMemo } from 'react'

import { useVaultContract } from './useContract'

const useVaultBalance = (): { result: number | null; loading: boolean; error: any } => {
  const vault = useVaultContract()
  const { result, loading, error } = useSingleCallResult(vault, 'totalAssets')

  return useMemo(() => {
    return {
      result: result ? new BN(result[0].toString()).shiftedBy(-18).toNumber() : null,
      loading,
      error,
    }
  }, [loading, error, result])
}

export default useVaultBalance
