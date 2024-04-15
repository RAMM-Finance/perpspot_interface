// import { BigintIsh } from '@uniswap/sdk-core'
import { MethodParameters, toHex } from '@uniswap/v3-sdk'
import MarginFacilityJson from 'abis_v2/MarginFacility.json'
import { BigNumber as BN } from 'bignumber.js'
import { Interface } from 'ethers/lib/utils'
import JSBI from 'jsbi'
import { LiquidityLoan } from 'types/leveragePosition'
import { OrderPositionKey, TraderPositionKey } from 'types/lmtv2position'

// const errorParser = require('ethers-decode-error')

export interface AddPositionOptions {
  positionKey: TraderPositionKey
  margin: string
  borrowAmount: string
  minimumOutput: string
  deadline: string
  simulatedOutput: string
  executionOption: number
  slippedTickMin: number
  slippedTickMax: number
  marginInPosToken: boolean
  depositPremium?: string
  premiumInPosToken?: boolean
  minPremiumOutput?: string
}

// struct ReduceParam {
//   bool positionIsToken0;
//   uint256 reducePercentage;
//   uint256 minOutput;
//   address trader;
//   uint256 executionOption;
//   bytes executionData;
//   int24 slippedTickMin;
//   int24 slippedTickMax;
//   uint256 reduceAmount;
// }
export interface ReducePositionOptions {
  positionKey: TraderPositionKey
  reducePercentage: string
  executionOption: number
  // deadline: BigNumber
  slippedTickMin: number
  slippedTickMax: number
  executionData: string
  minOutput: string
  isClose: boolean
}

export interface DepositPremiumOptions {
  positionKey: TraderPositionKey
  amount: string
}

export interface WithdrawPremiumOptions {
  positionKey: TraderPositionKey
  amount: JSBI
  isClose: boolean
}

//     address pool,
//     bool positionIsToken0,
//     bool isAdd,
//     uint256 deadline,
//     uint256 startOutput,
//     uint256 minOutput,
//     uint256 inputAmount,
//     uint256 decayRate,
//     uint256 margin

export interface LimitOrderOptions {
  orderKey: OrderPositionKey
  margin: string
  pool: string
  // positionIsToken0: boolean
  isAdd: boolean
  deadline: string
  startOutput: string
  minOutput: string
  inputAmount: string
  decayRate: string
  depositPremium?: string
}

export interface CancelOrderOptions {
  pool: string
  isToken0: boolean
  isAdd: boolean
}

export abstract class MarginFacilitySDK {
  private constructor() {}

  public static INTERFACE: Interface = new Interface(MarginFacilityJson.abi)

  public static addPositionParameters(param: AddPositionOptions) {
    const calldatas: string[] = []

    if (param.depositPremium) {
      if (param.premiumInPosToken) {
        calldatas.push(
          MarginFacilitySDK.INTERFACE.encodeFunctionData('swapAndDepositPremium', [
            {
              token0: param.positionKey.poolKey.token0,
              token1: param.positionKey.poolKey.token1,
              fee: param.positionKey.poolKey.fee,
            },
            param.positionKey.trader,
            param.positionKey.isToken0,
            param.depositPremium,
            param.minPremiumOutput,
          ])
        )
      } else {
        calldatas.push(
          MarginFacilitySDK.INTERFACE.encodeFunctionData('depositPremium', [
            {
              token0: param.positionKey.poolKey.token0,
              token1: param.positionKey.poolKey.token1,
              fee: param.positionKey.poolKey.fee,
            },
            param.positionKey.trader,
            param.positionKey.isToken0,
            param.depositPremium,
          ])
        )
      }
    }
    console.log("borrowToken1", param.positionKey.isToken0)
    console.log("amount", param.depositPremium)
    const key = {
      token0: param.positionKey.poolKey.token0,
      token1: param.positionKey.poolKey.token1,
      fee: param.positionKey.poolKey.fee.toString(),
    }
    const param2 = {
      margin: param.margin,
      simulatedOutput: param.simulatedOutput,
      borrowAmount: param.borrowAmount,
      positionIsToken0: param.positionKey.isToken0,
      executionOption: param.executionOption,
      trader: param.positionKey.trader,
      minOutput: param.minimumOutput,
      deadline: param.deadline,
      executionData: [],
      slippedTickMin: param.slippedTickMin,
      slippedTickMax: param.slippedTickMax,
      marginInPosToken: param.marginInPosToken,
    }



    console.log("RESLTTTT", param2.marginInPosToken ? param2.positionIsToken0 ? key.token0 : key.token1 : param2.positionIsToken0 ? key.token1 : key.token0)
    console.log("RESLTTTT 2222", param2.margin)
    calldatas.push(
      MarginFacilitySDK.INTERFACE.encodeFunctionData('addPosition', [
        {
          token0: param.positionKey.poolKey.token0,
          token1: param.positionKey.poolKey.token1,
          fee: param.positionKey.poolKey.fee.toString(),
        },
        {
          margin: param.margin,
          simulatedOutput: param.simulatedOutput,
          borrowAmount: param.borrowAmount,
          positionIsToken0: param.positionKey.isToken0,
          executionOption: param.executionOption,
          trader: param.positionKey.trader,
          minOutput: param.minimumOutput,
          deadline: param.deadline,
          executionData: [],
          slippedTickMin: param.slippedTickMin,
          slippedTickMax: param.slippedTickMax,
          marginInPosToken: param.marginInPosToken,
        },
        [],
      ])
    )
    return calldatas
  }

  public static submitLimitOrder(param: LimitOrderOptions) {
    const calldatas: string[] = []

    if (param.depositPremium) {
      calldatas.push(
        MarginFacilitySDK.INTERFACE.encodeFunctionData('depositPremium', [
          {
            token0: param.orderKey.poolKey.token0,
            token1: param.orderKey.poolKey.token1,
            fee: param.orderKey.poolKey.fee,
          },
          param.orderKey.trader,
          param.orderKey.isToken0,
          param.depositPremium,
        ])
      )
    }

    calldatas.push(
      MarginFacilitySDK.INTERFACE.encodeFunctionData('submitOrder', [
        param.pool,
        param.orderKey.isToken0,
        param.isAdd,
        param.deadline,
        param.startOutput,
        param.minOutput,
        param.inputAmount,
        param.decayRate,
        param.margin,
      ])
    )

    return calldatas
  }

  public static cancelLimitOrder(param: CancelOrderOptions) {
    // address pool, bool positionIsToken0, bool isAdd
    const calldata: string = MarginFacilitySDK.INTERFACE.encodeFunctionData('cancelOrder', [
      param.pool,
      param.isToken0,
      param.isAdd,
    ])

    return calldata
  }

  public static reducePositionParameters(param: ReducePositionOptions): string[] {
    const calldatas: string[] = []

    calldatas.push(
      MarginFacilitySDK.INTERFACE.encodeFunctionData('reducePosition', [
        {
          token0: param.positionKey.poolKey.token0,
          token1: param.positionKey.poolKey.token1,
          fee: param.positionKey.poolKey.fee,
        },
        {
          positionIsToken0: param.positionKey.isToken0,
          reducePercentage: param.reducePercentage,
          minOutput: param.minOutput,
          trader: param.positionKey.trader,
          executionOption: param.executionOption,
          executionData: param.executionData,
          slippedTickMin: param.slippedTickMin,
          slippedTickMax: param.slippedTickMax,
          reduceAmount: toHex(0),
        },
      ])
    )

    // remove after withdraw premium
    if (param.isClose || param.reducePercentage === new BN(1).shiftedBy(18).toFixed(0)) {
      calldatas.push(
        MarginFacilitySDK.INTERFACE.encodeFunctionData('withdrawPremium', [
          {
            token0: param.positionKey.poolKey.token0,
            token1: param.positionKey.poolKey.token1,
            fee: param.positionKey.poolKey.fee,
          },
          param.positionKey.isToken0,
          '0',
          param.isClose,
        ])
      )
    }

    return calldatas
  }

  public static depositPremiumParameters(param: DepositPremiumOptions): MethodParameters {
    const calldata: string = MarginFacilitySDK.INTERFACE.encodeFunctionData('depositPremium', [
      // PoolKey calldata key, address trader, bool isToken0, uint256 amount

      {
        token0: param.positionKey.poolKey.token0,
        token1: param.positionKey.poolKey.token1,
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
        token0: param.positionKey.poolKey.token0,
        token1: param.positionKey.poolKey.token1,
        fee: param.positionKey.poolKey.fee,
      },
      param.positionKey.trader,
      param.positionKey.isToken0,
      toHex(param.amount),
      param.isClose,
    ])

    return {
      calldata,
      value: toHex(0),
    }
  }

  public static decodeReducePositionResult(rawBytes: string): {} {
    const result = MarginFacilitySDK.INTERFACE.decodeFunctionResult('reducePosition', rawBytes)
    return result
  }

  public static decodeAddPositionResult(rawBytes: string): {
    totalPosition: JSBI
    totalInputDebt: JSBI
    totalOutputDebt: JSBI
    margin: JSBI
    borrowInfo: LiquidityLoan[]
    fees: JSBI
  } {
    const result = MarginFacilitySDK.INTERFACE.decodeFunctionResult('addPosition', rawBytes)
    const position = result[0]
    //   tick: number
    // liquidity: string
    // premium: string
    // feeGrowthInside0LastX128: string
    // feeGrowthInside1LastX128: string
    // lastGrowth: string
    const borrowInfo: LiquidityLoan[] = position.base.borrowInfo.map((item: any) => {
      return {
        tick: item.tick,
        liquidity: item.liquidity.toString(),
        premium: item.premium.toString(),
        feeGrowthInside0LastX128: item.feeGrowthInside0LastX128.toString(),
        feeGrowthInside1LastX128: item.feeGrowthInside1LastX128.toString(),
        lastGrowth: item.lastGrowth.toString(),
      }
    })

    return {
      totalPosition: JSBI.BigInt(position.totalPosition.toString()),
      totalInputDebt: JSBI.BigInt(position.base.totalDebtInput.toString()),
      totalOutputDebt: JSBI.BigInt(position.base.totalDebtOutput.toString()),
      margin: JSBI.BigInt(position.margin.toString()),
      borrowInfo,
      fees: JSBI.BigInt(result[2].toString()),
    }
  }
}
