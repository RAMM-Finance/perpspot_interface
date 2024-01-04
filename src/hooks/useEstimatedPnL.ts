import { Currency } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import { DATA_PROVIDER_ADDRESSES } from 'constants/addresses'
import { useMemo } from 'react'
import { MarginPositionDetails, OrderPositionKey } from 'types/lmtv2position'
import { DataProviderSDK } from 'utils/lmtSDK/DataProvider'
import { TokenBN } from 'utils/lmtSDK/internalConstants'

import { useContractCall } from './useContractCall'
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
  outputCurrency?: Currency
): {
  loading: boolean
  error: any
  result: TokenBN | undefined
} {
  const calldata = useMemo(() => {
    if (!orderKey || !existingPosition || !reduceAmount || !limitPrice || !outputCurrency) return undefined
    if (reduceAmount.lte(0) || limitPrice.lte(0)) return undefined

    const reducePercentage = reduceAmount.div(existingPosition.totalPosition).shiftedBy(18).toFixed(0)
    const fillerOutput = reduceAmount.times(limitPrice).shiftedBy(outputCurrency.decimals).toFixed(0)
    const params = [
      {
        token0: orderKey.poolKey.token0Address,
        token1: orderKey.poolKey.token1Address,
        fee: orderKey.poolKey.fee,
      },
      orderKey.trader,
      orderKey.isToken0,
      reducePercentage,
      fillerOutput,
    ]
    return DataProviderSDK.INTERFACE.encodeFunctionData('getEstimatedPnl', params)
  }, [orderKey, existingPosition, reduceAmount, limitPrice, outputCurrency])

  const { loading, error, result } = useContractCall(DATA_PROVIDER_ADDRESSES, calldata, false, 1)

  return useMemo(() => {
    if (result && outputCurrency) {
      const parsed = DataProviderSDK.INTERFACE.decodeFunctionResult('getEstimatedPnl', result)[0]
      return {
        loading,
        error,
        result: new TokenBN(parsed.toString(), outputCurrency.wrapped, true),
      }
    } else {
      return {
        loading,
        error,
        result: undefined,
      }
    }
  }, [result, loading, error, outputCurrency])
}
