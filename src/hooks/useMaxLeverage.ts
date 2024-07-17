// import { SupportedChainId } from '@looksrare/sdk'
import { FeeAmount } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { DATA_PROVIDER_ADDRESSES } from 'constants/addresses'
import { useMemo } from 'react'
import { DataProviderSDK } from 'utils/lmtSDK/DataProvider'

import { useContractCallV2 } from './useContractCall'
import { useChainId } from 'wagmi'

// margin must be in input token amount
export function useMaxLeverage(
  marginInPosToken: boolean,
  token0?: string,
  token1?: string,
  fee?: FeeAmount,
  isToken0?: boolean,
  margin?: BN,
  inputCurrencyDecimals?: number,
  outputCurrencyDecimals?: number,
  startingLeverage = 120,
  stepSize = 2
): { loading: boolean; error: any; result: BN | undefined } {
  const chainId = useChainId()
  const calldata = useMemo(() => {
    if (!token0 || !token1 || !fee || !margin || !outputCurrencyDecimals || !inputCurrencyDecimals) return undefined

    const params = [
      {
        poolKey: {
          token0,
          token1,
          fee,
        },
        isToken0,
        margin: margin.shiftedBy(marginInPosToken ? outputCurrencyDecimals : inputCurrencyDecimals).toFixed(0),
        startingLeverage: new BN(startingLeverage).shiftedBy(18).toFixed(0),
        stepSize: new BN(stepSize).shiftedBy(18).toFixed(0),
        marginInPosToken,
      },
    ]

    return DataProviderSDK.INTERFACE.encodeFunctionData('computeMaxLeverage', params)
  }, [
    token0,
    token1,
    fee,
    isToken0,
    margin,
    inputCurrencyDecimals,
    outputCurrencyDecimals,
    startingLeverage,
    stepSize,
    marginInPosToken,
  ])

  const { result, loading, error } = useContractCallV2(chainId, DATA_PROVIDER_ADDRESSES, calldata, ['computeMaxLeverage'])

  return useMemo(() => {
    if (!calldata || !result) {
      return {
        loading,
        error: undefined,
        result: undefined,
      }
    }
    try {
      const parsed = DataProviderSDK.INTERFACE.decodeFunctionResult('computeMaxLeverage', result)
      return {
        loading,
        error,
        result: new BN(parsed.toString()).shiftedBy(-18),
      }
    } catch (e) {
      console.error(e)
      return {
        loading,
        error: e,
        result: undefined,
      }
    }
  }, [result, loading, error, calldata])
}
