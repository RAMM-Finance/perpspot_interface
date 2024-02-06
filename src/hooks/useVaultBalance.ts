import { LMT_VAULT } from 'constants/addresses'
import { useMemo } from 'react'
import { LPVaultSDK } from 'utils/lmtSDK/LPVault'

import { useContractCall } from './useContractCall'

const useVaultBalance = () => {
  // const vault = useVaultContract()
  const calldata = useMemo(() => {
    return LPVaultSDK.INTERFACE.encodeFunctionData('totalAssets')
  }, [])

  const { result, error, loading, syncing } = useContractCall(LMT_VAULT, calldata, false, 5)

  return useMemo(() => {
    return {
      result: result ? LPVaultSDK.INTERFACE.decodeFunctionResult('totalAssets', result).toString() : undefined,
      error,
      loading,
    }
  }, [loading, error, result])
}

export default useVaultBalance
