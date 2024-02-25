import { Pool } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { BigNumber as BN } from 'bignumber.js'
import { DATA_PROVIDER_ADDRESSES, V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { LiquidityLoanStructOutput } from 'LmtTypes/src/Facility'
import { useMemo } from 'react'
import { useEffect, useState } from 'react'
import { useTickDiscretization } from 'state/mint/v3/hooks'
import { MarginLimitOrder, MarginPositionDetails, OrderPositionKey, TraderPositionKey } from 'types/lmtv2position'
import { DecodedError } from 'utils/ethersErrorHandler/types'
import { DataProviderSDK } from 'utils/lmtSDK/DataProvider'
import { roundToBin } from 'utils/roundToBin'

import { useDataProviderContract } from './useContract'
import { useContractCall } from './useContractCall'
import { computePoolAddress } from './usePools'
import { convertToBN } from './useV3Positions'

export function useRateAndUtil(
  token0: string | undefined,
  token1: string | undefined,
  fee: number | undefined,
  tickLower: number | undefined,
  tickUpper: number | undefined
): { loading: boolean; error: DecodedError | undefined; result: { apr: BN; util: BN } | undefined; syncing: boolean } {
  // console.log('contractcall1')
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
    // console.log('rateutil', token0, token1, tickLower, tickUpper)
    try {
      data = DataProviderSDK.INTERFACE.encodeFunctionData('getUtilAndAPR', params)
    } catch (err) {
      console.log('getutilerr', err)
    }
    return data
  }, [token0, token1, fee, tickLower, tickUpper])
  // useRenderCount()
  const { result, loading, error, syncing } = useContractCall(DATA_PROVIDER_ADDRESSES, calldata, false, 3)
  // console.log('rateutil', result, loading, syncing)
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
): { loading: boolean; error: DecodedError | undefined; result: string | undefined } {
  // console.log('contractcall2')
  const calldata = useMemo(() => {
    if (!token0 || !token1 || !fee || !trader || positionIsToken0 == undefined) return undefined
    const params = [
      {
        token0,
        token1,
        fee,
      },
      trader,
      positionIsToken0,
    ]
    return DataProviderSDK.INTERFACE.encodeFunctionData('getPostInstantaneousRate', params)
  }, [token0, token1, fee, trader, positionIsToken0])

  const { result, loading, error, syncing } = useContractCall(DATA_PROVIDER_ADDRESSES, calldata, false, 0)

  return useMemo(() => {
    if (!result) {
      return {
        loading,
        error,
        result: undefined,
        syncing,
      }
    } else {
      const parsed = DataProviderSDK.INTERFACE.decodeFunctionResult('getPostInstantaneousRate', result)
      return {
        loading,
        error,
        result: parsed.toString(),
        syncing,
      }
    }
  }, [result, loading, error, syncing])
}

// BinData[] |
export function useBulkBinData(
  pool: Pool | undefined
  // token0: string | undefined,
  // token1: string | undefined,
  // fee: number | undefined,
  // currentTick: number | undefined
): { loading: boolean; error: DecodedError | undefined; result: BinData[] | undefined } {
  const { tickDiscretization } = useTickDiscretization(pool?.token0.address, pool?.token1.address, pool?.fee)
  const calldata = useMemo(() => {
    if (!pool || !tickDiscretization) return undefined
    const roundedCurrentTick = roundToBin(pool.tickCurrent, tickDiscretization, false)
    const lookback = pool.fee == 500 ? 3000 : 7000
    const params = [
      {
        token0: pool.token0.address,
        token1: pool.token1.address,
        fee: pool.fee,
      },
      roundedCurrentTick - lookback,
      roundedCurrentTick + lookback,
    ]
    // console.log('params???', params)
    return DataProviderSDK.INTERFACE.encodeFunctionData('getBinsDataInBulk', params)
  }, [pool, tickDiscretization])
  const { result, loading, error, syncing } = useContractCall(DATA_PROVIDER_ADDRESSES, calldata, false, 0)
  return useMemo(() => {
    if (!result || !pool) {
      return {
        result: undefined,
        loading,
        error,
        syncing,
      }
    } else {
      const parsed: BinData[] = DataProviderSDK.INTERFACE.decodeFunctionResult('getBinsDataInBulk', result)[0]
      const token0Decimals = pool?.token0.decimals
      const token1Decimals = pool?.token1.decimals
      const processed = parsed.map((bin) => {
        return {
          price: new BN(bin.price.toString()).shiftedBy(-18),
          token0Liquidity: new BN(bin.token0Liquidity.toString()).shiftedBy(-token0Decimals),
          token1Liquidity: new BN(bin.token1Liquidity.toString()).shiftedBy(-token1Decimals),
          token0Borrowed: new BN(bin.token0Borrowed.toString()).shiftedBy(-token0Decimals),
          token1Borrowed: new BN(bin.token1Borrowed.toString()).shiftedBy(-token1Decimals),
        }
      })
      return {
        result: processed,
        loading,
        error,
        syncing,
      }
    }
  }, [result, loading, error, syncing, pool])

  // const dataProvider = useDataProviderContract()
  // const blockNumber = useBlockNumber()
  // const [lastBlockNumber, setBlockNumber] = useState<number | undefined>(undefined)

  // const [data, setData] = useState<any>()
  // const [loading, setLoading] = useState(false)
  // const [error, setError] = useState<any>()

  // useEffect(() => {
  //   if (!currentTick || loading || !blockNumber || (lastBlockNumber && lastBlockNumber + 2 > blockNumber)) return
  //   const tickRounded = Math.ceil(currentTick / 100) * 100

  //   const call = async () => {
  //     try {
  //       setLoading(true)

  //       const result = await dataProvider?.getBinsDataInBulk(
  //         {
  //           token0: token0 as string,
  //           token1: token1 as string,
  //           fee: fee as number,
  //         },
  //         (tickRounded - 3000) as number,
  //         (tickRounded + 3000) as number
  //       )
  //       setData(result)
  //       setLoading(false)
  //       setBlockNumber(blockNumber)
  //     } catch (error) {
  //       setError(error)
  //       setLoading(false)
  //       console.log('maxWithdrawableerr', error)
  //     }
  //   }
  //   call()
  // }, [dataProvider, loading, lastBlockNumber, blockNumber, token0, token1, fee, currentTick])

  // return useMemo(() => {
  //   if (!data) {
  //     return null
  //   } else {
  //     return data
  //   }
  // }, [data])
}

// fetches all leveraged LMT positions for a given account UseLmtMarginPositionsResults
export function useLeveragedLMTPositions(account: string | undefined): UseLmtMarginPositionsResults {
  const calldata = useMemo(() => {
    if (!account) return undefined
    return DataProviderSDK.INTERFACE.encodeFunctionData('getActiveMarginPositions', [account])
  }, [account])
  // console.log('contractcall4')
  const { result, loading, error, syncing } = useContractCall(DATA_PROVIDER_ADDRESSES, calldata, false, 2)
  return useMemo(() => {
    if (!result) {
      return {
        loading,
        syncing,
        error,
        positions: undefined,
      }
    } else {
      try {
        const parsed = DataProviderSDK.INTERFACE.decodeFunctionResult('getActiveMarginPositions', result)[0]
        const positions: MarginPositionDetails[] = parsed.map((position: any) => {
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
          }
        })

        // Return the processed positions
        return {
          loading,
          error,
          positions, // assuming positions is processed from parsed data
          syncing,
        }
      } catch (decodeError) {
        // Handle the error from decoding
        console.error('Error decoding result:', decodeError)
        return {
          loading,
          syncing,
          error: decodeError,
          positions: undefined,
        }
      }
    }
  }, [result, loading, error, account, syncing])

  // return useMemo(() => {
  //   if (!result) {
  //     return {
  //       loading,
  //       syncing,
  //       error,
  //       positions: undefined,
  //     }
  //   } else {
  //     const parsed = DataProviderSDK.INTERFACE.decodeFunctionResult('getActiveMarginPositions', result)[0]
  //     const positions: MarginPositionDetails[] = parsed.map((position: any) => {
  //       const inputDecimals = position.isToken0
  //         ? Number(position.token1Decimals.toString())
  //         : Number(position.token0Decimals.toString())
  //       const outputDecimals = position.isToken0
  //         ? Number(position.token0Decimals.toString())
  //         : Number(position.token1Decimals.toString())
  //       return {
  //         poolKey: {
  //           token0Address: position.poolKey.token0,
  //           token1Address: position.poolKey.token1,
  //           fee: position.poolKey.fee,
  //         },
  //         isToken0: position.isToken0,
  //         totalDebtOutput: convertToBN(position.totalDebtOutput, outputDecimals),
  //         totalDebtInput: convertToBN(position.totalDebtInput, inputDecimals),
  //         openTime: position.openTime,
  //         repayTime: position.repayTime,
  //         premiumDeposit: convertToBN(position.premiumDeposit, inputDecimals),
  //         totalPosition: convertToBN(position.totalPosition, outputDecimals),
  //         margin: convertToBN(position.margin, inputDecimals),
  //         premiumOwed: convertToBN(position.premiumOwed, inputDecimals),
  //         isBorrow: false,
  //         premiumLeft: convertToBN(position.premiumDeposit, inputDecimals).minus(
  //           convertToBN(position.premiumOwed, inputDecimals)
  //         ),
  //         token0Decimals: Number(position.token0Decimals.toString()),
  //         token1Decimals: Number(position.token1Decimals.toString()),
  //         trader: account,
  //         maxWithdrawablePremium: convertToBN(position.maxWithdrawablePremium, inputDecimals),
  //         borrowInfo: position.borrowInfo.map((info: LiquidityLoanStructOutput) => {
  //           return {
  //             tick: info.tick,
  //             liquidity: new BN(info.liquidity.toString()),
  //             premium: convertToBN(info.premium, inputDecimals),
  //             feeGrowthInside0LastX128: new BN(info.feeGrowthInside0LastX128.toString()),
  //             feeGrowthInside1LastX128: new BN(info.feeGrowthInside1LastX128.toString()),
  //             lastGrowth: new BN(info.lastGrowth.toString()),
  //           }
  //         }),
  //       }
  //     })
  //     return {
  //       loading,
  //       error,
  //       positions,
  //       syncing,
  //     }
  //   }
  // }, [result, loading, error, account, syncing])

  // const dataProvider = useDataProviderContract()
  // const [lastBlockNumber, setLastBlockNumber] = useState<number>()
  // const [lastAccount, setLastAccount] = useState<string>()
  // const [lastResult, setLastResult] = useState<MarginPositionDetails[]>()
  // const [loading, setLoading] = useState(false)
  // const [error, setError] = useState<any>()
  // const blockNumber = useBlockNumber()

  // useEffect(() => {
  //   if (!account || !dataProvider) {
  //     setLastResult(undefined)
  //     setError(undefined)
  //     setLastAccount(undefined)
  //     setLastBlockNumber(undefined)
  //     return
  //   }
  //   if (loading) return
  //   if (lastBlockNumber && lastBlockNumber === blockNumber && lastAccount === account) return

  //   const call = async () => {
  //     try {
  //       setLoading(true)
  //       const data = await dataProvider.callStatic.getActiveMarginPositions(account)
  //       const positions: MarginPositionDetails[] = data.map((position) => {
  //         const inputDecimals = position.isToken0
  //           ? Number(position.token1Decimals.toString())
  //           : Number(position.token0Decimals.toString())
  //         const outputDecimals = position.isToken0
  //           ? Number(position.token0Decimals.toString())
  //           : Number(position.token1Decimals.toString())
  //         return {
  //           poolKey: {
  //             token0Address: position.poolKey.token0,
  //             token1Address: position.poolKey.token1,
  //             fee: position.poolKey.fee,
  //           },
  //           isToken0: position.isToken0,
  //           totalDebtOutput: convertToBN(position.totalDebtOutput, outputDecimals),
  //           totalDebtInput: convertToBN(position.totalDebtInput, inputDecimals),
  //           openTime: position.openTime,
  //           repayTime: position.repayTime,
  //           premiumDeposit: convertToBN(position.premiumDeposit, inputDecimals),
  //           totalPosition: convertToBN(position.totalPosition, outputDecimals),
  //           margin: convertToBN(position.margin, inputDecimals),
  //           premiumOwed: convertToBN(position.premiumOwed, inputDecimals),
  //           isBorrow: false,
  //           premiumLeft: convertToBN(position.premiumDeposit, inputDecimals).minus(
  //             convertToBN(position.premiumOwed, inputDecimals)
  //           ),
  //           token0Decimals: Number(position.token0Decimals.toString()),
  //           token1Decimals: Number(position.token1Decimals.toString()),
  //           trader: account,
  //           maxWithdrawablePremium: convertToBN(position.maxWithdrawablePremium, inputDecimals),
  //           borrowInfo: position.borrowInfo.map((info: LiquidityLoanStructOutput) => {
  //             return {
  //               tick: info.tick,
  //               liquidity: new BN(info.liquidity.toString()),
  //               premium: convertToBN(info.premium, inputDecimals),
  //               feeGrowthInside0LastX128: new BN(info.feeGrowthInside0LastX128.toString()),
  //               feeGrowthInside1LastX128: new BN(info.feeGrowthInside1LastX128.toString()),
  //               lastGrowth: new BN(info.lastGrowth.toString()),
  //             }
  //           }),
  //         }
  //       })
  //       setLastResult(positions)
  //       setLoading(false)
  //       setLastBlockNumber(blockNumber)
  //       setLastAccount(account)
  //     } catch (error) {
  //       setError(error)
  //       setLoading(false)
  //       setLastResult(undefined)
  //       setLastAccount(undefined)
  //       setLastBlockNumber(undefined)
  //     }
  //   }

  //   call()
  // }, [
  //   dataProvider,
  //   loading,
  //   lastBlockNumber,
  //   blockNumber,
  //   account,
  //   lastAccount,
  //   lastResult,
  //   setLastResult,
  //   setLastAccount,
  //   setLastBlockNumber,
  // ])

  // return useMemo(() => {
  //   return {
  //     loading,
  //     error,
  //     positions: lastResult,
  //   }
  // }, [lastResult, error, loading])
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
        let inputDecimals = order.positionIsToken0
          ? Number(order.token1Decimals.toString())
          : Number(order.token0Decimals.toString())
        let outputDecimals = order.positionIsToken0
          ? Number(order.token0Decimals.toString())
          : Number(order.token1Decimals.toString())
        inputDecimals = order.isAdd ? inputDecimals : outputDecimals
        outputDecimals = order.isAdd ? outputDecimals : inputDecimals
        const currentOutput = convertToBN(order.currentOutput, outputDecimals) //new BN(order.currentOutput.toString()).shiftedBy(-outputDecimals)
        return {
          key: {
            token0Address: order.key.token0,
            token1Address: order.key.token1,
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
    if (!key || !chainId) return undefined
    return DataProviderSDK.INTERFACE.encodeFunctionData('getMarginPosition', [
      computePoolAddress({
        factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId ?? SupportedChainId.SEPOLIA],
        tokenA: key.poolKey.token0Address,
        tokenB: key.poolKey.token1Address,
        fee: key.poolKey.fee,
      }),
      key.trader,
      key.isToken0,
    ])
  }, [key, chainId])
  // console.log('contractcall5')
  const { result, loading, error, syncing } = useContractCall(DATA_PROVIDER_ADDRESSES, calldata, false, 0)

  return useMemo(() => {
    if (!result || !key) {
      return {
        loading,
        error,
        position: undefined,
        syncing,
      }
    } else {
      const position = DataProviderSDK.INTERFACE.decodeFunctionResult('getMarginPosition', result)[0]
      const inputDecimals = position.isToken0
        ? Number(position.token1Decimals.toString())
        : Number(position.token0Decimals.toString())
      const outputDecimals = position.isToken0
        ? Number(position.token0Decimals.toString())
        : Number(position.token1Decimals.toString())

      return {
        loading,
        error,
        syncing,
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
        },
      }
    }
  }, [result, loading, error, key, syncing])
}

// TODO
// export function getLimitOrderCurrentOutput(
//   auctionDeadline: number,
//   auctionStartTime: number,
//   decayRate: BN,
//   startOutput: BN,
//   minOutput: BN
// ): BN {
//   const now = Math.floor(Date.now() / 1000)
//   if (now > auctionDeadline) {
//     if (now > auctionStartTime) {
//       if (decayRate.isEqualTo(0)) {
//         return startOutput
//       }
//       const decayed = decayRate.exponentiatedBy(now - auctionStartTime)
//       return decayed.times(startOutput) < minOutput ? minOutput : decayed.times(startOutput)
//     }
//   }
//   return new BN(0)
// }

export function useMarginOrderPositionFromPositionId(key: OrderPositionKey | undefined): {
  loading: boolean
  error: any
  position: MarginLimitOrder | undefined
  syncing: boolean
} {
  const { chainId } = useWeb3React()
  const calldata = useMemo(() => {
    if (!key || !chainId) return undefined
    // const orderId = computeOrderId(key.poolKey, key.trader, key.isToken0, key.isAdd)
    // getOrderInfo(address pool, address trader, bool positionIsToken0, bool isAdd)
    const pool = computePoolAddress({
      factoryAddress: V3_CORE_FACTORY_ADDRESSES[chainId],
      tokenA: key.poolKey.token0Address,
      tokenB: key.poolKey.token1Address,
      fee: key.poolKey.fee,
    })

    return DataProviderSDK.INTERFACE.encodeFunctionData('getOrderInfo', [pool, key.trader, key.isToken0, key.isAdd])
  }, [key, chainId])

  const { result, loading, error, syncing } = useContractCall(DATA_PROVIDER_ADDRESSES, calldata, false, 0)
  return useMemo(() => {
    if (!result || !key) {
      return {
        loading,
        error,
        position: undefined,
        syncing,
      }
    } else {
      const position = DataProviderSDK.INTERFACE.decodeFunctionResult('getOrderInfo', result)[0]
      const inputDecimals = position.positionIsToken0
        ? Number(position.token1Decimals.toString())
        : Number(position.token0Decimals.toString())
      const outputDecimals = position.positionIsToken0
        ? Number(position.token0Decimals.toString())
        : Number(position.token1Decimals.toString())
      const startOutput = convertToBN(position.startOutput, position.isAdd ? outputDecimals : inputDecimals)
      const decayRate = convertToBN(position.decayRate, 18)
      const minOutput = convertToBN(position.minOutput, position.isAdd ? outputDecimals : inputDecimals)

      return {
        loading,
        error,
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
        },
        syncing,
      }
    }
  }, [result, loading, error, key, syncing])
}

export interface BinData {
  price: BN
  token0Liquidity: BN
  token1Liquidity: BN
  token0Borrowed: BN
  token1Borrowed: BN
}
export interface BinDatas {
  data: BinData[] | undefined
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
