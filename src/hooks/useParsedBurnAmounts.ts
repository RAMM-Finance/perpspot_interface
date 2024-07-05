import { useQuery } from '@tanstack/react-query'
import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import { BigNumber } from 'ethers'
import { useCallback, useMemo } from 'react'

import { useNFPMV2 } from './useContract'
import useTransactionDeadline from './useTransactionDeadline'

export const useParsedBurnAmounts = (
  tokenId: string | undefined,
  liquidity: BigNumber | undefined,
  token0: Token | undefined,
  token1: Token | undefined,
  percent: Percent | undefined
) => {
  const deadline = useTransactionDeadline()
  const enabled = useMemo(() => {
    return Boolean(tokenId && liquidity && token0 && token1 && Number(percent?.toFixed(0)) > 0 && deadline)
  }, [tokenId, liquidity, token0, token1, percent, deadline])
  const nfpm = useNFPMV2(true)
  const queryKey = useMemo(() => {
    if (!tokenId || !percent || !deadline || !enabled || !nfpm) return []
    return ['decreaseLiquidity', tokenId, percent.toFixed(10), deadline]
  }, [tokenId, liquidity, deadline, nfpm])

  const simulate = useCallback(async () => {
    if (!tokenId || !percent || !enabled || !deadline || !nfpm) throw new Error('invalid')

    const result = await nfpm.callStatic.decreaseLiquidity({
      tokenId,
      percentage: new BN(percent.toFixed(10)).shiftedBy(16).toFixed(0),
      amount0Min: '0',
      amount1Min: '0',
      deadline,
    })

    return result
  }, [tokenId, liquidity, token0, token1, percent, deadline])
  const {
    data: result,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    enabled,
    queryFn: simulate,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // console.log('zeke:', result, error, isLoading)
  return useMemo(() => {
    if (!result || !token0 || !token1) return undefined
    return {
      amount0: CurrencyAmount.fromRawAmount(token0, result.amount0.toString()),
      amount1: CurrencyAmount.fromRawAmount(token1, result.amount1.toString()),
    }
  }, [result, isLoading, error])
}
