import { Contract } from '@ethersproject/contracts'
import { FeeAmount } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { useSingleCallResult } from 'lib/hooks/multicall'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { useEffect, useMemo, useState } from 'react'
import { MarginPositionDetails, TraderPositionKey } from 'types/lmtv2position'

import { useToken } from './Tokens'
import { useDataProviderContract } from './useContract'
import { computePoolAddress } from './usePools'
import { convertToBN } from './useV3Positions'

// fetches all leveraged LMT positions for a given account
export function useLeveragedLMTPositions(account: string | undefined): UseLmtMarginPositionsResults {
  const dataProvider = useDataProviderContract()

  const { loading, error, result } = useSingleCallResult(dataProvider, 'getActiveMarginPositions', [account])

  return useMemo(() => {
    return {
      loading,
      error,
      positions: result?.[0]?.map((position: any) => {
        return {
          poolKey: {
            token0Address: position.poolKey.token0Address,
            token1Address: position.poolKey.token1Address,
            fee: getFee(position.poolKey.fee),
          },
          isToken0: position.isToken0,
          totalDebtOutput: convertToBN(position.totalDebtOutput, 18),
          totalDebtInput: convertToBN(position.totalDebtInput, 18),
          openTime: position.openTime,
          repayTime: position.repayTime,
          premiumDeposit: convertToBN(position.premiumDeposit, 18),
          totalPosition: convertToBN(position.totalPosition, 18),
          margin: convertToBN(position.margin, 18),
          premiumOwed: convertToBN(position.premiumOwed, 18),
          isBorrow: false,
          premiumLeft: convertToBN(position.premiumDeposit, 18).minus(convertToBN(position.premiumOwed, 18)),
        }
      }),
    }
  }, [loading, error, result])
}

function getFee(fee: number): FeeAmount {
  switch (fee) {
    case FeeAmount.LOWEST:
      return FeeAmount.LOWEST
    case FeeAmount.MEDIUM:
      return FeeAmount.MEDIUM
    case FeeAmount.HIGH:
      return FeeAmount.HIGH
    default:
      return FeeAmount.MEDIUM
  }
}

// fetches corresponding LMT position, if it exists then openTime > 0
export function useMarginLMTPositionFromPositionId(key: TraderPositionKey | undefined): {
  loading: boolean
  error: any
  position: MarginPositionDetails | undefined
} {
  const { chainId } = useWeb3React()
  const dataProvider = useDataProviderContract()
  const token0 = useToken(key?.poolKey.token0Address)
  const token1 = useToken(key?.poolKey.token1Address)

  const params = useMemo(() => {
    if (token0 && token1 && chainId && key) {
      return [
        computePoolAddress({
          factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId ?? SupportedChainId.SEPOLIA],
          tokenA: token0,
          tokenB: token1,
          fee: key?.poolKey.fee,
        }),
        key.trader,
        key.isToken0,
      ]
    } else {
      return ['', '', false]
    }
  }, [token0, token1, chainId, key])

  const { loading, error, result } = useSingleViewCall(dataProvider, 'getMarginPosition', params)

  return useMemo(() => {
    if (!result) {
      return {
        loading,
        error,
        position: undefined,
      }
    } else {
      const position = result
      return {
        loading,
        error,
        position: {
          poolKey: {
            token0Address: position.poolKey.token0Address,
            token1Address: position.poolKey.token1Address,
            fee: getFee(position.poolKey.fee),
          },
          positionId: new BN(0),
          isToken0: position.isToken0,
          totalDebtOutput: convertToBN(position.totalDebtOutput, 18),
          totalDebtInput: convertToBN(position.totalDebtInput, 18),
          openTime: position.openTime,
          repayTime: position.repayTime,
          premiumDeposit: convertToBN(position.premiumDeposit, 18),
          totalPosition: convertToBN(position.totalPosition, 18),
          margin: convertToBN(position.margin, 18),
          premiumOwed: convertToBN(position.premiumOwed, 18),
          isBorrow: false,
          premiumLeft: convertToBN(position.premiumDeposit, 18).minus(convertToBN(position.premiumOwed, 18)),
        },
      }
    }
  }, [loading, error, result])
}

type ContractArg = string | number | boolean

export function useSingleViewCall(
  contract: Contract | null,
  method: string | undefined,
  params: ContractArg[] | undefined
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()
  const [result, setResult] = useState<any>()
  const blockNumber = useBlockNumber()
  const [lastBlockNumber, setLastBlockNumber] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (loading || !contract || !method || lastBlockNumber == blockNumber || !params) return
    const call = async () => {
      try {
        setLoading(true)
        const result = await contract.callStatic[method](...params)
        setResult(result)
        setLoading(false)
        setLastBlockNumber(blockNumber)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    call()
  }, [contract, method, params, blockNumber, lastBlockNumber, loading])

  return { loading, error, result }
}

// fetches all borrow LMT positions for a given account
// export function useBorrowLMTPositions(account: string | undefined): {
//   loading: boolean
//   error: any
//   positions: BorrowLMTPositionDetails[] | undefined
// } {
//   return [] as any
// }

// export function useBorrowLMTPositionFromKeys(
//   account: string | undefined,
//   isToken0: boolean | undefined,
//   key: RawPoolKey | undefined
// ): { loading: boolean; error: any; position: BorrowLMTPositionDetails | undefined } {
//   return [] as any
// }

interface UseLmtMarginPositionsResults {
  loading: boolean
  error: any
  positions: MarginPositionDetails[] | undefined
}
