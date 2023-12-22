import { Currency, Percent } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { useEffect, useMemo, useState } from 'react'
import { TraderPositionKey } from 'types/lmtv2position'

import { useDataProviderContract } from './useContract'

const DEFAULT_MAX_LEVERAGE = '120'

export function useMaxLeverage(
  positionKey: TraderPositionKey | undefined,
  margin: BN | undefined, // formatted to raw amount
  inputCurrency: Currency | undefined,
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
  const [result, setResult] = useState<BN>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()
  const [lastBlockNumber, setBlockNumber] = useState<number | undefined>(undefined)
  const [lastParams, setLastParams] = useState<{
    margin?: BN
    slippage?: Percent
    positionKey?: TraderPositionKey
  }>({})

  useEffect(() => {
    if (!blockNumber || !margin || !slippage || !positionKey || !dataProvider || !inputCurrency) {
      setResult(undefined)
      setLoading(false)
      setError(undefined)
      return
    }

    if (loading) {
      return
    }

    if (margin.isZero()) {
      setResult(undefined)
      setLoading(false)
      setError(undefined)
      return
    }

    if (
      lastBlockNumber &&
      lastBlockNumber + 1 > blockNumber &&
      lastParams.margin === margin &&
      lastParams.slippage === slippage &&
      lastParams.positionKey === positionKey
    ) {
      return
    }

    const call = async () => {
      try {
        setLoading(true)

        const poolKey = {
          token0: positionKey.poolKey.token0Address,
          token1: positionKey.poolKey.token1Address,
          fee: positionKey.poolKey.fee,
        }

        const result = await dataProvider.callStatic.findMaxLeverageWithEstimatedSlippage(
          poolKey,
          margin.shiftedBy(inputCurrency.decimals).toFixed(0),
          positionKey.isToken0,
          new BN(999).shiftedBy(15).toFixed(0),
          startingLeverage
        )

        setResult(new BN(result.toString()))
        setLoading(false)
        setError(undefined)
        setBlockNumber(blockNumber)
        setLastParams({
          margin,
          slippage,
          positionKey,
        })
      } catch (error) {
        console.log('maxLeverage error', error)
        setResult(undefined)
        setLoading(false)
        setError(error)
        setBlockNumber(blockNumber)
        setLastParams({
          margin: undefined,
          slippage: undefined,
          positionKey: undefined,
        })
      }
    }

    call()
  }, [
    margin,
    positionKey,
    inputCurrency,
    slippage,
    startingLeverage,
    blockNumber,
    dataProvider,
    loading,
    lastBlockNumber,
    lastParams,
  ])

  return useMemo(() => {
    return {
      loading,
      error,
      result,
    }
  }, [loading, error, result])
}
