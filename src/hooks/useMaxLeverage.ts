import { Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { useEffect, useMemo, useState } from 'react'
import { TraderPositionKey } from 'types/lmtv2position'

import { useDataProviderContract } from './useContract'

const DEFAULT_MAX_LEVERAGE = '120'

export function useMaxLeverage(
  positionKey: TraderPositionKey | undefined,
  margin: string | undefined, // formatted to raw amount
  slippage: Percent | undefined,
  startingLeverage = DEFAULT_MAX_LEVERAGE
): { loading: boolean; error?: any; result?: BN } {
  const { chainId } = useWeb3React()
  const dataProvider = useDataProviderContract()

  // const [loading, setLoading] = useState(false)
  // const [error, setError] = useState<any>()
  // const [result, setResult] = useState<any>()
  // const [lastBlockNumber, setBlockNumber] = useState<number | undefined>(undefined)

  const blockNumber = useBlockNumber()
  const [state, setState] = useState<{
    result?: any
    loading: boolean
    error?: any
    blockNumber?: number
    margin?: string
    slippage?: Percent
    positionKey?: TraderPositionKey
  }>({
    result: undefined,
    loading: false,
    error: undefined,
    blockNumber: undefined,
    margin: undefined,
    slippage: undefined,
    positionKey: undefined,
  })

  useEffect(() => {
    if (
      (state.loading && state.margin === margin && state.slippage?.toFixed(18) === slippage?.toFixed(18)) ||
      state.positionKey === positionKey
    ) {
      return
    }

    if (
      !blockNumber ||
      (state.blockNumber && state.blockNumber + 2 > blockNumber) ||
      !margin ||
      !slippage ||
      !positionKey ||
      !dataProvider
    ) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: undefined,
        margin: undefined,
        slippage: undefined,
        positionKey: undefined,
      }))
      return
    }

    const call = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }))

        const poolKey = {
          token0: positionKey.poolKey.token0Address,
          token1: positionKey.poolKey.token1Address,
          fee: positionKey.poolKey.fee,
        }

        const result = await dataProvider.callStatic.findMaxLeverageWithEstimatedSlippage(
          poolKey,
          margin,
          positionKey.isToken0,
          new BN(999).shiftedBy(15).toFixed(0),
          startingLeverage
        )

        setState((prev) => ({
          ...prev,
          margin,
          slippage,
          positionKey,
          blockNumber,
          result: new BN(result.toString()),
          loading: false,
          error: undefined,
        }))
      } catch (error) {
        console.log('maxLeverage error', error)
        setState((prev) => ({
          ...prev,
          margin: undefined,
          slippage: undefined,
          positionKey: undefined,
          loading: false,
          error,
        }))
      }
    }

    call()
  }, [margin, positionKey, slippage, startingLeverage, blockNumber, dataProvider, state])

  return useMemo(() => {
    return {
      loading: state.loading,
      error: state.error,
      result: state.result,
    }
  }, [state])
}
