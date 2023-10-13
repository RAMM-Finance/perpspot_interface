import { BigintIsh } from '@uniswap/sdk-core'
import { MethodParameters, toHex } from '@uniswap/v3-sdk'
import MarginFacilityJson from 'abis_v2/MarginFacility.json'
import { Interface } from 'ethers/lib/utils'
import JSBI from 'jsbi'
import { TraderPositionKey } from 'types/lmtv2position'

import { Multicall } from './multicall'

export interface AddPositionOptions {
  positionKey: TraderPositionKey
  margin: JSBI
  borrowAmount: JSBI
  minimumOutput: JSBI
  deadline: BigintIsh
  minEstimatedSlippage: JSBI
  executionOption: number
  maxSlippage: JSBI
  depositPremium?: JSBI
}

export interface ReducePositionOptions {
  positionKey: TraderPositionKey
  reducePercentage: JSBI // should be in wad
  executionOption: number
  maxSlippage: JSBI
  deadline: BigintIsh
  slippedPrice: JSBI
}

export interface DepositPremiumOptions {
  positionKey: TraderPositionKey
  amount: JSBI
}

export interface WithdrawPremiumOptions {
  positionKey: TraderPositionKey
  amount: JSBI
}

export abstract class MarginFacility {
  private constructor() {}

  public static INTERFACE: Interface = new Interface(MarginFacilityJson.abi)

  public static addPositionParameters(param: AddPositionOptions): MethodParameters {
    const calldatas: string[] = []

    if (param.depositPremium) {
      // depositPremium(PoolKey calldata key, address trader, bool isToken0, uint256 amount)
      calldatas.push(
        MarginFacility.INTERFACE.encodeFunctionData('depositPremium', [
          {
            token0: param.positionKey.poolKey.token0Address,
            token1: param.positionKey.poolKey.token1Address,
            fee: param.positionKey.poolKey.fee,
          },
          param.positionKey.trader,
          param.positionKey.isToken0,
          toHex(param.depositPremium),
        ])
      )
    }

    calldatas.push(
      MarginFacility.INTERFACE.encodeFunctionData('addPosition', [
        {
          token0: param.positionKey.poolKey.token0Address,
          token1: param.positionKey.poolKey.token1Address,
          fee: param.positionKey.poolKey.fee,
        },
        {
          margin: toHex(param.margin),
          maxSlippage: toHex(param.maxSlippage),
          minEstimatedSlippage: toHex(param.minEstimatedSlippage),
          borrowAmount: toHex(param.borrowAmount),
          positionIsToken0: param.positionKey.isToken0,
          executionOption: param.executionOption,
          trader: param.positionKey.trader,
          minOutput: toHex(param.minimumOutput),
          deadline: param.deadline,
        },
      ])
    )

    return {
      calldata: Multicall.encodeMulticall(calldatas),
      value: toHex(0),
    }
  }

  public static reducePositionParameters(param: ReducePositionOptions): MethodParameters {
    const calldatas: string[] = []

    calldatas.push(
      MarginFacility.INTERFACE.encodeFunctionData('reducePosition', [
        {
          token0: param.positionKey.poolKey.token0Address,
          token1: param.positionKey.poolKey.token1Address,
          fee: param.positionKey.poolKey.fee,
        },
        {
          positionIsToken0: param.positionKey.isToken0,
          reducePercentage: toHex(param.reducePercentage),
          reduceAmount: toHex(0),
          maxSlippage: toHex(param.maxSlippage),
          trader: param.positionKey.trader,
          executionOption: param.executionOption,
          executionData: toHex(0),
          slippedPrice: toHex(param.slippedPrice),
          deadline: param.deadline,
        },
      ])
    )

    return {
      calldata: Multicall.encodeMulticall(calldatas),
      value: toHex(0),
    }
  }

  public static depositPremiumParameters(param: DepositPremiumOptions): MethodParameters {
    const calldata: string = MarginFacility.INTERFACE.encodeFunctionData('depositPremium', [
      // PoolKey calldata key, address trader, bool isToken0, uint256 amount

      {
        token0: param.positionKey.poolKey.token0Address,
        token1: param.positionKey.poolKey.token1Address,
        fee: param.positionKey.poolKey.fee,
      },
      param.positionKey.trader,
      param.positionKey.isToken0,
      toHex(param.amount),
    ])

    return {
      calldata,
      value: toHex(0),
    }
  }

  public static withdrawPremiumParameters(param: WithdrawPremiumOptions): MethodParameters {
    const calldata: string = MarginFacility.INTERFACE.encodeFunctionData('withdrawPremium', [
      {
        token0: param.positionKey.poolKey.token0Address,
        token1: param.positionKey.poolKey.token1Address,
        fee: param.positionKey.poolKey.fee,
      },
      param.positionKey.trader,
      param.positionKey.isToken0,
      toHex(param.amount),
    ])

    return {
      calldata,
      value: toHex(0),
    }
  }
}
