// import { BigintIsh } from '@uniswap/sdk-core'

import DataProviderJson from 'abis_v2/DataProvider.json'
import { Interface } from 'ethers/lib/utils'
import { TraderPositionKey } from 'types/lmtv2position'

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
    return DataProviderSDK.INTERFACE.encodeFunctionData('getPostInstantaneousRate', [poolKey, key.trader, key.isToken0])
  }
}
