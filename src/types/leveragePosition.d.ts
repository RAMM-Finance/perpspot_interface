import { BigNumber } from '@ethersproject/bignumber'
import { Token } from '@uniswap/sdk-core'
import { FeeAmount, Pool } from '@uniswap/v3-sdk'
import {BigNumber as BN} from 'bignumber.js'

export interface LimitlessPositionDetails {
  leverageManagerAddress: string | undefined
  borrowManagerAddress: string | undefined
  liquidityManagerAddress: string | undefined
  isBorrow: boolean
  token0Address: string 
  token1Address: string
  poolFee: FeeAmount | undefined
  tokenId: string
  totalPosition: BN // totalPosition
  totalDebt: BN // total debt in output token
  totalDebtInput: BN // total debt in input token
  initialCollateral: BN
  // creationPrice: string,
  recentPremium: BN
  totalPremium: BN,
  unusedPremium: BN,
  isToken0: boolean
  openTime: number
  repayTime: number
  totalPositionRaw?:string;
  trader: string
  // borrowInfo: TickLiquidity[]
}
// open price == ( totalDebtInput + initialCollateral ) / totalPosition

interface TickLiquidity {
  tick: number,
  liquidity: string
}
