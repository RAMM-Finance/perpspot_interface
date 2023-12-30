// import { BigintIsh } from '@uniswap/sdk-core'

import DataProviderJson from 'abis_v2/DataProvider.json'
import { Interface } from 'ethers/lib/utils'
import { RawPoolKey, TraderPositionKey } from 'types/lmtv2position'

export abstract class DataProviderSDK {
  private constructor() {}

  public static INTERFACE: Interface = new Interface(DataProviderJson.abi)

  public static getMaxLeverageCalldata(
    key: TraderPositionKey,
    margin: string,
    slippage: string,
    startingLeverage: string
  ): string {
    const poolKey = {
      token0: key.poolKey.token0Address,
      token1: key.poolKey.token1Address,
      fee: key.poolKey.fee,
    }
    return DataProviderSDK.INTERFACE.encodeFunctionData('findMaxLeverageWithEstimatedSlippage', [
      poolKey,
      margin,
      key.isToken0,
      slippage,
      startingLeverage,
    ])
  }

  // getPostInstantaeneousRate(PoolKey memory poolKey, address trader, bool positionIsToken0)
  public static getPostInstantaneousRateCalldata(key: TraderPositionKey): string {
    const poolKey = {
      token0: key.poolKey.token0Address,
      token1: key.poolKey.token1Address,
      fee: key.poolKey.fee,
    }
    return DataProviderSDK.INTERFACE.encodeFunctionData('getPostInstantaeneousRate', [
      poolKey,
      key.trader,
      key.isToken0,
    ])
  }

  public static decodeFindTicks(data: string): [string, string] {
    const decoded = DataProviderSDK.INTERFACE.decodeFunctionResult('findTicks', data)
    return [decoded[0], decoded[1]]
  }

  public static encodeGetActiveMarginPositions(trader: string): string {
    return DataProviderSDK.INTERFACE.encodeFunctionData('getActiveMarginPositions', [trader])
  }

  public static findTicks(
    key: RawPoolKey,
    margin: string,
    borrowAmount: string,
    positionIsToken0: boolean,
    simulatedOutput: string,
    sqrtPriceX160: string
  ): string {
    const poolKey = {
      token0: key.token0Address,
      token1: key.token1Address,
      fee: key.fee,
    }
    return DataProviderSDK.INTERFACE.encodeFunctionData('findTicks', [
      poolKey,
      margin,
      borrowAmount,
      positionIsToken0,
      simulatedOutput,
      sqrtPriceX160,
    ])
  }
}
