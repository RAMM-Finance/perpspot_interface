import { useWeb3React } from '@web3-react/core'
import { useSingleContractWithCallData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { TraderPositionKey } from 'types/lmtv2position'
import { DataProviderSDK } from 'utils/lmtSDK/DataProvider'

import { DEFAULT_GAS_QUOTE, QUOTE_GAS_OVERRIDES } from './useClientSideV3Trade'
import { useDataProviderContract } from './useContract'

export function useInstantaneousRate(key: TraderPositionKey | undefined) {
  const { chainId } = useWeb3React()
  const calldata = useMemo(() => {
    if (!key) return []
    const result = DataProviderSDK.getPostInstantaneousRateCalldata(key)
    return [result]
  }, [key])
  const dataProvider = useDataProviderContract()
  const result = useSingleContractWithCallData(dataProvider, calldata, {
    gasRequired: chainId ? QUOTE_GAS_OVERRIDES[chainId] ?? DEFAULT_GAS_QUOTE : undefined,
  })
}
