import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { LMT_NFT_POSITION_MANAGER } from 'constants/addresses'
import { BigNumber } from 'ethers'
import JSBI from 'jsbi'
import { useMemo } from 'react'
import { NonfungiblePositionManager as NFPM } from 'utils/lmtSDK/NFTPositionManager'
import { unwrappedToken } from 'utils/unwrappedToken'

import { useContractCall } from './useContractCall'
import useTransactionDeadline from './useTransactionDeadline'

export const useParsedBurnAmounts = (
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

  // const contract = useLmtNFTPositionManager(true)
  const { result, error, loading } = useContractCall(LMT_NFT_POSITION_MANAGER, calldata, true)
  console.log('zeke:', result)

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
