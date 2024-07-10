import { useQuery } from '@tanstack/react-query'
import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { BigNumber as BN } from 'bignumber.js'
import { LMT_NFT_POSITION_MANAGER } from 'constants/addresses'
import { BigNumber } from 'ethers'
import JSBI from 'jsbi'
import { useCallback, useMemo } from 'react'
import { NonfungiblePositionManager as NFPM } from 'utils/lmtSDK/NFTPositionManager'
import { unwrappedToken } from 'utils/unwrappedToken'

import { useNFPMV2 } from './useContract'
import { useContractCallV2 } from './useContractCall'
import useTransactionDeadline from './useTransactionDeadline'
export const useParsedBurnAmounts = (
  tokenId: string | undefined,
  maxPercentage: number | undefined,
  token0: Token | undefined,
  token1: Token | undefined,
  percent: Percent | undefined
) => {
  const deadline = useTransactionDeadline()
  const enabled = useMemo(() => {
    return Boolean(
      tokenId &&
        maxPercentage &&
        token0 &&
        token1 &&
        Number(percent?.toFixed(0)) > 0 &&
        maxPercentage >= Number(percent?.toFixed(18)) &&
        deadline
    )
  }, [tokenId, maxPercentage, token0, token1, percent, deadline])
  const nfpm = useNFPMV2(true)
  const queryKey = useMemo(() => {
    if (!tokenId || !percent || !deadline || !enabled || !nfpm) return []
    return ['decreaseLiquidity', tokenId, percent.toFixed(10), deadline]
  }, [tokenId, deadline, nfpm])

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
  }, [tokenId, token0, token1, percent, deadline])

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

  console.log('zeke:', result, error, isLoading)

  // console.log('zeke:', result, error, isLoading)
  return useMemo(() => {
    if (!result || !token0 || !token1) return undefined
    return {
      amount0: CurrencyAmount.fromRawAmount(token0, result.amount0.toString()),
      amount1: CurrencyAmount.fromRawAmount(token1, result.amount1.toString()),
    }
  }, [result, isLoading, error])
}

export const useParsedBurnAmountsV1 = (
  tokenId: string | undefined,
  liquidity: BigNumber | undefined,
  token0: Token | undefined,
  token1: Token | undefined,
  percent: Percent | undefined
) => {
  const deadline = useTransactionDeadline()
  const calldata = useMemo(() => {
    if (!liquidity || !tokenId || !deadline) return undefined
    return NFPM.INTERFACE.encodeFunctionData('decreaseLiquidity', [
      {
        tokenId,
        liquidity: liquidity.toString(),
        amount0Min: '0',
        amount1Min: '0',
        deadline: deadline.toString(),
      },
    ])
  }, [tokenId, liquidity, deadline])

  const { result, error, loading } = useContractCallV2(LMT_NFT_POSITION_MANAGER, calldata, ['decreaseLiquidity'])

  return useMemo(() => {
    if (loading || error) {
      return {
        loading,
        error,
        result: undefined,
      }
    }
    if (result && token0 && token1 && percent) {
      try {
        const parsed = NFPM.INTERFACE.decodeFunctionResult('decreaseLiquidity', result)
        const amount0 = percent.multiply(JSBI.BigInt(parsed[0].toString())).quotient
        const amount1 = percent.multiply(JSBI.BigInt(parsed[1].toString())).quotient
        return {
          loading,
          error,
          result: {
            amount0: CurrencyAmount.fromRawAmount(unwrappedToken(token0), amount0),
            amount1: CurrencyAmount.fromRawAmount(unwrappedToken(token1), amount1),
          },
        }
      } catch (err) {
        return {
          loading: false,
          error: {
            message: 'Unable to parse burn amounts',
          },
          result: undefined,
        }
      }
    }
    return {
      loading,
      error,
      result: undefined,
    }
  }, [result, loading, error, token0, token1, percent])
}
