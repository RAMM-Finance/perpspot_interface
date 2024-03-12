// import { SupportedChainId } from '@looksrare/sdk'
import { FeeAmount } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { DATA_PROVIDER_ADDRESSES } from 'constants/addresses'
import { useMemo } from 'react'
import { DataProviderSDK } from 'utils/lmtSDK/DataProvider'

import { useContractCall } from './useContractCall'

// margin must be in input token amount
export function useMaxLeverage(
  marginInPosToken: boolean,
  token0?: string,
  token1?: string,
  fee?: FeeAmount,
  isToken0?: boolean,
  marginInInput?: BN,
  marginInOutput?: BN,
  inputCurrencyDecimals?: number,
  outputCurrencyDecimals?: number,
  startingLeverage = 120,
  stepSize = 2
) {
  const calldata = useMemo(() => {
    if (marginInPosToken) {
      if (
        !token0 ||
        !token1 ||
        !fee ||
        !marginInInput ||
        !marginInOutput ||
        !outputCurrencyDecimals ||
        !inputCurrencyDecimals
      )
        return undefined

      const params = [
        {
          poolKey: {
            token0,
            token1,
            fee,
          },
          isToken0,
          marginInInput: marginInInput.shiftedBy(inputCurrencyDecimals).toFixed(0),
          marginInOutput: marginInOutput.shiftedBy(outputCurrencyDecimals).toFixed(0),
          startingLeverage: new BN(startingLeverage).shiftedBy(18).toFixed(0),
          stepSize: new BN(stepSize).shiftedBy(18).toFixed(0),
          marginInPosToken,
        },
      ]

      return DataProviderSDK.INTERFACE.encodeFunctionData('computeMaxLeverage', params)
    } else {
      if (!token0 || !token1 || !fee || !marginInInput || !inputCurrencyDecimals) return undefined
      const params = [
        {
          poolKey: {
            token0,
            token1,
            fee,
          },
          isToken0,
          marginInInput: marginInInput.shiftedBy(inputCurrencyDecimals).toFixed(0),
          marginInOutput: '0',
          startingLeverage: new BN(startingLeverage).shiftedBy(18).toFixed(0),
          stepSize: new BN(stepSize).shiftedBy(18).toFixed(0),
          marginInPosToken,
        },
      ]

      return DataProviderSDK.INTERFACE.encodeFunctionData('computeMaxLeverage', params)
    }
  }, [
    token0,
    token1,
    fee,
    isToken0,
    marginInInput,
    marginInOutput,
    inputCurrencyDecimals,
    outputCurrencyDecimals,
    startingLeverage,
    stepSize,
    marginInPosToken,
  ])

  const { result, loading, error } = useContractCall(DATA_PROVIDER_ADDRESSES, calldata, false, 0)

  return useMemo(() => {
    if (error || loading) {
      return {
        loading,
        error,
        result: undefined,
      }
    }

    if (result) {
      try {
        const decoded = DataProviderSDK.INTERFACE.decodeFunctionResult('computeMaxLeverage', result)
        return {
          loading,
          error,
          result: new BN(decoded.toString()).shiftedBy(-18),
        }
      } catch {
        return {
          loading,
          error: 'error decoding result',
          result: new BN(0),
        }
      }
    }

    return {
      loading,
      error,
      result: undefined,
    }
  }, [loading, error, result])
}
