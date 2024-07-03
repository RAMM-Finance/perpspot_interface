import { Interface } from '@ethersproject/abi'
import { BigintIsh, Currency, CurrencyAmount, Percent, validateAndParseAddress } from '@uniswap/sdk-core'
import { MintOptions, NFTPermitOptions } from '@uniswap/v3-sdk'
import { MethodParameters, Position, toHex } from '@uniswap/v3-sdk'
import ABI from 'abis_v2/NonfungiblePositionManagerV2.json'
import { BigNumber as BN } from 'bignumber.js'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { ONE, ZERO } from './internalConstants'
import { LmtLpPosition } from './LpPosition'
import { MulticallSDK } from './multicall'
interface CollectOptions {
  /**
   * Indicates the ID of the position to collect for.
   */
  tokenId: BigintIsh

  /**
   * Expected value of tokensOwed0, including as-of-yet-unaccounted-for fees/liquidity value to be burned
   */
  expectedCurrencyOwed0: CurrencyAmount<Currency>

  /**
   * Expected value of tokensOwed1, including as-of-yet-unaccounted-for fees/liquidity value to be burned
   */
  expectedCurrencyOwed1: CurrencyAmount<Currency>

  /**
   * The account that should receive the tokens.
   */
  recipient: string
}

/**
 * Options for producing the calldata to exit a position.
 */
interface RemoveLiquidityOptions {
  /**
   * The ID of the token to exit
   */
  tokenId: BigintIsh

  /**
   * The percentage of position liquidity to exit.
   */
  liquidityPercentage: Percent

  /**
   * How much the pool price is allowed to move.
   */
  slippageTolerance: Percent

  /**
   * When the transaction expires, in epoch seconds.
   */
  deadline: BigintIsh

  /**
   * Whether the NFT should be burned if the entire position is being exited, by default false.
   */
  burnToken?: boolean

  /**
   * The optional permit of the token ID being exited, in case the exit transaction is being sent by an account that does not own the NFT
   */
  permit?: NFTPermitOptions

  /**
   * Parameters to be passed on to collect
   */
  collectOptions: Omit<CollectOptions, 'tokenId'>
}

export abstract class NFPM_SDK {
  public static INTERFACE: Interface = new Interface(ABI.abi)

  /**
   * Cannot be constructed.
   */
  private constructor() {}

  private static encodeCollect(options: CollectOptions): string[] {
    const calldatas: string[] = []

    const tokenId = toHex(options.tokenId)

    const recipient = validateAndParseAddress(options.recipient)

    // collect
    calldatas.push(
      NFPM_SDK.INTERFACE.encodeFunctionData('collect', [
        {
          tokenId,
          recipient,
        },
      ])
    )

    return calldatas
  }

  public static addCallParameters(position: LmtLpPosition, options: MintOptions): MethodParameters {
    // get amounts
    const { amount0: amount0Max, amount1: amount1Max } = position.mintAmounts

    // adjust for slippage
    // const minimumAmounts = position.mintAmountsWithSlippage(options.slippageTolerance)

    const deadline = toHex(options.deadline)
    const amount0Desired = new BN(amount0Max.toString()).times(1000).div(1001).toFixed(0)
    const amount1Desired = new BN(amount1Max.toString()).times(1000).div(1001).toFixed(0)

    const minimumAmounts = position.customMintAmountsWithSlippage(
      JSBI.BigInt(amount0Desired),
      JSBI.BigInt(amount1Desired),
      options.slippageTolerance
    )

    const amount0Min = minimumAmounts.amount0.toString()
    const amount1Min = minimumAmounts.amount1.toString()

    const recipient: string = validateAndParseAddress(options.recipient)
    const calldata = NFPM_SDK.INTERFACE.encodeFunctionData('mint', [
      {
        token0: position.pool.token0.address,
        token1: position.pool.token1.address,
        fee: position.pool.fee,
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        amount0Desired,
        amount1Desired,
        amount0Max: amount0Max.toString(),
        amount1Max: amount1Max.toString(),
        amount0Min,
        amount1Min,
        recipient,
        deadline,
      },
    ])

    const value: string = toHex(0)
    return { calldata, value }
  }

  public static removeCallParameters(
    position: Position,
    options: RemoveLiquidityOptions,
    account: string,
    computedAmount0: JSBI,
    computedAmount1: JSBI,
    maxLiquidityToWithdraw: JSBI
  ): MethodParameters {
    const calldatas: string[] = []

    const deadline = toHex(options.deadline)
    const tokenId = toHex(options.tokenId)

    // construct a partial position with a percentage of liquidity
    const partialPosition = new Position({
      pool: position.pool,
      liquidity: options.liquidityPercentage.multiply(maxLiquidityToWithdraw).quotient,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
    })

    invariant(JSBI.greaterThan(partialPosition.liquidity, ZERO), 'ZERO_LIQUIDITY')
    // const remainingLiquidity = JSBI.subtract(position.liquidity, partialPosition.liquidity)

    // slippage-adjusted underlying amounts
    const { amount0: amount0Min, amount1: amount1Min } = partialPosition.burnAmountsWithSlippage(
      options.slippageTolerance
    )

    // remove liquidity
    // uint256 tokenId;
    //   uint128 percentage;
    //   uint256 amount0Min;
    //   uint256 amount1Min;
    //   uint256 deadline;
    calldatas.push(
      NFPM_SDK.INTERFACE.encodeFunctionData('decreaseLiquidity', [
        {
          tokenId,
          percentage: new BN(options.liquidityPercentage.toFixed(18)).shiftedBy(16).toFixed(0),
          amount0Min: JSBI.lessThan(computedAmount0, amount0Min) ? computedAmount0.toString() : toHex(amount0Min),
          amount1Min: JSBI.lessThan(computedAmount1, amount1Min) ? computedAmount1.toString() : toHex(amount1Min),
          deadline,
        },
      ])
    )

    // must close completely + auto collect
    if (options.liquidityPercentage.equalTo(ONE)) {
      calldatas.push(NFPM_SDK.INTERFACE.encodeFunctionData('collect', [{ tokenId, recipient: account }]))
      calldatas.push(NFPM_SDK.INTERFACE.encodeFunctionData('burn', [tokenId]))
    }

    return {
      calldata: MulticallSDK.encodeMulticall(calldatas),
      value: toHex(0),
    }
  }
}
