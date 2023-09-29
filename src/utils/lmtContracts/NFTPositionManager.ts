import { Interface } from '@ethersproject/abi'
import { validateAndParseAddress } from '@uniswap/sdk-core'
import { AddLiquidityOptions, MethodParameters, MintOptions, Position, toHex } from '@uniswap/v3-sdk'
import NonfungiblePositionManagerJson from 'abis_v2/NonfungiblePositionManager.json'

// type guard
function isMint(options: AddLiquidityOptions): options is MintOptions {
  return Object.keys(options).some((k) => k === 'recipient')
}

export abstract class NonfungiblePositionManager {
  public static INTERFACE: Interface = new Interface(NonfungiblePositionManagerJson.abi)

  /**
   * Cannot be constructed.
   */
  private constructor() {}

  public static addCallParameters(position: Position, options: AddLiquidityOptions): MethodParameters {
    // get amounts
    const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts

    // adjust for slippage
    const minimumAmounts = position.mintAmountsWithSlippage(options.slippageTolerance)
    const amount0Min = toHex(minimumAmounts.amount0)
    const amount1Min = toHex(minimumAmounts.amount1)

    const deadline = toHex(options.deadline)
    let calldata: string
    // mint
    if (isMint(options)) {
      const recipient: string = validateAndParseAddress(options.recipient)

      calldata = NonfungiblePositionManager.INTERFACE.encodeFunctionData('mint', [
        {
          token0: position.pool.token0.address,
          token1: position.pool.token1.address,
          fee: position.pool.fee,
          tickLower: position.tickLower,
          tickUpper: position.tickUpper,
          amount0Desired: toHex(amount0Desired),
          amount1Desired: toHex(amount1Desired),
          amount0Min,
          amount1Min,
          recipient,
          deadline,
        },
      ])
    } else {
      // increase
      calldata = NonfungiblePositionManager.INTERFACE.encodeFunctionData('increaseLiquidity', [
        {
          tokenId: toHex(options.tokenId),
          amount0Desired: toHex(amount0Desired),
          amount1Desired: toHex(amount1Desired),
          amount0Min,
          amount1Min,
          deadline,
        },
      ])
    }

    const value: string = toHex(0)
    return { calldata, value }
  }
}
