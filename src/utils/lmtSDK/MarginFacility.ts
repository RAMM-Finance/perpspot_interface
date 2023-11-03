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
  deadline: string
  simulatedOutput: JSBI
  executionOption: number
  maxSlippage: string
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

export abstract class MarginFacilitySDK {
  private constructor() {}

  public static INTERFACE: Interface = new Interface(MarginFacilityJson.abi)

  public static addPositionParameters(param: AddPositionOptions) {
    const calldatas: string[] = []

    if (param.depositPremium) {
      calldatas.push(
        MarginFacilitySDK.INTERFACE.encodeFunctionData('depositPremium', [
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
    // uint256 margin;
    // uint256 minOutput;
    // uint256 simulatedOutput;
    // uint256 borrowAmount;
    // bool positionIsToken0;
    // uint256 executionOption;
    // address trader;
    // bytes executionData;
    // int24 slippedTickMin;
    // int24 slippedTickMax;
    calldatas.push(
      MarginFacilitySDK.INTERFACE.encodeFunctionData('addPosition', [
        {
          token0: param.positionKey.poolKey.token0Address,
          token1: param.positionKey.poolKey.token1Address,
          fee: param.positionKey.poolKey.fee.toString(),
        },
        {
          margin: toHex(param.margin),
          maxSlippage: toHex(param.maxSlippage),
          simulatedOutput: toHex(param.simulatedOutput),
          borrowAmount: toHex(param.borrowAmount),
          positionIsToken0: param.positionKey.isToken0,
          executionOption: param.executionOption,
          trader: param.positionKey.trader,
          minOutput: toHex(param.minimumOutput),
          deadline: param.deadline,
          executionData: [],
          slippedTickMin: 0,
          slippedTickMax: 0,
        },
        [],
      ])
    )

    // return {
    //   calldata: Multicall.encodeMulticall(calldatas),
    //   value: toHex(0),
    // }
    return calldatas
  }

  public static reducePositionParameters(param: ReducePositionOptions): MethodParameters {
    const calldatas: string[] = []

    calldatas.push(
      MarginFacilitySDK.INTERFACE.encodeFunctionData('reducePosition', [
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
    const calldata: string = MarginFacilitySDK.INTERFACE.encodeFunctionData('depositPremium', [
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
    const calldata: string = MarginFacilitySDK.INTERFACE.encodeFunctionData('withdrawPremium', [
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

  public static decodeAddPositionResult(rawBytes: string): {
    totalPosition: JSBI
    totalInputDebt: JSBI
    totalOutputDebt: JSBI
    margin: JSBI
  } {
    const result = MarginFacilitySDK.INTERFACE.decodeFunctionResult('addPosition', rawBytes)[0]

    return {
      totalPosition: JSBI.BigInt(result.totalPosition.toString()),
      totalInputDebt: JSBI.BigInt(result.base.totalDebtInput.toString()),
      totalOutputDebt: JSBI.BigInt(result.base.totalDebtOutput.toString()),
      margin: JSBI.BigInt(result.margin.toString()),
    }
  }
}
