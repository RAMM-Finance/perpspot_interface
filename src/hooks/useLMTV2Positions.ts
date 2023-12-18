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

// export function usePoolParams(pool: Pool | undefined): PoolParams | undefined {
//   // getParams
//   const poolManager = useLmtPoolManagerContract()
//   const { chainId } = useWeb3React()

//   const poolAddress = useMemo(() => {
//     if (!pool) return undefined
//     return PoolCache.getPoolAddress(
//       V3_CORE_FACTORY_ADDRESSES[chainId ?? SupportedChainId.SEPOLIA],
//       pool.token0,
//       pool.token1,
//       pool.fee
//     )
//   }, [chainId, pool])
//   const { loading, error, result } = useSingleCallResult(poolManager, 'PoolParams', [poolAddress])

//   return useMemo(() => {
//     if (!result || loading || error) {
//       return undefined
//     } else {
//               console.log('huh',result.MIN_PREMIUM_DEPOSIT)

//       return {
//         minimumPremiumDeposit: convertToBN(result.MIN_PREMIUM_DEPOSIT, 18),
//       }
//     }
//   }, [result, loading, error])
// }

export function useInstantaeneousRate(
  token0: string | undefined,
  token1: string | undefined,
  fee: number | undefined,
  trader: string | undefined,
  positionIsToken0: boolean | undefined
): string | undefined {
  const dataProvider = useDataProviderContract()
  const blockNumber = useBlockNumber()
  const [lastBlockNumber, setBlockNumber] = useState<number | undefined>(undefined)

  const [data, setData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()

  useEffect(() => {
    if (!trader || loading || !blockNumber || (lastBlockNumber && lastBlockNumber + 2 > blockNumber)) return
    if (positionIsToken0 == undefined) return
    const call = async () => {
      try {
        setLoading(true)
        const result = await dataProvider?.getPostInstantaeneousRate(
          {
            token0: token0 as string,
            token1: token1 as string,
            fee: fee as number,
          },
          trader as string,
          positionIsToken0 as boolean
        )
        setData(result)
        setLoading(false)
        setBlockNumber(blockNumber)
      } catch (error) {
        setError(error)
        setLoading(false)
        console.log('instant rate', error)
      }
    }
    call()
  }, [dataProvider, loading, lastBlockNumber, blockNumber, token0, token1, fee, trader, positionIsToken0])

  return useMemo(() => {
    if (!data) {
      return null
    } else {
      return data
    }
  }, [token0, token1, fee, trader, positionIsToken0, error, data])
}

export function useBulkBinData(
  token0: string | undefined,
  token1: string | undefined,
  fee: number | undefined,
  currentTick: number | undefined
): BinData[] | undefined {
  const dataProvider = useDataProviderContract()
  const blockNumber = useBlockNumber()
  const [lastBlockNumber, setBlockNumber] = useState<number | undefined>(undefined)

  const [data, setData] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()

  useEffect(() => {
    if (!currentTick || loading || !blockNumber || (lastBlockNumber && lastBlockNumber + 2 > blockNumber)) return
    const tickRounded = Math.ceil(currentTick / 100) * 100

    const call = async () => {
      try {
        setLoading(true)

        const result = await dataProvider?.getBinsDataInBulk(
          {
            token0: token0 as string,
            token1: token1 as string,
            fee: fee as number,
          },
          (tickRounded - 3000) as number,
          (tickRounded + 3000) as number
        )
        setData(result)
        setLoading(false)
        setBlockNumber(blockNumber)
      } catch (error) {
        setError(error)
        setLoading(false)
        console.log('maxWithdrawableerr', error)
      }
    }
    call()
  }, [dataProvider, loading, lastBlockNumber, blockNumber, token0, token1, fee, currentTick])

  return useMemo(() => {
    if (!data) {
      return null
    } else {
      return data
    }
  }, [token0, token1, fee, currentTick, error, data])
}

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
          maxWithdrawablePremium: convertToBN(position.maxWithdrawablePremium, inputDecimals).toString(),
        }
      }),
    }
  }, [loading, error, result, account])
}

export function useLMTOrders(account: string | undefined): UseLmtOrdersResults {
  const dataProvider = useDataProviderContract()

  // make sure to have dataProvider provide the decimals for each token
  const {
    loading: loadingAdd,
    error: errorAdd,
    result: resultAdd,
  } = useSingleCallResult(dataProvider, 'getAddOrders', [account])
  const {
    loading: loadingReduce,
    error: errorReduce,
    result: resultReduce,
  } = useSingleCallResult(dataProvider, 'getReduceOrders', [account])

  const loading = loadingAdd && loadingReduce
  const error = errorAdd && errorReduce

  const result = useMemo(() => {
    if (!loading && !error) return resultAdd?.concat(resultReduce)
    else return undefined
  }, [loading, error, resultAdd, resultReduce])

  return useMemo(() => {
    return {
      loading,
      error,
      Orders: result?.[0]?.map((order: any) => {
        // const inputDecimals = position.isToken0
        //   ? Number(position.token1Decimals.toString())
        //   : Number(position.token0Decimals.toString())
        // const outputDecimals = position.isToken0
        //   ? Number(position.token0Decimals.toString())
        //   : Number(position.token1Decimals.toString())
        return {
          key: {
            token0Address: order.key.token0,
            token1Address: order.key.token1,
            fee: order.key.fee,
          },
          isAdd: order.isAdd,
          auctionDeadline: order.auctionDeadline,
          auctionStartTime: order.auctionStartTime,
          startOutput: order.startOutput.toString(),
          minOutput: order.minOutput.toString(),
          inputAmount: order.inputAmount.toString(),
          decayRate: order.decayRate.toString(),
          margin: order.margin.toString(),
          positionIsToken0: order.positionIsToken0,
        }
      }),
    }
  }, [loading, error, result])
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
          maxWithdrawablePremium: convertToBN(position.maxWithdrawablePremium, inputDecimals).toString(),
          // maxWithdrawablePremium: position.maxWithdrawablePremium.toString()
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
      isAdd: result.isAdd,
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
export interface BinData {
  price: string
  token0Liquidity: string
  token1Liquidity: string
  token0Borrowed: string
  token1Borrowed: string
}
export interface BinDatas {
  data: BinData[] | undefined
}
interface UseLmtMarginPositionsResults {
  loading: boolean
  error: any
  positions: MarginPositionDetails[] | undefined
}
interface UseLmtOrdersResults {
  loading: boolean
  error: any
  Orders: MarginLimitOrder[] | undefined
}
