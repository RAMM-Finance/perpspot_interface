import { Currency } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import { useSingleContractWithCallData } from 'lib/hooks/multicall'
import { useMemo } from 'react'
import { MarginPositionDetails, OrderPositionKey } from 'types/lmtv2position'
import { DataProviderSDK } from 'utils/lmtSDK/DataProvider'
import { TokenBN } from 'utils/lmtSDK/internalConstants'

import { useDataProviderContract } from './useContract'
/**
 * fetches the limit pnl for a given reduction of margin position, returns in inputCurrency.
 * @param orderKey
 * @param existingPosition
 * @param reduceAmount
 * @param limitPrice must be input / output
 */
export function useEstimatedPnL(
  orderKey?: OrderPositionKey,
  existingPosition?: MarginPositionDetails,
  reduceAmount?: BN,
  limitPrice?: BN,
  outputCurrency?: Currency,
  inputCurrency?: Currency
): {
  loading: boolean
  error: any
  result: TokenBN | undefined
} {
  const calldata = useMemo(() => {
    if (!orderKey || !existingPosition || !reduceAmount || !limitPrice || !outputCurrency || !inputCurrency)
      return undefined
    if (reduceAmount.lte(0) || limitPrice.lte(0)) return undefined

    const reducePercentage = reduceAmount.div(existingPosition.totalPosition).shiftedBy(18).toFixed(0)
    const fillerOutput = reduceAmount.times(limitPrice).shiftedBy(inputCurrency.decimals).toFixed(0)
    const params = [
      {
        token0: orderKey.poolKey.token0,
        token1: orderKey.poolKey.token1,
        fee: orderKey.poolKey.fee,
      },
      orderKey.trader,
      orderKey.isToken0,
      reducePercentage,
      fillerOutput,
    ]
    return DataProviderSDK.INTERFACE.encodeFunctionData('getEstimatedPnl', params)
  }, [orderKey, existingPosition, reduceAmount, limitPrice, outputCurrency, inputCurrency])

  const dataProvider = useDataProviderContract()
  const callStates = useSingleContractWithCallData(dataProvider, calldata ? [calldata] : [])
  return useMemo(() => {
    if (callStates.length > 0 && callStates[0] && inputCurrency) {
      return {
        loading: callStates[0].loading,
        error: callStates[0].error,
        result: callStates[0].result
          ? new TokenBN(callStates[0].result[0].toString(), inputCurrency.wrapped, true)
          : undefined,
      }
    }
    return {
      loading: false,
      error: undefined,
      result: undefined,
    }
  }, [callStates, inputCurrency])
}
