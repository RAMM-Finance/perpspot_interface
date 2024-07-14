import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { toHex } from '@uniswap/v3-sdk'
import { BigNumber as BN } from 'bignumber.js'
import { DATA_PROVIDER_ADDRESSES, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { useSingleContractWithCallData } from 'lib/hooks/multicall'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { LiquidityLoanStructOutput } from 'LmtTypes/src/Facility'
import { useCallback, useMemo } from 'react'
import { useEffect, useState } from 'react'
import { MarginLimitOrder, MarginPositionDetails, OrderPositionKey, TraderPositionKey } from 'types/lmtv2position'
import { DecodedError } from 'utils/ethersErrorHandler/types'
import { DataProviderSDK } from 'utils/lmtSDK/DataProvider'
import { MarginFacilitySDK } from 'utils/lmtSDK/MarginFacility'
import { useChainId } from 'wagmi'

import { useDataProviderContract, useMarginFacilityContract } from './useContract'
import { useContractCallV2 } from './useContractCall'
import { computePoolAddress, POOL_INIT_CODE_HASH_2 } from './usePools'
import { convertToBN } from './useV3Positions'

export function useRateAndUtil(
  token0: string | undefined,
  token1: string | undefined,
  fee: number | undefined,
  tickLower: number | undefined,
  tickUpper: number | undefined
): { loading: boolean; error: DecodedError | undefined; result: { apr: BN; util: BN } | undefined; syncing: boolean } {
  const calldata = useMemo(() => {
    if (!token0 || !token1 || !fee || !tickLower || !tickUpper || tickLower == tickUpper) return undefined
    const params = [
      {
        token0,
        token1,
        fee,
      },
      tickLower,
      tickUpper,
    ]
    let data

    try {
      data = DataProviderSDK.INTERFACE.encodeFunctionData('getUtilAndAPR', params)
    } catch (err) {
      console.log('getutilerr', err)
    }
    return data
  }, [token0, token1, fee, tickLower, tickUpper])

  const { result, loading, error, syncing } = useContractCallV2(
    DATA_PROVIDER_ADDRESSES,
    calldata,
    ['getUtilAndAPR'],
    false,
    true
  )

  return useMemo(() => {
    if (!result || !calldata) {
      return {
        loading,
        error,
        result: undefined,
        syncing,
      }
    } else {
      const parsed = DataProviderSDK.INTERFACE.decodeFunctionResult('getUtilAndAPR', result)
      const apr = new BN(parsed[0].toString()).shiftedBy(-16)
      const util = new BN(parsed[1].toString()).shiftedBy(-16)
      return {
        loading,
        error,
        result: {
          apr,
          util,
        },
        syncing,
      }
    }
  }, [result, loading, error, syncing, calldata])
}

export function useInstantaeneousRate(
  token0: string | undefined,
  token1: string | undefined,
  fee: number | undefined,
  trader: string | undefined,
  positionIsToken0: boolean | undefined
): { loading: boolean; error: boolean; result: string | undefined } {
  const calldata = useMemo(() => {
    if (!token0 || !token1 || !fee || !trader || positionIsToken0 == undefined) return []
    const params = [
      {
        token0,
        token1,
        fee,
      },
      trader,
      positionIsToken0,
    ]
    return [DataProviderSDK.INTERFACE.encodeFunctionData('getPostInstantaneousRate', params)]
  }, [token0, token1, fee, trader, positionIsToken0])

  const dataProvider = useDataProviderContract()
  const callStates = useSingleContractWithCallData(dataProvider, calldata, {
    gasRequired: 10_000_000,
  })

  return useMemo(() => {
    if (callStates.length === 0) {
      return {
        loading: false,
        error: false,
        result: undefined,
      }
    }
    if (!callStates[0] || !callStates[0].result) {
      return {
        loading: callStates[0]?.loading ?? false,
        error: callStates[0]?.error,
        result: undefined,
      }
    } else {
      return {
        loading: callStates[0].loading,
        error: callStates[0].error,
        result: callStates[0].result[0].toString(),
      }
    }
  }, [callStates])
}

// fetches all leveraged LMT positions for a given account UseLmtMarginPositionsResults
export function useLeveragedLMTPositions(account: string | undefined): UseLmtMarginPositionsResults {
  const calldata = useMemo(() => {
    if (!account) return undefined
    return DataProviderSDK.INTERFACE.encodeFunctionData('getActiveMarginPositions', [account])
  }, [account])

  const {
    result,
    loading: positionLoading,
    error: positionError,
    syncing: positionSyncing,
  } = useContractCallV2(
    DATA_PROVIDER_ADDRESSES,
    calldata,
    ['getActiveMarginPositions'],
    false,
    true,
    (data) => DataProviderSDK.INTERFACE.decodeFunctionResult('getActiveMarginPositions', data)[0],
    {
      placeholderData: keepPreviousData,
      refetchInterval: 1500,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
      staleTime: Infinity,
    }
  )

  const positions: MarginPositionDetails[] = useMemo(
    () =>
      result?.map((position: any, i: number) => {
        const token0Decimals = position[11]
        const token1Decimals = position[12]
        const isToken0 = position[1]
        const inputDecimals = isToken0 ? Number(token1Decimals.toString()) : Number(token0Decimals.toString())
        const outputDecimals = isToken0 ? Number(token0Decimals.toString()) : Number(token1Decimals.toString())
        const apr = new BN(position[14].toString()).shiftedBy(-18)
        return {
          poolKey: {
            token0: position[0][0],
            token1: position[0][1],
            fee: position[0][2],
          },
          isToken0: position[1],
          totalDebtOutput: convertToBN(position[3], outputDecimals),
          totalDebtInput: convertToBN(position[4], inputDecimals),
          openTime: position[5],
          repayTime: position[6],
          premiumDeposit: convertToBN(position[7], inputDecimals),
          totalPosition: convertToBN(position[8], outputDecimals),
          margin: convertToBN(position[9], position[2] ? outputDecimals : inputDecimals),
          premiumOwed: convertToBN(position[10], inputDecimals),
          isBorrow: false,
          premiumLeft: convertToBN(position[7], inputDecimals).minus(convertToBN(position[10], inputDecimals)),
          token0Decimals: Number(token0Decimals.toString()),
          token1Decimals: Number(token1Decimals.toString()),
          trader: account,
          maxWithdrawablePremium: convertToBN(position[13], inputDecimals),
          borrowInfo: position[15].map((info: LiquidityLoanStructOutput) => {
            return {
              tick: info[0],
              liquidity: new BN(info[1].toString()),
              premium: convertToBN(info[2], inputDecimals),
              feeGrowthInside0LastX128: new BN(info[3].toString()),
              feeGrowthInside1LastX128: new BN(info[4].toString()),
              lastGrowth: new BN(info[5].toString()),
            }
          }),
          marginInPosToken: position[2],
          apr,
        }
      }),
    [result]
  )

  const [calldatas, keys]: [string[], TraderPositionKey[]] = useMemo(() => {
    if (!positions || !account) return [[], []]
    const stored: TraderPositionKey[] = []
    const filtered = positions.map((position) => {
      const { poolKey, isToken0, premiumLeft } = position
      if (premiumLeft.lte(0)) return undefined

      stored.push({
        poolKey,
        trader: account,
        isToken0,
        isBorrow: false,
      })

      return MarginFacilitySDK.INTERFACE.encodeFunctionData('reducePosition', [
        {
          token0: poolKey.token0,
          token1: poolKey.token1,
          fee: poolKey.fee,
        },
        {
          positionIsToken0: isToken0,
          reducePercentage: new BN(1).shiftedBy(18).toFixed(0),
          minOutput: '0',
          trader: account,
          executionOption: 1,
          executionData: [],
          slippedTickMin: -887000,
          slippedTickMax: 887000,
          reduceAmount: toHex(0),
        },
      ])
    })

    return [filtered.filter((x) => x !== undefined) as string[], stored]
  }, [positions, account])

  const marginFacility = useMarginFacilityContract(true)

  const pnlQueryKey = useMemo(() => {
    if (!account || calldatas.length === 0 || !marginFacility || !marginFacility.signer) return []
    return ['getPnl', account, ...calldatas]
  }, [calldatas, account, marginFacility])

  const fetchPnL = useCallback(async () => {
    if (!account || calldatas.length === 0 || !marginFacility || !marginFacility.signer) throw Error('missing params')

    const rawPnls = await marginFacility.callStatic.multicall(calldatas)

    const parsedPnls = rawPnls.map((pnl: any) => {
      return MarginFacilitySDK.INTERFACE.decodeFunctionResult('reducePosition', pnl)
    })

    return parsedPnls
  }, [account, calldatas, marginFacility])

  const {
    data: pnls,
    isError: pnlIsError,
    error: pnlError,
    isLoading: pnlLoading,
  } = useQuery({
    queryKey: pnlQueryKey,
    enabled: pnlQueryKey.length > 0,
    queryFn: fetchPnL,
    refetchInterval: 2000,
    refetchOnMount: false,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })

  const loading = positionLoading || pnlLoading
  const error = positionError || pnlError
  const syncing = positionSyncing

  return useMemo(() => {
    if (!account || !calldatas || !calldata || !positions || !pnls || !keys) {
      return {
        loading,
        error,
        positions: undefined,
        syncing,
      }
    }

    return {
      loading,
      error,
      positions: positions.map((position) => {
        const { isToken0, poolKey } = position
        const index = keys.findIndex((key) => {
          if (
            key.isToken0 === isToken0 &&
            key.poolKey.token0 === poolKey.token0 &&
            key.poolKey.token1 === poolKey.token1 &&
            key.poolKey.fee === poolKey.fee
          ) {
            return true
          }
          return false
        })

        return {
          ...position,
          pnl: index !== -1 ? new BN(pnls[index][0][2].toString()).shiftedBy(-18) : undefined,
        }
      }),
      syncing,
    }
  }, [loading, error, positions, syncing, keys, pnls])
}

export function useLMTOrders(account: string | undefined): UseLmtOrdersResults {
  const dataProvider = useDataProviderContract()

  const blockNumber = useBlockNumber()

  const [orders, setOrders] = useState<any>()
  useEffect(() => {
    if (!dataProvider || !account) return
    const call = async () => {
      try {
        const orders = await dataProvider.getOrders(account)
        setOrders(orders)
      } catch (err) {
        console.log('err', err)
      }
    }
    call()
  }, [dataProvider, account, blockNumber])

  const result = orders
  const loading = false
  const error = false

  return useMemo(() => {
    return {
      loading,
      error,
      Orders: result?.map((order: any) => {
        const positionDecimals = order.positionIsToken0 ? order.token0Decimals : order.token1Decimals

        let inputDecimals = order.positionIsToken0
          ? Number(order.token1Decimals.toString())
          : Number(order.token0Decimals.toString())
        let outputDecimals = order.positionIsToken0
          ? Number(order.token0Decimals.toString())
          : Number(order.token1Decimals.toString())
        inputDecimals = order.isAdd ? inputDecimals : outputDecimals
        outputDecimals = order.isAdd ? outputDecimals : inputDecimals
        if (order.marginInPosToken) {
          inputDecimals = positionDecimals
          outputDecimals = positionDecimals
        }

        const currentOutput = convertToBN(order.currentOutput, outputDecimals) //new BN(order.currentOutput.toString()).shiftedBy(-outputDecimals)
        return {
          key: {
            token0: order.key.token0,
            token1: order.key.token1,
            fee: order.key.fee,
          },
          isAdd: order.isAdd,
          auctionDeadline: order.auctionDeadline,
          auctionStartTime: order.auctionStartTime,
          startOutput: new BN(order.startOutput.toString()).shiftedBy(-outputDecimals),
          minOutput: new BN(order.minOutput.toString()).shiftedBy(-outputDecimals),
          inputAmount: new BN(order.inputAmount.toString()).shiftedBy(-inputDecimals),
          decayRate: order.decayRate.toString(),
          margin: new BN(order.margin.toString()).shiftedBy(-inputDecimals),
          positionIsToken0: order.positionIsToken0,
          currentOutput,
          marginInPosToken: order.marginInPosToken,
        }
      }),
    }
  }, [loading, error, result])
}

// fetches corresponding LMT position, if it exists then openTime > 0
export function useMarginLMTPositionFromPositionId(key: TraderPositionKey | undefined): {
  loading: boolean
  error: any
  position: MarginPositionDetails | undefined
} {
  const { positions, loading, syncing, error } = useLeveragedLMTPositions(key?.trader)

  return useMemo(() => {
    return {
      loading,
      error,
      position: positions?.find((position) => {
        return (
          position.poolKey.token0.toLowerCase() === key?.poolKey.token0.toLowerCase() &&
          position.poolKey.token1.toLowerCase() === key?.poolKey.token1.toLowerCase() &&
          position.poolKey.fee === key?.poolKey.fee &&
          position.isToken0 === key?.isToken0
        )
      }),
    }
  }, [positions, loading, error, key])
}

export function useMarginOrderPositionFromPositionId(key: OrderPositionKey | undefined): {
  loading: boolean
  error: any
  position: MarginLimitOrder | undefined
  syncing: boolean
} {
  const chainId = useChainId()
  const calldata = useMemo(() => {
    if (!key || !chainId) return []
    // const orderId = computeOrderId(key.poolKey, key.trader, key.isToken0, key.isAdd)
    // getOrderInfo(address pool, address trader, bool positionIsToken0, bool isAdd)
    const pool = computePoolAddress({
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
      tokenA: key.poolKey.token0,
      tokenB: key.poolKey.token1,
      fee: key.poolKey.fee,
      initCodeHashManualOverride: chainId == SupportedChainId.BERA_ARTIO ? POOL_INIT_CODE_HASH_2 : undefined,
    })

    return [DataProviderSDK.INTERFACE.encodeFunctionData('getOrderInfo', [pool, key.trader, key.isToken0, key.isAdd])]
  }, [key, chainId])

  const dataProvider = useDataProviderContract()
  const callStates = useSingleContractWithCallData(dataProvider, calldata, {
    gasRequired: 10_000_000,
  })
  return useMemo(() => {
    if (callStates.length === 0) {
      return {
        loading: false,
        error: false,
        position: undefined,
        syncing: false,
      }
    }
    if (!callStates[0] || !callStates[0].result || !key) {
      return {
        loading: callStates[0]?.loading ?? false,
        error: callStates[0]?.error,
        position: undefined,
        syncing: callStates[0]?.syncing ?? false,
      }
    } else {
      const position = callStates[0].result[0]
      const positionDecimals = position.positionIsToken0 ? position.token0Decimals : position.token1Decimals
      let inputDecimals = position.positionIsToken0
        ? Number(position.token1Decimals.toString())
        : Number(position.token0Decimals.toString())
      let outputDecimals = position.positionIsToken0
        ? Number(position.token0Decimals.toString())
        : Number(position.token1Decimals.toString())
      if (position.marginInPosToken) {
        inputDecimals = positionDecimals
        outputDecimals = positionDecimals
      }
      const startOutput = convertToBN(position.startOutput, position.isAdd ? outputDecimals : inputDecimals)
      const decayRate = convertToBN(position.decayRate, 18)
      const minOutput = convertToBN(position.minOutput, position.isAdd ? outputDecimals : inputDecimals)

      return {
        loading: callStates[0].loading,
        error: callStates[0].error,
        position: {
          key: key.poolKey,
          isAdd: position.isAdd,
          positionIsToken0: position.positionIsToken0,
          auctionDeadline: position.auctionDeadline,
          auctionStartTime: position.auctionStartTime,
          startOutput,
          minOutput,
          inputAmount: convertToBN(position.inputAmount, position.isAdd ? inputDecimals : outputDecimals),
          decayRate,
          margin: convertToBN(position.margin, inputDecimals),
          currentOutput: convertToBN(position.currentOutput, position.isAdd ? outputDecimals : inputDecimals),
          marginInPosToken: position.marginInPosToken,
        },
        syncing: callStates[0].syncing,
      }
    }
  }, [callStates, key])
}

export interface BinData {
  price: BN
  token0Liquidity: BN
  token1Liquidity: BN
  token0Borrowed: BN
  token1Borrowed: BN
}

interface UseLmtMarginPositionsResults {
  loading: boolean
  error: any
  positions: MarginPositionDetails[] | undefined
  syncing: boolean
}
interface UseLmtOrdersResults {
  loading: boolean
  error: any
  Orders: MarginLimitOrder[] | undefined
}
