import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { useSingleCallResult } from 'lib/hooks/multicall'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { useEffect, useMemo, useState } from 'react'
import { MarginLimitOrder, MarginPositionDetails, OrderPositionKey, TraderPositionKey } from 'types/lmtv2position'

import { useToken } from './Tokens'
import { useDataProviderContract, useMarginFacilityContract } from './useContract'
import { computeOrderId, computePoolAddress } from './usePools'
import { convertToBN } from './useV3Positions'

// fetches all leveraged LMT positions for a given account
export function useLeveragedLMTPositions(account: string | undefined): UseLmtMarginPositionsResults {
  const dataProvider = useDataProviderContract()

  // make sure to have dataProvider provide the decimals for each token
  const { loading, error, result } = useSingleCallResult(dataProvider, 'getActiveMarginPositions', [account])

  return useMemo(() => {
    return {
      loading,
      error,
      positions: result?.[0]?.map((position: any) => {
        const inputDecimals = position.isToken0
          ? Number(position.token1Decimals.toString())
          : Number(position.token0Decimals.toString())
        const outputDecimals = position.isToken0
          ? Number(position.token0Decimals.toString())
          : Number(position.token1Decimals.toString())

        return {
          poolKey: {
            token0Address: position.poolKey.token0,
            token1Address: position.poolKey.token1,
            fee: position.poolKey.fee,
          },
          isToken0: position.isToken0,
          totalDebtOutput: convertToBN(position.totalDebtOutput, outputDecimals),
          totalDebtInput: convertToBN(position.totalDebtInput, inputDecimals),
          openTime: position.openTime,
          repayTime: position.repayTime,
          premiumDeposit: convertToBN(position.premiumDeposit, inputDecimals),
          totalPosition: convertToBN(position.totalPosition, outputDecimals),
          margin: convertToBN(position.margin, inputDecimals),
          premiumOwed: convertToBN(position.premiumOwed, inputDecimals),
          isBorrow: false,
          premiumLeft: convertToBN(position.premiumDeposit, inputDecimals).minus(
            convertToBN(position.premiumOwed, inputDecimals)
          ),
          token0Decimals: Number(position.token0Decimals.toString()),
          token1Decimals: Number(position.token1Decimals.toString()),
          trader: account,
        }
      }),
    }
  }, [loading, error, result, account])
}

// function getFee(fee: number): FeeAmount {
//   switch (fee) {
//     case FeeAmount.LOWEST:
//       return FeeAmount.LOWEST
//     case FeeAmount.MEDIUM:
//       return FeeAmount.MEDIUM
//     case FeeAmount.HIGH:
//       return FeeAmount.HIGH
//     default:
//       return FeeAmount.MEDIUM
//   }
// }

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()
  const [result, setResult] = useState<any>()
  const [lastBlockNumber, setBlockNumber] = useState<number | undefined>(undefined)
  const blockNumber = useBlockNumber()
  const { account } = useWeb3React()

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
      return undefined
    }
  }, [token0, token1, chainId, key])

  useEffect(() => {
    if (!params || loading || !blockNumber || (lastBlockNumber && lastBlockNumber + 2 > blockNumber)) return

    const call = async () => {
      try {
        setLoading(true)
        const result = await dataProvider?.callStatic.getMarginPosition(
          params[0] as string,
          params[1] as string,
          params[2] as boolean
        )
        setResult(result)
        setLoading(false)
        setBlockNumber(blockNumber)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    call()
  }, [dataProvider, params, blockNumber, lastBlockNumber, loading])

  return useMemo(() => {
    if (!result || !key || !account) {
      return {
        loading,
        error,
        position: undefined,
      }
    } else {
      const position = result
      const inputDecimals = position.isToken0
        ? Number(position.token1Decimals.toString())
        : Number(position.token0Decimals.toString())
      const outputDecimals = position.isToken0
        ? Number(position.token0Decimals.toString())
        : Number(position.token1Decimals.toString())
      return {
        loading,
        error,
        position: {
          poolKey: key.poolKey,
          positionId: new BN(0),
          isToken0: position.isToken0,
          totalDebtOutput: convertToBN(position.totalDebtOutput, outputDecimals),
          totalDebtInput: convertToBN(position.totalDebtInput, inputDecimals),
          openTime: position.openTime,
          repayTime: position.repayTime,
          premiumDeposit: convertToBN(position.premiumDeposit, inputDecimals),
          totalPosition: convertToBN(position.totalPosition, outputDecimals),
          margin: convertToBN(position.margin, inputDecimals),
          premiumOwed: convertToBN(position.premiumOwed, inputDecimals),
          isBorrow: false,
          premiumLeft: convertToBN(position.premiumDeposit, inputDecimals).minus(
            convertToBN(position.premiumOwed, inputDecimals)
          ),
          trader: account,
          token0Decimals: Number(position.token0Decimals.toString()),
          token1Decimals: Number(position.token1Decimals.toString()),
        },
      }
    }
  }, [loading, error, result, account, key])
}

export function useMarginOrderPositionFromPositionId(key: OrderPositionKey | undefined): MarginLimitOrder | undefined {
  // address pool, address trader, bool positionIsToken0, bool isAdd
  const MarginFacility = useMarginFacilityContract()
  const { chainId } = useWeb3React()
  const orderId = useMemo(() => {
    if (key && chainId) {
      const pool = computePoolAddress({
        factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
        tokenA: key.poolKey.token0Address,
        tokenB: key.poolKey.token1Address,
        fee: key.poolKey.fee,
      }) as string
      return computeOrderId(pool, key.trader, key.isToken0, key.isAdd)
    }
    return undefined
  }, [key, chainId])

  const { loading, error, result } = useSingleCallResult(MarginFacility, 'orders', [orderId])

  return useMemo(() => {
    if (loading || error || !result || !key) {
      return undefined
    }
    return {
      key: key.poolKey,
      positionIsToken0: key.isToken0,
      auctionDeadline: result.auctionDeadline,
      auctionStartTime: result.auctionStartTime,
      startOutput: convertToBN(result.startOutput, 18),
      minOutput: convertToBN(result.minOutput, 18),
      inputAmount: convertToBN(result.inputAmount, 18),
      decayRate: convertToBN(result.decayRate, 18),
      margin: convertToBN(result.margin, 18),
    }
  }, [result, loading, error, key])
}

interface UseLmtMarginPositionsResults {
  loading: boolean
  error: any
  positions: MarginPositionDetails[] | undefined
}
