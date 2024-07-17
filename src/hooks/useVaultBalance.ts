import { BigNumber as BN } from 'bignumber.js'
import { useSingleCallResult } from 'lib/hooks/multicall'
import { useCallback, useMemo } from 'react'

import { useArbVaultContract, useBaseVaultContract, useVaultContract } from './useContract'
import { SupportedChainId } from 'constants/chains'
import { LMT_VAULT } from 'constants/addresses'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

const useVaultBalance = (): { result: number | undefined; loading: boolean; error: any } => {
  const arbVault = useArbVaultContract()
  const baseVault = useBaseVaultContract()

  const enabled = useMemo(() => {
    return Boolean(arbVault && baseVault)
  }, [arbVault, baseVault])

  const fetchData = useCallback(async () => {
    return await Promise.all([
      arbVault?.totalAssets(),
      baseVault?.totalAssets()
    ])
  }, [arbVault, baseVault])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['vault'],
    queryFn: fetchData,
    enabled: enabled,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 60 * 1000, // 1 minute
    placeholderData: keepPreviousData,
  })
  
  return useMemo(() => {
    return {
      result: data && data[0] && data[1] ? new BN(data[0].toString()).plus(new BN(data[0].toString())).shiftedBy(-18).toNumber() : undefined,
      loading: isLoading,
      error: isError,
    }
  }, [data, isLoading, isError])
}

export default useVaultBalance
