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

    let decodedResult
    try {
      decodedResult =result? LPVaultSDK.INTERFACE.decodeFunctionResult('totalAssets', result).toString() : undefined
    } catch(err){
      decodedResult = '0'
    }

    return {
      result: decodedResult,
      error,
      loading,
    }
  }, [loading, error, result])
}



export default useVaultBalance
