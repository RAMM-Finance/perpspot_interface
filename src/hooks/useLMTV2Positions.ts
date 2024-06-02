import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { DATA_PROVIDER_ADDRESSES, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { useSingleContractWithCallData } from 'lib/hooks/multicall'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { LiquidityLoanStructOutput } from 'LmtTypes/src/Facility'
import { useMemo } from 'react'
import { useEffect, useState } from 'react'
import { MarginLimitOrder, MarginPositionDetails, OrderPositionKey, TraderPositionKey } from 'types/lmtv2position'
import { DecodedError } from 'utils/ethersErrorHandler/types'
import { DataProviderSDK } from 'utils/lmtSDK/DataProvider'

import { useDataProviderContract } from './useContract'
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
    if (!result) {
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
  }, [result, loading, error, syncing])
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

  const { result, loading, error, syncing, refetch } = useContractCallV2(
    DATA_PROVIDER_ADDRESSES,
    calldata,
    ['getActiveMarginPositions'],
    true,
    true,
    (data) => DataProviderSDK.INTERFACE.decodeFunctionResult('getActiveMarginPositions', data)[0],
    {
      keepPreviousData: true,
      refetchInterval: 1500,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Infinity,
    }
  )

  const dataProvider = useDataProviderContract()
  // const callStates = useSingleContractWithCallData(dataProvider, calldata ? [calldata] : [], {
  //   gasRequired: 15_000_000,
  // })

  // const result = useMemo(() => {
  //   if (callStates.length > 0 && callStates[0].result) {
  //     if (callStates[0].result[0]) {
  //       return callStates[0].result[0]
  //     }
  //   }
  //   return undefined
  // }, [callStates])

  // const loading = useMemo(() => {
  //   if (callStates.length > 0 && callStates[0]) {
  //     return callStates[0].loading
  //   }
  //   return false
  // }, [callStates])

  // const syncing = useMemo(() => {
  //   if (callStates.length > 0 && callStates[0]) {
  //     return callStates[0].syncing
  //   }
  //   return false
  // }, [callStates])

  // const error = useMemo(() => {
  //   if (callStates.length > 0 && callStates[0]) {
  //     return callStates[0].error
  //   }
  //   return false
  // }, [callStates])

  const rateCalldatas: string[] = useMemo(() => {
    if (!result || !account) return []
    // const parsed = DataProviderSDK.INTERFACE.decodeFunctionResult('getActiveMarginPositions', result)[0]
    const parsed = result
    return parsed.map((position: any) => {
      // console.log('zeke:', {
      //   token0: position[0][0],
      //   token1: position[0][1],
      //   fee: position[0][2],
      // })
      return DataProviderSDK.INTERFACE.encodeFunctionData('getPostInstantaneousRate', [
        {
          token0: position[0][0],
          token1: position[0][1],
          fee: position[0][2],
        },
        account,
        position[1],
      ])
    })
  }, [result, account])

  const rateData = useSingleContractWithCallData(dataProvider, rateCalldatas, {
    gasRequired: 10_000_000,
  })

  return useMemo(() => {
    if (!result || !rateData || rateData.length === 0) {
      return {
        loading,
        syncing,
        error,
        positions: undefined,
        refetch,
      }
    }

    if (rateData.some((rate) => rate.error) || rateData.some((rate) => !rate.result)) {
      return {
        loading,
        syncing,
        error,
        positions: undefined,
        refetch,
      }
    }
    try {
      // const parsed = DataProviderSDK.INTERFACE.decodeFunctionResult('getActiveMarginPositions', result)[0]
      const parsed = result
      const positions: MarginPositionDetails[] = parsed.map((position: any, i: number) => {
        const token0Decimals = position[11]
        const token1Decimals = position[12]
        const isToken0 = position[1]
        const inputDecimals = isToken0 ? Number(token1Decimals.toString()) : Number(token0Decimals.toString())
        const outputDecimals = isToken0 ? Number(token0Decimals.toString()) : Number(token1Decimals.toString())
        const apr = rateData[i].result
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
          borrowInfo: position[14].map((info: LiquidityLoanStructOutput) => {
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
          apr: apr?.['0'] ? new BN(apr?.['0'].toString()).shiftedBy(-18) : new BN(0),
        }
      })

      // Return the processed positions
      return {
        loading,
        error,
        positions, // assuming positions is processed from parsed data
        syncing,
        refetch,
      }
    } catch (decodeError) {
      // Handle the error from decoding
      console.error('Error decoding result:', decodeError)
      return {
        loading,
        syncing,
        error: decodeError,
        positions: undefined,
        refetch,
      }
    }
  }, [result, loading, error, account, syncing, rateData, refetch])
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
        console.log('err')
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
  const { chainId } = useWeb3React()
  const calldata = useMemo(() => {
    if (!key || !chainId) return []
    return [
      DataProviderSDK.INTERFACE.encodeFunctionData('getMarginPosition', [
        computePoolAddress({
          factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId ?? SupportedChainId.ARBITRUM_ONE],
          tokenA: key.poolKey.token0,
          tokenB: key.poolKey.token1,
          fee: key.poolKey.fee,
          initCodeHashManualOverride: chainId == SupportedChainId.BERA_ARTIO ? POOL_INIT_CODE_HASH_2 : undefined,
        }),
        key.trader,
        key.isToken0,
      ]),
    ]
  }, [key, chainId])

  const rate = useInstantaeneousRate(
    key?.poolKey.token0,
    key?.poolKey.token1,
    key?.poolKey.fee,
    key?.trader,
    key?.isToken0
  )

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
    if (!key || !callStates[0] || !callStates[0].result || !rate.result) {
      return {
        loading: callStates[0]?.loading ?? false,
        error: callStates[0]?.error,
        position: undefined,
        syncing: callStates[0]?.syncing ?? false,
      }
    } else {
      const position = callStates[0].result[0]
      const outputDecimals = position.isToken0
        ? Number(position.token0Decimals.toString())
        : Number(position.token1Decimals.toString())

      const inputDecimals = position.isToken0
        ? Number(position.token1Decimals.toString())
        : Number(position.token0Decimals.toString())

      return {
        loading: callStates[0].loading,
        error: callStates[0].error,
        syncing: callStates[0].syncing,
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
          margin: convertToBN(position.margin, position.marginInPosToken ? outputDecimals : inputDecimals),
          premiumOwed: convertToBN(position.premiumOwed, inputDecimals),
          isBorrow: false,
          premiumLeft: convertToBN(position.premiumDeposit, inputDecimals).minus(
            convertToBN(position.premiumOwed, inputDecimals)
          ),
          trader: key.trader,
          token0Decimals: Number(position.token0Decimals.toString()),
          token1Decimals: Number(position.token1Decimals.toString()),
          maxWithdrawablePremium: convertToBN(position.maxWithdrawablePremium, inputDecimals),
          borrowInfo: position.borrowInfo.map((info: LiquidityLoanStructOutput) => {
            return {
              tick: info.tick,
              liquidity: new BN(info.liquidity.toString()),
              premium: convertToBN(info.premium, inputDecimals),
              feeGrowthInside0LastX128: new BN(info.feeGrowthInside0LastX128.toString()),
              feeGrowthInside1LastX128: new BN(info.feeGrowthInside1LastX128.toString()),
              lastGrowth: new BN(info.lastGrowth.toString()),
            }
          }),
          marginInPosToken: position.marginInPosToken,
          apr: new BN(rate.result.toString()).shiftedBy(-18),
        },
      }
    }
  }, [callStates, key, rate])
}

export function useMarginOrderPositionFromPositionId(key: OrderPositionKey | undefined): {
  loading: boolean
  error: any
  position: MarginLimitOrder | undefined
  syncing: boolean
} {
  const { chainId } = useWeb3React()
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
  refetch: () => any
}
interface UseLmtOrdersResults {
  loading: boolean
  error: any
  Orders: MarginLimitOrder[] | undefined
}
