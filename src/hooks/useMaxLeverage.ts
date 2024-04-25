// import { SupportedChainId } from '@looksrare/sdk'
import { FeeAmount } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { useSingleContractWithCallData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { DataProviderSDK } from 'utils/lmtSDK/DataProvider'

import { useDataProviderContract } from './useContract'

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
): { loading: boolean; error: any; result: BN | undefined } {
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

  // const { result, loading, error } = useContractCall(DATA_PROVIDER_ADDRESSES, calldata, false, 0)
  const dataProvider = useDataProviderContract()
  const callStates = useSingleContractWithCallData(dataProvider, calldata ? [calldata] : [], {
    gasRequired: 10_000_000,
  })

  return useMemo(() => {
    if (callStates[0]) {
      return {
        loading: callStates[0].loading,
        error: callStates[0].error,
        result: callStates[0].result ? new BN(callStates[0].result[0].toString()).shiftedBy(-18) : undefined,
      }
    }

    return {
      loading: false,
      error: undefined,
      result: undefined,
    }
  }, [callStates])
}
