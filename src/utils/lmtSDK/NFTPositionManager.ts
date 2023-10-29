import { Interface } from '@ethersproject/abi'
import { BigintIsh, Currency, CurrencyAmount, Percent, validateAndParseAddress } from '@uniswap/sdk-core'
import { AddLiquidityOptions, MethodParameters, MintOptions, NFTPermitOptions, Position, toHex } from '@uniswap/v3-sdk'
import NonfungiblePositionManagerJson from 'abis_v2/NonfungiblePositionManager.json'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { ONE, ZERO } from './internalConstants'
import { Multicall } from './multicall'

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
    const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts

    // adjust for slippage
    const minimumAmounts = position.mintAmountsWithSlippage(options.slippageTolerance)
    const amount0Min = minimumAmounts.amount0.toString()
    const amount1Min = minimumAmounts.amount1.toString()

    const deadline = toHex(options.deadline)
    let calldata: string
    // mint
    if (isMint(options)) {
      const recipient: string = validateAndParseAddress(options.recipient)
      // console.log('params', {
      //   token0: position.pool.token0.address,
      //   token1: position.pool.token1.address,
      //   fee: position.pool.fee,
      //   tickLower: position.tickLower,
      //   tickUpper: position.tickUpper,
      //   amount0Desired: amount0Desired.toString(),
      //   amount1Desired: amount1Desired.toString(),
      //   amount0Min,
      //   amount1Min,
      //   recipient,
      //   deadline,
      // })
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

  public static removeCallParameters(position: Position, options: RemoveLiquidityOptions): MethodParameters {
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
          amount0Min: toHex(amount0Min),
          amount1Min: toHex(amount1Min),
          deadline,
        },
      ])
    )

    const { expectedCurrencyOwed0, expectedCurrencyOwed1, ...rest } = options.collectOptions
    calldatas.push(
      ...NonfungiblePositionManager.encodeCollect({
        tokenId: toHex(options.tokenId),
        // add the underlying value to the expected currency already owed
        expectedCurrencyOwed0: expectedCurrencyOwed0.add(
          CurrencyAmount.fromRawAmount(expectedCurrencyOwed0.currency, amount0Min)
        ),
        expectedCurrencyOwed1: expectedCurrencyOwed1.add(
          CurrencyAmount.fromRawAmount(expectedCurrencyOwed1.currency, amount1Min)
        ),
        ...rest,
      })
    )

    if (options.liquidityPercentage.equalTo(ONE)) {
      if (options.burnToken) {
        calldatas.push(NonfungiblePositionManager.INTERFACE.encodeFunctionData('burn', [tokenId]))
      }
    } else {
      invariant(options.burnToken !== true, 'CANNOT_BURN')
    }

    return {
      calldata: Multicall.encodeMulticall(calldatas),
      value: toHex(0),
    }
  }
}
