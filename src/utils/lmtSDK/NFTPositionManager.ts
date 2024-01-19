import { Interface } from '@ethersproject/abi'
import { BigintIsh, Currency, CurrencyAmount, Percent, validateAndParseAddress } from '@uniswap/sdk-core'
import { AddLiquidityOptions, MethodParameters, MintOptions, NFTPermitOptions, Position, toHex } from '@uniswap/v3-sdk'
import NonfungiblePositionManagerJson from 'abis_v2/NonfungiblePositionManager.json'
import { BigNumber as BN } from 'bignumber.js'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { ONE, ZERO } from './internalConstants'
import { MulticallSDK } from './multicall'

// type guard
function isMint(options: AddLiquidityOptions): options is MintOptions {
  return Object.keys(options).some((k) => k === 'recipient')
}

const MaxUint128 = toHex(JSBI.subtract(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128)), JSBI.BigInt(1)))

export interface CollectOptions {
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
export interface RemoveLiquidityOptions {
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

export abstract class NonfungiblePositionManager {
  public static INTERFACE: Interface = new Interface(NonfungiblePositionManagerJson.abi)

  /**
   * Cannot be constructed.
   */
  private constructor() {}

  private static encodeCollect(options: CollectOptions): string[] {
    const calldatas: string[] = []

    const tokenId = toHex(options.tokenId)

    // const involvesETH =
    //   options.expectedCurrencyOwed0.currency.isNative || options.expectedCurrencyOwed1.currency.isNative

    const recipient = validateAndParseAddress(options.recipient)

    // collect
    calldatas.push(
      NonfungiblePositionManager.INTERFACE.encodeFunctionData('collect', [
        {
          tokenId,
          // recipient: involvesETH ? ADDRESS_ZERO : recipient,
          recipient,
          // amount0Max: MaxUint128,
          // amount1Max: MaxUint128,
        },
      ])
    )

    // if (involvesETH) {
    //   const ethAmount = options.expectedCurrencyOwed0.currency.isNative
    //     ? options.expectedCurrencyOwed0.quotient
    //     : options.expectedCurrencyOwed1.quotient
    //   const token = options.expectedCurrencyOwed0.currency.isNative
    //     ? (options.expectedCurrencyOwed1.currency as Token)
    //     : (options.expectedCurrencyOwed0.currency as Token)
    //   const tokenAmount = options.expectedCurrencyOwed0.currency.isNative
    //     ? options.expectedCurrencyOwed1.quotient
    //     : options.expectedCurrencyOwed0.quotient

    //   calldatas.push(Payments.encodeUnwrapWETH9(ethAmount, recipient))
    //   calldatas.push(Payments.encodeSweepToken(token, tokenAmount, recipient))
    // }

    return calldatas
  }

  public static addCallParameters(position: Position, options: AddLiquidityOptions): MethodParameters {
    // get amounts
    const { amount0: amount0Max, amount1: amount1Max } = position.mintAmounts

    // adjust for slippage
    const minimumAmounts = position.mintAmountsWithSlippage(options.slippageTolerance)

    const deadline = toHex(options.deadline)
    let calldata: string
    const amount0Desired = new BN(amount0Max.toString()).times(1000).div(1001).toFixed(0)
    const amount1Desired = new BN(amount1Max.toString()).times(1000).div(1001).toFixed(0)
    const amount0Min = new BN(minimumAmounts.amount0.toString()).gt(amount0Desired)
      ? amount0Desired
      : minimumAmounts.amount0.toString()
    const amount1Min = new BN(minimumAmounts.amount1.toString()).gt(amount1Desired)
      ? amount1Desired
      : minimumAmounts.amount1.toString()
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
    } else {
      // increase
      calldata = NonfungiblePositionManager.INTERFACE.encodeFunctionData('increaseLiquidity', [
        {
          tokenId: toHex(options.tokenId),
          amount0Max: amount0Max.toString(),
          amount1Max: amount1Max.toString(),
          amount0Desired,
          amount1Desired,
          amount0Min,
          amount1Min,
          deadline,
        },
      ])
    }

    const value: string = toHex(0)
    return { calldata, value }
  }

  public static removeCallParameters(
    position: Position,
    options: RemoveLiquidityOptions,
    account: string,
    computedAmount0: JSBI,
    computedAmount1: JSBI
  ): MethodParameters {
    const calldatas: string[] = []

    const deadline = toHex(options.deadline)
    const tokenId = toHex(options.tokenId)

    // construct a partial position with a percentage of liquidity
    const partialPosition = new Position({
      pool: position.pool,
      liquidity: options.liquidityPercentage.multiply(position.liquidity).quotient,
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
    calldatas.push(
      NonfungiblePositionManager.INTERFACE.encodeFunctionData('decreaseLiquidity', [
        {
          tokenId,
          liquidity: toHex(partialPosition.liquidity),
          amount0Min: JSBI.lessThan(computedAmount0, amount0Min) ? computedAmount0.toString() : toHex(amount0Min),
          amount1Min: JSBI.lessThan(computedAmount1, amount1Min) ? computedAmount1.toString() : toHex(amount1Min),
          deadline,
        },
      ])
    )

    // must close completely + auto collect
    if (options.liquidityPercentage.equalTo(ONE)) {
      calldatas.push(
        NonfungiblePositionManager.INTERFACE.encodeFunctionData('collect', [{ tokenId, recipient: account }])
      )
      calldatas.push(NonfungiblePositionManager.INTERFACE.encodeFunctionData('burn', [tokenId]))
    }

    return {
      calldata: MulticallSDK.encodeMulticall(calldatas),
      value: toHex(0),
    }
  }
}
