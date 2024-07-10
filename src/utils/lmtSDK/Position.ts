import { CurrencyAmount, Price, Token } from '@uniswap/sdk-core'
import { SqrtPriceMath, TickMath, tickToPrice } from '@uniswap/v3-sdk'
import { LmtPool } from 'hooks/usePools'
import JSBI from 'jsbi'
import { Bin } from 'types/position'

import { ZERO } from './internalConstants'

export class V2LpPosition {
  public readonly pool: LmtPool
  public readonly tickLower: number
  public readonly tickUpper: number
  public readonly bins: Bin[]
  public readonly liquidity: JSBI
  private _token0Amount: CurrencyAmount<Token> | null = null
  private _token1Amount: CurrencyAmount<Token> | null = null
  constructor(pool: LmtPool, tickLower: number, tickUpper: number, bins: Bin[]) {
    this.pool = pool
    this.tickLower = tickLower
    this.tickUpper = tickUpper
    this.bins = bins
    this.liquidity = bins.length > 0 ? JSBI.BigInt(bins[0].liquidity.toString()) : JSBI.BigInt(0)
  }

  // amount0
  public get amount0(): CurrencyAmount<Token> {
    if (!this._token0Amount) {
      if (this.pool.tickCurrent < this.tickLower) {
        // lower to upper
        this._token0Amount = CurrencyAmount.fromRawAmount(this.pool.token0, ZERO)
        for (let i = 0; i < this.bins.length; i++) {
          if (this.bins[i].liquidity.isZero()) continue
          const lowerTick = this.tickLower + i * this.pool.tickDiscretization
          const upperTick = this.tickLower + (i + 1) * this.pool.tickDiscretization
          this._token0Amount = this._token0Amount.add(
            CurrencyAmount.fromRawAmount(
              this.pool.token0,
              SqrtPriceMath.getAmount0Delta(
                TickMath.getSqrtRatioAtTick(lowerTick),
                TickMath.getSqrtRatioAtTick(upperTick),
                JSBI.BigInt(this.bins[i].liquidity.toString()),
                false
              )
            )
          )
        }
        return this._token0Amount
      } else if (this.pool.tickCurrent < this.tickUpper) {
        this._token0Amount = CurrencyAmount.fromRawAmount(this.pool.token0, ZERO)
        for (let i = 0; i < this.bins.length; i) {
          if (this.bins[i].liquidity.isZero()) continue
          const upperTick = this.tickUpper - i * this.pool.tickDiscretization
          const lowerTick = this.tickUpper - (i + 1) * this.pool.tickDiscretization

          if (lowerTick < this.pool.tickCurrent) {
            this._token0Amount = this._token0Amount.add(
              CurrencyAmount.fromRawAmount(
                this.pool.token0,
                SqrtPriceMath.getAmount0Delta(
                  this.pool.sqrtRatioX96,
                  TickMath.getSqrtRatioAtTick(upperTick),
                  JSBI.BigInt(this.bins[this.bins.length - 1 - i].liquidity.toString()),
                  false
                )
              )
            )
            return this._token0Amount
          }

          this._token0Amount = this._token0Amount.add(
            CurrencyAmount.fromRawAmount(
              this.pool.token0,
              SqrtPriceMath.getAmount0Delta(
                TickMath.getSqrtRatioAtTick(lowerTick),
                TickMath.getSqrtRatioAtTick(upperTick),
                JSBI.BigInt(this.bins[i].liquidity.toString()),
                false
              )
            )
          )
        }
      } else {
        this._token0Amount = CurrencyAmount.fromRawAmount(this.pool.token0, ZERO)
      }
    }
    return this._token0Amount
  }

  // amount1
  public get amount1(): CurrencyAmount<Token> {
    if (!this._token1Amount) {
      if (this.pool.tickCurrent < this.tickLower) {
        this._token1Amount = CurrencyAmount.fromRawAmount(this.pool.token1, ZERO)
      } else if (this.pool.tickCurrent < this.tickUpper) {
        this._token1Amount = CurrencyAmount.fromRawAmount(this.pool.token1, ZERO)

        for (let i = 0; i < this.bins.length; i++) {
          if (this.bins[i].liquidity.isZero()) continue
          const lowerTick = this.tickLower + i * this.pool.tickDiscretization
          const upperTick = this.tickLower + (i + 1) * this.pool.tickDiscretization
          if (upperTick > this.pool.tickCurrent) {
            this._token1Amount = this._token1Amount.add(
              CurrencyAmount.fromRawAmount(
                this.pool.token1,
                SqrtPriceMath.getAmount1Delta(
                  TickMath.getSqrtRatioAtTick(lowerTick),
                  this.pool.sqrtRatioX96,
                  JSBI.BigInt(this.bins[i].liquidity.toString()),
                  false
                )
              )
            )
            return this._token1Amount
          }
          this._token1Amount = this._token1Amount.add(
            CurrencyAmount.fromRawAmount(
              this.pool.token1,
              SqrtPriceMath.getAmount1Delta(
                TickMath.getSqrtRatioAtTick(lowerTick),
                TickMath.getSqrtRatioAtTick(upperTick),
                JSBI.BigInt(this.bins[i].liquidity.toString()),
                false
              )
            )
          )
        }
      } else {
        this._token1Amount = CurrencyAmount.fromRawAmount(this.pool.token1, ZERO)
        for (let i = 0; i < this.bins.length; i++) {
          if (this.bins[i].liquidity.isZero()) continue
          const lowerTick = this.tickLower + i * this.pool.tickDiscretization
          const upperTick = this.tickLower + (i + 1) * this.pool.tickDiscretization
          this._token0Amount = this._token1Amount.add(
            CurrencyAmount.fromRawAmount(
              this.pool.token0,
              SqrtPriceMath.getAmount0Delta(
                TickMath.getSqrtRatioAtTick(lowerTick),
                TickMath.getSqrtRatioAtTick(upperTick),
                JSBI.BigInt(this.bins[i].liquidity.toString()),
                false
              )
            )
          )
        }
        return this._token1Amount
      }
    }

    return this._token1Amount
  }

  /**
   * Returns the price of token0 at the lower tick
   */
  public get token0PriceLower(): Price<Token, Token> {
    return tickToPrice(this.pool.token0, this.pool.token1, this.tickLower)
  }

  /**
   * Returns the price of token0 at the upper tick
   */
  public get token0PriceUpper(): Price<Token, Token> {
    return tickToPrice(this.pool.token0, this.pool.token1, this.tickUpper)
  }
}
